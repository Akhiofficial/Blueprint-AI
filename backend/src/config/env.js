/**
 * env.js — Centralized environment configuration
 *
 * Validates that all required environment variables are present at startup.
 * Exports them as named constants so the rest of the codebase never calls
 * process.env directly — making env usage grep-able and type-safe.
 *
 * Add every new env var here as the project grows (Gemini, Pinecone, etc.)
 */

const required = [
  'MONGO_URI',
  'JWT_SECRET',
];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

export const env = {
  // Server
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  MONGO_URI: process.env.MONGO_URI,

  // Auth
  JWT_SECRET: process.env.JWT_SECRET,

  // AI Providers & Models
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  GEMINI_REFINEMENT_MODEL: process.env.GEMINI_REFINEMENT_MODEL || process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  GEMINI_LIGHTWEIGHT_MODEL: process.env.GEMINI_LIGHTWEIGHT_MODEL || 'gemini-3.5-flash-lite',

  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  GROQ_REFINEMENT_MODEL: process.env.GROQ_REFINEMENT_MODEL || process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
  GROQ_LIGHTWEIGHT_MODEL: process.env.GROQ_LIGHTWEIGHT_MODEL || 'openai/gpt-oss-20b',

  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'inclusionai/ling-3.0-flash-sante:free',
  OPENROUTER_REFINEMENT_MODEL: process.env.OPENROUTER_REFINEMENT_MODEL || process.env.OPENROUTER_MODEL || 'inclusionai/ling-3.0-flash-sante:free',
  OPENROUTER_LIGHTWEIGHT_MODEL: process.env.OPENROUTER_LIGHTWEIGHT_MODEL || 'cohere/north-mini-code:free',

  LLM_FALLBACK_ORDER: process.env.LLM_FALLBACK_ORDER || 'gemini,groq,openrouter',
  PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
  PINECONE_INDEX: process.env.PINECONE_INDEX || '',
};
