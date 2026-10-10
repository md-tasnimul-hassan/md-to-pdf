import React from 'react';
import { PandocConfig } from '../types/pandoc';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

interface PandocConfigBarProps {
  config: PandocConfig;
  onChange: (updated: Partial<PandocConfig>) => void;
  onResetToDefaults: () => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const PandocConfigBar: React.FC<PandocConfigBarProps> = ({
  config,
  onChange,
  onResetToDefaults,
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Desktop / Tablet Bar */}
      <div className="no-print hidden md:block bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2 transition-colors overflow-x-auto scrollbar-none">
        <div className="flex items-center justify-between gap-3 min-w-max">
          {/* Left Settings Controls */}
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Layout:</span>
            </div>

            {/* Engine */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded px-2 py-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <label htmlFor="engine-select" className="text-slate-500 dark:text-slate-400 text-[11px]">Engine:</label>
              <select
                id="engine-select"
                value={config.engine}
                onChange={(e) => onChange({ engine: e.target.value as any })}
                className="bg-transparent text-blue-600 dark:text-blue-400 text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="pdflatex" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Standard LaTeX</option>
                <option value="xelatex" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">XeLaTeX</option>
                <option value="lualatex" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">LuaLaTeX</option>
                <option value="weasyprint" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">WeasyPrint</option>
                <option value="typst" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Typst</option>
              </select>
            </div>

            {/* Font Family - Real Academic Fonts */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded px-2 py-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <label htmlFor="fontfamily-select" className="text-slate-500 dark:text-slate-400 text-[11px]">Font:</label>
              <select
                id="fontfamily-select"
                value={config.fontfamily}
                onChange={(e) => onChange({ fontfamily: e.target.value as any })}
                className="bg-transparent text-emerald-600 dark:text-emerald-400 text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="arev" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Arev Sans (Vera - Default)</option>
                <option value="latin-modern" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Latin Modern Roman (Computer Modern)</option>
                <option value="times" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Times Roman (Tinos)</option>
                <option value="garamond" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">EB Garamond</option>
                <option value="palatino" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Palatino</option>
                <option value="baskerville" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Libre Baskerville</option>
              </select>
            </div>

            {/* Font Size */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded px-2 py-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <label htmlFor="fontsize-select" className="text-slate-500 dark:text-slate-400 text-[11px]">Size:</label>
              <select
                id="fontsize-select"
                value={config.fontsize}
                onChange={(e) => onChange({ fontsize: e.target.value as any })}
                className="bg-transparent text-amber-600 dark:text-amber-400 text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="11pt" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">11 pt</option>
                <option value="10pt" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">10 pt</option>
                <option value="12pt" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">12 pt</option>
              </select>
            </div>

            {/* Margins - Default 0.75in */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded px-2 py-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <label htmlFor="margin-select" className="text-slate-500 dark:text-slate-400 text-[11px]">Margins:</label>
              <select
                id="margin-select"
                value={config.margin}
                onChange={(e) => onChange({ margin: e.target.value as any })}
                className="bg-transparent text-cyan-600 dark:text-cyan-400 text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="0.75in" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">0.75 inch (default)</option>
                <option value="0.5in" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">0.5 inch</option>
                <option value="1in" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">1.0 inch</option>
                <option value="1.25in" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">1.25 inch</option>
                <option value="2cm" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">2.0 cm</option>
                <option value="2.5cm" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">2.5 cm</option>
              </select>
            </div>

            {/* Numbered Headings */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none ml-1">
              <input
                type="checkbox"
                checked={config.numberSections}
                onChange={(e) => onChange({ numberSections: e.target.checked })}
                className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-[11px]">Numbered Headings</span>
            </label>

            {/* Table of Contents - Default Checked */}
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 select-none ml-1">
              <input
                type="checkbox"
                checked={config.tableOfContents}
                onChange={(e) => onChange({ tableOfContents: e.target.checked })}
                className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0"
              />
              <span className="text-[11px] font-medium text-slate-900 dark:text-white">Table of Contents</span>
            </label>
          </div>

          {/* Right side utility buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onResetToDefaults}
              title="Reset layout settings to defaults (0.75in margins, A4, TOC)"
              className="flex items-center gap-1 px-2.5 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cozy Mobile Bottom Sheet / Modal Drawer */}
      {isOpenOnMobile && (
        <div className="no-print md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-t-3xl shadow-2xl p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-250 flex flex-col gap-4"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm">
                <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                <span>Document Settings</span>
              </div>
              <button
                onClick={onCloseMobile}
                className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>

            {/* Mobile Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Font Family */}
              <div className="flex flex-col gap-1 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <label className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Font Family</label>
                <select
                  value={config.fontfamily}
                  onChange={(e) => onChange({ fontfamily: e.target.value as any })}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg p-2 focus:outline-none"
                >
                  <option value="arev">Arev Sans (Vera - Default)</option>
                  <option value="latin-modern">Latin Modern Roman (Computer Modern)</option>
                  <option value="times">Times Roman (Tinos)</option>
                  <option value="garamond">EB Garamond</option>
                  <option value="palatino">Palatino</option>
                  <option value="baskerville">Libre Baskerville</option>
                </select>
              </div>

              {/* Font Size */}
              <div className="flex flex-col gap-1 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <label className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Font Size</label>
                <select
                  value={config.fontsize}
                  onChange={(e) => onChange({ fontsize: e.target.value as any })}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg p-2 focus:outline-none"
                >
                  <option value="11pt">11 pt (Standard)</option>
                  <option value="10pt">10 pt (Compact)</option>
                  <option value="12pt">12 pt (Large)</option>
                </select>
              </div>

              {/* Engine */}
              <div className="flex flex-col gap-1 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <label className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Engine</label>
                <select
                  value={config.engine}
                  onChange={(e) => onChange({ engine: e.target.value as any })}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg p-2 focus:outline-none"
                >
                  <option value="pdflatex">Standard LaTeX (pdfLaTeX)</option>
                  <option value="xelatex">XeLaTeX</option>
                  <option value="lualatex">LuaLaTeX</option>
                  <option value="weasyprint">WeasyPrint</option>
                  <option value="typst">Typst</option>
                </select>
              </div>

              {/* Margins */}
              <div className="flex flex-col gap-1 p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                <label className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Margins</label>
                <select
                  value={config.margin}
                  onChange={(e) => onChange({ margin: e.target.value as any })}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs rounded-lg p-2 focus:outline-none"
                >
                  <option value="0.75in">0.75 inch (Default)</option>
                  <option value="0.5in">0.5 inch (Narrow)</option>
                  <option value="1in">1.0 inch (Standard)</option>
                  <option value="1.25in">1.25 inch (Wide)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-2.5 pt-1">
              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Table of Contents</span>
                <input
                  type="checkbox"
                  checked={config.tableOfContents}
                  onChange={(e) => onChange({ tableOfContents: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 cursor-pointer">
                <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Numbered Headings</span>
                <input
                  type="checkbox"
                  checked={config.numberSections}
                  onChange={(e) => onChange({ numberSections: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-0"
                />
              </label>
            </div>

            {/* Reset button */}
            <button
              onClick={onResetToDefaults}
              className="mt-2 flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults (0.75in, Arev, A4, TOC)</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
