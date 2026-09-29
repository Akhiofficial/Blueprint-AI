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
  // 1. Validate doc exists and belongs to project
  await loadDocument(projectId, knowledgeDocId);

  // 2. Chunk text
  const textChunks = chunkText(rawText);
  if (!textChunks.length) return { status: 'empty' };

  // 3. Generate embeddings
  const embeddings = await generateEmbeddings(textChunks);

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

  // 6. Save Mongo records
  await KnowledgeChunk.insertMany(chunkRecords);

  // 7. Update doc status
  await KnowledgeDocument.updateOne({ _id: knowledgeDocId }, { 
    status: 'indexed', 
    chunkCount: textChunks.length 
  });

  return { status: 'success', chunksIndexed: textChunks.length };
};

export const retrieveRelevantContext = async (projectId, query) => {
  if (!query) return '';
  
  const chunks = await retrieveRelevantChunks(projectId, query);
  
  if (!chunks.length) return '';
  
  const textParts = chunks.map((c, i) => `[Source Chunk ${i + 1}]\n${c.content.trim()}`);
  return textParts.join('\n\n');
};
