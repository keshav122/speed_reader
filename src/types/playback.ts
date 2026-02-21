export interface PlaybackState {
  isPlaying: boolean;
  currentWordIndex: number;
  wordsPerMinute: number;
  fontSizePercent: number;
  visualPauseMs: number;
}

export interface PlaybackActions {
  setPlaying: (isPlaying: boolean) => void;
  setCurrentWordIndex: (index: number) => void;
  setWordsPerMinute: (wpm: number) => void;
  setFontSize: (percent: number) => void;
  setVisualPauseMs: (milliseconds: number) => void;
  resetPlayback: () => void;
}

export const DEFAULT_PLAYBACK_STATE: PlaybackState = {
  isPlaying: false,
  currentWordIndex: 0,
  wordsPerMinute: 250,
  fontSizePercent: 100,
  visualPauseMs: 1800,
};
