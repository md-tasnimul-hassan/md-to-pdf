import { marked } from 'marked';
import katex from 'katex';

export interface ParsedMarkdownResult {
  html: string;
  frontmatter: {
    title?: string;
    author?: string;
    date?: string;
    abstract?: string;
    [key: string]: any;
  };
  plainText: string;
}

const KATEX_MACROS: Record<string, string> = {
  '\\mus': '\\mu\\text{s}',
  '\\micro': '\\mu',
  '\\ohm': '\\Omega',
  '\\degree': '^{\\circ}',
  '\\deg': '^{\\circ}',
  '\\celsius': '^{\\circ}\\text{C}',
  '\\unit': '\\text',
  '\\textmu': '\\mu',
  '\\upmu': '\\mu',
  '\\boldsymbol': '\\mathbf',
  '\\binom': '\\dbinom',
  '\\tbinom': '\\dbinom',
  '\\choose': '\\dbinom',
};

function sanitizeLatex(expr: string, isDisplay = false): string {
  let cleaned = expr
    .replace(/\{([^{}]+)\s*\\choose\s*([^{}]+)\}/g, '\\dbinom{$1}{$2}')
    .replace(/\\binom\b/g, '\\dbinom')
    .replace(/\\tbinom\b/g, '\\dbinom')
    .replace(/\\mus\b/g, '\\mu\\text{s}')
    .replace(/\\micro\b/g, '\\mu')
    .replace(/\\degree\b/g, '^{\\circ}');

  // Upgrade \frac to \dfrac in display math or when fractions contain combinations,
  // ensuring numerators and denominators maintain full, crisp mathematical sizing
  if (isDisplay) {
    cleaned = cleaned.replace(/\\frac\b/g, '\\dfrac');
  } else {
    if (cleaned.includes('\\dbinom') || cleaned.includes('\\binom')) {
      cleaned = cleaned.replace(/\\frac\b/g, '\\dfrac');
    }
  }

  return cleaned;
}

