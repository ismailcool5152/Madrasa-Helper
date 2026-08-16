import React, { useState } from "react";
import {
  X,
  History,
  Trash2,
  Download,
  Search,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { WordLookupResult } from "../types";

interface LookupHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: WordLookupResult[];
  onSelectWord: (word: WordLookupResult) => void;
  onClearHistory: () => void;
}

export const LookupHistoryDrawer: React.FC<LookupHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectWord,
  onClearHistory
}) => {
  const [filterQuery, setFilterQuery] = useState("");

  if (!isOpen) return null;

  const filteredHistory = history.filter(
    (item) =>
      item.word.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.transliteration.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.primaryMeaningEn.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (item.root && item.root.includes(filterQuery))
  );

  const exportCsv = () => {
    if (history.length === 0) return;
    const headers = "Word,Transliteration,Language,Root,Meaning EN,Meaning Gujarati,Definition\n";
    const rows = history
      .map(
        (item) =>
          `"${item.word}","${item.transliteration}","${item.language}","${item.root || ""}","${item.primaryMeaningEn}","${item.primaryMeaningGu || ""}","${item.definition.replace(/"/g, '""')}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Lisan_ud_Dawat_Vocabulary_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-[#F9F7F2] border-l border-[#D1CEC7] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white text-[#2D2926] px-6 py-4 flex items-center justify-between border-b border-[#D1CEC7]">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-[#1B4332]" />
          <h2 className="font-bold uppercase tracking-wider text-sm text-[#2D2926]">Recent Lookups ({history.length})</h2>
        </div>

        <div className="flex items-center space-x-2">
          {history.length > 0 && (
            <>
              <button
                onClick={exportCsv}
                className="px-2.5 py-1 rounded-sm bg-white border border-[#D1CEC7] text-[#2D2926] hover:bg-stone-50 text-xs font-bold uppercase tracking-wider flex items-center space-x-1"
                title="Export CSV Vocabulary List"
              >
                <Download className="w-3.5 h-3.5 text-[#1B4332]" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={onClearHistory}
                className="p-1.5 rounded-sm bg-white border border-[#D1CEC7] text-[#2D2926] hover:text-red-600 hover:bg-stone-50 text-xs"
                title="Clear History"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm bg-white border border-[#D1CEC7] text-[#2D2926] hover:bg-stone-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#F4F1EA] border-b border-[#D1CEC7]">
        <div className="relative">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter saved words by root, transliteration, or meaning..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#D1CEC7] rounded-sm text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
          />
          <Search className="w-4 h-4 text-[#8C8880] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* History Cards List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9F7F2]">
        {filteredHistory.length === 0 ? (
          <div className="py-16 text-center text-[#8C8880] space-y-2">
            <BookOpen className="w-10 h-10 mx-auto opacity-30 text-[#1B4332]" />
            <p className="text-xs font-bold uppercase tracking-widest text-[#2D2926]">No lookups recorded yet.</p>
            <p className="text-xs text-[#8C8880] max-w-xs mx-auto">
              Highlight any Arabic or Lisan ud Dawat word in your PDF to instantly see and save its dictionary breakdown!
            </p>
          </div>
        ) : (
          filteredHistory.map((item, idx) => (
            <div
              key={idx}
              onClick={() => onSelectWord(item)}
              className="p-4 bg-white rounded-sm border border-[#D1CEC7] hover:border-[#1B4332] hover:shadow-xs transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold font-serif text-[#1B4332] group-hover:text-[#2D5A47]">
                    {item.word}
                  </h3>
                  <span className="text-xs italic text-[#5C5850] font-serif">
                    "{item.transliteration}"
                  </span>
                </div>
                {item.root && (
                  <span className="text-[10px] font-mono font-bold bg-[#1B4332]/10 text-[#1B4332] border border-[#1B4332]/20 px-2 py-0.5 rounded-sm">
                    {item.root}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#2D2926] font-semibold line-clamp-1">
                {item.primaryMeaningEn}
              </p>

              {item.primaryMeaningGu && (
                <p className="text-[11px] text-[#8C8880] line-clamp-1">
                  {item.primaryMeaningGu}
                </p>
              )}

              <div className="flex items-center justify-between text-[10px] text-[#8C8880] pt-1.5 border-t border-[#F0EEE8]">
                <span className="uppercase tracking-wider font-mono">{item.language}</span>
                {item.pageNumber && <span className="font-mono">Page {item.pageNumber}</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
