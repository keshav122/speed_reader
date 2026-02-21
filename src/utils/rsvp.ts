import { calculateMsPerWord } from './wordTokenizer';
import { Word } from '../types';

export interface SplitWord {
  leading: string;
  focal: string;
  trailing: string;
  pivotIndex: number;
}

function isAlphaNumeric(char: string): boolean {
  return /[\p{L}\p{N}]/u.test(char);
}

function findCoreBounds(word: string): { start: number; end: number } {
  let start = 0;
  let end = word.length;

  while (start < end && !isAlphaNumeric(word[start])) {
    start += 1;
  }

  while (end > start && !isAlphaNumeric(word[end - 1])) {
    end -= 1;
  }

  return { start, end };
}

/**
 * ORP pivot index heuristic used by many RSVP readers.
 */
export function getPivotIndex(wordLength: number): number {
  if (wordLength <= 1) return 0;
  if (wordLength <= 5) return 1;
  if (wordLength <= 9) return 2;
  if (wordLength <= 13) return 3;
  return 4;
}

export function splitWordForDisplay(word: string): SplitWord {
  if (!word) {
    return { leading: '', focal: '', trailing: '', pivotIndex: 0 };
  }

  const { start, end } = findCoreBounds(word);
  const hasCore = end > start;
  const coreWord = hasCore ? word.slice(start, end) : word;
  const pivotInCore = Math.min(
    getPivotIndex(coreWord.length),
    Math.max(0, coreWord.length - 1)
  );
  const pivotIndex = (hasCore ? start : 0) + pivotInCore;

  return {
    leading: word.slice(0, pivotIndex),
    focal: word[pivotIndex] ?? '',
    trailing: word.slice(pivotIndex + 1),
    pivotIndex,
  };
}

/**
 * Adds natural pauses for punctuation and long words so cadence feels less robotic.
 */
export function getWordDisplayDelayMs(word: string, wordsPerMinute: number): number {
  const baseDelay = calculateMsPerWord(wordsPerMinute);
  let multiplier = 1;

  if (/[.!?]["')\]]*$/.test(word)) {
    multiplier *= 2.4;
  } else if (/[,;:]["')\]]*$/.test(word)) {
    multiplier *= 1.6;
  }

  const { start, end } = findCoreBounds(word);
  const coreLength = end > start ? word.slice(start, end).length : word.length;

  if (coreLength >= 10) {
    multiplier *= 1.35;
  } else if (coreLength >= 7) {
    multiplier *= 1.2;
  }

  return Math.round(baseDelay * multiplier);
}

export function getTokenDisplayDelayMs(
  token: Word,
  wordsPerMinute: number,
  visualPauseMs: number
): number {
  if (token.kind === 'visual') {
    return visualPauseMs;
  }

  return getWordDisplayDelayMs(token.text, wordsPerMinute);
}
