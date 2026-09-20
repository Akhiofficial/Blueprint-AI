/**
 * textChunker.js
 *
 * Splits loaded documents into overlapping chunks for embedding.
 */

export const chunkText = (text, chunkSize = 1000, overlap = 200) => {
  if (!text) return [];
  const chunks = [];
  let index = 0;
  while (index < text.length) {
    const end = Math.min(index + chunkSize, text.length);
    const chunk = text.slice(index, end);
    chunks.push(chunk);
    if (end === text.length) break;
    index += (chunkSize - overlap);
  }
  return chunks;
};
