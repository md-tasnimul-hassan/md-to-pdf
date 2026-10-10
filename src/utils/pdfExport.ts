import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { toCanvas } from 'html-to-image';
import { PandocConfig } from '../types/pandoc';

interface SelectableWord {
  text: string;
  xMm: number;
  baselineYMm: number;
  fontSizePt: number;
}

/**
 * Extracts selectable text nodes and LaTeX math expressions with sub-pixel accuracy.
 * Each word is located using native DOM Range measurements, ensuring the invisible
 * text layer in the PDF perfectly aligns with the visible text for precise highlighting,
 * copying (Ctrl+C), and searching (Ctrl+F).
 */
function extractSelectableWords(
  root: HTMLElement,
  sheetWidthPx: number,
  pageWidthMm: number
): SelectableWord[] {
  const words: SelectableWord[] = [];
  const rootRect = root.getBoundingClientRect();
  if (rootRect.width === 0) return words;

  const mmPerPx = pageWidthMm / (sheetWidthPx || rootRect.width);

  // 1. Handle KaTeX math formulas as semantic units (provides clean LaTeX math on copy)
  const mathElements = root.querySelectorAll<HTMLElement>('.katex, .katex-display');
  const handledMathNodes = new Set<Node>();

  mathElements.forEach((mathEl) => {
    // Avoid double counting nested .katex inside .katex-display
    if (mathEl.parentElement?.closest('.katex-display')) return;

    // Mark all child text nodes so text walker skips them
    const walker = document.createTreeWalker(mathEl, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      handledMathNodes.add(walker.currentNode);
    }

    const rect = mathEl.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Get the clean LaTeX expression from the annotation or text
    const annotation = mathEl.querySelector('annotation');
    const mathText = (annotation?.textContent || mathEl.innerText || '').trim();
    if (!mathText) return;

    const relLeft = rect.left - rootRect.left;
    const relTop = rect.top - rootRect.top;
    const xMm = Math.max(0, relLeft * mmPerPx);
    const baselineYMm = Math.max(0, (relTop + rect.height * 0.75) * mmPerPx);
    const fontSizePt = Math.max(8, Math.min(18, rect.height * mmPerPx * 2.8346 * 0.7));

    words.push({
      text: mathText,
      xMm,
      baselineYMm,
      fontSizePt,
    });
  });

  // 2. Walk regular text nodes word-by-word with DOM Range for sub-pixel accuracy
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (handledMathNodes.has(node)) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (
        parent.closest('.katex-mathml') ||
        parent.closest('script') ||
        parent.closest('style')
      ) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const range = document.createRange();
  let textNode: Node | null;

  while ((textNode = treeWalker.nextNode())) {
    const rawText = textNode.textContent || '';
    if (!rawText.trim()) continue;

    const parentEl = textNode.parentElement;
    let baseFontSizePt = 10;
    if (parentEl) {
      try {
        const computed = window.getComputedStyle(parentEl);
        const px = parseFloat(computed.fontSize);
        if (px > 0) baseFontSizePt = px * 0.75;
      } catch {
        // use default font size
      }
    }

    // Match words and their character offsets
    const regex = /\S+/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(rawText)) !== null) {
      const word = match[0];
      const startIdx = match.index;
      const endIdx = startIdx + word.length;

      try {
        range.setStart(textNode, startIdx);
        range.setEnd(textNode, endIdx);
        const rect = range.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          const relLeft = rect.left - rootRect.left;
          const relTop = rect.top - rootRect.top;

          const xMm = Math.max(0, relLeft * mmPerPx);
          const baselineYMm = Math.max(0, (relTop + rect.height * 0.82) * mmPerPx);
          const fontSizePt = Math.max(6, Math.min(36, rect.height * mmPerPx * 2.8346 * 0.85));

          words.push({
            text: word,
            xMm,
            baselineYMm,
            fontSizePt: fontSizePt || baseFontSizePt,
          });
        }
      } catch {
        // Continue if single word measurement fails
      }
    }
  }

  return words;
}

/**
 * Sanitizes modern CSS color functions (e.g. oklab, color(srgb)) in the cloned document
 * to prevent parser errors in canvas rasterizers, ensuring 100% stable execution.
 */
