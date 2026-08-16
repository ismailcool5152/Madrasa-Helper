import React from "react";
import { X, BookOpen, MousePointerClick, Scan, Sparkles, Layers, Volume2, Globe } from "lucide-react";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#2D2926]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-[#D1CEC7] animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#D1CEC7] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-sm bg-[#1B4332] text-white flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold uppercase tracking-tight text-[#2D2926]">Lisan Lexicon</h2>
              <p className="text-[10px] text-[#8C8880] uppercase tracking-widest font-mono">Digital Manuscript Reader & Dictionary</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-sm text-[#8C8880] hover:text-[#2D2926] hover:bg-stone-50 border border-transparent hover:border-[#D1CEC7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-[#2D2926] leading-relaxed">
          <p className="bg-[#1B4332]/10 p-4 rounded-sm border border-[#1B4332]/20 text-[#1B4332] font-medium">
            <strong className="uppercase tracking-wide text-[10px] block mb-1">What is Lisan ud Dawat (لسان الدعوة)?</strong>
            Lisan ud Dawat is the traditional language of the Dawoodi Bohra community. Written in the Arabic script, it blends rich Gujarati grammar with extensive Classical Arabic, Persian, and Urdu roots.
          </p>

          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-[#2D2926] uppercase tracking-widest text-[10px] flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#1B4332]" />
              <span>How To Use This Lexicon</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#F9F7F2] rounded-sm border border-[#D1CEC7] space-y-1">
                <div className="font-bold text-[#1B4332] flex items-center space-x-1.5 uppercase text-[11px]">
                  <MousePointerClick className="w-4 h-4" />
                  <span>1. Select Any Word</span>
                </div>
                <p className="text-[11px] text-[#5C5850]">
                  Highlight or double-click any Arabic or Lisan ud Dawat word in your PDF document to trigger the floating AI lookup button.
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F7F2] rounded-sm border border-[#D1CEC7] space-y-1">
                <div className="font-bold text-[#1B4332] flex items-center space-x-1.5 uppercase text-[11px]">
                  <Scan className="w-4 h-4" />
                  <span>2. Scanned PDF Box OCR</span>
                </div>
                <p className="text-[11px] text-[#5C5850]">
                  If your PDF is a scanned image or manuscript, toggle <strong>Box OCR Mode</strong> in the toolbar and drag a box over any text snippet.
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F7F2] rounded-sm border border-[#D1CEC7] space-y-1">
                <div className="font-bold text-[#1B4332] flex items-center space-x-1.5 uppercase text-[11px]">
                  <Layers className="w-4 h-4" />
                  <span>3. Root & Grammar</span>
                </div>
                <p className="text-[11px] text-[#5C5850]">
                  Get Arabic 3-letter roots (الجذر), part of speech, Gujarati and English meanings, and related derived words.
                </p>
              </div>

              <div className="p-3.5 bg-[#F9F7F2] rounded-sm border border-[#D1CEC7] space-y-1">
                <div className="font-bold text-[#1B4332] flex items-center space-x-1.5 uppercase text-[11px]">
                  <Volume2 className="w-4 h-4" />
                  <span>4. Audio & Vocabulary</span>
                </div>
                <p className="text-[11px] text-[#5C5850]">
                  Listen to vocalized pronunciation, save words to your history, and export your personal vocabulary list to CSV.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1B4332] hover:bg-[#2D5A47] text-white font-bold uppercase tracking-wider px-5 py-2.5 rounded-sm text-xs border border-[#1B4332] shadow-xs"
          >
            Start Reading
          </button>
        </div>
      </div>
    </div>
  );
};
