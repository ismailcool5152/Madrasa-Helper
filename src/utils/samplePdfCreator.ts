/**
 * Sample PDF Creator for Lisan ud Dawat and Arabic text.
 * Renders high-resolution manuscript pages using loaded Arabic fonts (Amiri & Noto Naskh Arabic)
 * and wraps them into valid PDF documents for pixel-perfect typography.
 */

export const SAMPLE_TEXTS = [
  {
    title: "رسالة العلم والحكمة (Sabaq on Knowledge & Wisdom)",
    arabicTitle: "رسالة العلم والحكمة",
    description: "Classical Lisan ud Dawat text explaining the virtues of 'Ilm (Knowledge), Khidmat (Service), and Adab (Etiquette).",
    passages: [
      {
        heading: "فصل في فضل العلم والإخلاص",
        transliteration: "Fasl fi Fadl al-'Ilm wa al-Ikhlas",
        textArabic: "طلب العلم فريضة على كل مسلم ومسلمة. العلم نور يضيء القلوب بالمرعاة والتقوى. والخدمة بالإخلاص تفتح أبواب البركات والنجاح في الدنيا والآخرة.",
        textLisan: "Mumineen-ne Sabaq-ma Haazir Thavanu wa 'Ilm-ni Talab Karvanu Bhaare Sawaab Chhe. 'Ilm wa Hikmat-si Insaan-no Maqam Buland Thaye Chhe. Khidmat-ma Ikhlas Rajvanu Zaroori Chhe.",
        translation: "Seeking knowledge is an obligation upon every Muslim. Knowledge is a light that illuminates hearts with piety. Service rendered with sincerity opens the doors of blessings and success in this world and the Hereafter."
      },
      {
        heading: "في الأدب والتعظيم للمُعَلِّم",
        transliteration: "Fi al-Adab wa al-Ta'zeem lil-Mu'allim",
        textArabic: "الأدب قبل العلم. ومن يعظم شعائر الله فإنها من تقوى القلوب. احترام المعلم والشيخ وسيلة الوصول إلى بركة العلم.",
        textLisan: "Adab wa Ta'zeem-si 'Ilm-ni Barakat Haasil Thaye Chhe. Mu'allim-no Ihteram wa 'Aalim-ni Muhabbat Deen-no Asas Chhe.",
        translation: "Etiquette comes before knowledge. Respect and reverence for the teacher and guide is the true vessel for receiving the blessings of knowledge."
      }
    ]
  },
  {
    title: "مخطوطة الخدمة والبركة (Manuscript on Service & Blessing)",
    arabicTitle: "مخطوطة الخدمة والبركة",
    description: "Reflections on Khidmat (Selfless Service), Barakat (Divine Blessings), and Ikhlas (Sincerity).",
    passages: [
      {
        heading: "فصل في شرف الخدمة والمحبة",
        transliteration: "Fasl fi Sharaf al-Khidmah wa al-Mahabbah",
        textArabic: "الخدمة تاج على رؤوس الخدام. والإخلاص في العمل يورث التوفيق والبركة في العمر والرزق.",
        textLisan: "Khidmat-ma Ikhlas Rajvu wa Mumineen-ni Khidmat Karvi Eh Bhaare N'amat Chhe.",
        translation: "Selfless service is a crown upon the heads of servers. Sincerity in work brings divine grace and abundance in life."
      }
    ]
  }
];

/**
 * Creates a canvas with rendered Arabic text using loaded Google Fonts (Amiri / Noto Naskh Arabic)
 * and exports a JPEG Blob converted into a standard PDF 1.4 file binary.
 */
