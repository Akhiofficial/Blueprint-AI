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
  
  try {
    const response = await ai.models.embedContent({
      model: 'gemini-embedding-001',
      contents: text,
      config: { outputDimensionality: 768 },
    });
    
    if (!response || !response.embeddings || !response.embeddings[0] || !response.embeddings[0].values) {
      throw new Error('Failed to generate embedding');
    }
    
    return response.embeddings[0].values;
  } catch (err) {
    console.warn(`[EmbeddingService] Could not generate embedding: ${err.message}`);
    return [];
  }
};

export const generateEmbeddings = async (texts, batchSize = 20) => {
  if (!texts || !texts.length) return [];
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

  const ai = new GoogleGenAI({ apiKey });
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    try {
      let response = null;
      let attempts = 0;
      while (attempts < 3) {
        try {
          response = await ai.models.embedContent({
            model: 'gemini-embedding-001',
            contents: batch,
            config: { outputDimensionality: 768 },
          });
          break;
        } catch (apiErr) {
          attempts++;
          const is429 = apiErr.message?.includes('429') || apiErr.message?.includes('RESOURCE_EXHAUSTED');
          if (is429 && attempts < 3) {
            console.warn(`[EmbeddingService] Rate limit hit (attempt ${attempts}/3). Waiting 10s before retry...`);
            await new Promise(r => setTimeout(r, 10000));
          } else {
            throw apiErr;
          }
        }
      }

      if (!response || !response.embeddings || response.embeddings.length !== batch.length) {
        throw new Error('Failed to generate embeddings for batch');
      }

      for (const item of response.embeddings) {
        if (!item?.values || !item.values.length) {
          throw new Error('Invalid embedding vector returned in batch');
        }
        allEmbeddings.push(item.values);
      }
    } catch (err) {
      console.warn(`[EmbeddingService] Batch embedContent failed: ${err.message}`);
      throw err;
    }
  }

  return allEmbeddings;
};
