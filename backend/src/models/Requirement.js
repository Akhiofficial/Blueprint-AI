/**
 * Requirement.js — Mongoose Model
 *
 * Represents a software requirement captured for a project.
 * Each requirement belongs to a Project and is owned by a User.
 *
 * TODO: Implement full schema in Phase 2 — Requirements feature.
 *
 * Planned fields:
 *   - project        ObjectId ref → Project  (required)
 *   - title          String  (required)
 *   - description    String  (required)
 *   - type           Enum: 'functional' | 'non-functional' | 'constraint' | 'assumption'
 *   - priority       Enum: 'must-have' | 'should-have' | 'could-have' | 'wont-have'
 *   - status         Enum: 'draft' | 'reviewed' | 'approved' | 'rejected'
 *   - createdAt / updatedAt  (timestamps: true)
 */
