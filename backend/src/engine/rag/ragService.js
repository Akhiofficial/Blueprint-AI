/**
 * ragService.js
 *
 * Orchestrates the full RAG pipeline: query → embed → retrieve → format context.
 */

import { loadDocument } from './documentLoader.js';
import { chunkText } from './textChunker.js';
import { generateEmbeddings } from './embeddingService.js';
import { upsertVectors } from './vectorStore.js';
import { retrieveRelevantChunks } from './retriever.js';
import KnowledgeChunk from '../../models/KnowledgeChunk.js';
import KnowledgeDocument from '../../models/KnowledgeDocument.js';

export const indexDocument = async (projectId, knowledgeDocId, rawText) => {
  try {
    // 1. Validate doc exists and belongs to project
    await loadDocument(projectId, knowledgeDocId);

    // 2. Chunk text
    const textChunks = chunkText(rawText);
    if (!textChunks.length) {
      await KnowledgeDocument.updateOne({ _id: knowledgeDocId }, { 
        status: 'indexed', 
        chunkCount: 0 
      });
      return { status: 'empty', chunksIndexed: 0 };
    }

    // 3. Generate embeddings
    const embeddings = await generateEmbeddings(textChunks);
    if (embeddings.some(e => !e || !e.length)) {
      throw new Error('Failed to generate embeddings for one or more text chunks');
    }

    // 4. Prepare Mongo records and Pinecone vectors
    const vectorsToUpsert = [];
    const chunkRecords = [];

    for (let i = 0; i < textChunks.length; i++) {
      const vectorReference = `vec_${knowledgeDocId}_${i}`;
      
      const newChunk = new KnowledgeChunk({
        knowledgeDocument: knowledgeDocId,
        chunkIndex: i,
        content: textChunks[i],
        vectorReference
      });
      
      chunkRecords.push(newChunk);

      vectorsToUpsert.push({
        id: vectorReference,
        values: embeddings[i],
        metadata: {
          projectId: projectId.toString(),
          documentId: knowledgeDocId.toString(),
          chunkIndex: i
        }
      });
    }

    // 5. Store in Pinecone
    await upsertVectors(vectorsToUpsert);

    // 6. Clean up any existing chunks for this document to ensure idempotency
    await KnowledgeChunk.deleteMany({ knowledgeDocument: knowledgeDocId });

    // 7. Save Mongo records
    await KnowledgeChunk.insertMany(chunkRecords);

    // 8. Update doc status
    await KnowledgeDocument.updateOne({ _id: knowledgeDocId }, { 
      status: 'indexed', 
      chunkCount: textChunks.length 
    });

    return { status: 'success', chunksIndexed: textChunks.length };
  } catch (err) {
    console.error(`[RAGService] indexDocument failed for doc ${knowledgeDocId}: ${err.message}`);
    await KnowledgeDocument.updateOne({ _id: knowledgeDocId }, { 
      status: 'failed', 
      chunkCount: 0 
    }).catch(() => {});
    throw err;
  }
};

export const retrieveRelevantContext = async (projectId, query) => {
  if (!query) return '';
  
  const chunks = await retrieveRelevantChunks(projectId, query);
  
  if (!chunks.length) return '';
  
  const textParts = chunks.map((c, i) => `[Source Chunk ${i + 1}]\n${c.content.trim()}`);
  return textParts.join('\n\n');
};