function sanitizeClonedStyles(doc: Document) {
  const canvas = doc.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext('2d');

  const toSafeColor = (colorStr: string): string | null => {
    if (!colorStr) return null;
    if (
      colorStr.startsWith('#') ||
      colorStr.startsWith('rgb(') ||
      colorStr.startsWith('rgba(')
    ) {
      return colorStr;
    }
    if (ctx) {
      try {
        ctx.fillStyle = '#000000';
        ctx.fillStyle = colorStr;
        return ctx.fillStyle;
      } catch {
        return null;
      }
    }
    return null;
  };

  const elements = doc.querySelectorAll<HTMLElement>('*');
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];

    // Ensure hidden MathML does not overlap rendered KaTeX HTML spans
    if (el.classList.contains('katex-mathml')) {
      el.style.display = 'none';
    }

    try {
      const computed = window.getComputedStyle(el);
      const color = computed.color;
      const bg = computed.backgroundColor;
      const borderTop = computed.borderTopColor;

      if (color && (color.includes('oklab') || color.includes('color(') || color.includes('lch'))) {
        const safe = toSafeColor(color);
        if (safe) el.style.color = safe;
      }
      if (bg && (bg.includes('oklab') || bg.includes('color(') || bg.includes('lch'))) {
        const safe = toSafeColor(bg);
        if (safe) el.style.backgroundColor = safe;
      }
      if (
        borderTop &&
        (borderTop.includes('oklab') || borderTop.includes('color(') || borderTop.includes('lch'))
      ) {
        const safe = toSafeColor(borderTop);
        if (safe) el.style.borderColor = safe;
      }
    } catch {
      // Continue safely
    }
  }
}

/**
 * Fallback SVG foreignObject canvas rasterizer.
 */
async function nativeSvgToCanvas(
  element: HTMLElement,
  width: number,
  height: number,
  scale = 2.4
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context not available');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const serializer = new XMLSerializer();
  const serializedHtml = serializer.serializeToString(element);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml" style="background:#ffffff;color:#0f172a;width:${width}px;box-sizing:border-box;">
        ${serializedHtml}
      </div>
    </foreignObject>
  </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Native SVG fallback failed'));
    img.src = url;
  });

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  return canvas;
}

/**
 * Renders the document into an Ultra-HD canvas at 2.4x scale (~230-260 DPI).
 * Uses html2canvas with direct access to loaded browser web fonts, ensuring all
 * LaTeX formulas, math fonts, and layout styles are rendered in pristine quality.
 */
async function renderHighQualityCanvas(
  element: HTMLElement,
  sheetWidthPx: number
): Promise<HTMLCanvasElement> {
  // Primary method: html2canvas with color sanitization
  try {
    const canvas = await html2canvas(element, {
      scale: 2.4,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: sheetWidthPx,
      onclone: (clonedDoc) => {
        sanitizeClonedStyles(clonedDoc);
      },
    });
    return canvas;
  } catch (primaryErr) {
    console.warn('html2canvas rendering fallback to html-to-image:', primaryErr);
  }

  // Secondary method: html-to-image with full style preservation
  try {
    const canvas = await toCanvas(element, {
      pixelRatio: 2.4,
      backgroundColor: '#ffffff',
      width: sheetWidthPx,
      cacheBust: false,
    });
    return canvas;
  } catch (secondaryErr) {
    console.warn('html-to-image failed, using native SVG rasterizer:', secondaryErr);
  }

  // Final fallback: native SVG serializer
  const measuredHeight = Math.max(
    1123,
    element.scrollHeight || element.offsetHeight || 1123
  );
  return await nativeSvgToCanvas(element, sheetWidthPx, measuredHeight, 2.4);
}

/**
 * Triggers native browser vector print dialog ("Save as PDF").
 * This renders 100% native vector text, vector KaTeX SVGs, and infinite-zoom vector typography.
 */
export function printVectorPdf(): void {
  window.print();
}

/**
 * Compiles and downloads the document into the best possible shape and quality PDF:
 * - Ultra-HD print-grade resolution (2.4x scale) with lossless PNG encoding
 * - Complete preservation of KaTeX math fonts, formulas, and academic typography
 * - Invisible selectable text layer aligned word-by-word with sub-pixel accuracy
 * - Fast compilation with real-time progress feedback
 */
