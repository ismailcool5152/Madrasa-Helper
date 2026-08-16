import React, { useState } from "react";
import { Search, Sparkles, X, Globe, Keyboard } from "lucide-react";

interface ManualLookupBarProps {
  onLookup: (word: string) => void;
  isLoading: boolean;
  onClose: () => void;
}

export const ManualLookupBar: React.FC<ManualLookupBarProps> = ({
  onLookup,
  isLoading,
  onClose
}) => {
  const [inputWord, setInputWord] = useState("");
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);

  const samplePhrases = [
    { arabic: "العِلْم", transliteration: "'Ilm", meaning: "Knowledge" },
    { arabic: "الخِدْمَة", transliteration: "Khidmat", meaning: "Service" },
    { arabic: "البَرَكَة", transliteration: "Barakat", meaning: "Blessings" },
    { arabic: "الأَدَب", transliteration: "Adab", meaning: "Etiquette" },
    { arabic: "الحِكْمَة", transliteration: "Hikmat", meaning: "Wisdom" },
    { arabic: "الإِخْلَاص", transliteration: "Ikhlas", meaning: "Sincerity" },
    { arabic: "الإِحْتِرَام", transliteration: "Ihteram", meaning: "Reverence" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputWord.trim()) {
      onLookup(inputWord.trim());
    }
  };

  return (
    <div className="bg-[#F9F7F2] border-b border-[#D1CEC7] px-4 py-3 shadow-xs">
      <div className="max-w-4xl mx-auto space-y-2">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value)}
              placeholder="Type or paste any Arabic or Lisan ud Dawat word (e.g., العلم, الخدمة, بركة, حكمة)..."
              dir="auto"
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#D1CEC7] rounded-sm text-[#2D2926] text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-all font-serif"
            />
            <Search className="w-4 h-4 text-[#8C8880] absolute left-3.5 top-3.5" />
            {inputWord && (
              <button
                type="button"
                onClick={() => setInputWord("")}
                className="p-1 text-[#8C8880] hover:text-[#2D2926] absolute right-3 top-3"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputWord.trim() || isLoading}
            className="bg-[#1B4332] text-white hover:bg-[#2D5A47] disabled:opacity-50 px-5 py-2.5 rounded-sm font-bold uppercase tracking-wider text-xs transition-all flex items-center space-x-1.5 shadow-xs border border-[#1B4332] shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Lookup Meaning</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 text-[#8C8880] hover:text-[#2D2926] hover:bg-black/5 rounded-sm transition-colors shrink-0"
            title="Close Search Bar"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Sample Word Badges */}
        <div className="flex flex-col space-y-1">
          <button 
            type="button"
            onClick={() => setShowQuickPhrases(!showQuickPhrases)}
            className="flex items-center space-x-1 w-fit text-[10px] font-bold text-[#8C8880] hover:text-[#2D2926] uppercase tracking-widest transition-colors"
          >
            <span>Common Vocabulary</span>
            <span className="text-[8px] bg-black/5 px-1 rounded-sm">{showQuickPhrases ? 'Hide' : 'Show'}</span>
          </button>
          
          {showQuickPhrases && (
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs no-scrollbar">
              {samplePhrases.map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputWord(phrase.arabic);
                    onLookup(phrase.arabic);
                  }}
                  className="px-2.5 py-1 bg-white hover:bg-[#1B4332]/10 text-[#2D2926] hover:text-[#1B4332] rounded-sm text-xs font-serif font-medium transition-colors border border-[#D1CEC7] shrink-0 flex items-center space-x-1"
                >
                  <span>{phrase.arabic}</span>
                  <span className="text-[10px] text-[#8C8880] font-sans font-normal">({phrase.transliteration})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
