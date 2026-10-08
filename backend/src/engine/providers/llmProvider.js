/**
 * llmProvider.js
 *
 * Unified Multi-Provider LLM Orchestrator & Fallback Load Balancer.
 * Automatically routes prompts through configured providers (Gemini -> Groq -> OpenRouter)
 * upon quota, rate limit (429), or service availability (503) failures.
 */

import { env } from '../../config/env.js';
import * as geminiProvider from './geminiProvider.js';
import * as groqProvider from './groqProvider.js';
import * as openRouterProvider from './openRouterProvider.js';

const PROVIDERS = {
  gemini: {
    name: 'Gemini',
    apiKeyEnv: 'GEMINI_API_KEY',
    generateJSON: geminiProvider.generateJSON,
  },
  groq: {
    name: 'Groq',
    apiKeyEnv: 'GROQ_API_KEY',
    generateJSON: groqProvider.generateJSON,
  },
  openrouter: {
    name: 'OpenRouter',
    apiKeyEnv: 'OPENROUTER_API_KEY',
    generateJSON: openRouterProvider.generateJSON,
  },
};

/**
 * Executes JSON generation across available LLM providers with automatic fallback and role-based routing.
 *
 * @param {Object} options
 * @param {string} options.prompt - Main user prompt
 * @param {string} [options.systemInstruction] - System prompt role/rules
 * @param {string} [options.modelName] - Optional preferred model identifier
 * @param {string} [options.preferredProvider] - Optional initial provider override
 * @param {string} [options.role='primary'] - Logical model role ('primary' | 'refinement' | 'lightweight')
 * @returns {Promise<Object>} Parsed JSON object from winning provider
 */
export const generateJSON = async ({ prompt, systemInstruction, modelName, preferredProvider, role = 'primary' }) => {
  // Parse fallback order from environment (e.g., 'gemini,groq,openrouter')
  const defaultOrder = (env.LLM_FALLBACK_ORDER || 'gemini,groq,openrouter')
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  let providerOrder = [...defaultOrder];

  if (preferredProvider && PROVIDERS[preferredProvider.toLowerCase()]) {
    const pref = preferredProvider.toLowerCase();
    providerOrder = [pref, ...providerOrder.filter((p) => p !== pref)];
  }

  // Deduplicate
  providerOrder = [...new Set(providerOrder)];

  const errors = [];

  for (let i = 0; i < providerOrder.length; i++) {
    const providerKey = providerOrder[i];
    const provider = PROVIDERS[providerKey];
    if (!provider) {
      console.warn(`[LLMProvider] Unknown provider '${providerKey}' specified in fallback order. Skipping.`);
      continue;
    }

    // Check if API key is configured
    if (provider.apiKeyEnv && !env[provider.apiKeyEnv]) {
      console.info(`[LLMProvider] ${provider.name} skipped (${provider.apiKeyEnv} not configured).`);
      errors.push(`${provider.name}: API key not configured`);
      continue;
    }

    try {
      console.log(`[LLMProvider] DISPATCH → role=${role}, provider=${providerKey}`);
      const result = await provider.generateJSON({ prompt, systemInstruction, modelName, role });
      const actualModel = result?.model || modelName || 'unknown';
      console.log(`[LLMProvider] SUCCESS → role=${role}, provider=${providerKey}, model=${actualModel}`);
      const actualData = result?.data !== undefined ? result.data : result;
      return { data: actualData, model: actualModel, provider: providerKey, role };
    } catch (err) {
      const errMsg = err.message || 'Unknown error';
      console.warn(`[LLMProvider] FAILED → role=${role}, provider=${providerKey}: ${errMsg}`);
      errors.push(`${provider.name}: ${errMsg}`);

      const nextProviderKey = providerOrder[i + 1];
      if (nextProviderKey) {
        console.warn(`[LLMProvider] FALLBACK → role=${role}, ${providerKey} → ${nextProviderKey}`);
      }
    }
  }

  throw new Error(`All LLM providers failed execution for role '${role}':\n- ${errors.join('\n- ')}`);
};
