/**
 * userStoryValidator.js
 *
 * Validates AI-generated User Stories output against the expected Zod schema structure.
 */

import { z } from 'zod';

// Normalize LLM priority output to canonical MoSCoW values.
// Uses fuzzy substring matching to handle all LLM output variants:
// 'must-have', 'Must-Have', 'MUST HAVE', 'must have', 'High', etc.
const normalizePriority = (val) => {
  if (typeof val !== 'string') return 'Should Have'; // safe default
  const s = val.toLowerCase().replace(/[-_]/g, ' ').trim();
  console.log(`[UserStoryValidator] RAW priority value: "${val}" → normalized: "${s}"`);
  if (s.includes('must'))   return 'Must Have';
  if (s.includes('should')) return 'Should Have';
  if (s.includes('could'))  return 'Could Have';
  if (s.includes('won') || s.includes('wont') || s.includes('will not') || s.includes('nice to have'))
    return "Won't Have";
  // Fallback: map generic priority scales to MoSCoW
  if (s === 'high' || s === 'critical') return 'Must Have';
  if (s === 'medium' || s === 'normal') return 'Should Have';
  if (s === 'low')                      return 'Could Have';
  console.warn(`[UserStoryValidator] Unrecognized priority "${val}" — defaulting to 'Should Have'`);
  return 'Should Have'; // safe fallback — never fail on unknown priority
};

const storySchema = z.object({
  storyId: z.string().min(1, 'Story ID is required (e.g. US-001)'),
  role: z.string().min(1, 'Role is required (e.g. registered user, admin)'),
  goal: z.string().min(1, 'Goal is required'),
  benefit: z.string().min(1, 'Benefit is required'),
  priority: z.preprocess(normalizePriority, z.enum(['Must Have', 'Should Have', 'Could Have', "Won't Have"])),
  storyPoints: z.preprocess(
    (v) => (typeof v === 'string' ? parseInt(v, 10) : v),
    z.number().int().refine(
      (v) => [1, 2, 3, 5, 8, 13].includes(v),
      { message: 'Story points must be a Fibonacci number: 1, 2, 3, 5, 8, or 13' }
    )
  ),
  acceptanceCriteria: z.array(z.string().min(1)).min(1, 'At least one acceptance criterion is required'),
  notes: z.array(z.string()).default([]),
});

const epicSchema = z.object({
  epicId: z.string().min(1, 'Epic ID is required (e.g. EP-001)'),
  epicName: z.string().min(1, 'Epic name is required'),
  description: z.string().min(1, 'Epic description is required'),
  stories: z.array(storySchema).min(1, 'At least one story per epic is required'),
});

const prioritySummarySchema = z.object({
  mustHave: z.number().int().min(0).default(0),
  shouldHave: z.number().int().min(0).default(0),
  couldHave: z.number().int().min(0).default(0),
  wontHave: z.number().int().min(0).default(0),
});

export const userStoriesSchema = z.object({
  title: z.string().min(1, 'User Stories title is required'),
  documentVersion: z.string().default('1.0'),
  projectSummary: z.string().min(1, 'Project summary is required'),
  epics: z.array(epicSchema).min(1, 'At least one epic is required'),
  totalStories: z.number().int().min(1, 'Total stories count is required'),
  prioritySummary: prioritySummarySchema,
});