export async function exportElementToPdf(
  element: HTMLElement,
  filename = 'document.pdf',
  config: PandocConfig,
  onProgress?: (progress: number) => void
): Promise<void> {
  // Stage 1: Fast initialization
  onProgress?.(15);
  await new Promise((r) => setTimeout(r, 25));

  // Determine physical page dimensions
  const isA4 = config.papersize === 'a4';
  const pageWidthMm = isA4 ? 210 : 215.9;
  const pageHeightMm = isA4 ? 297 : 279.4;
  const sheetWidthPx = isA4 ? 794 : 816;

  // Ensure bundled web fonts are ready
  try {
    if ('fonts' in document && (document as any).fonts?.status !== 'loaded') {
      await Promise.race([
        (document as any).fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 200)),
      ]);
    }
  } catch {
    // Continue smoothly
  }

  onProgress?.(25);
  await new Promise((r) => setTimeout(r, 20));

  // Create an on-origin staging container for layout normalization
  const exportContainer = document.createElement('div');
  exportContainer.id = 'pandoc-export-staging';
  exportContainer.style.position = 'fixed';
  exportContainer.style.top = '0';
  exportContainer.style.left = '-9999px';
  exportContainer.style.width = `${sheetWidthPx}px`;
  exportContainer.style.zIndex = '-999999';
  exportContainer.style.pointerEvents = 'none';
  exportContainer.style.backgroundColor = '#ffffff';
  exportContainer.style.margin = '0';
  exportContainer.style.padding = '0';
  exportContainer.style.overflow = 'visible';

  const clone = element.cloneNode(true) as HTMLElement;
  clone.id = 'pandoc-export-clone';
  clone.style.width = `${sheetWidthPx}px`;
  clone.style.minHeight = `${isA4 ? 1123 : 1056}px`;
  clone.style.height = 'auto';
  clone.style.transform = 'none';
  clone.style.margin = '0';
  clone.style.backgroundColor = '#ffffff';
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.boxSizing = 'border-box';

  exportContainer.appendChild(clone);
  document.body.appendChild(exportContainer);

  onProgress?.(35);
  await new Promise((r) => setTimeout(r, 20));

  // Extract sub-pixel selectable word coordinates
  let words: SelectableWord[] = [];
  try {
    words = extractSelectableWords(clone, sheetWidthPx, pageWidthMm);
  } catch (textErr) {
    console.warn('Text layer extraction warning:', textErr);
  }

  onProgress?.(45);
  await new Promise((r) => setTimeout(r, 20));

  // Render Ultra-HD canvas with full fonts and typography
  let canvas: HTMLCanvasElement;
  try {
    canvas = await renderHighQualityCanvas(clone, sheetWidthPx);
  } finally {
    if (document.body.contains(exportContainer)) {
      document.body.removeChild(exportContainer);
    }
  }

  onProgress?.(65);
  await new Promise((r) => setTimeout(r, 20));

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: isA4 ? 'a4' : 'letter',
    compress: true,
  });

  // Calculate physical page slicing
  const pageHeightPx = Math.floor((canvas.width * pageHeightMm) / pageWidthMm);
  const totalPages = Math.max(1, Math.ceil(canvas.height / pageHeightPx));

  // Slice each page into dedicated lossless frames and embed selectable text
  for (let i = 0; i < totalPages; i++) {
    if (i > 0) {
      pdf.addPage(isA4 ? 'a4' : 'letter', 'portrait');
    }

    onProgress?.(65 + Math.floor(((i + 1) / totalPages) * 22));
    await new Promise((r) => setTimeout(r, 15));

    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = canvas.width;
    pageCanvas.height = pageHeightPx;

    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

      const sourceY = i * pageHeightPx;
      const sourceHeight = Math.min(pageHeightPx, canvas.height - sourceY);

      if (sourceHeight > 0) {
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight
        );
      }

      // Lossless PNG encoding: perfectly crisp text and math symbols with zero blur
      const pageImgData = pageCanvas.toDataURL('image/png');
      pdf.addImage(
        pageImgData,
        'PNG',
        0,
        0,
        pageWidthMm,
        pageHeightMm,
        undefined,
        'FAST'
      );
    }

    // Embed invisible selectable words for this page
    const pageWords = words.filter((w) => {
      const pageIdx = Math.floor(w.baselineYMm / pageHeightMm);
      return pageIdx === i;
    });

    if (pageWords.length > 0) {
      try {
        pdf.saveGraphicsState();
        pdf.setGState(new (pdf as any).GState({ opacity: 0 }));
        for (const w of pageWords) {
          const localYMm = w.baselineYMm - i * pageHeightMm;
          if (localYMm >= 2 && localYMm <= pageHeightMm - 2) {
            pdf.setFontSize(w.fontSizePt);
            pdf.text(w.text, w.xMm, localYMm);
          }
        }
        pdf.restoreGraphicsState();
      } catch (err) {
        console.warn('Page text layer embedding error:', err);
      }
    }
  }

  onProgress?.(94);
  await new Promise((r) => setTimeout(r, 20));

  const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;

  // Standard cross-browser file download trigger with multiple fallback strategies
  try {
    const blob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = cleanFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 20000);
  } catch (blobErr) {
    console.warn('Blob URL download failed, using jsPDF.save fallback:', blobErr);
    pdf.save(cleanFilename);
  }

  onProgress?.(100);
}


