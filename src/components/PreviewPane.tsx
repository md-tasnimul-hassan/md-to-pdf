import React, { useState, useEffect } from 'react';
import { PandocConfig } from '../types/pandoc';
import { ParsedMarkdownResult } from '../utils/markdownParser';
import { ZoomIn, ZoomOut, FileCheck, Smartphone, FileText } from 'lucide-react';

interface PreviewPaneProps {
  parsed: ParsedMarkdownResult;
  config: PandocConfig;
  sheetRef: React.RefObject<HTMLDivElement | null>;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  parsed,
  config,
  sheetRef,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'reading' | 'sheet'>(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'reading' : 'sheet'
  );

  // Automatically adapt zoom on mobile screens when in sheet mode
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 850) {
        const calculated = Math.max(35, Math.min(100, Math.floor(((window.innerWidth - 32) / 794) * 100)));
        setZoom(calculated);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFitZoom = () => {
    if (window.innerWidth < 850) {
      const calculated = Math.max(35, Math.min(100, Math.floor(((window.innerWidth - 32) / 794) * 100)));
      setZoom(calculated);
    } else {
      setZoom(100);
    }
  };

  // Font family class
  const getFontFamilyClass = () => {
    switch (config.fontfamily) {
      case 'latin-modern':
        return 'font-latin-modern';
      case 'times':
        return 'font-times';
      case 'garamond':
        return 'font-garamond';
      case 'palatino':
        return 'font-palatino';
      case 'baskerville':
        return 'font-baskerville';
      case 'arev':
      default:
        return 'font-arev';
    }
  };

  // Font size styles and line-height
  const getFontSizeStyle = () => {
    const lineSpacing = config.linestretch || '1.36';
    switch (config.fontsize) {
      case '10pt':
        return { fontSize: '13.33px', lineHeight: lineSpacing };
      case '12pt':
        return { fontSize: '16px', lineHeight: lineSpacing };
      case '11pt':
      default:
        return { fontSize: '14.67px', lineHeight: lineSpacing };
    }
  };

  // Margin padding in inches/pixels (96px = 1in)
  const getMarginPadding = () => {
    switch (config.margin) {
      case '0.5in':
        return '48px';
      case '0.75in':
        return '72px';
      case '1.25in':
        return '120px';
      case '2cm':
        return '76px';
      case '2.5cm':
        return '95px';
      case '1in':
      default:
        return '96px';
    }
  };

  const isA4 = config.papersize === 'a4';
  // Target dimensions in pixels at 96 DPI:
  // US Letter: 8.5in x 11in = 816px x 1056px
  // A4: 210mm x 297mm = 794px x 1123px
  const sheetWidthPx = isA4 ? 794 : 816;
  const sheetMinHeightPx = isA4 ? 1123 : 1056;
  const scaledWidth = Math.round(sheetWidthPx * (zoom / 100));
  const [sheetHeight, setSheetHeight] = useState<number>(sheetMinHeightPx);

  // Monitor sheetRef client height to ensure the wrapper scales height appropriately
  useEffect(() => {
    if (!sheetRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSheetHeight(Math.max(sheetMinHeightPx, entry.target.clientHeight));
      }
    });
    observer.observe(sheetRef.current);
    return () => observer.disconnect();
  }, [sheetRef, sheetMinHeightPx]);

  const scaledHeight = Math.round(sheetHeight * (zoom / 100));

  return (
    <div className="flex flex-col h-full bg-slate-200/70 dark:bg-slate-950 overflow-hidden transition-colors">
      {/* Preview Sub-header & Mode Switcher */}
      <div className="no-print flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs transition-colors shrink-0 gap-2">
        {/* Left: View Mode Segmented Switcher on mobile/tablet */}
        <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800/80 p-0.5 rounded-xl">
          <button
            onClick={() => setViewMode('reading')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'reading'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Cozy readable view formatted for screens"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Cozy View</span>
          </button>
          <button
            onClick={() => setViewMode('sheet')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'sheet'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Exact A4 paper layout with physical margins"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>A4 Sheet</span>
          </button>
        </div>

        {/* Right: Zoom controls for Sheet view, or label for Reading view */}
        {viewMode === 'sheet' ? (
          <div className="flex items-center gap-1 sm:gap-1.5 bg-white dark:bg-slate-800 rounded px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-2xs">
            <button
              onClick={() => setZoom((z) => Math.max(35, z - 10))}
              className="p-1 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono tabular-nums px-1 text-slate-700 dark:text-slate-200 min-w-8 text-center">
              {zoom}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="p-1 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitZoom}
              className="px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
              title="Fit screen width"
            >
              Fit
            </button>
            <button
              onClick={() => setZoom(100)}
              className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition-colors cursor-pointer ${
                zoom === 100
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="100% Actual size"
            >
              100%
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Sync</span>
          </div>
        )}
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 overflow-y-auto overflow-x-auto p-2 sm:p-6 md:p-8 flex justify-center items-start">
        {/* VIEW 1: COZY MOBILE-RESPONSIVE READING CARD */}
        {viewMode === 'reading' && (
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-md border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-7 md:p-8 transition-colors mb-12 sm:mb-8">
            {/* Frontmatter Title / Author / Date */}
            {(parsed.frontmatter.title || parsed.frontmatter.author) && (
              <div className="text-center mb-6 pb-5 border-b border-slate-200 dark:border-slate-800">
                {parsed.frontmatter.title && (
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                    {parsed.frontmatter.title}
                  </h1>
                )}
                {parsed.frontmatter.author && (
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                    {parsed.frontmatter.author}
                  </div>
                )}
                {parsed.frontmatter.date && (
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {parsed.frontmatter.date}
                  </div>
                )}
                {parsed.frontmatter.abstract && (
                  <div className="mt-4 mx-auto text-left text-xs text-slate-700 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3">
                    <span className="font-bold not-italic block mb-1 text-slate-900 dark:text-white uppercase tracking-wider text-[10px]">
                      Abstract
                    </span>
                    {parsed.frontmatter.abstract}
                  </div>
                )}
              </div>
            )}

            {/* Cozy Body Content */}
            {parsed.html ? (
              <div
                className={`pdf-document-body ${getFontFamilyClass()}`}
                dangerouslySetInnerHTML={{ __html: parsed.html }}
              />
            ) : !parsed.frontmatter.title && (
              <div className="py-24 text-center select-none">
                <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                  Preview is empty
                </p>
                <p className="text-xs text-slate-400/80 dark:text-slate-600 mt-1">
                  Type or paste Markdown into the editor to see your formatted document
                </p>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: STANDARD A4 PHYSICAL PAPER SHEET */}
        {/* Note: This is ALWAYS kept actively rendered in DOM so exportElementToPdf has access to sheetRef with valid layout metrics */}
        <div
          style={
            viewMode === 'sheet'
              ? {
                  width: `${scaledWidth}px`,
                  height: `${scaledHeight}px`,
                }
              : {
                  position: 'fixed',
                  left: '-9999px',
                  top: '0',
                  width: `${sheetWidthPx}px`,
                  height: 'auto',
                  opacity: 0,
                  pointerEvents: 'none',
                  zIndex: -9999,
                }
          }
          className="print-only-document shrink-0 transition-all duration-150 mb-12 sm:mb-8"
        >
          {/* Printable White Document Sheet - Always 100% white with black ink */}
          <div
            ref={sheetRef}
            id="pandoc-printable-sheet"
            className={`bg-white shadow-xl border border-[#cbd5e1] ${getFontFamilyClass()}`}
            style={{
              width: `${sheetWidthPx}px`,
              minHeight: `${sheetMinHeightPx}px`,
              padding: getMarginPadding(),
              ...getFontSizeStyle(),
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              color: '#0f172a',
              transform: viewMode === 'sheet' ? `scale(${zoom / 100})` : 'none',
              transformOrigin: 'top left',
            }}
          >
            {/* Frontmatter Title / Author / Date Block (Standard LaTeX Article format) */}
            {(parsed.frontmatter.title || parsed.frontmatter.author) && (
              <div className="text-center mb-8 border-b border-[#cbd5e1] pb-6">
                {parsed.frontmatter.title && (
                  <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] mb-2">
                    {parsed.frontmatter.title}
                  </h1>
                )}
                {parsed.frontmatter.author && (
                  <div className="text-sm font-medium text-[#334155] mb-1">
                    {parsed.frontmatter.author}
                  </div>
                )}
                {parsed.frontmatter.date && (
                  <div className="text-xs text-[#64748b]">
                    {parsed.frontmatter.date}
                  </div>
                )}

                {/* Abstract Block */}
                {parsed.frontmatter.abstract && (
                  <div className="mt-5 mx-auto max-w-lg text-left text-xs text-[#334155] italic bg-[#f8fafc] border border-[#cbd5e1] rounded p-3">
                    <span className="font-bold not-italic block mb-1 text-[#0f172a] text-center uppercase tracking-wider text-[10px]">
                      Abstract
                    </span>
                    {parsed.frontmatter.abstract}
                  </div>
                )}
              </div>
            )}

            {/* Markdown Body Content with KaTeX, Booktabs, and TOC */}
            {parsed.html ? (
              <div
                className="pdf-document-body"
                dangerouslySetInnerHTML={{ __html: parsed.html }}
              />
            ) : !parsed.frontmatter.title && (
              <div className="py-24 text-center select-none no-print">
                <p className="text-sm font-medium text-slate-400">Preview paper sheet</p>
                <p className="text-xs text-slate-400/80 mt-1">Type or paste Markdown into the editor to preview your PDF</p>
              </div>
            )}

            {/* Simulated LaTeX Footer with Page Number */}
            <div className="mt-16 pt-4 border-t border-[#e2e8f0] text-center text-xs text-[#64748b] font-mono no-print">
              - 1 -
            </div>
          </div>
        </div>

        {/* When in reading view, keep a hidden 794px A4 element attached to sheetRef for PDF generation */}
        {viewMode === 'reading' && (
          <div
            style={{
              position: 'fixed',
              top: '-99999px',
              left: '-99999px',
              width: `${sheetWidthPx}px`,
              opacity: 0,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <div
              ref={viewMode === 'reading' ? sheetRef : undefined}
              id="pandoc-printable-sheet-staging"
              className={`bg-white ${getFontFamilyClass()}`}
              style={{
                width: `${sheetWidthPx}px`,
                minHeight: `${sheetMinHeightPx}px`,
                padding: getMarginPadding(),
                ...getFontSizeStyle(),
                boxSizing: 'border-box',
                backgroundColor: '#ffffff',
                color: '#0f172a',
              }}
            >
              {(parsed.frontmatter.title || parsed.frontmatter.author) && (
                <div className="text-center mb-8 border-b border-[#cbd5e1] pb-6">
                  {parsed.frontmatter.title && (
                    <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] mb-2">
                      {parsed.frontmatter.title}
                    </h1>
                  )}
                  {parsed.frontmatter.author && (
                    <div className="text-sm font-medium text-[#334155] mb-1">
                      {parsed.frontmatter.author}
                    </div>
                  )}
                  {parsed.frontmatter.date && (
                    <div className="text-xs text-[#64748b]">
                      {parsed.frontmatter.date}
                    </div>
                  )}
                  {parsed.frontmatter.abstract && (
                    <div className="mt-5 mx-auto max-w-lg text-left text-xs text-[#334155] italic bg-[#f8fafc] border border-[#cbd5e1] rounded p-3">
                      <span className="font-bold not-italic block mb-1 text-[#0f172a] text-center uppercase tracking-wider text-[10px]">
                        Abstract
                      </span>
                      {parsed.frontmatter.abstract}
                    </div>
                  )}
                </div>
              )}
              <div
                className="pdf-document-body"
                dangerouslySetInnerHTML={{ __html: parsed.html }}
              />
              <div className="mt-16 pt-4 border-t border-[#e2e8f0] text-center text-xs text-[#64748b] font-mono no-print">
                - 1 -
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

