/**
 * groqProvider.js
 *
 * Groq LLM provider wrapper using native fetch and OpenAI-compatible API endpoint.
 * Provides fast fallback using models like Llama-3.3-70B and DeepSeek-R1-Distill.
 */

import { env } from '../../config/env.js';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generates structured JSON output from Groq.
 *
 * @param {Object} options
 * @param {string} options.prompt - Main user prompt
 * @param {string} [options.systemInstruction] - System prompt role/rules
 * @param {string} [options.modelName] - Preferred Groq model identifier
 * @returns {Promise<Object>} Parsed JSON object from Groq
 */
export const generateJSON = async ({ prompt, systemInstruction, modelName }) => {
  const apiKey = env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured in environment variables.');
  }

  const primaryModel = modelName || env.GROQ_MODEL || 'openai/gpt-oss-120b';
  const modelCandidates = [
    primaryModel,
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'qwen/qwen3.8-27b',
  ].filter((m, idx, self) => Boolean(m) && self.indexOf(m) === idx);

  let lastError = null;

  for (const targetModel of modelCandidates) {
    console.log(`[GroqProvider] Trying model: ${targetModel}`);
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const messages = [];
        if (systemInstruction) {
          messages.push({ role: 'system', content: `${systemInstruction}\n\nIMPORTANT: You must respond in valid JSON format only.` });
        } else {
          messages.push({ role: 'system', content: 'You must respond in valid JSON format only.' });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages,
            response_format: { type: 'json_object' },
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
          throw new Error('Empty response payload from Groq API.');
        }

        // Clean JSON response (strip markdown code fence if wrapped)
        const cleanedText = content.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleanedText);
        console.log(`[GroqProvider] SUCCESS — model=${targetModel}, attempt=${attempt}`);
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
          console.warn(`[GroqProvider] ${targetModel} attempt ${attempt} failed (${errMessage}). Retrying in ${delayMs}ms...`);
          await wait(delayMs);
          continue;
        }

        console.warn(`[GroqProvider] Model ${targetModel} failed: ${errMessage}`);
        break;
      }
    }
  }

  console.error('[GroqProvider] EXHAUSTED — all Groq models failed');
  throw new Error(`Groq API provider exhausted: ${lastError?.message || 'Rate limit or connection failure'}`);
};
