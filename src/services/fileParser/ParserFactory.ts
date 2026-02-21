import { ParsedText, FileValidationResult } from '../../types/index';
import { parseTextFile } from './TextFileParser';
import { parsePDFFile } from './PDFParser';
import { parseDOCXFile } from './DOCXParser';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from './constants';

export type FileType = 'txt' | 'pdf' | 'docx' | 'doc' | 'unknown';

/**
 * Determines the file type based on MIME type and extension
 */
export function detectFileType(file: File): FileType {
  const mimeType = file.type.toLowerCase();
  const name = file.name.toLowerCase();

  if (mimeType === 'text/plain' || name.endsWith('.txt')) {
    return 'txt';
  }

  if (mimeType === 'application/pdf' || name.endsWith('.pdf')) {
    return 'pdf';
  }

  if (
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  ) {
    return 'docx';
  }

  if (mimeType === 'application/msword' || name.endsWith('.doc')) {
    return 'doc';
  }

  return 'unknown';
}

/**
 * Validates a file before parsing
 */
export async function validateFile(file: File): Promise<FileValidationResult> {
  const fileType = detectFileType(file);

  if (fileType === 'unknown') {
    return {
      isValid: false,
      error: 'Unsupported file type. Please upload a .txt, .pdf, or .docx file.',
    };
  }

  if (fileType === 'doc') {
    return {
      isValid: false,
      error: 'Legacy .doc files are not supported. Please save as .docx and upload again.',
    };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File is too large (max ${MAX_FILE_SIZE_LABEL}, got ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  return { isValid: true };
}

/**
 * Parses a file using the appropriate parser based on file type
 */
export async function parseFile(file: File): Promise<ParsedText> {
  const validation = await validateFile(file);

  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const fileType = detectFileType(file);

  switch (fileType) {
    case 'txt':
      return parseTextFile(file);
    case 'pdf':
      return parsePDFFile(file);
    case 'docx':
      return parseDOCXFile(file);
    default:
      throw new Error('Unsupported file type');
  }
}

export { parseTextFile } from './TextFileParser';
export { parsePDFFile } from './PDFParser';
export { parseDOCXFile } from './DOCXParser';
