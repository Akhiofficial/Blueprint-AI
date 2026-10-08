/**
 * openRouterProvider.js
 *
 * OpenRouter LLM provider wrapper using native fetch and OpenAI-compatible API endpoint.
 * Provides fallback access to 100% free models (DeepSeek-R1, Llama 3.3, Mistral, etc.).
 */

import { env } from '../../config/env.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates structured JSON output from OpenRouter.
 *
 * @param {Object} options
 * @param {string} options.prompt - Main user prompt
 * @param {string} [options.systemInstruction] - System prompt role/rules
 * @param {string} [options.modelName] - Preferred OpenRouter model identifier
 * @param {string} [options.role] - Logical model role ('primary' | 'refinement' | 'lightweight')
 * @returns {Promise<Object>} Parsed JSON object from OpenRouter
 */
export const generateJSON = async ({ prompt, systemInstruction, modelName, role = 'primary' }) => {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured in environment variables.');
  }

  let primaryModel = modelName;
  if (!primaryModel) {
    if (role === 'refinement') {
      primaryModel = env.OPENROUTER_REFINEMENT_MODEL || env.OPENROUTER_MODEL || 'inclusionai/ling-3.0-flash-sante:free';
    } else if (role === 'lightweight') {
      primaryModel = env.OPENROUTER_LIGHTWEIGHT_MODEL || 'cohere/north-mini-code:free';
    } else {
      primaryModel = env.OPENROUTER_MODEL || 'inclusionai/ling-3.0-flash-sante:free';
    }
  }

  const modelCandidates = [
    primaryModel,
    'inclusionai/ling-3.0-flash-sante:free',
    'nvidia/nemotron-3.5-lightning:free',
    'dots-studio/dots-3-note-preview:free',
    'cohere/north-mini-code:free',
  ].filter((m, idx, self) => Boolean(m) && self.indexOf(m) === idx);

  let lastError = null;

  for (const targetModel of modelCandidates) {
    console.log(`[OpenRouterProvider] Trying model: ${targetModel}`);
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: `${systemInstruction}\n\nIMPORTANT: Return valid raw JSON only. Do not wrap in extra prose.` });
        } else {
          messages.push({ role: 'system', content: 'Return valid raw JSON only. Do not wrap in extra prose.' });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://blueprintai.app',
            'X-Title': 'BlueprintAI',
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
            temperature: 0.2,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const statusMsg = errorData?.error?.message || response.statusText;
          throw new Error(`HTTP ${response.status}: ${statusMsg}`);
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;

        if (!content) {
          throw new Error('Empty response payload from OpenRouter API.');
        }

        // Clean JSON response (strip markdown code fences and think tags if present from DeepSeek R1)
        let cleanedText = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

        const parsed = JSON.parse(cleanedText);
        console.log(`[OpenRouterProvider] SUCCESS — model=${targetModel}, attempt=${attempt}`);
        return { data: parsed, model: targetModel };
      } catch (err) {
        lastError = err;
        const errMessage = err.message || '';
        const isTemporary =
          errMessage.includes('429') ||
          errMessage.includes('503') ||
          errMessage.includes('rate_limit') ||
          errMessage.includes('overloaded');

        if (isTemporary && attempt < 2) {
          const delayMs = attempt * 1000;
          console.warn(`[OpenRouterProvider] ${targetModel} attempt ${attempt} failed (${errMessage}). Retrying in ${delayMs}ms...`);
          await wait(delayMs);
          continue;
        }

        console.warn(`[OpenRouterProvider] Model ${targetModel} failed: ${errMessage}`);
        break;
      }
    }
  }

  console.error('[OpenRouterProvider] EXHAUSTED — all OpenRouter models failed');
  throw new Error(`OpenRouter API provider exhausted: ${lastError?.message || 'Rate limit or connection failure'}`);
};
