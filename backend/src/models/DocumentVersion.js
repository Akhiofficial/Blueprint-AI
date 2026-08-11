import mongoose from 'mongoose';

const documentVersionSchema = new mongoose.Schema(
  {
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: [true, 'Version must belong to a document'],
      index: true,
    },
    versionNumber: {
      type: Number,
      required: [true, 'Version number is required'],
    },
    content: {
      type: String,
      required: [true, 'Document version content is required'],
    },
    changes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Version must be created by a user'],
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Enforce unique version number per document
documentVersionSchema.index({ document: 1, versionNumber: 1 }, { unique: true });

const DocumentVersion = mongoose.model('DocumentVersion', documentVersionSchema);
export default DocumentVersion;
