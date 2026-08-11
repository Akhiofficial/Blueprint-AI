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

  // ── AI (populated in Phase 2 when Gemini/RAG is integrated) ──
  // GEMINI_API_KEY:  process.env.GEMINI_API_KEY,
  // PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  // PINECONE_INDEX:   process.env.PINECONE_INDEX,
};
