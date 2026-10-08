/**
 * exportController.js
 *
 * HTTP request handler for the Blueprint export endpoint.
 *   GET /api/projects/:projectId/export
 *
 * Supported Query Parameters:
 *   Single document: ?docType=BRD&format=markdown
 *                    ?docType=BRD&format=pdf
 *   All documents:   ?scope=all&format=markdown
 *                    ?scope=all&format=pdf
 *
 * Supported docType values (aliases are resolved inside exportService):
 *   BRD | SRS | UserStories | APISpec | DBSchema
 *   or their common aliases: brd, srs, user-stories, api, database, etc.
 *
 * READ-ONLY — this endpoint never creates, modifies, or deletes any record.
 */

import asyncHandler from '../utils/asyncHandler.js';
import * as exportService from '../services/export/exportService.js';

export const exportProjectDocuments = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const ownerId = req.user._id;

  // ── Validate format ──────────────────────────────────────────────────────
  const rawFormat = req.query.format || '';
  const format = String(rawFormat).toLowerCase().trim();

  if (!format || (format !== 'markdown' && format !== 'pdf')) {
    res.status(400);
    throw new Error("Missing or invalid 'format'. Supported values: 'markdown', 'pdf'.");
  }

  const { scope, docType, docTypes, mode, exportMode } = req.query;
  const resolvedMode = String(mode || exportMode || 'combined').toLowerCase().trim() === 'separate' ? 'separate' : 'combined';

  // ── Route: Single document ───────────────────────────────────────────────
  if (docType) {
    return await exportService.exportSingleDocument({
      projectId,
      ownerId,
      docType: String(docType).trim(),
      format,
      mode: resolvedMode,
      res,
    });
  }

  // ── Route: All / Selected documents ──────────────────────────────────────
  if (scope === 'all' || docTypes) {
    let parsedDocTypes = null;
    if (docTypes) {
      parsedDocTypes = Array.isArray(docTypes)
        ? docTypes.map(t => String(t).trim()).filter(Boolean)
        : String(docTypes).split(',').map(t => t.trim()).filter(Boolean);
    }

    return await exportService.exportAllDocuments({
      projectId,
      ownerId,
      format,
      docTypes: parsedDocTypes,
      mode: resolvedMode,
      res,
    });
  }

  // ── Neither docType nor scope=all / docTypes ─────────────────────────────
  res.status(400);
  throw new Error("Please provide a 'docType' query parameter for a single document, or 'scope=all' / 'docTypes' for selected documents.");
});
