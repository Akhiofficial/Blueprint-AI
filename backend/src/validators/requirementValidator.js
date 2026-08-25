import { z } from 'zod';

const createRequirementSchema = z.object({
  requirementId: z.string({ required_error: 'Requirement ID is required' }).trim(),
  title: z.string({ required_error: 'Title is required' }).trim(),
  description: z.string().trim().optional(),
  type: z.enum(['functional', 'non-functional', 'constraint', 'assumption'], {
    required_error: 'Type is required',
  }),
  priority: z.enum(['must-have', 'should-have', 'could-have', 'wont-have']).optional().default('must-have'),
  status: z.enum(['draft', 'approved', 'rejected']).optional().default('draft'),
  source: z.string().trim().optional().default('user'),
});

// For updates — all fields are optional
const updateRequirementSchema = createRequirementSchema.partial();

export { createRequirementSchema, updateRequirementSchema };
