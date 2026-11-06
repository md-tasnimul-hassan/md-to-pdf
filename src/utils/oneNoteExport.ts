import { marked } from 'marked';
import katex from 'katex';
import { mml2omml } from 'mathml2omml';

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

function sanitizeLatexForOneNote(expr: string, isDisplay = false): string {
  let cleaned = expr
    .replace(/\{([^{}]+)\s*\\choose\s*([^{}]+)\}/g, '\\dbinom{$1}{$2}')
    .replace(/\\binom\b/g, '\\dbinom')
    .replace(/\\tbinom\b/g, '\\dbinom')
    .replace(/\\mus\b/g, '\\mu\\text{s}')
    .replace(/\\micro\b/g, '\\mu')
    .replace(/\\degree\b/g, '^{\\circ}');

  if (isDisplay) {
    cleaned = cleaned.replace(/\\frac\b/g, '\\dfrac');
  } else if (cleaned.includes('\\dbinom') || cleaned.includes('\\binom')) {
    cleaned = cleaned.replace(/\\frac\b/g, '\\dfrac');
  }

  return cleaned;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Enhances raw OMML generated from MathML:
 * 1. Replaces contradictory namespaces with Microsoft's official office OMML namespace.
 * 2. Promotes fences enclosing fractions, binomials, radicals, and sub/superscripts
 *    into native OMML delimiter elements (<m:d>) so parentheses dynamically stretch.
 */
function enhanceOmmlFencesAndNamespaces(rawOmml: string): string {
  // Normalize namespace to standard Microsoft Office OMML
  let omml = rawOmml
    .replace(/xmlns:m="[^"]*"/g, 'xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"')
    .replace(/\s*xmlns:w="[^"]*"/g, '')
    .replace(/<m:sty m:val="undefined"\s*\/>/g, '');

  // Eliminate empty operand placeholders (<m:e/>) in n-ary operators (sum, int, prod, union)
  // which Microsoft Word and OneNote otherwise render as unwanted dotted square placeholder boxes.
  omml = omml.replace(/<(m:nary|m:limLow|m:limUpp)\b([\s\S]*?)<\/\1>/g, (block) => {
    return block.replace(
      /<m:e\s*\/>|<m:e>\s*<\/m:e>/g,
      '<m:e><m:r><m:t xml:space="preserve">&#8203;</m:t></m:r></m:e>'
    );
  });

  // Convert literal run parentheses enclosing tall elements (fractions, powers, roots)
  // into native Office Math delimiter elements <m:d> with elastic brackets
  const fenceRegex = /<m:r><m:t xml:space="preserve">\s*([(\[{])\s*<\/m:t><\/m:r>((?:(?!<m:r><m:t xml:space="preserve">\s*[()\[\]{}]\s*<\/m:t><\/m:r>)[\s\S])*?)<m:r><m:t xml:space="preserve">\s*([)\]}])\s*<\/m:t><\/m:r>/g;

  let prev = '';
  let iterations = 0;
  while (prev !== omml && iterations < 5) {
    prev = omml;
    omml = omml.replace(fenceRegex, (match, open, inner, close) => {
      const isMatching =
        (open === '(' && close === ')') ||
        (open === '[' && close === ']') ||
        (open === '{' && close === '}');
      if (isMatching && /<m:(f|sSub|sSup|rad|m|d|eqArr)/.test(inner)) {
        return `<m:d><m:dPr><m:begChr m:val="${open}"/><m:sepChr m:val=""/><m:endChr m:val="${close}"/></m:dPr><m:e>${inner}</m:e></m:d>`;
      }
      return match;
    });
    iterations++;
  }

  return omml;
}

/**
 * Converts a LaTeX formula into Microsoft Office OMML and MathML for OneNote.
 * Handles display equations and inline equations with Cambria Math typography.
 */
function convertFormulaToOneNote(latex: string, isDisplay = false): string {
  try {
    const rawMml = katex.renderToString(latex, {
      displayMode: isDisplay,
      output: 'mathml',
      throwOnError: false,
      macros: KATEX_MACROS,
      strict: false,
      trust: true,
    });

    const mathMatch = rawMml.match(/<math[\s\S]*?<\/math>/);
    if (!mathMatch) {
      return isDisplay
        ? `<p style="text-align: center; margin: 10pt 0; font-family: 'Cambria Math', 'STIX Two Math', 'Segoe UI', serif; font-size: 11.5pt;">${escapeHtml(latex)}</p>`
        : `<span style="font-family: 'Cambria Math', 'STIX Two Math', 'Segoe UI', serif; font-size: 11pt;">${escapeHtml(latex)}</span>`;
    }

    // Critical fix: KaTeX outputs linethickness="0px", but mathml2omml and Office MathML parsers
    // only recognize linethickness="0" for zero-thickness fraction bars (binomials, combinations, matrices).
    const cleanMml = mathMatch[0]
      .replace(/<annotation[\s\S]*?<\/annotation>/g, '')
      .replace(/linethickness="0px"/g, 'linethickness="0"')
      .replace(/linethickness="0pt"/g, 'linethickness="0"');

    let omml = '';
    try {
      omml = mml2omml(cleanMml);
    } catch {
      omml = '';
    }

    if (omml) {
      omml = enhanceOmmlFencesAndNamespaces(omml);

      if (isDisplay) {
        // Strip namespace from inner m:oMath so it inherits cleanly from m:oMathPara
        const innerOmml = omml.replace(/<m:oMath[\s\S]*?>/, '<m:oMath>');
        return `
<p style="margin: 10pt 0; text-align: center;">
<!--[if gte msEquation 12]>
<m:oMathPara xmlns:m="http://schemas.microsoft.com/office/2004/12/omml">
  <m:oMathParaPr>
    <m:jc m:val="center"/>
  </m:oMathParaPr>
  ${innerOmml}
</m:oMathPara>
<![endif]-->
<![if !msEquation]>
<span style="font-family: 'Cambria Math', 'STIX Two Math', 'Segoe UI Math', 'Calibri', serif; font-size: 11.5pt; color: #0f172a;">${cleanMml}</span>
<![endif]>
</p>`;
      }

      // Inline formula
      const inlineOmml = omml.replace(/<m:oMath[\s\S]*?>/, '<m:oMath xmlns:m="http://schemas.microsoft.com/office/2004/12/omml">');
      return `<!--[if gte msEquation 12]>${inlineOmml}<![endif]--><![if !msEquation]><span style="font-family: 'Cambria Math', 'STIX Two Math', 'Segoe UI Math', 'Calibri', serif; font-size: 11pt; color: #0f172a; vertical-align: middle;">${cleanMml}</span><![endif]>`;
    }

    // Fallback if OMML generator encountered an unsupported token
    if (isDisplay) {
      return `
<p style="margin: 10pt 0; text-align: center;">
  <span style="font-family: 'Cambria Math', 'STIX Two Math', 'Segoe UI Math', 'Calibri', serif; font-size: 11.5pt; color: #0f172a;">${cleanMml}</span>
</p>`;
    }

    return `<span style="font-family: 'Cambria Math', 'STIX Two Math', 'Segoe UI Math', 'Calibri', serif; font-size: 11pt; color: #0f172a; vertical-align: middle;">${cleanMml}</span>`;
  } catch {
    return isDisplay
      ? `<p style="text-align: center; margin: 10pt 0; font-family: 'Cambria Math', 'STIX Two Math', 'Segoe UI', serif; font-size: 11.5pt;">${escapeHtml(latex)}</p>`
      : `<span style="font-family: 'Cambria Math', 'STIX Two Math', 'Segoe UI', serif; font-size: 11pt;">${escapeHtml(latex)}</span>`;
  }
}

/**
 * Builds a completely self-contained, beautifully styled HTML document
 * fully compatible with Microsoft OneNote's rich-text and equation engine.
 */
export function generateOneNoteHtml(markdown: string): { html: string; plainText: string } {
  let content = markdown;
  const frontmatter: Record<string, string> = {};

  // Extract YAML frontmatter
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

  // Remove explicit pagebreak markers for OneNote continuous canvas
  content = content.replace(/\\newpage/g, '<hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 12pt 0;" />');
  content = content.replace(/<!--\s*pagebreak\s*-->/g, '<hr style="border: none; border-top: 1px dashed #cbd5e1; margin: 12pt 0;" />');

  // Auto-promote standalone formulas on their own line to display math ($$ ... $$)
  content = content.replace(/(^|\n)[ \t]*\$([^\$\n]+)\$[ \t]*(?=\n|$)/g, '$1\n\n$$$$2$$$$\n\n');

  // STEP 1: Protect display math ($$ ... $$)
  const displayMathList: string[] = [];
  content = content.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const index = displayMathList.length;
    displayMathList.push(sanitizeLatexForOneNote(math.trim(), true));
    return `\n\n%%ONENOTE_DISPLAY_BLOCK_${index}%%\n\n`;
  });

  // STEP 2: Protect inline math ($ ... $)
  const inlineMathList: string[] = [];
  content = content.replace(/(?<!\$)\$(?!\$)([^\n\r$]+?)(?<!\$)\$(?!\$)/g, (_, math) => {
    const index = inlineMathList.length;
    inlineMathList.push(sanitizeLatexForOneNote(math.trim(), false));
    return `%%ONENOTE_INLINE_BLOCK_${index}%%`;
  });

  // Custom Marked renderer with strict inline styles that OneNote recognizes
  const renderer = new marked.Renderer();

  renderer.heading = function ({ tokens, depth }) {
    const text = this.parser.parseInline(tokens);
    if (depth === 1) {
      return `<h1 style="font-family: 'Segoe UI', Calibri, -apple-system, sans-serif; font-size: 16pt; font-weight: bold; color: #0f172a; margin-top: 18pt; margin-bottom: 6pt; border-bottom: 1.5px solid #cbd5e1; padding-bottom: 3pt;">${text}</h1>`;
    }
    if (depth === 2) {
      return `<h2 style="font-family: 'Segoe UI', Calibri, -apple-system, sans-serif; font-size: 13.5pt; font-weight: bold; color: #0f172a; margin-top: 14pt; margin-bottom: 4pt;">${text}</h2>`;
    }
    if (depth === 3) {
      return `<h3 style="font-family: 'Segoe UI', Calibri, -apple-system, sans-serif; font-size: 11.5pt; font-weight: bold; color: #1e293b; margin-top: 10pt; margin-bottom: 3pt;">${text}</h3>`;
    }
    return `<h4 style="font-family: 'Segoe UI', Calibri, -apple-system, sans-serif; font-size: 11pt; font-weight: bold; color: #334155; margin-top: 8pt; margin-bottom: 2pt;">${text}</h4>`;
  };

  renderer.paragraph = function ({ tokens }) {
    const text = this.parser.parseInline(tokens);
    return `<p style="font-family: 'Segoe UI', Calibri, -apple-system, sans-serif; font-size: 11pt; line-height: 1.5; color: #1e293b; margin: 0 0 6pt 0;">${text}</p>`;
  };

  renderer.hr = function () {
    return `<hr style="border: none; border-top: 1px solid #cbd5e1; margin: 12pt 0;" />`;
  };

  renderer.table = function (token: any) {
    let headerCells = '';
    if (token.header && Array.isArray(token.header)) {
      for (let i = 0; i < token.header.length; i++) {
        headerCells += this.tablecell(token.header[i]);
      }
    }
    const headerRow = `<tr style="background-color: #f1f5f9; border-bottom: 2px solid #0f172a;">${headerCells}</tr>`;

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
        const rowBg = r % 2 === 0 ? '#ffffff' : '#f8fafc';
        bodyRows += `<tr style="background-color: ${rowBg}; border-bottom: 1px solid #e2e8f0;">${rowCells}</tr>`;
      }
    }

    return `
<table style="border-collapse: collapse; width: 100%; margin: 8pt 0 10pt 0; font-family: 'Segoe UI', Calibri, -apple-system, sans-serif; font-size: 10.5pt; border: 1px solid #cbd5e1;" border="1" cellpadding="6" cellspacing="0">
  <thead>${headerRow}</thead>
  <tbody>${bodyRows}</tbody>
</table>`;
  };

  renderer.tablecell = function (token: any) {
    const isHeader = !!token.header;
    const tag = isHeader ? 'th' : 'td';
    const align = token.align === 'center' ? 'center' : token.align === 'right' ? 'right' : 'left';
    const content = token.tokens ? this.parser.parseInline(token.tokens) : token.text || '';
    if (isHeader) {
      return `<th style="padding: 6pt 10pt; border: 1px solid #cbd5e1; font-weight: 600; text-align: ${align}; color: #0f172a; vertical-align: middle;">${content}</th>`;
    }
    return `<td style="padding: 5pt 10pt; border: 1px solid #cbd5e1; text-align: ${align}; color: #1e293b; vertical-align: middle;">${content}</td>`;
  };

  renderer.code = function ({ text }) {
    return `<pre style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8pt 10pt; font-family: Consolas, 'Courier New', monospace; font-size: 9.5pt; color: #0f172a; margin: 8pt 0; white-space: pre-wrap; line-height: 1.4;"><code>${escapeHtml(text)}</code></pre>`;
  };

  renderer.codespan = function ({ text }) {
    return `<code style="background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 3px; padding: 1pt 4pt; font-family: Consolas, 'Courier New', monospace; font-size: 9.5pt; color: #0969da;">${escapeHtml(text)}</code>`;
  };

  renderer.blockquote = function ({ tokens }) {
    const text = this.parser.parse(tokens);
    return `<blockquote style="margin: 8pt 0; padding: 4pt 10pt; border-left: 3px solid #3b82f6; background-color: #f8fafc; color: #334155; font-style: italic; font-family: 'Segoe UI', Calibri, sans-serif;">${text}</blockquote>`;
  };

  renderer.list = function ({ ordered, items }) {
    const tag = ordered ? 'ol' : 'ul';
    const listStyle = ordered
      ? 'margin: 4pt 0 6pt 0; padding-left: 20pt; font-family: \'Segoe UI\', Calibri, sans-serif; font-size: 11pt; color: #1e293b;'
      : 'margin: 4pt 0 6pt 0; padding-left: 20pt; font-family: \'Segoe UI\', Calibri, sans-serif; font-size: 11pt; color: #1e293b; list-style-type: disc;';
    const body = items.map((item) => renderer.listitem(item)).join('');
    return `<${tag} style="${listStyle}">${body}</${tag}>`;
  };

  renderer.listitem = function ({ tokens }) {
    const content = this.parser.parse(tokens);
    return `<li style="margin-bottom: 2pt; line-height: 1.45;">${content}</li>`;
  };

  let bodyHtml = marked.parse(content, { renderer, gfm: true }) as string;

  // Substitute Display formulas
  displayMathList.forEach((math, idx) => {
    const formulaHtml = convertFormulaToOneNote(math, true);
    bodyHtml = bodyHtml.replace(new RegExp(`<p>[^<]*?%%ONENOTE_DISPLAY_BLOCK_${idx}%%[^<]*?<\\/p>`, 'g'), formulaHtml);
    bodyHtml = bodyHtml.replace(new RegExp(`%%ONENOTE_DISPLAY_BLOCK_${idx}%%`, 'g'), formulaHtml);
  });

  // Substitute Inline formulas
  inlineMathList.forEach((math, idx) => {
    const formulaHtml = convertFormulaToOneNote(math, false);
    bodyHtml = bodyHtml.replace(new RegExp(`%%ONENOTE_INLINE_BLOCK_${idx}%%`, 'g'), formulaHtml);
  });

  // Prepend Frontmatter Header if present
  let headerHtml = '';
  if (frontmatter.title || frontmatter.author) {
    headerHtml = `
<div style="margin-bottom: 16pt; padding-bottom: 10pt; border-bottom: 2px solid #0f172a; font-family: 'Segoe UI', Calibri, sans-serif;">
  ${frontmatter.title ? `<h1 style="font-size: 18pt; font-weight: bold; margin: 0 0 4pt 0; color: #0f172a;">${escapeHtml(frontmatter.title)}</h1>` : ''}
  ${frontmatter.author ? `<div style="font-size: 11pt; color: #475569; margin-bottom: 2pt; font-weight: 500;">${escapeHtml(frontmatter.author)}</div>` : ''}
  ${frontmatter.date ? `<div style="font-size: 9.5pt; color: #64748b; margin-bottom: 6pt;">${escapeHtml(frontmatter.date)}</div>` : ''}
  ${frontmatter.abstract ? `
    <div style="margin-top: 8pt; padding: 8pt 12pt; background-color: #f1f5f9; border-left: 3px solid #0f172a; font-style: italic; font-size: 10pt; color: #334155;">
      <strong style="font-style: normal; text-transform: uppercase; font-size: 8.5pt; display: block; margin-bottom: 2pt; color: #0f172a;">Abstract</strong>
      ${escapeHtml(frontmatter.abstract)}
    </div>` : ''}
</div>`;
  }

  const fullBody = headerHtml + bodyHtml;

  // Wrap in Microsoft Office clipboard compatible HTML envelope
  const officeHtml = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns:m="http://schemas.microsoft.com/office/2004/12/omml"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]>
