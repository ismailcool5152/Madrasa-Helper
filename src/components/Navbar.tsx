import React, { useRef } from "react";
import {
  BookOpen,
  Upload,
  FileText,
  History,
  Search,
  Sparkles,
  Info,
  HelpCircle,
  Layers,
  ChevronDown
} from "lucide-react";
import { SAMPLE_TEXTS } from "../utils/samplePdfCreator";

interface NavbarProps {
  onFileUpload: (file: File) => void;
  onLoadSample: (sampleIndex: number) => void;
  uploadedFiles?: File[];
  onLoadUploadedFile?: (file: File) => void;
  onToggleHistory: () => void;
  historyCount: number;
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  onOpenAbout: () => void;
  currentTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onFileUpload,
  onLoadSample,
  uploadedFiles = [],
  onLoadUploadedFile,
  onToggleHistory,
  historyCount,
  onToggleSearch,
  isSearchOpen,
  onOpenAbout,
  currentTitle
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        onFileUpload(file);
      } else {
        alert("Please upload a valid PDF document (.pdf)");
      }
    }
  };

  return (
    <header className="bg-white border-b border-[#D1CEC7] sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#1B4332] text-white font-bold rounded-md flex items-center justify-center text-xl shadow-xs shrink-0">
            <BookOpen className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-[#2D2926] tracking-tight uppercase">
                Lisan Lexicon
              </h1>
              <span className="text-[10px] bg-[#1B4332]/10 text-[#1B4332] px-2 py-0.5 rounded-sm border border-[#1B4332]/20 font-serif font-bold">
                لسان الدعوة
              </span>
            </div>
            <p className="text-[10px] text-[#8C8880] uppercase tracking-[0.2em] hidden sm:block font-medium">
              Digital Manuscript Reader
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* File Upload Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/pdf"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-[#1B4332] hover:bg-[#2D5A47] text-white font-bold uppercase tracking-wider px-3.5 py-2 rounded-sm text-xs transition-all flex items-center space-x-1.5 shadow-xs border border-[#1B4332]"
            title="Upload your Arabic or Lisan ud Dawat PDF document"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upload PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Documents Dropdown */}
          <div className="relative group">
            <button
              className="bg-white hover:bg-stone-50 text-[#2D2926] border border-[#D1CEC7] px-3 py-2 rounded-sm text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-[#1B4332]" />
              <span className="hidden md:inline">Documents</span>
              <ChevronDown className="w-3 h-3 text-[#8C8880]" />
            </button>

            <div className="absolute right-0 mt-1 w-64 bg-white border border-[#D1CEC7] rounded-sm shadow-xl p-2 hidden group-hover:block z-50 max-h-96 overflow-y-auto">
              {uploadedFiles.length > 0 && (
                <div className="mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C8880] px-2 py-1">
                    Your Uploaded Files
                  </div>
                  {uploadedFiles.map((file, idx) => (
                    <button
                      key={`uploaded-${idx}`}
                      onClick={() => onLoadUploadedFile && onLoadUploadedFile(file)}
                      className="w-full text-left p-2 hover:bg-[#F9F7F2] rounded-sm transition-colors space-y-0.5 group/item"
                    >
                      <p className="text-xs font-bold text-[#1B4332] group-hover/item:text-[#2D5A47]">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-[#8C8880] line-clamp-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </button>
                  ))}
                  <div className="h-px bg-[#D1CEC7] my-2" />
                </div>
              )}

              <div className="text-[10px] font-bold uppercase tracking-widest text-[#8C8880] px-2 py-1">
                Pre-Loaded Manuscripts
              </div>
              {SAMPLE_TEXTS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => onLoadSample(idx)}
                  className="w-full text-left p-2 hover:bg-[#F9F7F2] rounded-sm transition-colors space-y-0.5 group/item"
                >
                  <p className="text-xs font-bold text-[#1B4332] group-hover/item:text-[#2D5A47]">
                    {sample.title}
                  </p>
                  <p className="text-[10px] text-[#8C8880] line-clamp-1">
                    {sample.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Word Search Toggle */}
          <button
            onClick={onToggleSearch}
            className={`p-2 rounded-sm border text-xs font-semibold uppercase tracking-wider transition-all flex items-center space-x-1 ${
              isSearchOpen
                ? "bg-[#1B4332] text-white border-[#1B4332]"
                : "bg-white text-[#2D2926] border-[#D1CEC7] hover:bg-stone-50"
            }`}
            title="Toggle Direct Word Search Bar"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline">Search</span>
          </button>

          {/* History Toggle */}
          <button
            onClick={onToggleHistory}
            className="p-2 rounded-sm bg-white text-[#2D2926] border border-[#D1CEC7] hover:bg-stone-50 transition-all relative"
            title="Saved & History Words"
          >
            <History className="w-4 h-4 text-[#1B4332]" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#1B4332] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {historyCount}
              </span>
            )}
          </button>

          {/* About / Help */}
          <button
            onClick={onOpenAbout}
            className="p-2 rounded-sm bg-white text-[#2D2926] border border-[#D1CEC7] hover:bg-stone-50 transition-all"
            title="About Lisan ud Dawat PDF Reader"
          >
            <Info className="w-4 h-4 text-[#8C8880]" />
          </button>
        </div>
      </div>
    </header>
  );
};
