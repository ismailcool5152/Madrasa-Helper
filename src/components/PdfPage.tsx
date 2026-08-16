import React, { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

interface PdfPageProps {
  pageNumber: number;
  pdfDoc: pdfjsLib.PDFDocumentProxy;
  scale: number;
  rotation: number;
  isOcrMode: boolean;
  onOcrCrop: (base64: string, pageNum: number) => void;
  highlightWords?: string[];
}

export const PdfPage: React.FC<PdfPageProps> = React.memo(({
  pageNumber,
  pdfDoc,
  scale,
  rotation,
  isOcrMode,
  onOcrCrop,
  highlightWords = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [isTextLayerReady, setIsTextLayerReady] = useState(false);

  // Box mode state
  const [isDrawingBox, setIsDrawingBox] = useState(false);
  const [boxStart, setBoxStart] = useState<{ x: number; y: number } | null>(null);
  const [boxCurrent, setBoxCurrent] = useState<{ x: number; y: number } | null>(null);

  // 1. Fetch size beforehand to reserve space
  useEffect(() => {
    let isMounted = true;
    pdfDoc.getPage(pageNumber).then((page) => {
      if (!isMounted) return;
      const viewport = page.getViewport({ scale, rotation });
      setSize({ width: viewport.width, height: viewport.height });
    }).catch(console.error);
    return () => { isMounted = false; };
  }, [pdfDoc, pageNumber, scale, rotation]);

  // 2. Intersection Observer to trigger rendering
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
      } else {
        // Keep it rendered if it was visible? To save memory on large PDFs, we could unload it.
        // But re-rendering on every scroll up/down might cause flicker.
        // Let's keep it visible once loaded for now, or unload it if it's far away.
        // We'll use a large rootMargin and unload it if it goes out.
        setIsVisible(false);
      }
    }, { rootMargin: '1000px 0px' });
    
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 3. Render Canvas when visible
  useEffect(() => {
    if (!isVisible || !size) return;
    
    let renderTask: any;
    let isMounted = true;
    
    async function renderPage() {
      if (!canvasRef.current) return;
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.height = viewport.height * dpr;
        canvas.width = viewport.width * dpr;
        canvas.style.height = `${viewport.height}px`;
        canvas.style.width = `${viewport.width}px`;
        context.scale(dpr, dpr);
        
        renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;
        
        if (textLayerRef.current && isMounted) {
          const textLayerDiv = textLayerRef.current;
          textLayerDiv.innerHTML = "";
          textLayerDiv.style.height = `${viewport.height}px`;
          textLayerDiv.style.width = `${viewport.width}px`;
          
          const textContent = await page.getTextContent();
          textContent.items.forEach((item: any) => {
            if (!item.str || item.str.trim() === "") return;
            const span = document.createElement("span");
            span.textContent = item.str;
            const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
            const fontHeight = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
            span.style.left = `${tx[4]}px`;
            span.style.top = `${tx[5] - fontHeight}px`;
            span.style.fontSize = `${fontHeight}px`;
            span.style.fontFamily = "Noto Naskh Arabic, Amiri, sans-serif";
            span.style.position = "absolute";
            span.style.transformOrigin = "0% 0%";
            span.style.whiteSpace = "pre";
            span.style.color = "transparent";
            span.style.lineHeight = "1";
            span.style.cursor = "text";
            span.style.direction = "rtl";
            textLayerDiv.appendChild(span);
          });
          setIsTextLayerReady(true);
        }
      } catch (err: any) {
        if (err.name !== "RenderingCancelledException") console.error(err);
      }
    }
    
    renderPage();
    return () => {
      isMounted = false;
      setIsTextLayerReady(false);
      if (renderTask) renderTask.cancel();
    }
  }, [isVisible, size, pdfDoc, pageNumber, scale, rotation]);

  // Apply highlights when text layer is ready or highlight words change
  useEffect(() => {
    if (!isTextLayerReady || !textLayerRef.current) return;
    
    const spans = textLayerRef.current.querySelectorAll("span");
    
    // Normalize Arabic string for looser matching (strip harakat)
    const stripDiacritics = (str: string) => str.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
    const searchTerms = highlightWords.map(w => stripDiacritics(w).trim());

    spans.forEach(span => {
      const rawText = span.textContent || "";
      const cleanText = stripDiacritics(rawText).trim();
      
      if (!cleanText || cleanText.length < 2) {
        span.style.backgroundColor = "transparent";
        return;
      }
      
      const isMatch = searchTerms.some(term => {
         // Because pdfjs might split words or group multiple, check substring
         return cleanText.includes(term) || term.includes(cleanText);
      });

      if (isMatch) {
        span.style.backgroundColor = "rgba(252, 211, 77, 0.4)"; // highlight styling
        span.style.borderRadius = "2px";
      } else {
        span.style.backgroundColor = "transparent";
      }
    });
  }, [isTextLayerReady, highlightWords]);

  // OCR Drawing Box Handlers
  const getCanvasCoords = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, e.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, e.clientY - rect.top))
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOcrMode || !canvasRef.current) return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    setIsDrawingBox(true);
    setBoxStart(coords);
    setBoxCurrent(coords);
  };

  useEffect(() => {
    if (!isDrawingBox) return;
    const handleMouseMove = (e: MouseEvent) => setBoxCurrent(getCanvasCoords(e));
    const handleMouseUp = async (e: MouseEvent) => {
      if (!isDrawingBox || !boxStart || !canvasRef.current) {
        setIsDrawingBox(false);
        return;
      }
      const finalCoords = getCanvasCoords(e);
      setIsDrawingBox(false);
      
      const left = Math.min(boxStart.x, finalCoords.x);
      const top = Math.min(boxStart.y, finalCoords.y);
      const width = Math.abs(finalCoords.x - boxStart.x);
      const height = Math.abs(finalCoords.y - boxStart.y);
      setBoxStart(null);
      setBoxCurrent(null);
      
      if (width < 10 || height < 10) return;
      
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = width * scaleX;
      tempCanvas.height = height * scaleY;
      const ctx = tempCanvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(canvas, left * scaleX, top * scaleY, width * scaleX, height * scaleY, 0, 0, tempCanvas.width, tempCanvas.height);
        const cropBase64 = tempCanvas.toDataURL("image/png");
        onOcrCrop(cropBase64, pageNumber);
      }
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDrawingBox, boxStart, getCanvasCoords, isOcrMode, onOcrCrop, pageNumber]);

  return (
    <div 
      ref={containerRef}
      className={`relative shadow-2xl rounded-sm border border-[#1B4332]/20 bg-white mx-auto shrink-0 transition-all ${isOcrMode ? "cursor-crosshair select-none" : ""}`}
      style={{
        width: size ? `${size.width}px` : `${800 * scale}px`,
        height: size ? `${size.height}px` : `${1100 * scale}px`,
        marginBottom: '20px'
      }}
      data-page-number={pageNumber}
      onMouseDown={handleMouseDown}
    >
       {isVisible && size && (
         <>
           <canvas ref={canvasRef} className="block max-w-none" />
           <div 
             ref={textLayerRef} 
             className={`absolute inset-0 textLayer overflow-hidden ${isOcrMode ? "pointer-events-none" : "pointer-events-auto"}`} 
             style={{ direction: "rtl" }} 
           />
           {isOcrMode && isDrawingBox && boxStart && boxCurrent && (
             <div className="absolute border-2 border-[#1B4332] bg-[#1B4332]/20 pointer-events-none rounded-xs z-30" style={{
                left: `${Math.min(boxStart.x, boxCurrent.x)}px`,
                top: `${Math.min(boxStart.y, boxCurrent.y)}px`,
                width: `${Math.abs(boxCurrent.x - boxStart.x)}px`,
                height: `${Math.abs(boxCurrent.y - boxStart.y)}px`
             }} />
           )}
         </>
       )}
    </div>
  );
});