<xml>
<o:OfficeDocumentSettings>
  <o:AllowPNG/>
</o:OfficeDocumentSettings>
</xml>
<![endif]-->
<title>${escapeHtml(frontmatter.title || 'Document')}</title>
<style>
body, p, div, table, tr, td, th {
  font-family: 'Segoe UI', Calibri, -apple-system, sans-serif;
}
m\\:oMath, m\\:oMathPara, math {
  font-family: 'Cambria Math', 'STIX Two Math', 'Segoe UI Math', serif !important;
}
</style>
</head>
<body style="font-family: 'Segoe UI', Calibri, -apple-system, sans-serif; font-size: 11pt; color: #1e293b; line-height: 1.5;">
<!--StartFragment-->
${fullBody}
<!--EndFragment-->
</body>
</html>`;

  return {
    html: officeHtml,
    plainText: content,
  };
}

/**
 * Copies OneNote-compatible rich HTML and plain text to the clipboard.
 * Works seamlessly across desktop and web OneNote with native clipboard fallback.
 */
export async function copyToOneNoteClipboard(markdown: string): Promise<boolean> {
  const { html, plainText } = generateOneNoteHtml(markdown);

  // Method 1: Modern asynchronous Clipboard API with ClipboardItem
  if (navigator.clipboard && window.ClipboardItem) {
    try {
      const htmlBlob = new Blob([html], { type: 'text/html' });
      const textBlob = new Blob([plainText], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      return true;
    } catch (err) {
      console.warn('ClipboardItem API write failed, trying event-based fallback:', err);
    }
  }

  // Method 2: Document copy event interception
  return new Promise<boolean>((resolve) => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData('text/html', html);
        e.clipboardData.setData('text/plain', plainText);
      }
      document.removeEventListener('copy', handleCopy);
      resolve(true);
    };

    document.addEventListener('copy', handleCopy);
    try {
      const successful = document.execCommand('copy');
      if (!successful) {
        document.removeEventListener('copy', handleCopy);
        resolve(false);
      }
    } catch {
      document.removeEventListener('copy', handleCopy);
      resolve(false);
    }
  });
}
