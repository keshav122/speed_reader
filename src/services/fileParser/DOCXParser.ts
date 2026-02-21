import mammoth from 'mammoth';
import { ParsedText, FileValidationResult } from '../../types/index';
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_LABEL } from './constants';

export function validateDOCXFile(file: File): FileValidationResult {
  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File is too large (max ${MAX_FILE_SIZE_LABEL}, got ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  const mimeType = file.type.toLowerCase();
  const isDocx =
    mimeType ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    file.name.toLowerCase().endsWith('.docx');

  if (!isDocx) {
    return { isValid: false, error: 'Not a valid .docx file' };
  }

  return { isValid: true };
}

export async function parseDOCXFile(file: File): Promise<ParsedText> {
  const validation = validateDOCXFile(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = result.value?.trim();

  if (!text) {
    throw new Error('Could not extract text from this .docx file');
  }

  return {
    text,
    fileName: file.name,
    fileType: 'docx',
  };
}
