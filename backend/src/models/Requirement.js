import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Requirement must belong to a project'],
      index: true,
    },
    requirementId: {
      type: String,
      required: [true, 'Requirement ID is required (e.g. REQ-001)'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Requirement title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: ['functional', 'non-functional', 'constraint', 'assumption'],
      required: [true, 'Requirement type is required'],
    },
    priority: {
      type: String,
      enum: ['must-have', 'should-have', 'could-have', 'wont-have'],
      default: 'must-have',
    },
    status: {
      type: String,
      enum: ['draft', 'reviewed', 'approved', 'rejected'],
      default: 'draft',
    },
    source: {
      type: String,
      default: 'user',
    },
  },
  { timestamps: true }
);

// Enforce unique requirementId within the scope of a single project
requirementSchema.index({ project: 1, requirementId: 1 }, { unique: true });

const Requirement = mongoose.model('Requirement', requirementSchema);
export default Requirement;
