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
  await index.namespace(namespace).upsert(vectors);
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
