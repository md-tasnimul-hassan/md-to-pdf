/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PandocConfigBar } from './components/PandocConfigBar';
import { EditorPane } from './components/EditorPane';
import { PreviewPane } from './components/PreviewPane';
import { DownloadProgressModal } from './components/DownloadProgressModal';
import { PandocConfig, DEFAULT_PANDOC_CONFIG } from './types/pandoc';
import { parseMarkdownWithLaTeX } from './utils/markdownParser';
import { exportElementToPdf, printVectorPdf } from './utils/pdfExport';
import { Eye, Edit3, SlidersHorizontal } from 'lucide-react';

const INITIAL_MARKDOWN = `---
title: "Technical Report: High-Speed Signal Processing"
author: "Tasnimul Hasan"
date: "October 2026"
abstract: "This report examines small-signal frequency response and high-amplitude slew rate constraints in closed-loop operational amplifier circuits."
---

# Frequency Response and Slew Rate

The full-power bandwidth of an operational amplifier is bounded by its internal compensation capacitor charging current:

$$SR = 2\\pi f V_m$$

## Maximum Undistorted Output Amplitude

**Given Parameters:**
- Signal frequency: $f = 105\\text{ kHz} = 105 \\times 10^3\\text{ Hz}$
- Measured slew rate: $SR = 0.96\\text{ V}/\\mu\\text{s} = 0.96 \\times 10^6\\text{ V/s}$

Condition for distortion-free output swing:

$$V_{m,\\max} = \\frac{SR}{2\\pi f} = \\frac{0.96 \\times 10^6}{2\\pi \\times (105 \\times 10^3)} \\approx 1.4551\\text{ V}$$

$$\\mathbf{V}_{\\mathbf{m},\\max} \\approx 1.455\\text{ V}$$

The closed-loop cut-off frequency accounting for parasitic reactance:

$$f_{\\text{3dB}} = \\frac{1}{2\\pi \\sqrt{R_1^2 + (\\omega L_1)^2}} = \\frac{1}{\\sqrt{1 + (f / f_0)^2}}$$

## Performance Benchmark

Table 1 summarizes measured laboratory outcomes:

| Amplifier Stage | Slew Rate (V/μs) | Bandwidth (kHz) | Distortion (THD) |
| :--- | :--- | :--- | :--- |
| Precision Stage A | 0.96 | 105 | < 0.02% |
| High-Speed Stage B| 4.50 | 480 | < 0.05% |
| Buffer Stage C   | 12.80 | 1,200 | < 0.01% |

## Summary

Careful matching of slew rate and feedback resistance guarantees distortion-free transmission across the operational passband.
`;

