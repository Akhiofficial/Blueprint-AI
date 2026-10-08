/**
 * generationPipeline.js — Generation Pipeline
 *
 * Executes the common AI generation sequence:
 * Prompt -> LLM Provider -> Zod Validation -> Structured Output
 */

import { generateJSON } from '../providers/llmProvider.js';

export const runPipeline = async ({ prompt, systemInstruction, schema, modelName, preferredProvider, role = 'primary' }) => {
  try {
    const rawResult = await generateJSON({
      prompt,
      systemInstruction,
      modelName,
      preferredProvider,
      role,
    });

    console.log(`[GenerationPipeline] SUCCESS — role=${role}, LLM response received`);

    const rawOutput = rawResult?.data !== undefined ? rawResult.data : rawResult;
    const actualModel = rawResult?.model || modelName || 'unknown';
    const actualProvider = rawResult?.provider || 'unknown';

    if (schema) {
      const parsed = schema.safeParse(rawOutput);
      if (!parsed.success) {
        const validationError = parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join(', ');

        console.warn(`[GenerationPipeline] VALIDATION FAILED — role=${role}`);

        return {
          success: false,
          error: `AI output validation failed: ${validationError}`,
        };
      }
      console.log(`[GenerationPipeline] SUCCESS — role=${role}, structured output validated`);
      return { success: true, data: parsed.data, model: actualModel, provider: actualProvider, role };
    }

    return { success: true, data: rawOutput, model: actualModel, provider: actualProvider, role };
  } catch (err) {
    return {
      success: false,
      error: `Pipeline execution failed: ${err.message}`,
    };
  }
};
