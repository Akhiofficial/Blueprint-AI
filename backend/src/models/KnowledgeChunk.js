/**
 * KnowledgeChunk.js — Mongoose Model
 *
 * Represents a single text chunk from a KnowledgeDocument.
 * Each chunk has a vector embedding stored in the vector store (Pinecone/ChromaDB).
 * This model tracks the chunk metadata in MongoDB.
 *
 * TODO: Implement full schema in Phase 3 — RAG pipeline.
 *
 * Planned fields:
 *   - document       ObjectId ref → KnowledgeDocument  (required)
 *   - chunkIndex     Number  (position in the source document)
 *   - content        String  (raw text of the chunk)
 *   - vectorId       String  (ID in the external vector store)
 *   - tokenCount     Number
 *   - createdAt      (timestamps: true)
 */