export async function createSamplePdfBlob(sampleIndex: number = 0): Promise<Blob> {
  // Ensure fonts are loaded before drawing
  if (document.fonts) {
    try {
      await Promise.all([
        document.fonts.load('28px "Amiri"'),
        document.fonts.load('22px "Noto Naskh Arabic"')
      ]);
    } catch {
      // Fallback gracefully if font load check fails
    }
  }

  const canvas = document.createElement("canvas");
  const width = 1240; // 300 DPI equivalent for A4 page width
  const height = 1754;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context");
  }

  // 1. Page Background - Warm Parchment (#F9F7F2)
  ctx.fillStyle = "#F9F7F2";
  ctx.fillRect(0, 0, width, height);

  // 2. Outer Geometric Border Frame (#1B4332)
  ctx.strokeStyle = "#1B4332";
  ctx.lineWidth = 12;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  ctx.strokeStyle = "#D1CEC7";
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 52, width - 104, height - 104);

  // Decorative Corner Squares
  const corners = [
    [40, 40],
    [width - 64, 40],
    [40, height - 64],
    [width - 64, height - 64]
  ];
  ctx.fillStyle = "#1B4332";
  corners.forEach(([x, y]) => {
    ctx.fillRect(x, y, 24, 24);
  });

  // 3. Document Header Banner
  ctx.fillStyle = "#1B4332";
  ctx.fillRect(80, 80, width - 160, 120);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = 'bold 38px "Amiri", "Noto Naskh Arabic", serif';
  ctx.textAlign = "center";
  ctx.direction = "rtl";

  const sample = SAMPLE_TEXTS[sampleIndex] || SAMPLE_TEXTS[0];
  ctx.fillText(sample.arabicTitle, width / 2, 145);

  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = "#D1CEC7";
  ctx.direction = "ltr";
  ctx.fillText("LISAN UD DAWAT & ARABIC MANUSCRIPT READER", width / 2, 178);

  // 4. Bismillah Calligraphy Heading
  let yPos = 270;
  ctx.fillStyle = "#1B4332";
  ctx.font = 'bold 44px "Amiri", "Noto Naskh Arabic", serif';
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.fillText("بِسمِ اللّٰهِ الرَّحمٰنِ الرَّحيمِ", width / 2, yPos);

  yPos += 30;
  ctx.strokeStyle = "#1B4332";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 180, yPos);
  ctx.lineTo(width / 2 + 180, yPos);
  ctx.stroke();

  yPos += 70;

  // 5. Render Passages
  sample.passages.forEach((passage, idx) => {
    // Section Heading
    ctx.fillStyle = "#1B4332";
    ctx.font = 'bold 30px "Amiri", "Noto Naskh Arabic", serif';
    ctx.textAlign = "right";
    ctx.direction = "rtl";
    ctx.fillText(`${idx + 1}. ${passage.heading}`, width - 120, yPos);

    yPos += 35;
    ctx.fillStyle = "#8C8880";
    ctx.font = 'italic 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = "left";
    ctx.direction = "ltr";
    ctx.fillText(`(${passage.transliteration})`, 120, yPos);

    yPos += 50;

    // Arabic Text Box Card
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#D1CEC7";
    ctx.lineWidth = 1.5;
    const boxHeight = 160;
    ctx.fillRect(100, yPos, width - 200, boxHeight);
    ctx.strokeRect(100, yPos, width - 200, boxHeight);

    // Accent left strip
    ctx.fillStyle = "#1B4332";
    ctx.fillRect(100, yPos, 8, boxHeight);

    // Main Arabic Text Passage inside Card
    ctx.fillStyle = "#2D2926";
    ctx.font = 'bold 28px "Amiri", "Noto Naskh Arabic", serif';
    ctx.textAlign = "right";
    ctx.direction = "rtl";

    // Word wrap helper for Arabic text
    const maxTextWidth = width - 250;
    const words = passage.textArabic.split(" ");
    let line = "";
    let lineY = yPos + 55;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + (line ? " " : "") + words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        ctx.fillText(line, width - 130, lineY);
        line = words[n];
        lineY += 48;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, width - 130, lineY);
    }

    yPos += boxHeight + 30;

    // Lisan ud Dawat Transliteration & Explanation
    ctx.fillStyle = "#2D2926";
    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = "left";
    ctx.direction = "ltr";

    ctx.fillStyle = "#1B4332";
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("LISAN UD DAWAT READING:", 120, yPos);
    yPos += 24;

    ctx.fillStyle = "#2D2926";
    ctx.font = '16px "Plus Jakarta Sans", sans-serif';
    
    // Wrap Lisan Text
    const lisanWords = passage.textLisan.split(" ");
    let lisanLine = "";
    for (let w = 0; w < lisanWords.length; w++) {
      const testLisan = lisanLine + (lisanLine ? " " : "") + lisanWords[w];
      if (ctx.measureText(testLisan).width > width - 240 && w > 0) {
        ctx.fillText(lisanLine, 120, yPos);
        lisanLine = lisanWords[w];
        yPos += 26;
      } else {
        lisanLine = testLisan;
      }
    }
    if (lisanLine) {
      ctx.fillText(lisanLine, 120, yPos);
      yPos += 26;
    }

    yPos += 15;

    // Translation
    ctx.fillStyle = "#8C8880";
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText("ENGLISH TRANSLATION:", 120, yPos);
    yPos += 22;

    ctx.fillStyle = "#5C5850";
    ctx.font = 'italic 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`"${passage.translation}"`, 120, yPos);

    yPos += 65;
  });

  // Footer Marker
  ctx.fillStyle = "#8C8880";
  ctx.font = 'bold 12px "Plus Jakarta Sans", monospace';
  ctx.textAlign = "center";
  ctx.direction = "ltr";
  ctx.fillText("PAGE 01 OF 01  •  LISAN LEXICON DIGITAL MANUSCRIPT  •  REF: LD_2026_V1", width / 2, height - 70);

  // Convert canvas to JPEG blob
  const jpegBase64 = canvas.toDataURL("image/jpeg", 0.92);
  const jpegBinary = base64ToUint8Array(jpegBase64.split(",")[1]);

  // Wrap JPEG into standard PDF 1.4 binary structure
  const pdfBytes = wrapJpegInPdf(jpegBinary, width, height);

  return new Blob([pdfBytes], { type: "application/pdf" });
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Builds a valid PDF 1.4 document containing an embedded JPEG XObject image.
 */
