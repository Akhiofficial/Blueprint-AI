/**
 * vectorStore.js
 *
 * Abstraction over Pinecone vector database operations.
 */

import { Pinecone } from '@pinecone-database/pinecone';
import { env } from '../../config/env.js';

let pineconeClient = null;

const getPineconeClient = () => {
  if (!pineconeClient) {
    if (!env.PINECONE_API_KEY) throw new Error('PINECONE_API_KEY missing');
    pineconeClient = new Pinecone({ apiKey: env.PINECONE_API_KEY });
  }
  return pineconeClient;
};

const getIndex = () => {
  const client = getPineconeClient();
  const indexName = env.PINECONE_INDEX || 'blueprintai';
  return client.index(indexName);
};

export const upsertVectors = async (vectors, namespace = 'default') => {
  const index = getIndex();
  const records = Array.isArray(vectors) ? vectors : (vectors?.records || []);
  if (!records.length) return;
  await index.namespace(namespace).upsert({ records });
};

export const deleteVectors = async (vectorIds, namespace = 'default') => {
  if (!vectorIds || !vectorIds.length) return;
  const index = getIndex();
  await index.namespace(namespace).deleteMany({ ids: vectorIds });
};

export const queryVectors = async (vector, topK = 5, namespace = 'default', filter = {}) => {
  const index = getIndex();
  const result = await index.namespace(namespace).query({
    vector,
    topK,
    includeMetadata: true,
    filter
  });
  return result.matches || [];
};
