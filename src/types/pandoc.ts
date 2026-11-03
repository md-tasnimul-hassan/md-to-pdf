export type PdfEngine = 'pdflatex' | 'xelatex' | 'lualatex' | 'weasyprint' | 'typst';
export type FontFamily = 'latin-modern' | 'times' | 'garamond' | 'palatino' | 'baskerville' | 'arev';
export type FontSize = '10pt' | '11pt' | '12pt';
export type PageMargin = '0.75in' | '0.5in' | '1in' | '1.25in' | '2cm' | '2.5cm';
export type PaperSize = 'a4' | 'letter';

export interface PandocConfig {
  engine: PdfEngine;
  fontfamily: FontFamily;
  fontsize: FontSize;
  margin: PageMargin;
  papersize: PaperSize;
  linestretch: string;
  numberSections: boolean;
  tableOfContents: boolean;
  documentClass: 'article' | 'report' | 'scrartcl';
  title?: string;
  author?: string;
  date?: string;
  abstract?: string;
}

export const DEFAULT_PANDOC_CONFIG: PandocConfig = {
  engine: 'pdflatex',
  fontfamily: 'arev', // Default Arev Sans / Bitstream Vera Sans
  fontsize: '11pt',
  margin: '0.75in', // Default 0.75 inch
  papersize: 'a4',   // Default A4
  linestretch: '1.36',
  numberSections: false, // Clean: faithful to markdown headings
  tableOfContents: true, // Default TOC ON
  documentClass: 'article',
};

export function buildPandocCommand(config: PandocConfig, inputFile = 'file.md', outputFile = 'file.pdf'): string {
  const parts: string[] = ['pandoc', inputFile, '-o', outputFile];

  parts.push(`--pdf-engine=${config.engine}`);
  parts.push(`-V geometry:margin=${config.margin}`);
  parts.push(`-V fontfamily=${config.fontfamily}`);
  parts.push(`-V fontsize=${config.fontsize}`);

  if (config.papersize !== 'letter') {
    parts.push(`-V papersize=${config.papersize}`);
  }

  if (config.linestretch && config.linestretch !== '1.0') {
    parts.push(`-V linestretch=${config.linestretch}`);
  }

  if (config.numberSections) {
    parts.push('-N');
  }

  if (config.tableOfContents) {
    parts.push('--toc');
  }

  return parts.join(' ');
}
