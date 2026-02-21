import { useStore } from '../store/store';

/**
 * Custom hook to access document-related state and actions
 */
export function useDocument() {
  const document = useStore((state) => state.document);
  const loading = useStore((state) => state.loading);
  const error = useStore((state) => state.error);
  const loadDocument = useStore((state) => state.loadDocument);
  const resetDocument = useStore((state) => state.resetDocument);
  const setError = useStore((state) => state.setError);

  return {
    document,
    loading,
    error,
    loadDocument,
    resetDocument,
    setError,
  };
}

/**
 * Custom hook to access playback-related state and actions
 */
export function usePlayback() {
  const isPlaying = useStore((state) => state.isPlaying);
  const currentWordIndex = useStore((state) => state.currentWordIndex);
  const wordsPerMinute = useStore((state) => state.wordsPerMinute);
  const fontSizePercent = useStore((state) => state.fontSizePercent);
  const visualPauseMs = useStore((state) => state.visualPauseMs);
  const setPlaying = useStore((state) => state.setPlaying);
  const setCurrentWordIndex = useStore((state) => state.setCurrentWordIndex);
  const setWordsPerMinute = useStore((state) => state.setWordsPerMinute);
  const setFontSize = useStore((state) => state.setFontSize);
  const setVisualPauseMs = useStore((state) => state.setVisualPauseMs);
  const resetPlayback = useStore((state) => state.resetPlayback);

  return {
    isPlaying,
    currentWordIndex,
    wordsPerMinute,
    fontSizePercent,
    visualPauseMs,
    setPlaying,
    setCurrentWordIndex,
    setWordsPerMinute,
    setFontSize,
    setVisualPauseMs,
    resetPlayback,
  };
}
