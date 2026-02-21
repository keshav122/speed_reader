import { ParsedText, FileValidationResult } from '../../types/index';
import * as pdfjsLib from 'pdfjs-dist';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from './constants';

// Set up PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

/**
 * Validates a PDF file before parsing
 */
export function validatePDFFile(file: File): FileValidationResult {
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File is too large (max ${MAX_FILE_SIZE_LABEL}, got ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
    return { isValid: false, error: 'Not a valid PDF file' };
  }

  return { isValid: true };
}

/**
 * Extracts text from a PDF file
 */
export async function parsePDFFile(file: File): Promise<ParsedText> {
  const validation = validatePDFFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

  let fullText = '';
  const pages: ParsedText['pages'] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item) => ('str' in item ? String(item.str ?? '') : ''))
      .join(' ');

    const cleanedPageText = cleanPDFText(pageText);
    const visualMeta = detectLikelyVisualPage(cleanedPageText);

    fullText += `${cleanedPageText}\n`;
    pages?.push({
      pageNumber: pageNum,
      text: cleanedPageText,
      likelyVisual: visualMeta.likelyVisual,
      visualReason: visualMeta.reason,
    });
  }

  fullText = cleanPDFText(fullText);

  return {
    text: fullText,
    fileName: file.name,
    fileType: 'pdf',
    pages,
  };
}

/**
 * Cleans up common PDF extraction artifacts
 */
function cleanPDFText(text: string): string {
  // Remove common PDF artifacts
  let cleaned = text;

  // Fix common spacing issues
  cleaned = cleaned.replace(/\s+/g, ' ');

  // Remove form feed characters
  cleaned = cleaned.replace(/\f/g, '\n');

  // Remove excessive newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

function detectLikelyVisualPage(text: string): { likelyVisual: boolean; reason?: string } {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return {
      likelyVisual: true,
      reason: 'No extractable text found on this page (likely diagram/image-heavy content).',
    };
  }

  const words = trimmedText.split(/\s+/).filter(Boolean);
  const alphaChars = trimmedText.replace(/[^A-Za-z]/g, '').length;
  const numericChars = trimmedText.replace(/[^0-9]/g, '').length;
  const denseData = numericChars > 0 && numericChars / Math.max(1, alphaChars) > 0.6;
  const lowTextDensity = words.length < 35 || alphaChars < 160;

  if (lowTextDensity || denseData) {
    return {
      likelyVisual: true,
      reason:
        'Low text density detected; this page may contain a table, chart, or diagram.',
    };
  }

  return { likelyVisual: false };
}
