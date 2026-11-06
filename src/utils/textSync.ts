/**
 * Utility to synchronize text selected in the PDF/HTML preview
 * with the raw Markdown source text in the editor.
 */

export interface SelectionContext {
  blockText?: string;
  latex?: string;
}

/**
 * Escapes regex special characters.
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Finds the range [start, end] of a query string within a target text.
 * Uses exact match, case-insensitive match, whitespace-normalized match,
 * and markdown-tolerant matching (accounting for bold, italic, code ticks).
 */
export function findLocalMatch(
  text: string,
  query: string
): { start: number; end: number } | null {
  const trimmed = query.trim();
  if (!trimmed || !text) return null;

  // 1. Exact substring match
  const exactIdx = text.indexOf(trimmed);
  if (exactIdx !== -1) {
    return { start: exactIdx, end: exactIdx + trimmed.length };
  }

  // 2. Case-insensitive exact match
  const lowerText = text.toLowerCase();
  const lowerQuery = trimmed.toLowerCase();
  const lowerIdx = lowerText.indexOf(lowerQuery);
  if (lowerIdx !== -1) {
    return { start: lowerIdx, end: lowerIdx + trimmed.length };
  }

  // Split into individual non-empty words
  const words = trimmed.split(/\s+/).filter(Boolean);

  // 3. Normalized whitespace match (handles newlines and multiple spaces)
  if (words.length > 1) {
    try {
      const wsPattern = words.map(escapeRegExp).join('\\s+');
      const wsRegex = new RegExp(wsPattern, 'i');
      const wsMatch = wsRegex.exec(text);
      if (wsMatch) {
        return { start: wsMatch.index, end: wsMatch.index + wsMatch[0].length };
      }
    } catch {
      // Fall through
    }

    // 4. Markdown-tolerant match (allows Markdown styling tokens like **bold**, *italic*, `code` between words)
    try {
      const mdPattern = words.map(escapeRegExp).join('[\\*_`~#\\[\\]\\(\\)\\\\:\\-]*\\s+[\\*_`~#\\[\\]\\(\\)\\\\:\\-]*');
      const mdRegex = new RegExp(mdPattern, 'i');
      const mdMatch = mdRegex.exec(text);
      if (mdMatch) {
        return { start: mdMatch.index, end: mdMatch.index + mdMatch[0].length };
      }
    } catch {
      // Fall through
    }
  }

  // 5. Single word boundary match
  if (words.length === 1) {
    try {
      const singlePattern = `\\b${escapeRegExp(words[0])}\\b`;
      const wordRegex = new RegExp(singlePattern, 'i');
      const wordMatch = wordRegex.exec(text);
      if (wordMatch) {
        return { start: wordMatch.index, end: wordMatch.index + wordMatch[0].length };
      }
    } catch {
      // Fall through
    }
  }

  return null;
}

/**
 * Finds the exact [start, end] character range in the markdown text
 * corresponding to the highlighted text in the preview.
 */
export function findMarkdownRangeForSelectedText(
  markdown: string,
  selectedText: string,
  context?: SelectionContext
): { start: number; end: number } | null {
  const trimmed = selectedText.trim();
  if (!trimmed || !markdown) return null;

  // Priority 1: If LaTeX formula was selected, search for the formula in markdown
  if (context?.latex) {
    const cleanLatex = context.latex.trim();
    const latexMatch = findLocalMatch(markdown, cleanLatex);
    if (latexMatch) {
      return latexMatch;
    }
  }

  // Priority 2: Use enclosing block context to locate the correct paragraph/section
  if (context?.blockText) {
    const cleanBlock = context.blockText.trim();
    const blockWords = cleanBlock.split(/\s+/).filter(Boolean).slice(0, 8);
    if (blockWords.length >= 2) {
      try {
        const blockPattern = blockWords.map(escapeRegExp).join('[\\*_`~#\\s]*');
        const blockRegex = new RegExp(blockPattern, 'i');
        const blockMatch = blockRegex.exec(markdown);
        if (blockMatch) {
          // Search within a generous 2000-character window around the matched block
          const windowStart = blockMatch.index;
          const windowText = markdown.slice(windowStart, windowStart + 2500);
          const localMatch = findLocalMatch(windowText, trimmed);
          if (localMatch) {
            return {
              start: windowStart + localMatch.start,
              end: windowStart + localMatch.end,
            };
          }
        }
      } catch {
        // Fall through to global match
      }
    }
  }

  // Priority 3: Global match across the entire markdown document
  return findLocalMatch(markdown, trimmed);
}
