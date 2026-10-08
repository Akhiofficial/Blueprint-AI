/**
 * retriever.js
 *
 * Retrieves relevant knowledge chunks from the vector store for a given query.
 */

import { queryVectors } from './vectorStore.js';
import { generateEmbedding } from './embeddingService.js';
import KnowledgeChunk from '../../models/KnowledgeChunk.js';

export const retrieveRelevantChunks = async (projectId, query, topK = 5) => {
  try {
    // 1. Generate query embedding
    const queryVector = await generateEmbedding(query);
    if (!queryVector || !queryVector.length) return [];

    // 2. Query Pinecone for relevant vector IDs
    // We use projectId as a filter to ensure multitenant isolation
    let matches = [];
    try {
      matches = await queryVectors(queryVector, topK, 'default', { projectId: projectId.toString() });
    } catch (pineconeErr) {
      console.warn(`[Retriever] Vector store query failed: ${pineconeErr.message}. Gracefully falling back to empty context.`);
      return [];
    }

    if (!matches || !matches.length) return [];

    // 3. Extract the vector references
    const vectorRefs = matches.map(m => m.id).filter(Boolean);
    if (!vectorRefs.length) return [];

    // 4. Fetch the raw chunks from MongoDB
    const dbChunks = await KnowledgeChunk.find({ vectorReference: { $in: vectorRefs } }).lean();
    return dbChunks || [];
  } catch (err) {
    console.warn(`[Retriever] Retrieval pipeline error: ${err.message}. Gracefully falling back to empty context.`);
    return [];
  }
};
