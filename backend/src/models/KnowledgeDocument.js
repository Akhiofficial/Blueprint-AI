/**
 * KnowledgeDocument.js — Mongoose Model
 *
 * Represents a document uploaded to the RAG knowledge base.
 * Tracks source file metadata; actual text chunks are in KnowledgeChunk.
 *
 * TODO: Implement full schema in Phase 3 — RAG pipeline.
 *
 * Planned fields:
 *   - filename       String  (original uploaded filename)
 *   - mimeType       String  ('application/pdf', 'text/plain', etc.)
 *   - size           Number  (bytes)
 *   - status         Enum: 'processing' | 'indexed' | 'failed'
 *   - chunkCount     Number  (how many chunks were created)
 *   - uploadedBy     ObjectId ref → User
 *   - createdAt / updatedAt  (timestamps: true)
 */
