import mongoose from 'mongoose';

const generationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Generation must belong to a project'],
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    generationType: {
      type: String,
      required: [true, 'Generation type is required'],
      trim: true,
    },
    provider: {
      type: String,
      default: '',
    },
    model: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'running', 'completed', 'failed'],
      default: 'pending',
    },
    promptVersion: {
      type: String,
      default: '',
    },
    durationMs: {
      type: Number,
      default: 0,
    },
    output: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    error: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Generation = mongoose.model('Generation', generationSchema);
export default Generation;
