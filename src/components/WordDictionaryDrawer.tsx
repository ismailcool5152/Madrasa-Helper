import React, { useState } from "react";
import {
  X,
  Volume2,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  Layers,
  FileText,
  Compass,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Loader2,
  GitCommit,
  Grid,
  Lightbulb,
  HelpCircle as QuizIcon,
  RotateCcw,
  User,
  Users,
  Clock,
  Briefcase,
  ListFilter,
  Quote
} from "lucide-react";
import { WordLookupResult } from "../types";

interface WordDictionaryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  result: WordLookupResult | null;
  isLoading: boolean;
  error: string | null;
  onSaveBookmark?: (item: WordLookupResult) => void;
  isBookmarked?: boolean;
}

export const WordDictionaryDrawer: React.FC<WordDictionaryDrawerProps> = ({
  isOpen,
  onClose,
  result,
  isLoading,
  error,
  onSaveBookmark,
  isBookmarked = false
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "wordbyword" | "construction" | "variations" | "quiz">("overview");

  // Quiz state
  const [quizFlipped, setQuizFlipped] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!result) return;
    const textToCopy = `${result.word} (${result.transliteration}) - ${result.primaryMeaningEn}\nRoot: ${result.root || "N/A"}\nDefinition: ${result.definition}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const speakWord = (customText?: string) => {
    const textToSpeak = customText || result?.word;
    if (!textToSpeak) return;
    try {
      setIsPlayingAudio(true);
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = "ar-SA";
      utterance.rate = 0.85;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const grammaticalFormsList = result?.grammaticalForms
    ? Object.entries(result.grammaticalForms).filter(([_, val]) => Boolean(val?.arabic))
    : [];

  const hasWordBreakdown = Boolean(result?.wordBreakdown && result.wordBreakdown.length > 0);
  const isVerse = Boolean(result?.isVerseOrPhrase || hasWordBreakdown || (result?.word && result.word.trim().split(/\s+/).length > 1));

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-[#F9F7F2] border-l border-[#D1CEC7] shadow-2xl z-50 flex flex-col transition-all duration-300 ease-in-out">
      {/* Top Drawer Header */}
      <div className="bg-white text-[#2D2926] px-6 py-4 flex items-center justify-between border-b border-[#D1CEC7]">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-sm bg-[#1B4332] text-white flex items-center justify-center font-bold">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#2D2926]">Dictionary & Grammar</h2>
            <p className="text-[10px] text-[#8C8880] uppercase tracking-widest font-mono">Lisan ud Dawat Lexicon</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {result && onSaveBookmark && (
            <button
              onClick={() => onSaveBookmark(result)}
              className={`p-2 rounded-sm transition-colors ${
                isBookmarked
                  ? "bg-[#1B4332] text-white border border-[#1B4332]"
                  : "bg-white text-[#2D2926] border border-[#D1CEC7] hover:bg-stone-50"
              }`}
              title={isBookmarked ? "Saved in vocabulary" : "Save word"}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-sm bg-white border border-[#D1CEC7] text-[#2D2926] hover:bg-stone-50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Result Tabs Navigation Bar */}
      {result && !isLoading && (
        <div className="bg-[#F4F1EA] border-b border-[#D1CEC7] px-4 pt-2 flex items-center space-x-1 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === "overview"
                ? "border-[#1B4332] text-[#1B4332] bg-white rounded-t-sm"
                : "border-transparent text-[#8C8880] hover:text-[#2D2926]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          {(isVerse || hasWordBreakdown) && (
            <button
              onClick={() => setActiveTab("wordbyword")}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === "wordbyword"
                  ? "border-[#1B4332] text-[#1B4332] bg-white rounded-t-sm"
                  : "border-transparent text-[#1B4332] font-extrabold hover:text-[#2D2926]"
              }`}
            >
              <ListFilter className="w-3.5 h-3.5 text-[#1B4332]" />
              <span>Word-by-Word</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab("construction")}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === "construction"
                ? "border-[#1B4332] text-[#1B4332] bg-white rounded-t-sm"
                : "border-transparent text-[#8C8880] hover:text-[#2D2926]"
            }`}
          >
            <GitCommit className="w-3.5 h-3.5" />
            <span>Construction</span>
          </button>

          <button
            onClick={() => setActiveTab("variations")}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === "variations"
                ? "border-[#1B4332] text-[#1B4332] bg-white rounded-t-sm"
                : "border-transparent text-[#8C8880] hover:text-[#2D2926]"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Forms ({grammaticalFormsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === "quiz"
                ? "border-[#1B4332] text-[#1B4332] bg-white rounded-t-sm"
                : "border-transparent text-[#8C8880] hover:text-[#2D2926]"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Fun & Quiz</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F9F7F2]">
        {isLoading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-[#1B4332]/20 border-t-[#1B4332] animate-spin" />
              <Sparkles className="w-6 h-6 text-[#1B4332] absolute inset-0 m-auto" />
            </div>
            <div>
              <h3 className="font-bold text-[#2D2926] uppercase tracking-wider text-xs">Deconstructing Word & Morphology...</h3>
              <p className="text-[11px] text-[#8C8880] mt-1">Extracting 3-letter root, forms, and meaning shifts</p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-6 bg-red-50 rounded-sm border border-red-200 text-center space-y-3 my-8">
            <p className="text-sm text-red-800 font-bold">{error}</p>
            <p className="text-xs text-red-600">Please try selecting another word or check your network connection.</p>
          </div>
        )}

        {result && !isLoading && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Hero Word Display Card */}
            <div className="bg-[#1B4332] text-white p-6 rounded-sm border border-[#1B4332] shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-9xl font-serif text-white">
                {result.word.charAt(0)}
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-100 bg-[#2D5A47] border border-emerald-400/30 px-2.5 py-1 rounded-sm">
                    {result.language || "Arabic / Lisan ud Dawat"}
                  </span>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => speakWord()}
                      disabled={isPlayingAudio}
                      className="p-2 rounded-sm bg-[#2D5A47] hover:bg-emerald-800 text-white transition-colors border border-emerald-500/30"
                      title="Listen Arabic Pronunciation"
                    >
                      <Volume2 className={`w-4 h-4 ${isPlayingAudio ? "animate-pulse text-emerald-200" : ""}`} />
                    </button>
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-sm bg-[#2D5A47] hover:bg-emerald-800 text-white transition-colors border border-emerald-500/30"
                      title="Copy Word Details"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Arabic Script Word */}
                <div className="pt-2 text-right">
                  <h1 className="text-4xl sm:text-5xl font-bold font-serif text-white leading-snug tracking-wide">
                    {result.word}
                  </h1>
                </div>

                {/* Roman Transliteration & Part of speech */}
                <div className="flex items-center justify-between text-sm text-emerald-100 font-medium pt-2 border-t border-[#2D5A47]">
                  <span className="italic font-serif text-base text-emerald-200">
                    "{result.transliteration}"
                  </span>
                  {result.partOfSpeech && (
                    <span className="text-[10px] font-bold uppercase bg-[#2D5A47] text-emerald-100 px-2 py-0.5 rounded-sm font-mono border border-emerald-500/30">
                      {result.partOfSpeech}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Entire Verse / Statement Translation Banner if verse */}
                {isVerse && (
                  <div className="bg-white border-2 border-[#1B4332] p-5 rounded-sm space-y-3 shadow-xs">
                    <div className="flex items-center space-x-2 text-[#1B4332]">
                      <Quote className="w-4 h-4 text-[#1B4332]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider">Entire Statement Translation</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 bg-[#F4F1EA] rounded-sm border border-[#D1CEC7]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-0.5">English</span>
                        <p className="text-sm font-semibold text-[#2D2926]">
                          {result.entireTranslationEn || result.primaryMeaningEn}
                        </p>
                      </div>

                      {(result.entireTranslationGu || result.primaryMeaningGu) && (
                        <div className="p-3 bg-[#F4F1EA] rounded-sm border border-[#D1CEC7]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332] block mb-0.5">Gujarati (ગુજરાતી)</span>
                          <p className="text-sm font-medium text-[#2D2926]">
                            {result.entireTranslationGu || result.primaryMeaningGu}
                          </p>
                        </div>
                      )}

                      {(result.entireTranslationUr || result.primaryMeaningUr) && (
                        <div className="p-3 bg-[#F4F1EA] rounded-sm border border-[#D1CEC7]">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block mb-0.5">Urdu (اردو)</span>
                          <p className="text-sm font-medium text-[#2D2926] font-serif" dir="rtl">
                            {result.entireTranslationUr || result.primaryMeaningUr}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Word by Word Summary in Overview */}
                {hasWordBreakdown && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-bold text-[#1B4332] uppercase tracking-widest flex items-center space-x-1.5">
                        <ListFilter className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span>Word-by-Word Breakdown ({result.wordBreakdown!.length} words)</span>
                      </h3>
                      <button
                        onClick={() => setActiveTab("wordbyword")}
                        className="text-[11px] font-bold text-[#1B4332] hover:underline flex items-center space-x-1"
                      >
                        <span>Full Breakdown</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {result.wordBreakdown!.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-sm border border-[#D1CEC7] hover:border-[#1B4332] transition-colors flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-base font-serif text-[#1B4332]">{item.word}</span>
                              {item.transliteration && (
                                <span className="text-[11px] text-[#8C8880] italic">({item.transliteration})</span>
                              )}
                            </div>
                            <p className="text-xs font-medium text-[#2D2926]">
                              {item.meaningEn || item.meaningGu}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => speakWord(item.word)}
                              className="p-1.5 text-[#8C8880] hover:text-[#1B4332] hover:bg-stone-100 rounded-sm"
                              title="Listen word"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            {item.root && (
                              <span className="text-[10px] font-bold bg-[#F4F1EA] text-[#1B4332] border border-[#D1CEC7] px-2 py-0.5 rounded-sm font-mono">
                                {item.root}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}

                      {result.wordBreakdown!.length > 6 && (
                        <button
                          onClick={() => setActiveTab("wordbyword")}
                          className="py-2 text-center text-xs font-bold text-[#1B4332] bg-[#F4F1EA] hover:bg-stone-200 rounded-sm border border-[#D1CEC7]"
                        >
                          Show all {result.wordBreakdown!.length} words →
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Arabic Root ( المادة / الجذر ) */}
                {result.root && result.root !== "N/A" && (
                  <div className="bg-[#F4F1EA] border border-[#1B4332] p-5 rounded-sm flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-[10px] uppercase tracking-widest text-[#1B4332] font-bold flex items-center space-x-1">
                        <Layers className="w-3.5 h-3.5 text-[#1B4332]" />
                        <span>Arabic Root (الجذر)</span>
                      </div>
                      <p className="text-xs text-[#5C5850] font-medium">
                        {result.rootMeaning || "Core Root Meaning"}
                      </p>
                    </div>
                    <div className="text-2xl font-bold font-serif text-[#1B4332] bg-white px-4 py-1.5 rounded-sm border border-[#1B4332] dir-rtl">
                      {result.root}
                    </div>
                  </div>
                )}

                {/* Multilingual Meaning Breakdown */}
                {!isVerse && (
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-[#8C8880] uppercase tracking-widest flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>Primary Meanings</span>
                    </h3>

                    <div className="grid grid-cols-1 gap-2.5">
                      {/* English */}
                      <div className="bg-white p-4 rounded-sm border border-[#D1CEC7] shadow-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">English</span>
                        <p className="text-sm font-semibold text-[#2D2926]">{result.primaryMeaningEn}</p>
                      </div>

                      {/* Gujarati (Lisan ud Dawat script) */}
                      {result.primaryMeaningGu && (
                        <div className="bg-white p-4 rounded-sm border border-[#D1CEC7] shadow-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1B4332]">Gujarati (ગુજરાતી)</span>
                          <p className="text-sm font-medium text-[#2D2926]">{result.primaryMeaningGu}</p>
                        </div>
                      )}

                      {/* Urdu */}
                      {result.primaryMeaningUr && (
                        <div className="bg-white p-4 rounded-sm border border-[#D1CEC7] shadow-xs space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">Urdu (اردو)</span>
                          <p className="text-sm font-medium text-[#2D2926] font-serif" dir="rtl">{result.primaryMeaningUr}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Detailed Definition & Literary Background */}
                <div className="bg-white p-5 rounded-sm border border-[#D1CEC7] shadow-xs space-y-2">
                  <h3 className="text-[10px] font-bold text-[#8C8880] uppercase tracking-widest">
                    Comprehensive Definition & Nuance
                  </h3>
                  <p className="text-xs leading-relaxed text-[#2D2926]">
                    {result.definition}
                  </p>

                  {result.contextNote && (
                    <div className="mt-3 p-3 bg-[#F4F1EA] rounded-sm border border-[#D1CEC7] text-xs text-[#2D2926] space-y-1">
                      <span className="font-bold text-[#1B4332] text-[10px] uppercase tracking-wider block">In this PDF Context:</span>
                      <p className="italic text-[#5C5850]">{result.contextNote}</p>
                    </div>
                  )}
                </div>

                {/* Example Sentence */}
                {result.exampleSentence && (
                  <div className="bg-[#F4F1EA] p-5 rounded-sm border border-[#1B4332] space-y-2">
                    <h3 className="text-[10px] font-bold text-[#1B4332] uppercase tracking-widest">
                      Example Manuscript Usage
                    </h3>
                    <p className="text-lg font-bold font-serif text-[#1B4332] text-right leading-relaxed" dir="rtl">
                      {result.exampleSentence.arabic}
                    </p>
                    <p className="text-xs italic text-[#5C5850]">
                      {result.exampleSentence.transliteration}
                    </p>
                    <p className="text-xs text-[#2D2926] font-medium pt-1 border-t border-[#D1CEC7]">
                      {result.exampleSentence.translation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: WORD BY WORD DETAILED DECONSTRUCTION */}
            {activeTab === "wordbyword" && (
              <div className="space-y-6">
                {/* Complete Verse Translation Banner */}
                <div className="bg-[#1B4332] text-white p-5 rounded-sm space-y-3 shadow-md">
                  <div className="flex items-center space-x-2 text-emerald-200">
                    <Quote className="w-4 h-4" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Verse Full Translation</h3>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 bg-[#2D5A47] rounded-sm border border-emerald-500/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block mb-0.5">English Translation</span>
                      <p className="text-sm font-semibold text-white">
                        {result.entireTranslationEn || result.primaryMeaningEn}
                      </p>
                    </div>

                    {(result.entireTranslationGu || result.primaryMeaningGu) && (
                      <div className="p-3 bg-[#2D5A47] rounded-sm border border-emerald-500/30">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block mb-0.5">Gujarati (ગુજરાતી)</span>
                        <p className="text-xs font-medium text-emerald-50">
                          {result.entireTranslationGu || result.primaryMeaningGu}
                        </p>
                      </div>
                    )}

                    {(result.entireTranslationUr || result.primaryMeaningUr) && (
                      <div className="p-3 bg-[#2D5A47] rounded-sm border border-emerald-500/30">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block mb-0.5">Urdu (اردو)</span>
                        <p className="text-xs font-medium text-emerald-50 font-serif" dir="rtl">
                          {result.entireTranslationUr || result.primaryMeaningUr}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Word Chips Row */}
                <div className="bg-white p-4 rounded-sm border border-[#D1CEC7] space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] block">Interactive Verse Line (Click any word to hear)</span>
                  <div className="flex flex-wrap flex-row-reverse gap-2 text-right dir-rtl">
                    {result.wordBreakdown?.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => speakWord(item.word)}
                        className="px-3 py-1.5 bg-[#F4F1EA] hover:bg-[#1B4332] hover:text-white rounded-sm border border-[#D1CEC7] text-lg font-serif font-bold transition-all text-[#1B4332] group"
                      >
                        <span>{item.word}</span>
                        <span className="text-[9px] block text-[#8C8880] group-hover:text-emerald-200 font-sans font-normal italic dir-ltr">
                          {item.transliteration}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Breakdown Cards List */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#8C8880] uppercase tracking-widest">
                    Grammatical Word-by-Word Analysis
                  </h4>

                  {result.wordBreakdown?.map((item, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-sm border border-[#D1CEC7] shadow-xs space-y-2 hover:border-[#1B4332] transition-colors">
                      <div className="flex items-center justify-between border-b border-[#F0EEE8] pb-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 rounded-sm bg-[#1B4332] text-white flex items-center justify-center text-xs font-bold font-mono">
                            {idx + 1}
                          </span>
                          <button
                            onClick={() => speakWord(item.word)}
                            className="p-1.5 text-[#8C8880] hover:text-[#1B4332] hover:bg-stone-100 rounded-sm"
                            title="Listen word"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <h4 className="text-2xl font-bold font-serif text-[#1B4332]">{item.word}</h4>
                          <p className="text-xs italic text-[#5C5850]">"{item.transliteration}"</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-[#8C8880] block">English Meaning</span>
                          <p className="font-semibold text-[#2D2926]">{item.meaningEn || item.meaningGu}</p>
                        </div>

                        {item.meaningGu && (
                          <div>
                            <span className="text-[10px] font-bold uppercase text-[#1B4332] block">Gujarati Meaning</span>
                            <p className="font-medium text-[#2D2926]">{item.meaningGu}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-[#F0EEE8] pt-2 text-[11px]">
                        {item.root ? (
                          <span className="font-bold text-[#1B4332] bg-[#F4F1EA] px-2 py-0.5 rounded-sm border border-[#D1CEC7]">
                            Root (الجذر): <span className="font-serif font-bold text-sm">{item.root}</span>
                          </span>
                        ) : (
                          <span className="text-[#8C8880]">Root: Non-root / Particle</span>
                        )}

                        {item.partOfSpeech && (
                          <span className="text-[10px] font-bold uppercase text-[#8C8880] bg-stone-100 px-2 py-0.5 rounded-sm">
                            {item.partOfSpeech}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: WORD CONSTRUCTION & MORPHOLOGY */}
            {activeTab === "construction" && (
              <div className="space-y-6">
                <div className="bg-[#1B4332]/5 p-4 rounded-sm border border-[#1B4332]/20 space-y-1 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-[#1B4332] text-[11px] flex items-center space-x-1.5">
                    <GitCommit className="w-4 h-4" />
                    <span>How This Word Is Built (كَيْفَ بُنِيَتِ الْكَلِمَةُ)</span>
                  </h3>
                  <p className="text-[#5C5850] leading-relaxed">
                    Arabic and Lisan ud Dawat words are constructed by taking a 3-letter core root (المادة) and applying morphological weights (الوزن), prefixes, and suffixes to alter gender, number, or function.
                  </p>
                </div>

                {/* Root & Pattern Badge */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-4 rounded-sm border border-[#D1CEC7] space-y-1 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">Core Root (الجذر)</span>
                    <p className="text-2xl font-bold font-serif text-[#1B4332]">{result.root || result.morphology?.root || "N/A"}</p>
                    <p className="text-[11px] text-[#5C5850] italic">{result.rootMeaning || result.morphology?.rootMeaning}</p>
                  </div>

                  <div className="bg-white p-4 rounded-sm border border-[#D1CEC7] space-y-1 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880]">Pattern Weight (الوزن)</span>
                    <p className="text-xl font-bold font-serif text-[#1B4332]">{result.morphology?.pattern || "فَعَلَ"}</p>
                    <p className="text-[11px] text-[#5C5850]">{result.morphology?.patternMeaning || result.morphology?.wordClass || "Word Pattern"}</p>
                  </div>
                </div>

                {/* Construction Assembly Steps */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-[#8C8880] uppercase tracking-widest">
                    Step-by-Step Construction Timeline
                  </h4>

                  {result.morphology?.constructionSteps && result.morphology.constructionSteps.length > 0 ? (
                    <div className="space-y-2">
                      {result.morphology.constructionSteps.map((step, idx) => (
                        <div key={idx} className="bg-white p-3.5 rounded-sm border border-[#D1CEC7] flex items-start space-x-3">
                          <div className="w-7 h-7 rounded-sm bg-[#1B4332] text-white flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-base font-bold font-serif text-[#1B4332]">{step.part}</span>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-[#F4F1EA] text-[#1B4332] border border-[#D1CEC7]">
                                {step.type}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-[#2D2926]">{step.role}</p>
                            <p className="text-[11px] text-[#5C5850]">{step.contribution}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white p-4 rounded-sm border border-[#D1CEC7] space-y-3 text-xs">
                      <div className="flex items-center space-x-2 text-[#1B4332]">
                        <span className="font-serif font-bold text-xl">{result.root}</span>
                        <ArrowRight className="w-4 h-4 text-[#8C8880]" />
                        <span className="font-serif font-bold text-xl">{result.word}</span>
                      </div>
                      <p className="text-[#5C5850]">
                        The word <strong>{result.word}</strong> is formed directly from the root <strong>{result.root}</strong> ({result.rootMeaning}), carrying the pattern weight of <em>{result.partOfSpeech || "Noun/Verb"}</em>.
                      </p>
                    </div>
                  )}
                </div>

                {/* Meaning Shift Rule Box */}
                {result.meaningShiftExplanation && (
                  <div className="bg-amber-500/10 border border-amber-600/30 p-4 rounded-sm space-y-2 text-xs">
                    <span className="font-bold text-amber-900 uppercase tracking-wider text-[10px] flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>How Meaning Changes with Form</span>
                    </span>
                    <p className="text-[#2D2926] leading-relaxed">
                      {result.meaningShiftExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: GRAMMATICAL VARIATIONS MATRIX */}
            {activeTab === "variations" && (
              <div className="space-y-6">
                <div className="bg-[#1B4332]/5 p-4 rounded-sm border border-[#1B4332]/20 space-y-1 text-xs">
                  <h3 className="font-bold uppercase tracking-wider text-[#1B4332] text-[11px] flex items-center space-x-1.5">
                    <Grid className="w-4 h-4" />
                    <span>Grammatical Forms & Meaning Spectrum</span>
                  </h3>
                  <p className="text-[#5C5850] leading-relaxed">
                    Explore how this word transforms across Singular, Dual, Plural, Male, Female, Verbs, Doer (Active), and Object (Passive) forms.
                  </p>
                </div>

                {grammaticalFormsList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(result.grammaticalForms || {}).map(([key, form]) => {
                      if (!form?.arabic) return null;
                      const labelMap: Record<string, { label: string; icon: any }> = {
                        singular: { label: "Singular (المفرد)", icon: User },
                        dual: { label: "Dual (المثنى)", icon: Users },
                        plural: { label: "Plural (الجمع)", icon: Users },
                        masculine: { label: "Masculine (المذكر)", icon: User },
                        feminine: { label: "Feminine (المؤنث)", icon: User },
                        pastVerb: { label: "Past Verb (الماضي)", icon: Clock },
                        presentVerb: { label: "Present Verb (المضارع)", icon: Clock },
                        imperative: { label: "Command (الأمر)", icon: Clock },
                        activeParticiple: { label: "Active Doer (اسم الفاعل)", icon: Briefcase },
                        passiveParticiple: { label: "Passive Object (اسم المفعول)", icon: Briefcase },
                        nounOfPlace: { label: "Place/Time (اسم المكان)", icon: Briefcase }
                      };

                      const itemInfo = labelMap[key] || { label: key, icon: Sparkles };
                      const IconComp = itemInfo.icon;

                      return (
                        <div
                          key={key}
                          className="bg-white p-4 rounded-sm border border-[#D1CEC7] shadow-xs space-y-2 hover:border-[#1B4332] transition-all group"
                        >
                          <div className="flex items-center justify-between border-b border-[#F0EEE8] pb-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C8880] flex items-center space-x-1">
                              <IconComp className="w-3 h-3 text-[#1B4332]" />
                              <span>{itemInfo.label}</span>
                            </span>
                            <button
                              onClick={() => speakWord(form.arabic)}
                              className="p-1 rounded-sm text-[#8C8880] hover:text-[#1B4332] hover:bg-stone-50"
                              title="Listen"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <h4 className="text-2xl font-bold font-serif text-[#1B4332] group-hover:text-[#2D5A47]">
                              {form.arabic}
                            </h4>
                            <p className="text-xs italic text-[#5C5850]">"{form.transliteration}"</p>
                          </div>

                          <p className="text-xs font-semibold text-[#2D2926] border-t border-[#F0EEE8] pt-1.5">
                            {form.meaning}
                          </p>

                          {form.explanation && (
                            <p className="text-[11px] text-[#8C8880] italic">
                              {form.explanation}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white p-6 text-center space-y-3 rounded-sm border border-[#D1CEC7]">
                    <Layers className="w-8 h-8 mx-auto text-[#1B4332] opacity-40" />
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2D2926]">Form Variations Ready</p>
                    <p className="text-xs text-[#5C5850] max-w-xs mx-auto">
                      Derived from root <strong>{result.root || result.word}</strong>. Explore the word construction tab to view prefix/suffix breakdowns.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: FUN FACTS & INTERACTIVE QUIZ */}
            {activeTab === "quiz" && (
              <div className="space-y-6">
                {/* Fun Fact Card */}
                {result.funFact ? (
                  <div className="bg-[#1B4332] text-white p-5 rounded-sm shadow-sm space-y-2 relative overflow-hidden">
                    <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-widest">
                      <Lightbulb className="w-4 h-4 text-amber-300" />
                      <span>Linguistic Fun Fact & Memory Tip</span>
                    </div>
                    <p className="text-xs leading-relaxed text-emerald-50 font-medium">
                      {result.funFact}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#1B4332] text-white p-5 rounded-sm shadow-sm space-y-2">
                    <div className="flex items-center space-x-2 text-emerald-200 text-xs font-bold uppercase tracking-widest">
                      <Lightbulb className="w-4 h-4 text-amber-300" />
                      <span>Memory Mnemonic</span>
                    </div>
                    <p className="text-xs text-emerald-50">
                      In Arabic & Lisan ud Dawat, all words connected to the root <strong>{result.root}</strong> revolve around the core concept of <em>"{result.rootMeaning || result.primaryMeaningEn}"</em>.
                    </p>
                  </div>
                )}

                {/* Interactive Flashcard Quiz */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold text-[#8C8880] uppercase tracking-widest flex items-center space-x-1">
                      <QuizIcon className="w-3.5 h-3.5 text-[#1B4332]" />
                      <span>Interactive Self-Test Flashcard</span>
                    </h4>
                    <span className="text-[10px] font-bold font-mono text-[#1B4332]">
                      Score: {quizScore}
                    </span>
                  </div>

                  <div className="bg-white p-6 rounded-sm border-2 border-[#1B4332] shadow-sm text-center space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-[#8C8880] tracking-widest">Word Under Study</span>
                      <h3 className="text-3xl font-bold font-serif text-[#1B4332]">{result.word}</h3>
                    </div>

                    {!quizFlipped ? (
                      <div className="space-y-4 pt-2 border-t border-[#F0EEE8]">
                        <p className="text-xs font-medium text-[#2D2926]">
                          Can you recall the <strong>3-letter root</strong> and <strong>primary meaning</strong> of this word?
                        </p>

                        <button
                          onClick={() => setQuizFlipped(true)}
                          className="w-full py-2.5 bg-[#1B4332] text-white font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-[#2D5A47] transition-colors shadow-xs"
                        >
                          Tap to Reveal Answer
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-2 border-t border-[#F0EEE8] animate-in fade-in">
                        <div className="bg-[#F4F1EA] p-3 rounded-sm border border-[#D1CEC7] text-left space-y-1 text-xs">
                          <p><strong>Root (الجذر):</strong> <span className="font-serif font-bold text-[#1B4332] text-sm">{result.root || "N/A"}</span></p>
                          <p><strong>Meaning:</strong> {result.primaryMeaningEn}</p>
                          {result.grammaticalForms?.plural && (
                            <p><strong>Plural Form:</strong> <span className="font-serif font-bold text-[#1B4332]">{result.grammaticalForms.plural.arabic}</span> ({result.grammaticalForms.plural.meaning})</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setQuizScore((s) => s + 1);
                              setQuizFlipped(false);
                            }}
                            className="flex-1 py-2 bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-emerald-800"
                          >
                            I Got It Right! 🎉
                          </button>
                          <button
                            onClick={() => setQuizFlipped(false)}
                            className="px-4 py-2 bg-stone-200 text-[#2D2926] font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-stone-300"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

