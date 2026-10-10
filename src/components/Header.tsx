import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  onExportPdf: () => void;
  isExporting: boolean;
  exportProgress?: number;
}

export const Header: React.FC<HeaderProps> = ({ onExportPdf, isExporting, exportProgress = 0 }) => {
  return (
    <header className="no-print relative h-13 sm:h-14 border-b border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 sticky top-0 shrink-0 transition-colors">
      {/* Left: Theme toggle */}
      <div className="flex items-center shrink-0 z-10">
        <ThemeToggle />
      </div>

      {/* Centered Brand Title */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none max-w-[50%] sm:max-w-md">
        <h1 className="text-xs sm:text-sm md:text-base font-semibold tracking-tight text-slate-900 dark:text-white truncate select-none">
          md to pdf converter
        </h1>
      </div>

      {/* Right: Download PDF Action */}
      <div className="flex items-center shrink-0 z-10">
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

