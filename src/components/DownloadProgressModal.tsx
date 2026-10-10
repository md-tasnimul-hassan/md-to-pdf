import React from 'react';
import { Loader2, FileText, CheckCircle2, AlertCircle, Printer, Sparkles } from 'lucide-react';

interface DownloadProgressModalProps {
  isOpen: boolean;
  progress: number;
  statusText: string;
  error?: string | null;
  onDismissError?: () => void;
  onPrintVectorPdf?: () => void;
}

export const DownloadProgressModal: React.FC<DownloadProgressModalProps> = ({
  isOpen,
  progress,
  statusText,
  error,
  onDismissError,
  onPrintVectorPdf,
}) => {
  if (!isOpen && !error) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-900 dark:text-slate-100 transition-all">
        {error ? (
          <div>
            <div className="flex items-center gap-3 mb-3 text-rose-600 dark:text-rose-400">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-950/60 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  PDF Generation Notice
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Document could not be compiled
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/60 mb-4 leading-relaxed">
              {error}
            </p>
            <div className="flex justify-end gap-2">
              {onPrintVectorPdf && (
                <button
                  onClick={() => {
                    onDismissError?.();
                    onPrintVectorPdf();
                  }}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save as PDF
                </button>
              )}
              <button
                onClick={onDismissError}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header with animated icon */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
                  {progress >= 100 ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-200" />
                  ) : (
                    <>
                      <FileText className="w-6 h-6" />
                      <Loader2 className="w-4 h-4 animate-spin absolute -bottom-1 -right-1 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900 rounded-full" />
                    </>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                    {progress >= 100 ? 'Crystal-Clear PDF Ready!' : 'Compiling Publication PDF'}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>Lossless HD · Selectable Text</span>
                  </div>
                </div>
              </div>
              <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                {progress}%
              </span>
            </div>

            {/* Prominent Animated Progress Bar */}
            <div className="relative w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden mb-3 border border-slate-200/60 dark:border-slate-700/60">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress >= 100
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-400'
                }`}
                style={{ width: `${Math.max(8, progress)}%` }}
              />
            </div>

            {/* Dynamic Stage Message */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 min-h-5 mb-2">
              <span className="truncate">{statusText || 'Processing crystal-clear document stream...'}</span>
            </div>

            {/* Vector Print Option Tip */}
            {onPrintVectorPdf && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  Want infinite zoom vector?
                </span>
                <button
                  onClick={onPrintVectorPdf}
                  className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Printer className="w-3 h-3" />
                  Print / Vector PDF
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

