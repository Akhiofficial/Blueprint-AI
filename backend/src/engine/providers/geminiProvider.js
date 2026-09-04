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
 * @returns {Promise<Object>} Parsed JSON object from Gemini
 */
export const generateJSON = async ({ prompt, systemInstruction, modelName }) => {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const primaryModel = modelName || env.GEMINI_MODEL || 'gemini-3.6-flash';
  const modelCandidates = [
    primaryModel,
    'gemini-3.5-flash',
    'gemini-flash-latest',
  ].filter((m, idx, self) => self.indexOf(m) === idx);

  let lastError = null;

  for (const targetModel of modelCandidates) {
    // Retry up to 2 times per candidate model for temporary 503 / 429 errors
    for (let attempt = 1; attempt <= 2; attempt++) {
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

        return JSON.parse(response.text);
      } catch (err) {
        lastError = err;
        const errMessage = err.message || '';
        const isTemporary =
          errMessage.includes('503') ||
          errMessage.includes('UNAVAILABLE') ||
          errMessage.includes('429') ||
          errMessage.includes('RESOURCE_EXHAUSTED');

        if (isTemporary && attempt < 2) {
          console.warn(`[GeminiProvider] ${targetModel} attempt ${attempt} failed. Retrying in 1s...`);
          await wait(1000 * attempt);
          continue;
        }

        console.warn(`[GeminiProvider] ${targetModel} failed. Trying fallback model...`);
        break;
      }
    }
  }

  throw new Error(`Gemini API request failed across all models: ${lastError?.message || 'Unknown error'}`);
};
