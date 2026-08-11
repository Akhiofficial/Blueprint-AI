import mongoose from 'mongoose';

const knowledgeChunkSchema = new mongoose.Schema(
  {
    knowledgeDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeDocument',
      required: [true, 'Knowledge chunk must belong to a knowledge document'],
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: [true, 'Chunk index is required'],
    },
    content: {
      type: String,
      required: [true, 'Chunk content is required'],
    },
    vectorReference: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Enforce unique chunk indices per document
knowledgeChunkSchema.index({ knowledgeDocument: 1, chunkIndex: 1 }, { unique: true });

const KnowledgeChunk = mongoose.model('KnowledgeChunk', knowledgeChunkSchema);
export default KnowledgeChunk;
