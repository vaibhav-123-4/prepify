import pdf from 'pdf-parse/lib/pdf-parse.js';

/**
 * Extract and clean text from a PDF buffer.
 * Returns at most 3000 characters to stay within token limits.
 */
export async function extractTextFromPDF(buffer) {
  const data = await pdf(buffer);

  // Clean: collapse whitespace, remove excessive newlines, trim
  let text = data.text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  // Truncate to 3000 chars to avoid exceeding token limits
  if (text.length > 3000) {
    text = text.slice(0, 3000) + '…';
  }

  return text;
}
