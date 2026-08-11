/**
 * contextBuilder.js
 *
 * Assembles the full generation context by combining:
 *   - projectContext   (project metadata, title, description, tech stack)
 *   - requirementContext  (analyzed requirements, features)
 *   - documentContext  (previously generated documents for cross-referencing)
 *   - RAG context      (retrieved knowledge chunks)
 *
 * The assembled context is passed to the prompt builder.
 *
 * TODO: Implement in Phase 3 — Blueprint Engine context layer.
 */