export function parseMarkdownWithLaTeX(
  markdown: string,
  options: { numberSections?: boolean; tableOfContents?: boolean } = {}
): ParsedMarkdownResult {
  let content = markdown;
  const frontmatter: Record<string, string> = {};

  // Extract YAML frontmatter if present
  if (content.startsWith('---')) {
    const endMatch = content.indexOf('\n---', 3);
    if (endMatch !== -1) {
      const yamlBlock = content.slice(3, endMatch).trim();
      content = content.slice(endMatch + 4).trim();

      const lines = yamlBlock.split('\n');
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
          const key = line.slice(0, colonIndex).trim().toLowerCase();
          const val = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
          frontmatter[key] = val;
        }
      }
    }
  }

  // Handle explicit LaTeX page breaks
  content = content.replace(/\\newpage/g, '<div class="page-break-before my-4 border-b border-dashed border-slate-300 print:hidden text-center text-xs text-slate-400 py-1.5">[Page Break]</div>');
  content = content.replace(/<!--\s*pagebreak\s*-->/g, '<div class="page-break-before my-4 border-b border-dashed border-slate-300 print:hidden text-center text-xs text-slate-400 py-1.5">[Page Break]</div>');

  // Auto-promote standalone formulas on their own line to display math ($$ ... $$) for Overleaf-grade rendering
  content = content.replace(/(^|\n)[ \t]*\$([^\$\n]+)\$[ \t]*(?=\n|$)/g, '$1\n\n$$$$2$$$$\n\n');

  // STEP 1: Protect display math ($$ ... $$) with unique tokens so marked won't touch KaTeX HTML
  const displayMathList: string[] = [];
  content = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const index = displayMathList.length;
    displayMathList.push(sanitizeLatex(math.trim(), true));
    return `\n\n%%KATEX_DISPLAY_BLOCK_${index}%%\n\n`;
  });

  // STEP 2: Protect inline math ($ ... $) with unique tokens
  const inlineMathList: string[] = [];
  content = content.replace(/(?<!\$)\$(?!\$)([^\n\r$]+?)(?<!\$)\$(?!\$)/g, (_, math) => {
    const index = inlineMathList.length;
    inlineMathList.push(sanitizeLatex(math.trim(), false));
    return `%%KATEX_INLINE_BLOCK_${index}%%`;
  });

  // Track table of contents items
  const tocEntries: Array<{ title: string; id: string; depth: number; numberPrefix: string }> = [];

  // Configure marked for clean LaTeX-like rendering (STRICTLY BLACK INK FOR PDF - NO DARK MODE CLASSES)
  const renderer = new marked.Renderer();

  let secCounter = 0;
  let subSecCounter = 0;
  let subSubSecCounter = 0;

  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    let prefix = '';
    
    // Only add automated numbering if explicitly requested AND heading does not already start with a number
    const alreadyNumbered = /^(\d+(\.\d+)*|[A-Z]\.|\d+\))\s+/.test(text.trim());
    if (options.numberSections && !alreadyNumbered) {
      if (depth === 1) {
        secCounter++;
        subSecCounter = 0;
        subSubSecCounter = 0;
        prefix = `${secCounter}. `;
      } else if (depth === 2) {
        subSecCounter++;
        subSubSecCounter = 0;
        prefix = `${secCounter}.${subSecCounter} `;
      } else if (depth === 3) {
        subSubSecCounter++;
        prefix = `${secCounter}.${subSecCounter}.${subSubSecCounter} `;
      }
    }

    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    if (depth <= 2) {
      tocEntries.push({ title: text, id, depth, numberPrefix: prefix });
    }

    // Classic LaTeX article heading scaling and compact publication spacing
    const headingClasses =
      depth === 1
        ? 'text-lg font-bold mt-3.5 mb-1 text-[#0f172a]'
        : depth === 2
        ? 'text-base font-bold mt-2.5 mb-1 text-[#0f172a]'
        : 'text-sm font-semibold mt-2 mb-0.5 text-[#0f172a]';

    return `<h${depth} id="${id}" class="${headingClasses}">${prefix}${text}</h${depth}>`;
  };

  renderer.paragraph = function ({ tokens }) {
    const text = this.parser.parseInline(tokens);
    return `<p class="mb-1.5 leading-normal text-[#0f172a]">${text}</p>`;
  };

  renderer.hr = function () {
    return `<div class="my-2.5 border-b border-slate-300"></div>`;
  };

  // LaTeX Booktabs-style table rendering (Compatible with Marked v12+ tokens)
  renderer.table = function (token: any) {
    let headerCells = '';
    if (token.header && Array.isArray(token.header)) {
      for (let i = 0; i < token.header.length; i++) {
        headerCells += this.tablecell(token.header[i]);
      }
    }
    const headerRow = this.tablerow({ text: headerCells });

    let bodyRows = '';
    if (token.rows && Array.isArray(token.rows)) {
      for (let r = 0; r < token.rows.length; r++) {
        const row = token.rows[r];
        let rowCells = '';
        if (Array.isArray(row)) {
          for (let c = 0; c < row.length; c++) {
            rowCells += this.tablecell(row[c]);
          }
        }
        bodyRows += this.tablerow({ text: rowCells });
      }
    }

    return `<div class="my-2 table-container w-full overflow-visible">
      <table class="w-full text-left border-collapse text-xs sm:text-sm">
        <thead class="border-t-[1.5px] border-b border-slate-900 font-semibold text-slate-900">
          ${headerRow}
        </thead>
        <tbody class="border-b-[1.5px] border-slate-900 divide-y divide-slate-200 text-slate-900">
          ${bodyRows}
        </tbody>
      </table>
    </div>`;
  };

  renderer.tablerow = function (token: any) {
    const content = token.text || '';
    return `<tr>${content}</tr>`;
  };

  renderer.tablecell = function (token: any) {
    const isHeader = !!token.header;
    const tag = isHeader ? 'th' : 'td';
    const align =
      token.align === 'center'
        ? 'text-center'
        : token.align === 'right'
        ? 'text-right'
        : 'text-left';
    const padding = isHeader ? 'py-1 px-2.5 font-semibold' : 'py-0.5 px-2.5';
    const content = token.tokens
      ? this.parser.parseInline(token.tokens)
      : token.text || '';
    return `<${tag} class="${align} ${padding}">${content}</${tag}>`;
  };

  renderer.code = function ({ text, lang }) {
    return `<div class="my-2 rounded border border-[#cbd5e1] bg-[#f8fafc] p-2.5 font-mono text-xs overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-[#0f172a]">
      ${lang ? `<div class="text-[10px] text-[#64748b] uppercase tracking-wider mb-1 font-mono">${lang}</div>` : ''}
      <code>${escapeHtml(text)}</code>
    </div>`;
  };

  renderer.blockquote = function ({ tokens }) {
    const text = this.parser.parse(tokens);
    return `<blockquote class="my-2 pl-3 border-l-2 border-[#64748b] italic text-[#334155]">
      ${text}
    </blockquote>`;
  };

  renderer.list = function ({ ordered, items }) {
    const tag = ordered ? 'ol' : 'ul';
    const listClasses = ordered
      ? 'list-decimal list-outside pl-5 my-1 text-[#0f172a] space-y-0.5'
      : 'list-disc list-outside pl-5 my-1 text-[#0f172a] space-y-0.5';
    const body = items.map((item) => renderer.listitem(item)).join('');
    return `<${tag} class="${listClasses}">${body}</${tag}>`;
  };

  renderer.listitem = function ({ tokens }) {
    const content = this.parser.parse(tokens);
    return `<li class="leading-normal">${content}</li>`;
  };

  // STEP 3: Parse markdown with marked
  let html = marked.parse(content, { renderer, gfm: true }) as string;

  // STEP 4: Render protected display math with KaTeX
  displayMathList.forEach((math, index) => {
    let rendered = '';
    try {
      rendered = katex.renderToString(math, {
        displayMode: true,
        throwOnError: false,
        errorColor: '#000000',
        macros: KATEX_MACROS,
        strict: false,
        trust: true,
        output: 'html',
      });
    } catch {
      rendered = `<div class="font-mono text-xs p-2 text-[#0f172a]">${math}</div>`;
    }
    const displayHtml = `<div class="katex-display-container my-1.5 text-center overflow-x-auto overflow-y-hidden [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5 select-text">${rendered}</div>`;
    
    // Replace placeholder inside <p> or standalone without leaving orphaned tags
    html = html.replace(new RegExp(`<p>\\s*%%KATEX_DISPLAY_BLOCK_${index}%%\\s*<\\/p>`, 'g'), displayHtml);
    html = html.replace(new RegExp(`<p>[^<]*?%%KATEX_DISPLAY_BLOCK_${index}%%[^<]*?<\\/p>`, 'g'), displayHtml);
    html = html.replace(new RegExp(`%%KATEX_DISPLAY_BLOCK_${index}%%`, 'g'), displayHtml);
  });

  // STEP 5: Render protected inline math with KaTeX
  inlineMathList.forEach((math, index) => {
    let rendered = '';
    try {
      rendered = katex.renderToString(math, {
        displayMode: false,
        throwOnError: false,
        errorColor: '#000000',
        macros: KATEX_MACROS,
        strict: false,
        trust: true,
        output: 'html',
      });
    } catch {
      rendered = `<code class="font-mono text-xs">${math}</code>`;
    }
    html = html.replace(new RegExp(`%%KATEX_INLINE_BLOCK_${index}%%`, 'g'), rendered);
  });

  // Optional Table of Contents injection
  if (options.tableOfContents && tocEntries.length > 0) {
    const items = tocEntries
      .map(
        (e) => `
      <li class="${e.depth === 2 ? 'ml-5 text-xs text-[#334155]' : 'font-semibold text-sm text-[#0f172a]'} py-0.5 flex items-baseline justify-between border-b border-dotted border-[#cbd5e1]">
        <a href="#${e.id}" class="hover:underline text-[#0f172a]">${e.numberPrefix}${e.title}</a>
        <span class="text-xs font-mono text-[#64748b] select-none">...</span>
      </li>`
      )
      .join('');

    const tocHtml = `
    <div class="my-6 p-4 rounded border border-[#cbd5e1] bg-[#f8fafc] page-break-inside-avoid">
      <div class="font-bold text-xs text-[#0f172a] uppercase tracking-wider mb-2">Contents</div>
      <ul class="list-none p-0 m-0 space-y-0.5">
        ${items}
      </ul>
    </div>`;

    html = tocHtml + html;
  }

  return {
    html,
    frontmatter,
    plainText: content,
  };
}

function escapeHtml(string: string): string {
  return string
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
