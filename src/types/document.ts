import { Word } from './index';

export interface DocumentState {
  document: {
    id: string;
    fileName: string;
    rawText: string;
    wordArray: Word[];
    totalWords: number;
    uploadedAt: Date;
  } | null;
  loadDocument: (file: File) => Promise<void>;
  resetDocument: () => void;
  setDocument: (doc: any) => void;
}

export interface DocumentActions {
  loadDocument: (file: File) => Promise<void>;
  resetDocument: () => void;
  setDocument: (doc: any) => void;
}
