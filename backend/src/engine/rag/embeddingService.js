/**
 * embeddingService.js
 *
 * Generates vector embeddings from text chunks using the embedding model.
 */

import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';

export const generateEmbedding = async (text) => {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');
  
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text
  });
  
  if (!response || !response.embeddings || !response.embeddings[0] || !response.embeddings[0].values) {
    throw new Error('Failed to generate embedding');
  }
  
  return response.embeddings[0].values;
};

export const generateEmbeddings = async (texts) => {
  // In a production setup, we would batch these.
  const embeddings = await Promise.all(texts.map(text => generateEmbedding(text)));
  return embeddings;
};
