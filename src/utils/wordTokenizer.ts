import { ParsedPage, Word } from '../types';

export const ESTIMATED_WORDS_PER_PAGE = 250;

function splitByWhitespace(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function segmentWithoutWhitespace(text: string): string[] {
  const segmenterCtor = (
    Intl as unknown as {
      Segmenter?: new (
        locales?: string | string[],
        options?: { granularity?: 'grapheme' | 'word' | 'sentence' }
      ) => {
        segment(input: string): Iterable<{ segment: string; isWordLike?: boolean }>;
      };
    }
  ).Segmenter;

  if (!segmenterCtor) {
    return Array.from(text);
  }

  try {
    const segmenter = new segmenterCtor(undefined, { granularity: 'word' });
    const segments: string[] = [];

    for (const part of segmenter.segment(text)) {
      if (part.segment && part.isWordLike) {
        segments.push(part.segment);
      }
    }

    return segments.length > 0 ? segments : Array.from(text);
  } catch {
    return Array.from(text);
  }
}

function splitIntoTokens(text: string): string[] {
  if (!text.trim()) return [];

  // Space-delimited languages preserve punctuation naturally.
  if (/\s/u.test(text)) {
    return splitByWhitespace(text);
  }

  // For scripts with minimal/no spaces (e.g. CJK), rely on Intl.Segmenter.
  return segmentWithoutWhitespace(text);
}

/**
 * Tokenizes text into words, preserving position information
 */
export function tokenizeText(text: string, pageNumber = 1): Word[] {
  if (text.trim() === '') return [];

  const words: Word[] = [];
  let index = 0;
  let position = 0;

  const tokens = splitIntoTokens(text);

  tokens.forEach(token => {
    if (token.length > 0) {
      // Find actual position in original text
      position = text.indexOf(token, position);

      words.push({
        text: token,
        index: index,
        originalPosition: position,
        kind: 'word',
        pageNumber,
      });

      index++;
      position += token.length;
    }
  });

  return words;
}

export interface TokenizePagesResult {
  words: Word[];
  pageStartIndexes: number[];
  visualTokenCount: number;
}

export function tokenizePages(pages: ParsedPage[]): TokenizePagesResult {
  const words: Word[] = [];
  const pageStartIndexes: number[] = [];
  let visualTokenCount = 0;
  let originalPosition = 0;

  pages.forEach((page) => {
    pageStartIndexes.push(words.length);
    let pagePosition = 0;

    if (page.likelyVisual) {
      words.push({
        text: `[Visual ${page.pageNumber}]`,
        index: words.length,
        originalPosition,
        kind: 'visual',
        pageNumber: page.pageNumber,
        visualReason: page.visualReason,
      });
      visualTokenCount += 1;
      originalPosition += 1;
    }

    const tokens = splitIntoTokens(page.text);

    tokens.forEach((token) => {
      const foundPosition = page.text.indexOf(token, pagePosition);
      const tokenPosition = foundPosition >= 0 ? foundPosition : pagePosition;

      words.push({
        text: token,
        index: words.length,
        originalPosition: tokenPosition,
        kind: 'word',
        pageNumber: page.pageNumber,
      });

      pagePosition = tokenPosition + token.length + 1;
      originalPosition += token.length + 1;
    });
  });

  return {
    words,
    pageStartIndexes,
    visualTokenCount,
  };
}

export function buildEstimatedPageStartIndexes(
  totalWords: number,
  wordsPerPage = ESTIMATED_WORDS_PER_PAGE
): number[] {
  if (totalWords <= 0) {
    return [0];
  }

  const starts: number[] = [];
  for (let start = 0; start < totalWords; start += wordsPerPage) {
    starts.push(start);
  }

  return starts;
}

export function applyEstimatedPageNumbers(
  words: Word[],
  wordsPerPage = ESTIMATED_WORDS_PER_PAGE
): Word[] {
  return words.map((word, index) => ({
    ...word,
    pageNumber: Math.floor(index / wordsPerPage) + 1,
  }));
}

/**
 * Calculates milliseconds per word based on WPM
 */
export function calculateMsPerWord(wordsPerMinute: number): number {
  // WPM = words per minute, convert to ms per word
  return Math.round(60000 / wordsPerMinute);
}

/**
 * Gets the next word in sequence with proper handling of edge cases
 */
export function getNextWordIndex(
  currentIndex: number,
  totalWords: number
): number | null {
  if (currentIndex + 1 >= totalWords) {
    return null; // End of document
  }
  return currentIndex + 1;
}

/**
 * Validates if index is within bounds
 */
export function isValidWordIndex(index: number, totalWords: number): boolean {
  return index >= 0 && index < totalWords;
}

/**
 * Formats words per minute display with constraints
 */
export function formatWPM(wpm: number): number {
  // Clamp WPM between 100 and 1000
  const min = 100;
  const max = 1000;
  return Math.max(min, Math.min(max, Math.round(wpm)));
}
