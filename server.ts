import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini AI client
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables");
    }
    return new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API Route: Lookup Word in Arabic / Lisan ud Dawat
  app.post("/api/lookup-word", async (req, res) => {
    try {
      const { word, context, pdfTitle } = req.body;

      if (!word || typeof word !== "string") {
        return res.status(400).json({ error: "Word parameter is required" });
      }

      const cleanWord = word.trim();
      const ai = getAi();

      const systemInstruction = `You are a premier linguist, lexicographer, and master teacher of Classical Arabic, Modern Standard Arabic, and Lisan ud Dawat (Lisān al-Da'wah / لسان الدعوة - the traditional language written in Arabic script with rich Arabic, Persian, and Urdu vocabulary, used in the Dawoodi Bohra community).

Your job is to analyze any given word, verse, or full statement selected from an Arabic or Lisan ud Dawat PDF document and return an educational, deeply detailed, structured dictionary entry in valid JSON.

Crucial Requirements:
1. VERSE / STATEMENT ANALYSIS: If the selected target is a phrase, verse, or multi-word statement:
   - Mark isVerseOrPhrase as true.
   - Provide the complete, fluent translation of the entire phrase/verse in English (entireTranslationEn), Gujarati (entireTranslationGu in Gujarati script), and Urdu (entireTranslationUr in Urdu script).
   - Provide a granular, WORD-BY-WORD breakdown array (wordBreakdown) for EVERY single word in the selected verse/statement with its vocalized Arabic spelling (word), Roman transliteration, 3-letter root (root), English meaning (meaningEn), Gujarati meaning (meaningGu), Urdu meaning (meaningUr), and part of speech (partOfSpeech).
2. SINGLE WORD CONSTRUCTION: Deconstruct how the main word was built step-by-step from its 3-letter or 4-letter Arabic root (المادة / الجذر). Identify prefixes, core root letters, weight/pattern (الوزن), and suffixes. Explain how each piece contributes to the final meaning.
3. GRAMMATICAL FORMS & VARIATIONS: Provide all key grammatical forms derived from the root (Singular, Dual, Plural, Masculine, Feminine, Past, Present, Imperative, Doer, Object, Place).
4. MEANING SHIFT EXPLANATION: Write a clear explanation of how changing patterns or forms shifts the root meaning.
5. FUN FACT: Share a delightful linguistic, cultural, or Sabaq fun fact or memory tip.
6. Always output strict JSON matching the requested schema.`;

      const userPrompt = `Target Selection: "${cleanWord}"
${context ? `Surrounding Sentence/Context: "${context}"` : ""}
${pdfTitle ? `Document Title: "${pdfTitle}"` : ""}

Analyze this selection. If it is a verse or statement with multiple words, set isVerseOrPhrase=true, provide the complete entire translation (English, Gujarati, Urdu), and provide a detailed word-by-word breakdown array for every word in the verse. Also provide root deconstruction, grammatical form variations, meaning shift rules, and educational fun facts. Return valid JSON.`;

      const formItemSchema = {
        type: Type.OBJECT,
        properties: {
          arabic: { type: Type.STRING },
          transliteration: { type: Type.STRING },
          meaning: { type: Type.STRING },
          explanation: { type: Type.STRING, description: "How this specific form changes the meaning from the root" }
        }
      };

      const modelsToTry = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];
      let response = null;
      let lastError = null;

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING, description: "Original target word or selected verse phrase" },
                  cleanWord: { type: Type.STRING, description: "Normalized text" },
                  transliteration: { type: Type.STRING, description: "Standard Roman/Latin transliteration" },
                  language: { type: Type.STRING, description: "Language/Origin e.g. 'Arabic', 'Lisan ud Dawat'" },
                  primaryMeaningEn: { type: Type.STRING, description: "Primary English translation of word or verse" },
                  primaryMeaningGu: { type: Type.STRING, description: "Primary Gujarati definition/translation in Gujarati script" },
                  primaryMeaningUr: { type: Type.STRING, description: "Primary Urdu definition/translation" },
                  isVerseOrPhrase: { type: Type.BOOLEAN, description: "True if target is a multi-word verse or phrase" },
                  entireTranslationEn: { type: Type.STRING, description: "Complete fluent English translation of the whole verse/statement" },
                  entireTranslationGu: { type: Type.STRING, description: "Complete fluent Gujarati translation of the whole verse/statement" },
                  entireTranslationUr: { type: Type.STRING, description: "Complete fluent Urdu translation of the whole verse/statement" },
                  wordBreakdown: {
                    type: Type.ARRAY,
                    description: "Word-by-word breakdown for each individual word in the verse/statement",
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        word: { type: Type.STRING, description: "Arabic word with harakat" },
                        transliteration: { type: Type.STRING, description: "Roman pronunciation" },
                        meaningEn: { type: Type.STRING, description: "English translation of this specific word" },
                        meaningGu: { type: Type.STRING, description: "Gujarati translation of this specific word" },
                        meaningUr: { type: Type.STRING, description: "Urdu translation of this specific word" },
                        root: { type: Type.STRING, description: "3-letter root or N/A" },
                        partOfSpeech: { type: Type.STRING, description: "Grammatical part of speech" }
                      }
                    }
                  },
                  root: { type: Type.STRING, description: "Arabic root letters (Maddah) e.g. ع-ل-م or 'N/A' if non-Arabic" },
                  rootMeaning: { type: Type.STRING, description: "Core meaning of the 3-letter root" },
                  partOfSpeech: { type: Type.STRING, description: "Part of speech" },
                  definition: { type: Type.STRING, description: "Comprehensive definition and spiritual/literary nuances" },
                  contextNote: { type: Type.STRING, description: "Context-specific breakdown of how this word or verse functions" },
                  morphology: {
                    type: Type.OBJECT,
                    properties: {
                      root: { type: Type.STRING },
                      rootMeaning: { type: Type.STRING },
                      pattern: { type: Type.STRING },
                      patternMeaning: { type: Type.STRING },
                      wordClass: { type: Type.STRING },
                      constructionSteps: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            part: { type: Type.STRING },
                            type: { type: Type.STRING },
                            role: { type: Type.STRING },
                            contribution: { type: Type.STRING }
                          }
                        }
                      }
                    }
                  },
                  grammaticalForms: {
                    type: Type.OBJECT,
                    properties: {
                      singular: formItemSchema,
                      dual: formItemSchema,
                      plural: formItemSchema,
                      masculine: formItemSchema,
                      feminine: formItemSchema,
                      pastVerb: formItemSchema,
                      presentVerb: formItemSchema,
                      imperative: formItemSchema,
                      activeParticiple: formItemSchema,
                      passiveParticiple: formItemSchema,
                      nounOfPlace: formItemSchema
                    }
                  },
                  meaningShiftExplanation: { type: Type.STRING },
                  funFact: { type: Type.STRING },
                  derivedTerms: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        arabic: { type: Type.STRING },
                        transliteration: { type: Type.STRING },
                        meaning: { type: Type.STRING }
                      }
                    }
                  },
                  exampleSentence: {
                    type: Type.OBJECT,
                    properties: {
                      arabic: { type: Type.STRING },
                      transliteration: { type: Type.STRING },
                      translation: { type: Type.STRING }
                    }
                  }
                },
                required: ["word", "transliteration", "language", "primaryMeaningEn", "definition"]
              }
            }
          });
          if (response) break;
        } catch (mErr: any) {
          lastError = mErr;
          console.warn(`Model ${modelName} failed or rate-limited:`, mErr?.message || mErr);
        }
      }

      if (!response) {
        throw lastError || new Error("All model attempts failed or exceeded quota.");
      }

      const text = response.text || "{}";
      const parsedData = JSON.parse(text);

      return res.json({
        success: true,
        data: parsedData
      });
    } catch (err: any) {
      console.error("Error in /api/lookup-word:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to lookup word meaning"
      });
    }
  });

  // API Route: OCR Region Scan
  app.post("/api/ocr-region", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/png" } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "Image data is required" });
      }

      const ai = getAi();
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const systemInstruction = `You are an expert OCR and Arabic / Lisan ud Dawat text reader. 
Given a image snippet of text from a manuscript or PDF:
1. Extract the Arabic / Lisan ud Dawat text accurately.
2. Identify the main words and offer translation/meaning for the selected snippet.`;

      const ocrModelsToTry = ["gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-flash-latest", "gemini-2.5-flash"];
      let response = null;
      let lastOcrError = null;

      for (const mName of ocrModelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: mName,
            contents: {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: cleanBase64
                  }
                },
                {
                  text: "Read the Arabic / Lisan ud Dawat text in this image snippet. Extract the exact text, Roman transliteration, and English/Gujarati translation. Also list individual words with meanings."
                }
              ]
            },
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  extractedText: { type: Type.STRING, description: "Extracted Arabic/Lisan ud Dawat text in Arabic script" },
                  transliteration: { type: Type.STRING, description: "Romanized pronunciation" },
                  translationEn: { type: Type.STRING, description: "English translation" },
                  translationGu: { type: Type.STRING, description: "Gujarati translation in Gujarati script" },
                  wordBreakdown: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        word: { type: Type.STRING },
                        transliteration: { type: Type.STRING },
                        meaning: { type: Type.STRING },
                        root: { type: Type.STRING }
                      }
                    }
                  }
                },
                required: ["extractedText", "translationEn"]
              }
            }
          });
          if (response) break;
        } catch (oErr: any) {
          lastOcrError = oErr;
          console.warn(`OCR Model ${mName} failed:`, oErr?.message || oErr);
        }
      }

      if (!response) {
        throw lastOcrError || new Error("All OCR model attempts failed or exceeded quota.");
      }

      const text = response.text || "{}";
      const parsedData = JSON.parse(text);

      return res.json({
        success: true,
        data: parsedData
      });
    } catch (err: any) {
      console.error("Error in /api/ocr-region:", err);
      return res.status(500).json({
        success: false,
        error: err.message || "Failed to process image snippet"
      });
    }
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
