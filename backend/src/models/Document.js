import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Document must belong to a project'],
      index: true,
    },
    type: {
      type: String,
      enum: [
        'BRD',
        'SRS',
        'UserStories',
        'UseCases',
        'DBSchema',
        'APISpec',
        'Architecture',
        'TestCases',
        'Roadmap',
      ],
      required: [true, 'Document type is required'],
    },
    title: {
      type: String,
      required: [true, 'Document title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['generating', 'ready', 'failed'],
      default: 'generating',
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    generation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Generation',
    },
  },
  { timestamps: true }
);

// A project can only have one active document per document type
documentSchema.index({ project: 1, type: 1 }, { unique: true });

const Document = mongoose.model('Document', documentSchema);
export default Document;
