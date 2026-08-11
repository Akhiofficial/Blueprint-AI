/**
 * DocumentVersion.js — Mongoose Model
 *
 * Stores historical versions of an AI-generated Document.
 * Supports rollback/restore and audit trail.
 *
 * TODO: Implement full schema in Phase 2 — Documents / Versioning.
 *
 * Planned fields:
 *   - document       ObjectId ref → Document  (required)
 *   - versionNumber  Number  (auto-incremented)
 *   - content        String  (Markdown snapshot at save time)
 *   - savedBy        ObjectId ref → User
 *   - createdAt      (timestamps: true)
 */
