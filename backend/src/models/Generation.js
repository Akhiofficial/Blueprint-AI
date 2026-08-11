/**
 * Generation.js — Mongoose Model
 *
 * Tracks a single Blueprint Engine generation job.
 * Records input, output, token usage, and status for each AI call.
 *
 * TODO: Implement full schema in Phase 3 — Blueprint Engine.
 *
 * Planned fields:
 *   - project        ObjectId ref → Project  (required)
 *   - user           ObjectId ref → User     (required)
 *   - documentType   String  (which document was generated)
 *   - status         Enum: 'pending' | 'running' | 'completed' | 'failed'
 *   - inputTokens    Number
 *   - outputTokens   Number
 *   - error          String  (error message if failed)
 *   - startedAt      Date
 *   - completedAt    Date
 *   - createdAt / updatedAt  (timestamps: true)
 */
