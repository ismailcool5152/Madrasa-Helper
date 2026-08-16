import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "./components/Navbar";
import { PdfViewer } from "./components/PdfViewer";
import { WordDictionaryDrawer } from "./components/WordDictionaryDrawer";
import { ManualLookupBar } from "./components/ManualLookupBar";
import { LookupHistoryDrawer } from "./components/LookupHistoryDrawer";
import { AboutModal } from "./components/AboutModal";
import { WordLookupResult, OcrResult } from "./types";
import { createSamplePdfBlob, SAMPLE_TEXTS } from "./utils/samplePdfCreator";
import { BookOpen, Sparkles, Upload, FileText } from "lucide-react";

export default function App() {
  const [pdfSource, setPdfSource] = useState<File | Blob | string | null>(null);
  const [pdfTitle, setPdfTitle] = useState<string>("Sample Lisan ud Dawat Document");

  // Dictionary Drawer State
  const [isDictionaryOpen, setIsDictionaryOpen] = useState<boolean>(false);
  const [currentResult, setCurrentResult] = useState<WordLookupResult | null>(null);
  const [isLookupLoading, setIsLookupLoading] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Vocabulary History & Saved Words State
  const [history, setHistory] = useState<WordLookupResult[]>(() => {
    try {
      const saved = localStorage.getItem("lisan_ud_dawat_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Manual Search Bar State
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // About Modal State
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Initialize with Sample PDF on load
  useEffect(() => {
    let isMounted = true;
    createSamplePdfBlob(0).then((blob) => {
      if (isMounted) {
        setPdfSource(blob);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync History to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem("lisan_ud_dawat_history", JSON.stringify(history));
    } catch (e) {
      console.warn("Could not save history to localStorage:", e);
    }
  }, [history]);

  // Handle Lookup Word Request
  const handleLookupWord = useCallback(
    async (word: string, contextSentence: string = "", pageNum: number = 1) => {
      if (!word || word.trim().length === 0) return;

      setIsDictionaryOpen(true);
      setIsLookupLoading(true);
      setLookupError(null);
      setCurrentResult(null);

      try {
        const response = await fetch("/api/lookup-word", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            word: word.trim(),
            context: contextSentence,
            pdfTitle
          })
        });

        const json = await response.json();

        if (json.success && json.data) {
          const resultData: WordLookupResult = {
            ...json.data,
            contextSentence,
            pageNumber: pageNum,
            pdfName: pdfTitle,
            timestamp: Date.now()
          };

          setCurrentResult(resultData);

          // Add to History (avoid immediate duplicates)
          setHistory((prev) => {
            const filtered = prev.filter(
              (item) => item.word.toLowerCase() !== resultData.word.toLowerCase()
            );
            return [resultData, ...filtered];
          });
        } else {
          setLookupError(json.error || "Failed to retrieve dictionary details.");
        }
      } catch (err: any) {
        console.error("Lookup error:", err);
        setLookupError("Network error while looking up word meaning.");
      } finally {
        setIsLookupLoading(false);
      }
    },
    [pdfTitle]
  );

  // Handle OCR Result from Box Crop
  const handleOcrResult = (result: OcrResult) => {
    if (result.wordBreakdown && result.wordBreakdown.length > 0) {
      const topWord = result.wordBreakdown[0];
      handleLookupWord(topWord.word, result.extractedText, 1);
    } else if (result.extractedText) {
      handleLookupWord(result.extractedText, result.translationEn, 1);
    }
  };

  // Handle PDF File Upload
  const handleFileUpload = (file: File) => {
    setPdfSource(file);
    setPdfTitle(file.name);
    setUploadedFiles((prev) => {
      const exists = prev.find((f) => f.name === file.name && f.size === file.size);
      if (exists) return prev;
      return [...prev, file];
    });
  };

  const handleLoadUploadedFile = (file: File) => {
    setPdfSource(file);
    setPdfTitle(file.name);
  };

  // Handle Sample Document Load
  const handleLoadSample = async (sampleIndex: number) => {
    const sample = SAMPLE_TEXTS[sampleIndex] || SAMPLE_TEXTS[0];
    const blob = await createSamplePdfBlob(sampleIndex);
    setPdfSource(blob);
    setPdfTitle(sample.title);
  };

  // Bookmark Toggle
  const toggleBookmark = (result: WordLookupResult) => {
    setBookmarks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(result.word)) {
        newSet.delete(result.word);
      } else {
        newSet.add(result.word);
      }
      return newSet;
    });
  };

  const historyWords = useMemo(() => {
    return Array.from(
      new Set(
        history.flatMap((h) => [h.word, h.cleanWord]).filter(Boolean)
      )
    ) as string[];
  }, [history]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F4F1EA] overflow-hidden text-[#2D2926] font-sans">
      {/* Top Navbar */}
      <Navbar
        onFileUpload={handleFileUpload}
        onLoadSample={handleLoadSample}
        uploadedFiles={uploadedFiles}
        onLoadUploadedFile={handleLoadUploadedFile}
        onToggleHistory={() => setIsHistoryOpen(!isHistoryOpen)}
        historyCount={history.length}
        onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        isSearchOpen={isSearchOpen}
        onOpenAbout={() => setIsAboutOpen(true)}
        currentTitle={pdfTitle}
      />

      {/* Manual Word Lookup Search Bar */}
      {isSearchOpen && (
        <ManualLookupBar
          onLookup={(word) => handleLookupWord(word, "", 1)}
          isLoading={isLookupLoading}
          onClose={() => setIsSearchOpen(false)}
        />
      )}

      {/* Main PDF Workspace Viewport */}
      <main className="flex-1 overflow-hidden p-2 sm:p-4">
        <PdfViewer
          pdfSource={pdfSource}
          pdfTitle={pdfTitle}
          onLookupWord={handleLookupWord}
          onOcrResult={handleOcrResult}
          highlightWords={historyWords}
        />
      </main>

      {/* Dictionary Drawer Side Panel */}
      <WordDictionaryDrawer
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        result={currentResult}
        isLoading={isLookupLoading}
        error={lookupError}
        onSaveBookmark={toggleBookmark}
        isBookmarked={currentResult ? bookmarks.has(currentResult.word) : false}
      />

      {/* Vocabulary History Side Drawer */}
      <LookupHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectWord={(wordObj) => {
          setCurrentResult(wordObj);
          setIsDictionaryOpen(true);
          setIsHistoryOpen(false);
        }}
        onClearHistory={() => setHistory([])}
      />

      {/* About & Guide Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
