/**
 * changeSummaryService.js
 *
 * Generates concise, factual change summaries for DocumentVersion snapshots
 * using the lightweight AI model role and actual BEFORE/AFTER diff analysis.
 *
 * Responsibilities:
 *   1. Receive persisted BEFORE content and incoming AFTER content.
 *   2. Assemble the prompt and execute via generationPipeline using role: 'lightweight'.
 *   3. Enforce a strict timeout and deterministic fallback to ensure document saves never fail.
 *   4. Return a clean 1-2 line summary string for DocumentVersion.changes.
 */

import { z } from 'zod';
import { runPipeline } from '../../engine/core/generationPipeline.js';
import {
  CHANGE_SUMMARY_SYSTEM_INSTRUCTION,
  buildChangeSummaryPrompt,
} from '../../engine/prompts/changeSummary.prompt.js';

// Minimal Zod schema for the summary response
const changeSummarySchema = z.object({
  summary: z.string().min(1, 'Summary must not be empty').max(300, 'Summary too long'),
});

const TIMEOUT_MS = 3500;

/**
 * Generates an AI change summary comparing before and after content.
 *
 * @param {object} params
 * @param {string} params.docType - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @param {any} params.beforeContent - Persisted content before edit
 * @param {any} params.afterContent - Incoming content being saved
 * @returns {Promise<string>} Concise summary string (e.g. "Removed leak reporting from in-scope requirements.")
 */
export const generateChangeSummary = async ({ docType, beforeContent, afterContent }) => {
  if (!beforeContent && !afterContent) {
    return 'Document updated.';
  }

  try {
    const prompt = buildChangeSummaryPrompt(docType, beforeContent, afterContent);

    const pipelinePromise = runPipeline({
      prompt,
      systemInstruction: CHANGE_SUMMARY_SYSTEM_INSTRUCTION,
      schema: changeSummarySchema,
      role: 'lightweight',
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Change summary generation timed out')), TIMEOUT_MS);
    });

    const result = await Promise.race([pipelinePromise, timeoutPromise]);

    if (result?.success && result?.data?.summary) {
      const cleaned = result.data.summary.trim().replace(/^["']|["']$/g, '');
      console.log(`[ChangeSummaryService] SUCCESS — docType=${docType}, summary="${cleaned}"`);
      return cleaned;
    }

    console.warn(`[ChangeSummaryService] Non-fatal fallback: AI returned no valid summary for ${docType}`);
    return 'Document updated.';
  } catch (err) {
    console.warn(`[ChangeSummaryService] Non-fatal fallback for ${docType}: ${err.message}`);
    return 'Document updated.';
  }
};
