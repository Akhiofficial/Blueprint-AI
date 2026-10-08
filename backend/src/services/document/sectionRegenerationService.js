/**
 * sectionRegenerationService.js
 *
 * Stage 3A: AI Section Regeneration for BRD & SRS documents.
 * Reuses generationPipeline with role: 'lightweight' (gemini-3.5-flash-lite -> Groq -> OpenRouter).
 *
 * This service does NOT persist to the database or create document versions.
 * It returns the regenerated section for the frontend to apply to the local draft.
 */

import { z } from 'zod';
import { runPipeline } from '../../engine/core/generationPipeline.js';
import {
  SECTION_REGEN_SYSTEM_INSTRUCTION,
  buildSectionRegenerationPrompt,
} from '../../engine/prompts/sectionRegeneration.prompt.js';

/**
 * Zod validation schema matching existing normalized BRD/SRS section shapes:
 * - Prose:  { content: string }
 * - Items:  { items: string[] }
 * - Table:  { table: { headers: string[], rows: (string|number|null)[][] } } (optional content)
 */
export const regeneratedSectionSchema = z.object({
  content: z.string().optional(),
  items: z.array(z.string()).optional(),
  table: z.object({
    headers: z.array(z.string()).default([]),
    rows: z.array(z.array(z.union([z.string(), z.number(), z.boolean(), z.null()]))).default([]),
  }).optional(),
}).refine(
  (data) =>
    data.content !== undefined ||
    (Array.isArray(data.items) && data.items.length > 0) ||
    (data.table && Array.isArray(data.table.rows)),
  { message: 'Regenerated section must contain content, items, or table rows.' }
);

/**
 * Regenerates a single section of a BRD or SRS document using the lightweight model role.
 *
 * @param {object} params
 * @param {string} params.docType        - 'BRD' | 'SRS'
 * @param {string} params.sectionId      - e.g. 'brd-objectives', 'srs-roles'
 * @param {object} params.currentSection - { id, title, content?, items?, table? }
 * @param {object} [params.projectInfo]  - { title, description }
 * @returns {Promise<{ sectionId: string, regeneratedSection: object, provider: string, model: string }>}
 */
export const regenerateSection = async ({
  docType,
  sectionId,
  currentSection,
  projectInfo = {},
}) => {
  const prompt = buildSectionRegenerationPrompt({
    docType,
    sectionId,
    currentSection,
    projectInfo,
  });

  const pipelineResult = await runPipeline({
    prompt,
    systemInstruction: SECTION_REGEN_SYSTEM_INSTRUCTION,
    schema: regeneratedSectionSchema,
    role: 'lightweight',
  });

  if (!pipelineResult.success || !pipelineResult.data) {
    throw new Error(pipelineResult.error || 'Failed to regenerate section.');
  }

  const rawData = pipelineResult.data;

  // Build the updated section object preserving canonical id and title
  const updatedSection = {
    id: currentSection.id || sectionId,
    title: currentSection.title || sectionId,
  };

  if (rawData.table && rawData.table.rows) {
    updatedSection.table = {
      headers: (rawData.table.headers && rawData.table.headers.length > 0)
        ? rawData.table.headers
        : currentSection.table?.headers || [],
      rows: rawData.table.rows,
    };
    if (rawData.content) {
      updatedSection.content = rawData.content;
    }
  } else if (Array.isArray(rawData.items)) {
    updatedSection.items = rawData.items;
  } else if (rawData.content !== undefined) {
    updatedSection.content = rawData.content;
  }

  return {
    sectionId,
    regeneratedSection: updatedSection,
    provider: pipelineResult.provider,
    model: pipelineResult.model,
  };
};
