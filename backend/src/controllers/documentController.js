/**
 * documentController.js
 *
 * HTTP request handlers for the /api/documents routes.
 * Delegates business logic to documentService.
 *
 * TODO: Implement in Phase 2 — Documents feature.
 *   - getDocuments    GET    /api/projects/:projectId/documents
 *   - getDocument     GET    /api/projects/:projectId/documents/:id
 *   - deleteDocument  DELETE /api/projects/:projectId/documents/:id
 *   - getVersions     GET    /api/documents/:id/versions
 *
 * Note: Document creation is triggered by the Blueprint Engine, not directly
 * by this controller — the AI route calls the engine which calls documentService.
 */
