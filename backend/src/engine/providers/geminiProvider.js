/**
 * geminiProvider.js
 *
 * Google Gemini LLM provider wrapper using @google/genai SDK.
 * Includes automatic retry with exponential backoff and fallback model selection
 * for handling temporary 503 (High Demand) and 429 (Rate Limit) errors.
 */

import { GoogleGenAI } from '@google/genai';
import { env } from '../../config/env.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates structured JSON output from Gemini with retry & fallback support.
 *
 * @param {Object} options
 * @param {string} options.prompt - Main user prompt
 * @param {string} [options.systemInstruction] - System prompt role/rules
 * @param {string} [options.modelName] - Preferred Gemini model identifier
 * @param {string} [options.role] - Logical model role ('primary' | 'refinement' | 'lightweight')
 * @returns {Promise<Object>} Parsed JSON object from Gemini
 */
export const generateJSON = async ({ prompt, systemInstruction, modelName, role = 'primary' }) => {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });

  let primaryModel = modelName;
  if (!primaryModel) {
    if (role === 'refinement') {
      primaryModel = env.GEMINI_REFINEMENT_MODEL || env.GEMINI_MODEL || 'gemini-3.6-flash';
    } else if (role === 'lightweight') {
      primaryModel = env.GEMINI_LIGHTWEIGHT_MODEL || 'gemini-3.5-flash-lite';
    } else {
      primaryModel = env.GEMINI_MODEL || 'gemini-3.6-flash';
    }
  }

  const modelCandidates = [
    primaryModel,
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
  ].filter((m, idx, self) => Boolean(m) && self.indexOf(m) === idx);

  let lastError = null;

  for (const targetModel of modelCandidates) {
    console.log(`[GeminiProvider] Trying model: ${targetModel}`);
    // Retry up to 3 times per candidate model for temporary 503 / 429 errors
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: targetModel,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        });

        if (!response || !response.text) {
          throw new Error('Empty response received from Gemini API.');
        }

        // Clean JSON response (strip markdown code fence if wrapped)
        const cleanedText = response.text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const data = JSON.parse(cleanedText);
        console.log(`[GeminiProvider] SUCCESS — model=${targetModel}, attempt=${attempt}`);
        return { data, model: targetModel };
      } catch (err) {
        lastError = err;
        const errMessage = err.message || '';
        const isTemporary =
          errMessage.includes('503') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED');

        if (isTemporary && attempt < 3) {
          const delayMs = attempt * 1500;
          console.warn(`[GeminiProvider] ${targetModel} attempt ${attempt} failed (${errMessage}). Retrying in ${delayMs}ms...`);
          await wait(delayMs);
          continue;
        }

        console.warn(`[GeminiProvider] Model ${targetModel} failed: ${errMessage}`);
        break;
      }
    }
  }

  console.error('[GeminiProvider] EXHAUSTED — all Gemini models failed');
  throw new Error(`Gemini API provider exhausted: ${lastError?.message || 'Rate limit or service unavailable'}`);
};
