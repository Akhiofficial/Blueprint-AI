import { z } from 'zod';

const actorSchema = z.object({
  id: z.string().default(''),
  name: z.string().min(1, 'Actor name is required'),
  description: z.string().default(''),
});

const functionalRequirementSchema = z.object({
  id: z.string().default(''),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  actor: z.string().default('System'),
  priority: z.string().default('must-have'),
  sourceRequirementId: z.string().optional().default(''),
});

const nonFunctionalRequirementSchema = z.object({
  id: z.string().default(''),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().default('General'),
  priority: z.string().default('must-have'),
  sourceRequirementId: z.string().optional().default(''),
});

const entitySchema = z.object({
  name: z.string().min(1, 'Entity name is required'),
  description: z.string().default(''),
});

const userFlowSchema = z.object({
  name: z.string().min(1, 'Flow name is required'),
  steps: z.array(z.string()).default([]),
});

const requirementAnalysisSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
  complexity: z.enum(['low', 'medium', 'high']).default('medium'),
  actors: z.array(actorSchema).default([]),
  functionalRequirements: z.array(functionalRequirementSchema).default([]),
  nonFunctionalRequirements: z.array(nonFunctionalRequirementSchema).default([]),
  businessGoals: z.array(z.string()).default([]),
  entities: z.array(entitySchema).default([]),
  userFlows: z.array(userFlowSchema).default([]),
  constraints: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  ambiguities: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  technologyHints: z.array(z.string()).default([]),
});

export { requirementAnalysisSchema };
