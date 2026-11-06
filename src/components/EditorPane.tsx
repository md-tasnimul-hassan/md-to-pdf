import React, { useRef, useEffect } from 'react';
import { Upload, Trash2, Heading1, Heading2, Bold, Italic, Code, Sigma, List, Table as TableIcon, Copy, Check } from 'lucide-react';

interface EditorPaneProps {
  markdown: string;
  onChange: (value: string) => void;
  onCopyOneNote?: () => void;
  isOneNoteCopied?: boolean;
  highlightRange?: { start: number; end: number; timestamp: number } | null;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  markdown,
  onChange,
  onCopyOneNote,
  isOneNoteCopied = false,
  highlightRange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize selection from preview highlights into textarea
  useEffect(() => {
    if (!highlightRange || !textareaRef.current) return;
    const textarea = textareaRef.current;
    const { start, end } = highlightRange;
    if (start < 0 || end > markdown.length || start > end) return;

    // Focus textarea and select the exact range
    textarea.focus();
    textarea.setSelectionRange(start, end);

    // Smoothly scroll textarea to center the highlighted text
    const textBefore = markdown.substring(0, start);
    const lineIndex = textBefore.split('\n').length - 1;
    const totalLines = Math.max(1, markdown.split('\n').length);

    const lineRatio = lineIndex / totalLines;
    const targetScrollTop = Math.max(0, lineRatio * textarea.scrollHeight - textarea.clientHeight / 3);
    textarea.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });
  }, [highlightRange, markdown]);

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;
  const lineCount = markdown.split('\n').length;
  const charCount = markdown.length;

  const insertSnippet = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);
    const replacement = prefix + (selected || '') + suffix;

    const updated = markdown.substring(0, start) + replacement + markdown.substring(end);
    onChange(updated);

    setTimeout(() => {
      textarea.focus();
      const newCursor = start + prefix.length + (selected ? selected.length : 0);
      textarea.setSelectionRange(newCursor, newCursor);
    }, 10);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onChange(event.target.result);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      {/* Sub-header with Import, Copy for OneNote & Clear */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-xs shrink-0 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs font-medium cursor-pointer"
            title="Import Markdown File"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="text-xs">Import .md</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Copy for OneNote Button */}
          {onCopyOneNote && (
            <button
              onClick={onCopyOneNote}
              disabled={!markdown.trim()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all shadow-2xs font-medium cursor-pointer text-xs disabled:opacity-40 disabled:pointer-events-none ${
                isOneNoteCopied
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                  : 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300'
              }`}
              title="Copy formatted Markdown with native formulas and tables for OneNote"
            >
              {isOneNoteCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Copied for OneNote!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Copy for OneNote</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (!markdown.trim()) return;
              if (window.confirm('Clear all markdown content?')) {
                onChange('');
              }
            }}
            disabled={!markdown.trim()}
            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 disabled:pointer-events-none p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Clear editor"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Cozy Mobile Markdown Formatting Toolbar */}
      <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800/80 overflow-x-auto scrollbar-none shrink-0 text-slate-600 dark:text-slate-400 text-xs">
        <button
          onClick={() => insertSnippet('\n# ', '\n')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold text-[11px] shrink-0"
          title="Heading 1"
        >
          <Heading1 className="w-3.5 h-3.5" />
          <span>H1</span>
        </button>
        <button
          onClick={() => insertSnippet('\n## ', '\n')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold text-[11px] shrink-0"
          title="Heading 2"
        >
          <Heading2 className="w-3.5 h-3.5" />
          <span>H2</span>
        </button>
        <button
          onClick={() => insertSnippet('**', '**')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold text-[11px] shrink-0"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('*', '*')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold text-[11px] shrink-0"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('$$', '$$')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold text-[11px] shrink-0"
          title="LaTeX Math Equation"
        >
          <Sigma className="w-3.5 h-3.5" />
          <span>Math</span>
        </button>
        <button
          onClick={() => insertSnippet('```\n', '\n```')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold text-[11px] shrink-0"
          title="Code Block"
        >
          <Code className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('\n- ', '')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold text-[11px] shrink-0"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => insertSnippet('\n| Header 1 | Header 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |\n', '')}
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold text-[11px] shrink-0"
          title="Table"
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Table</span>
        </button>
      </div>

      {/* Editor Pure Textarea */}
      <div className="flex-1 relative min-h-0">
        <textarea
          ref={textareaRef}
          value={markdown}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Type or paste your Markdown here...&#10;&#10;Use LaTeX math like $$E = mc^2$$ and standard headings."
          className="w-full h-full p-3.5 sm:p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 font-mono text-base md:text-xs leading-relaxed resize-none focus:outline-none"
          spellCheck={false}
        />
      </div>

      {/* Bottom Status bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-1.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span>{wordCount} words</span>
          <span aria-hidden="true">·</span>
          <span>{lineCount} lines</span>
          <span aria-hidden="true" className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">{charCount} chars</span>
        </div>
        <div className="text-slate-400 dark:text-slate-500 text-[10px] sm:text-[11px]">
          Markdown + LaTeX
        </div>
      </div>
    </div>
  );
};
