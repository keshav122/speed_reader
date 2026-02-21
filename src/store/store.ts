import { create } from 'zustand';
import { Document } from '../types/index';
import { normalizeText } from '../utils/textNormalizer';
import {
  applyEstimatedPageNumbers,
  buildEstimatedPageStartIndexes,
  tokenizePages,
  tokenizeText,
} from '../utils/wordTokenizer';
import { parseFile } from '../services/fileParser/ParserFactory';
import { DEFAULT_PLAYBACK_STATE } from '../types/playback';

interface AppStore {
  // Document state
  document: Document | null;
  loading: boolean;
  error: string | null;

  // Playback state
  isPlaying: boolean;
  currentWordIndex: number;
  wordsPerMinute: number;
  fontSizePercent: number;
  visualPauseMs: number;

  // Actions
  loadDocument: (file: File) => Promise<void>;
  resetDocument: () => void;
  setPlaying: (isPlaying: boolean) => void;
  setCurrentWordIndex: (index: number) => void;
  setWordsPerMinute: (wpm: number) => void;
  setFontSize: (percent: number) => void;
  setVisualPauseMs: (milliseconds: number) => void;
  resetPlayback: () => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppStore>((set, get) => ({
  // Initial state
  document: null,
  loading: false,
  error: null,

  isPlaying: false,
  currentWordIndex: 0,
  wordsPerMinute: DEFAULT_PLAYBACK_STATE.wordsPerMinute,
  fontSizePercent: DEFAULT_PLAYBACK_STATE.fontSizePercent,
  visualPauseMs: DEFAULT_PLAYBACK_STATE.visualPauseMs,

  // Document actions
  loadDocument: async (file: File) => {
    set({ loading: true, error: null });

    try {
      // Parse file
      const parsedText = await parseFile(file);

      // Normalize text
      const normalizedText = normalizeText(parsedText.text);

      let wordArray = applyEstimatedPageNumbers(tokenizeText(normalizedText));
      let pageStartIndexes = buildEstimatedPageStartIndexes(wordArray.length);
      let pageCount = pageStartIndexes.length;
      let hasEstimatedPages = true;
      let visualTokenCount = 0;

      if (parsedText.pages && parsedText.pages.length > 0) {
        const pageResult = tokenizePages(parsedText.pages);
        wordArray = pageResult.words;
        pageStartIndexes = pageResult.pageStartIndexes;
        pageCount = parsedText.pages.length;
        hasEstimatedPages = false;
        visualTokenCount = pageResult.visualTokenCount;
      }

      if (wordArray.length === 0) {
        throw new Error('No words found in file');
      }

      // Create document
      const newDocument: Document = {
        id: Math.random().toString(36).substring(7),
        fileName: file.name,
        rawText: normalizedText,
        sourceType: parsedText.fileType,
        wordArray,
        totalWords: wordArray.length,
        pageCount,
        pageStartIndexes,
        hasEstimatedPages,
        visualTokenCount,
        uploadedAt: new Date(),
      };

      set({
        document: newDocument,
        loading: false,
        currentWordIndex: 0,
        isPlaying: false,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      set({
        loading: false,
        error: errorMessage,
      });
      throw err;
    }
  },

  resetDocument: () => {
    set({
      document: null,
      currentWordIndex: 0,
      isPlaying: false,
      error: null,
    });
  },

  // Playback actions
  setPlaying: (isPlaying: boolean) => {
    set({ isPlaying });
  },

  setCurrentWordIndex: (index: number) => {
    const state = get();
    if (state.document) {
      const validIndex = Math.max(0, Math.min(index, state.document.totalWords - 1));
      set({ currentWordIndex: validIndex });
    }
  },

  setWordsPerMinute: (wpm: number) => {
    const validWpm = Math.max(100, Math.min(1000, Math.round(wpm)));
    set({ wordsPerMinute: validWpm });
  },

  setFontSize: (percent: number) => {
    const validPercent = Math.max(50, Math.min(200, Math.round(percent)));
    set({ fontSizePercent: validPercent });
  },

  setVisualPauseMs: (milliseconds: number) => {
    const validValue = Math.max(800, Math.min(6000, Math.round(milliseconds)));
    set({ visualPauseMs: validValue });
  },

  resetPlayback: () => {
    set({
      isPlaying: false,
      currentWordIndex: 0,
      wordsPerMinute: DEFAULT_PLAYBACK_STATE.wordsPerMinute,
      fontSizePercent: DEFAULT_PLAYBACK_STATE.fontSizePercent,
      visualPauseMs: DEFAULT_PLAYBACK_STATE.visualPauseMs,
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