function wrapJpegInPdf(jpegBytes: Uint8Array, width: number, height: number): Uint8Array {
  const encoder = new TextEncoder();

  // Standard PDF page dimensions in points (A4 ratio)
  const pdfPageWidth = 595.28;
  const pdfPageHeight = 841.89;

  const header = `%PDF-1.4\n`;

  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pdfPageWidth} ${pdfPageHeight}] /Resources << /XObject << /Img1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;

  const imgHeader = `4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
  const imgFooter = `\nendstream\nendobj\n`;

  const contentStreamStr = `q\n${pdfPageWidth} 0 0 ${pdfPageHeight} 0 0 cm\n/Img1 Do\nQ\n`;
  const obj5 = `5 0 obj\n<< /Length ${contentStreamStr.length} >>\nstream\n${contentStreamStr}endstream\nendobj\n`;

  // Combine bytes
  const parts: (Uint8Array | string)[] = [
    header,
    obj1,
    obj2,
    obj3,
    imgHeader,
    jpegBytes,
    imgFooter,
    obj5
  ];

  // Calculate byte offsets for xref table
  let currentOffset = header.length;
  const offsets: number[] = [0];

  offsets.push(currentOffset);
  currentOffset += obj1.length;

  offsets.push(currentOffset);
  currentOffset += obj2.length;

  offsets.push(currentOffset);
  currentOffset += obj3.length;

  offsets.push(currentOffset);
  currentOffset += imgHeader.length + jpegBytes.length + imgFooter.length;

  offsets.push(currentOffset);
  currentOffset += obj5.length;

  let xrefStr = `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    xrefStr += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }

  const trailerStr = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${currentOffset}\n%%EOF\n`;

  // Build final array
  const finalParts = [...parts, xrefStr, trailerStr];

  // Calculate total size
  let totalLen = 0;
  finalParts.forEach((part) => {
    totalLen += typeof part === "string" ? encoder.encode(part).length : part.length;
  });

  const out = new Uint8Array(totalLen);
  let pos = 0;
  finalParts.forEach((part) => {
    if (typeof part === "string") {
      const b = encoder.encode(part);
      out.set(b, pos);
      pos += b.length;
    } else {
      out.set(part, pos);
      pos += part.length;
    }
  });

  return out;
}
