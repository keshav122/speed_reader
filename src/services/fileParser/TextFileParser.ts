import { ParsedText, FileValidationResult } from '../../types/index';
import { ensureUTF8 } from '../../utils/textNormalizer';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from './constants';

/**
 * Validates a file before parsing
 */
export function validateFile(file: File): FileValidationResult {
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
 * Parses a text file
 */
export async function parseTextFile(file: File): Promise<ParsedText> {
  const validation = validateFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const buffer = await file.arrayBuffer();
  const text = ensureUTF8(buffer);

  return {
    text,
    fileName: file.name,
    fileType: 'txt',
  };
}