export default function App() {
  const [config, setConfig] = useState<PandocConfig>(DEFAULT_PANDOC_CONFIG);
  const [markdown, setMarkdown] = useState<string>(INITIAL_MARKDOWN);
  const [mobileView, setMobileView] = useState<'editor' | 'preview'>('preview');
  const [isMobileSettingsOpen, setIsMobileSettingsOpen] = useState<boolean>(false);

  // Responsive desktop detection (>= 768px)
  const [isDesktop, setIsDesktop] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Split ratio (default 50/50)
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exportStatusText, setExportStatusText] = useState<string>('');

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parse markdown whenever text, section numbering, or TOC flag changes
  const parsed = useMemo(() => {
    return parseMarkdownWithLaTeX(markdown, {
      numberSections: config.numberSections,
      tableOfContents: config.tableOfContents,
    });
  }, [markdown, config.numberSections, config.tableOfContents]);

  const handleConfigChange = (updated: Partial<PandocConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleResetToDefaults = () => {
    setConfig(DEFAULT_PANDOC_CONFIG);
  };

  // Draggable Split Divider handling
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const percentage = (relativeX / rect.width) * 100;
      setSplitRatio(Math.min(80, Math.max(20, Math.round(percentage))));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  // High-fidelity standard PDF Download
  const [exportError, setExportError] = useState<string | null>(null);

  // Auto-dismiss export error toast after 6 seconds
  useEffect(() => {
    if (!exportError) return;
    const timer = setTimeout(() => {
      setExportError(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [exportError]);

  const handlePrintVectorPdf = () => {
    printVectorPdf();
  };

  const handleExportPdf = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      setExportError(null);
      setExportProgress(10);
      setExportStatusText('Preparing crystal-clear publication layout...');

      // Yield immediately so the modal paints onto the screen before heavy work begins
      await new Promise((resolve) => setTimeout(resolve, 60));

      if (!sheetRef.current) {
        throw new Error('Preview sheet is not ready yet. Please wait a moment.');
      }

      const filename = parsed.frontmatter.title
        ? `${parsed.frontmatter.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
        : 'document.pdf';

      await exportElementToPdf(sheetRef.current, filename, config, (progress) => {
        setExportProgress(progress);
        if (progress < 30) setExportStatusText('Preparing document typography...');
        else if (progress < 50) setExportStatusText('Extracting selectable text & math coordinates...');
        else if (progress < 75) setExportStatusText('Rendering ultra-crisp lossless HD canvas...');
        else if (progress < 90) setExportStatusText('Embedding searchable text stream & pages...');
        else setExportStatusText('Compiling crystal-clear PDF download stream...');
      });

      setExportProgress(100);
      setExportStatusText('Crystal-Clear PDF ready and downloaded!');
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
        setExportStatusText('');
      }, 1200);
    } catch (err: any) {
      console.error('PDF generation error:', err);
      const rawMsg = String(err?.message || err || '');
      if (rawMsg.includes('oklab') || rawMsg.includes('color function')) {
        setExportError('Could not process canvas colors. Re-try or print to save PDF.');
      } else {
        setExportError(err?.message || 'Could not generate PDF. Please try again.');
      }
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header with "From Hassan With Love" Centered */}
      <Header
        onExportPdf={handleExportPdf}
        onPrintPdf={handlePrintVectorPdf}
        isExporting={isExporting}
        exportProgress={exportProgress}
      />

      {/* Main Single-Page Workspace */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Layout Options Bar (Desktop bar & Mobile bottom drawer) */}
        <PandocConfigBar
          config={config}
          onChange={handleConfigChange}
          onResetToDefaults={handleResetToDefaults}
          isOpenOnMobile={isMobileSettingsOpen}
          onCloseMobile={() => setIsMobileSettingsOpen(false)}
        />

        {/* Cozy Mobile Top View Switcher & Settings */}
        <div className="no-print md:hidden flex items-center justify-between px-3 py-1.5 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200/90 dark:border-slate-800/90 shrink-0 gap-2">
          {/* Segmented Mode Switcher */}
          <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl text-xs">
            <button
              onClick={() => setMobileView('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                mobileView === 'editor'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setMobileView('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer ${
                mobileView === 'preview'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>

          {/* Quick Document Settings Button */}
          <button
            onClick={() => setIsMobileSettingsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs cursor-pointer"
            title="Document Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500" />
            <span>Layout</span>
          </button>
        </div>

        {/* Split Screen Workspace on Desktop / Full Screen on Mobile */}
        <div
          ref={containerRef}
          className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative"
        >
          {/* Left: Markdown Editor */}
          <div
            style={isDesktop ? { width: `${splitRatio}%` } : undefined}
            className={`h-full flex flex-col min-h-0 w-full ${
              mobileView === 'editor' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <EditorPane
              markdown={markdown}
              onChange={setMarkdown}
            />
          </div>

          {/* Draggable Vertical Divider Bar (Desktop only) */}
          <div
            onMouseDown={handleMouseDown}
            className="no-print hidden md:flex items-center justify-center w-2 bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 dark:hover:bg-blue-600 cursor-col-resize transition-colors select-none z-10 shrink-0 group"
            title="Drag to resize editor and viewer width"
          >
            <div className="w-0.5 h-6 rounded-full bg-slate-400 dark:bg-slate-600 group-hover:bg-white transition-colors" />
          </div>

          {/* Right: Live LaTeX Document Preview */}
          <div
            style={isDesktop ? { width: `${100 - splitRatio}%` } : undefined}
            className={`h-full flex flex-col min-h-0 w-full ${
              mobileView === 'preview' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <PreviewPane
              parsed={parsed}
              config={config}
              sheetRef={sheetRef}
            />
          </div>
        </div>
      </div>

      {/* Prominent High-Fidelity Download Progress Modal & Error Handler */}
      <DownloadProgressModal
        isOpen={isExporting}
        progress={exportProgress}
        statusText={exportStatusText}
        error={exportError}
        onDismissError={() => setExportError(null)}
        onPrintVectorPdf={handlePrintVectorPdf}
      />
    </div>
  );
}
