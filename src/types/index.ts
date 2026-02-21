export type SourceType = 'txt' | 'pdf' | 'docx';

export type TokenKind = 'word' | 'visual';

// Core token object used throughout the app
export interface Word {
  text: string;
  index: number;
  originalPosition: number;
  kind: TokenKind;
  pageNumber: number;
  visualReason?: string;
}

// Document state interface
export interface Document {
  id: string;
  fileName: string;
  rawText: string;
  sourceType: SourceType;
  wordArray: Word[];
  totalWords: number;
  pageCount: number;
  pageStartIndexes: number[];
  hasEstimatedPages: boolean;
  visualTokenCount: number;
  uploadedAt: Date;
}

// Playback state interface
export interface PlaybackState {
  isPlaying: boolean;
  currentWordIndex: number;
  wordsPerMinute: number;
  fontSizePercent: number;
}

// Full app state
export interface AppState {
  document: Document | null;
  playback: PlaybackState;
  ui: {
    showSettings: boolean;
    errorMessage: string | null;
  };
}

// Parsed text result from file parsers
export interface ParsedText {
  text: string;
  fileName: string;
  fileType: SourceType;
  pages?: ParsedPage[];
}

export interface ParsedPage {
  pageNumber: number;
  text: string;
  likelyVisual: boolean;
  visualReason?: string;
}

// File validation result
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}
