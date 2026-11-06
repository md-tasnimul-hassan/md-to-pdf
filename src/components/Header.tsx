import React from 'react';
import { Download, Loader2, Printer, Copy, Check } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { printVectorPdf } from '../utils/pdfExport';

interface HeaderProps {
  onExportPdf: () => void;
  isExporting: boolean;
  exportProgress?: number;
  onCopyOneNote?: () => void;
  isOneNoteCopied?: boolean;
  hasMarkdown?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onExportPdf,
  isExporting,
  exportProgress = 0,
  onCopyOneNote,
  isOneNoteCopied = false,
  hasMarkdown = false,
}) => {
  return (
    <header className="no-print relative h-13 sm:h-14 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shrink-0 transition-colors">
      {/* Left: Theme toggle */}
      <div className="flex items-center shrink-0 z-10">
        <ThemeToggle />
      </div>

      {/* Centered Brand Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none max-w-[40%] sm:max-w-md">
        <h1 className="text-xs sm:text-sm md:text-base font-semibold tracking-tight text-slate-900 dark:text-white truncate select-none">
          md to pdf converter
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10">
        {/* Copy for OneNote Button */}
        {onCopyOneNote && (
          <button
            onClick={onCopyOneNote}
            disabled={!hasMarkdown}
            className={`inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 h-8.5 sm:h-9 text-xs font-semibold rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
              isOneNoteCopied
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                : 'text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800/80'
            }`}
            title="Copy rendered rich text and formulas formatted for Microsoft OneNote"
          >
            {isOneNoteCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="font-medium text-emerald-700 dark:text-emerald-300">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline font-medium">Copy for OneNote</span>
                <span className="sm:hidden font-medium">OneNote</span>
              </>
            )}
          </button>
        )}

        {/* Native Vector Print Button */}
        <button
          onClick={printVectorPdf}
          className="hidden md:inline-flex items-center justify-center gap-1.5 px-3 h-8.5 sm:h-9 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
          title="Print or Save as Vector PDF (Native Browser Dialog)"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Vector Print</span>
        </button>

        {/* Download PDF Action */}
        <button
          onClick={onExportPdf}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 h-8.5 sm:h-9 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-75 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          title="Download publication-quality PDF"
        >
          {isExporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Download className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline font-mono">
            {isExporting ? `Compiling ${exportProgress}%` : 'Download PDF'}
          </span>
          <span className="sm:hidden font-mono">
            {isExporting ? `${exportProgress}%` : 'PDF'}
          </span>
        </button>
      </div>
    </header>
  );
};

