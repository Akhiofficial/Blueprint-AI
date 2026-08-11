import { z } from 'zod';

const createProjectSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters')
    .trim(),
  description: z
    .string({ required_error: 'Description is required' })
    .min(10, 'Description must be at least 10 characters')
    .trim(),
  category: z.string().trim().optional().default(''),
  techStack: z.array(z.string().trim()).optional().default([]),
  projectType: z.string().trim().optional().default(''),
  businessGoal: z.string().trim().optional().default(''),
  status: z.enum(['active', 'archived', 'completed']).optional().default('active'),
});

// For updates — all fields are optional
const updateProjectSchema = createProjectSchema.partial();

export { createProjectSchema, updateProjectSchema };
