import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Scan,
  Sparkles,
  AlertCircle,
  Loader2,
  MousePointerClick
} from "lucide-react";
import { SelectionState, OcrResult } from "../types";
import { PdfPage } from "./PdfPage";

// Configure pdfjs-dist worker
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  pdfSource: File | Blob | string | null;
  pdfTitle: string;
  onLookupWord: (word: string, contextSentence: string, pageNum: number) => void;
  onOcrResult?: (result: OcrResult) => void;
  highlightWords?: string[];
}

export const PdfViewer: React.FC<PdfViewerProps> = ({
  pdfSource,
  pdfTitle,
  onLookupWord,
  onOcrResult,
  highlightWords = []
}) => {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [rotation, setRotation] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selection & Popup State
  const [selectionState, setSelectionState] = useState<SelectionState | null>(null);
  const [floatingPos, setFloatingPos] = useState<{ top: number; left: number } | null>(null);

  // Box OCR Selection Mode State
  const [isOcrMode, setIsOcrMode] = useState<boolean>(false);
  const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Load PDF Document
  useEffect(() => {
    let isSubscribed = true;

    async function loadPdf() {
      if (!pdfSource) return;

      setIsLoading(true);
      setErrorMessage(null);
      setSelectionState(null);
      setFloatingPos(null);

      try {
        let loadingTask: any;

        if (typeof pdfSource === "string") {
          loadingTask = pdfjsLib.getDocument(pdfSource);
        } else if (pdfSource instanceof File || pdfSource instanceof Blob) {
          const arrayBuffer = await pdfSource.arrayBuffer();
          loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        } else {
          throw new Error("Invalid PDF source format");
        }

        const doc = await loadingTask.promise;

        if (isSubscribed) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setIsLoading(false);
          
          if (containerRef.current) {
             containerRef.current.scrollTop = 0;
          }
        }
      } catch (err: any) {
        console.error("Failed to load PDF:", err);
        if (isSubscribed) {
          setErrorMessage(err.message || "Failed to render PDF document. Please check the file format.");
          setIsLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isSubscribed = false;
    };
  }, [pdfSource]);

  // Handle Text Selection in PDF
  const handleSelectionCheck = useCallback(() => {
    if (isOcrMode) return;

    const windowSelection = window.getSelection();
    if (!windowSelection || windowSelection.isCollapsed) {
      // Clear popup if clicked outside
      setTimeout(() => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed) {
          setFloatingPos(null);
        }
      }, 200);
      return;
    }

    const selectedText = windowSelection.toString().trim();
    if (!selectedText || selectedText.length < 1) return;

    // Filter out huge multi-paragraph selections if accidentally dragged over entire page
    const cleanWordText = selectedText.replace(/[\n\r]+/g, " ");
    
    const range = windowSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    if (containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Find the page number we are interacting with
      let pageNumber = currentPage;
      if (range.commonAncestorContainer) {
        const pageElem = range.commonAncestorContainer.parentElement?.closest('[data-page-number]');
        if (pageElem) {
           pageNumber = parseInt(pageElem.getAttribute('data-page-number') || String(currentPage), 10);
        }
      }

      // Calculate top/left relative to scrollable container
      const top = rect.top - containerRect.top + containerRef.current.scrollTop - 48;
      const left = rect.left - containerRect.left + containerRef.current.scrollLeft + (rect.width / 2);

      // Extract surrounding context sentence
      let contextSentence = cleanWordText;
      if (range.commonAncestorContainer) {
        const parentElem = range.commonAncestorContainer.parentElement;
        if (parentElem) {
          const fullParaText = parentElem.parentElement?.textContent || parentElem.textContent || cleanWordText;
          contextSentence = fullParaText.slice(0, 300).trim();
        }
      }

      setSelectionState({
        text: cleanWordText,
        contextSentence,
        pageNumber: pageNumber,
        x: left,
        y: top
      });

      setFloatingPos({ top, left });
    }
  }, [currentPage, isOcrMode]);

  useEffect(() => {
    const handleMouseUp = () => {
      setTimeout(handleSelectionCheck, 50);
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleSelectionCheck]);

  // Track current page based on scroll position
  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (!scrollContainer) return;

    let ticking = false;
    const handleScroll = () => {
      const pages = scrollContainer.querySelectorAll('[data-page-number]');
      if (!pages.length) return;
      
      let closestPage = 1;
      let minDistance = Infinity;
      const containerCenter = scrollContainer.scrollTop + scrollContainer.clientHeight / 2;

      pages.forEach(page => {
        const el = page as HTMLElement;
        const pageCenter = el.offsetTop + el.offsetHeight / 2;
        const distance = Math.abs(pageCenter - containerCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestPage = parseInt(el.getAttribute('data-page-number') || '1', 10);
        }
      });

      if (closestPage !== currentPage) {
        setCurrentPage(closestPage);
      }
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener('scroll', onScroll);
    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [currentPage]);

  const scrollToPage = (pageNum: number) => {
    if (!containerRef.current) return;
    const pageEl = containerRef.current.querySelector(`[data-page-number="${pageNum}"]`);
    if (pageEl) {
      pageEl.scrollIntoView({ behavior: 'smooth' });
      setCurrentPage(pageNum);
    }
  };

  const triggerLookup = () => {
    if (selectionState) {
      onLookupWord(selectionState.text, selectionState.contextSentence, selectionState.pageNumber);
      setFloatingPos(null);
    }
  };

  const handleOcrCrop = useCallback(async (base64: string, pageNum: number) => {
    try {
      setIsOcrLoading(true);
      const res = await fetch("/api/ocr-region", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 })
      });

      const json = await res.json();
      if (json.success && json.data) {
        if (onOcrResult) {
          onOcrResult(json.data);
        }
        if (json.data.extractedText) {
          onLookupWord(json.data.extractedText, json.data.translationEn || "", pageNum);
        }
      }
    } catch (err) {
      console.error("OCR crop error:", err);
    } finally {
      setIsOcrLoading(false);
    }
  }, [onOcrResult, onLookupWord]);

  // Array of page numbers
  const pagesArray = useMemo(() => {
    return Array.from({ length: numPages }, (_, i) => i + 1);
  }, [numPages]);

  return (
    <div className="flex flex-col h-full bg-[#F4F1EA] rounded-sm overflow-hidden border border-[#D1CEC7] shadow-xs">
      {/* Top PDF Reader Control Toolbar */}
      <div className="bg-white text-[#2D2926] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-[#D1CEC7] z-10 shadow-xs">
        {/* Page Navigation & Title */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1 || isLoading}
            className="p-1.5 rounded-sm hover:bg-[#F9F7F2] disabled:opacity-40 transition-colors text-[#2D2926] hover:text-[#1B4332]"
            title="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-semibold bg-[#F9F7F2] px-3 py-1 rounded-sm border border-[#D1CEC7]">
            <span className="text-[#8C8880] uppercase tracking-wider text-[10px]">Page</span>
            <input
              type="number"
              min={1}
              max={numPages || 1}
              value={currentPage}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 1 && val <= numPages) {
                  scrollToPage(val);
                }
              }}
              className="w-10 bg-white text-[#1B4332] text-center rounded-sm border border-[#D1CEC7] focus:outline-none focus:border-[#1B4332] font-bold py-0.5"
            />
            <span className="text-[#8C8880] text-[10px] uppercase tracking-wider">OF {numPages || 1}</span>
          </div>

          <button
            onClick={() => scrollToPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage >= numPages || isLoading}
            className="p-1.5 rounded-sm hover:bg-[#F9F7F2] disabled:opacity-40 transition-colors text-[#2D2926] hover:text-[#1B4332]"
            title="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setScale((s) => Math.max(0.6, s - 0.15))}
            className="p-1.5 rounded-sm hover:bg-[#F9F7F2] text-[#2D2926] hover:text-[#1B4332] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold text-[#1B4332] min-w-[48px] text-center bg-[#F9F7F2] border border-[#D1CEC7] px-2 py-1 rounded-sm">
            {Math.round(scale * 100)}%
          </span>

          <button
            onClick={() => setScale((s) => Math.min(2.5, s + 0.15))}
            className="p-1.5 rounded-sm hover:bg-[#F9F7F2] text-[#2D2926] hover:text-[#1B4332] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-[#D1CEC7] mx-1" />

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded-sm hover:bg-[#F9F7F2] text-[#2D2926] hover:text-[#1B4332] transition-colors"
            title="Rotate Page"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Mode Switcher: Standard Text Selection vs Crop OCR */}
          <button
            onClick={() => setIsOcrMode(!isOcrMode)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
              isOcrMode
                ? "bg-[#1B4332] text-white shadow-xs"
                : "bg-white text-[#2D2926] hover:bg-[#F9F7F2] border border-[#D1CEC7]"
            }`}
            title="Toggle Box Crop Tool for Scanned PDFs / Custom Regions"
          >
            {isOcrMode ? (
              <>
                <Scan className="w-3.5 h-3.5 animate-pulse text-emerald-200" />
                <span>Box OCR Mode</span>
              </>
            ) : (
              <>
                <MousePointerClick className="w-3.5 h-3.5 text-[#1B4332]" />
                <span>Text Select Mode</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mode Instruction Bar */}
      <div className="bg-[#1B4332]/10 border-b border-[#1B4332]/20 px-4 py-1.5 text-xs text-[#1B4332] flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOcrMode ? (
            <>
              <Scan className="w-4 h-4 text-[#1B4332] shrink-0" />
              <span>
                <strong>Box OCR Active:</strong> Click & drag a rectangle around any Arabic / Lisan ud Dawat text region on scanned pages to read and translate.
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-[#1B4332] shrink-0" />
              <span>
                <strong>Instant Word Lookup:</strong> Highlight or double-click any Arabic or Lisan ud Dawat word in the text to see its meaning & root.
              </span>
            </>
          )}
        </div>
        <div className="text-[10px] text-[#1B4332] font-mono font-bold uppercase tracking-wider hidden sm:block">
          {pdfTitle || "Document Loaded"}
        </div>
      </div>

      {/* Main Canvas Viewport Area */}
      <div
        ref={containerRef}
        className={`relative flex-1 overflow-auto bg-[#D1CEC7] p-4 sm:p-10 ${
          isOcrMode ? "cursor-crosshair select-none" : "cursor-text select-text"
        }`}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-[#F4F1EA]/90 backdrop-blur-xs z-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#1B4332] animate-spin" />
            <p className="text-xs uppercase tracking-widest text-[#1B4332] font-bold">Loading Manuscript...</p>
          </div>
        )}

        {errorMessage && (
          <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded-sm shadow-md border border-red-200 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h3 className="font-bold text-[#2D2926]">PDF Reader Error</h3>
            <p className="text-xs text-[#5C5850] leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {!isLoading && !errorMessage && pdfDoc && (
          <div className="flex flex-col items-center">
            {pagesArray.map(pageNum => (
              <PdfPage
                key={pageNum}
                pageNumber={pageNum}
                pdfDoc={pdfDoc}
                scale={scale}
                rotation={rotation}
                isOcrMode={isOcrMode}
                onOcrCrop={handleOcrCrop}
                highlightWords={highlightWords}
              />
            ))}
          </div>
        )}

        {/* Floating Action Button on Text Selection */}
        {floatingPos && selectionState && !isOcrMode && (
          <div
            className="absolute z-50 transform -translate-x-1/2 transition-all duration-150 animate-in fade-in zoom-in-95"
            style={{
              top: `${floatingPos.top}px`,
              left: `${floatingPos.left}px`
            }}
          >
            <button
              onClick={triggerLookup}
              className="bg-[#1B4332] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-sm shadow-xl hover:bg-[#2D5A47] transition-all flex items-center space-x-2 border border-[#1B4332] ring-2 ring-black/10 whitespace-nowrap"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300 animate-spin-slow" />
              <span>
                {selectionState.text.trim().split(/\s+/).length > 1 ? "Verse / Word-by-Word Study" : `Meaning of "${selectionState.text.slice(0, 12)}"`}
              </span>
              <span className="text-[10px] text-emerald-200 font-serif font-normal">
                {selectionState.text.trim().split(/\s+/).length > 1 ? "ترجمة و تفكيك الآية" : "معنى الكلمة"}
              </span>
            </button>
          </div>
        )}

        {isOcrLoading && (
          <div className="fixed bottom-6 right-6 bg-[#1B4332] text-white text-xs px-4 py-3 rounded-sm shadow-2xl z-50 flex items-center space-x-3 border border-emerald-500/30 font-semibold tracking-wide">
            <Loader2 className="w-4 h-4 text-emerald-300 animate-spin" />
            <span>Scanning selected region with Gemini OCR...</span>
          </div>
        )}
      </div>
    </div>
  );
};
