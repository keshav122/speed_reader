/**
 * Normalizes text by cleaning up whitespace and handling encoding issues
 */
export function normalizeText(text: string): string {
  if (!text) return '';

  // Normalize line endings
  let normalized = text.replace(/\r\n/g, '\n');

  // Remove extra whitespace between words but preserve line breaks
  normalized = normalized.replace(/[ \t]+/g, ' ');

  // Remove leading/trailing whitespace from each line
  normalized = normalized
    .split('\n')
    .map(line => line.trim())
    .join('\n');

  // Remove excessive blank lines (more than 2 consecutive)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  // Trim start and end
  normalized = normalized.trim();

  return normalized;
}

/**
 * Removes special characters while preserving basic punctuation structure
 */
export function cleanText(text: string): string {
  // Remove zero-width characters
  let cleaned = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Replace tabs with spaces
  cleaned = cleaned.replace(/\t/g, ' ');

  return cleaned;
}

/**
 * Detects and converts encoding if needed
 */
export function ensureUTF8(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const text = decoder.decode(buffer);

  if (!text || text.includes('\ufffd')) {
    // Fallback to latin1 if UTF-8 fails
    return new TextDecoder('iso-8859-1').decode(buffer);
  }

  return text;
}
