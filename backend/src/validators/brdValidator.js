/**
 * brdValidator.js
 *
 * Zod validation schema for AI-generated Business Requirements Document (BRD).
 * Ensures structured JSON responses conform strictly to BRD expectations.
 */

import { z } from 'zod';

const stakeholderSchema = z.object({
  role: z.string().min(1, 'Stakeholder role is required'),
  description: z.string().default(''),
});

const targetUserSchema = z.object({
  persona: z.string().min(1, 'User persona is required'),
  description: z.string().default(''),
});

const businessRequirementItemSchema = z.object({
  id: z.string().default(''),
  title: z.string().min(1, 'Requirement title is required'),
  description: z.string().min(1, 'Requirement description is required'),
  priority: z.enum(['must-have', 'should-have', 'could-have', 'wont-have']).default('must-have'),
  rationale: z.string().optional().default(''),
});

const overviewItemSchema = z.object({
  id: z.string().default(''),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Overview description is required'),
});

const riskItemSchema = z.object({
  id: z.string().default(''),
  risk: z.string().min(1, 'Risk is required'),
  impact: z.enum(['low', 'medium', 'high']).default('medium'),
  mitigation: z.string().optional().default(''),
});

const scopeSchema = z.object({
  inScope: z.array(z.string()).default([]),
  outOfScope: z.array(z.string()).default([]),
});

const brdSchema = z.object({
  title: z.string().min(1, 'BRD title is required'),
  documentVersion: z.string().default('1.0'),
  executiveSummary: z.string().min(1, 'Executive summary is required'),
  businessProblem: z.string().min(1, 'Business problem statement is required'),
  businessObjectives: z.array(z.string()).default([]),
  scope: scopeSchema.default({ inScope: [], outOfScope: [] }),
  stakeholders: z.array(stakeholderSchema).default([]),
  targetUsers: z.array(targetUserSchema).default([]),
  businessRequirements: z.array(businessRequirementItemSchema).default([]),
  functionalOverview: z.array(overviewItemSchema).default([]),
  nonFunctionalOverview: z.array(overviewItemSchema).default([]),
  businessRules: z.array(z.string()).default([]),
  assumptions: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  risks: z.array(riskItemSchema).default([]),
  successCriteria: z.array(z.string()).default([]),
  dependencies: z.array(z.string()).default([]),
  openQuestions: z.array(z.string()).default([]),
});

export { brdSchema };
