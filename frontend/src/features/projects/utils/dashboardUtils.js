// ── Dashboard Utilities ──────────────────────────────────────────────────────
// Pure helpers — no React, no side effects.

/**
 * Returns a time-of-day greeting based on the current hour.
 * @param {number} hour - 0..23
 */
export const getGreeting = (hour = new Date().getHours()) => {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

/**
 * Formats a date string as a relative time label.
 * e.g. "just now", "5 minutes ago", "3 days ago"
 * @param {string|Date} dateString
 */
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours   / 24);
  const weeks   = Math.floor(days    / 7);
  const months  = Math.floor(days    / 30);

  if (seconds < 60)  return 'just now';
  if (minutes < 60)  return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  if (hours   < 24)  return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days    < 7)   return `${days} day${days !== 1 ? 's' : ''} ago`;
  if (weeks   < 5)   return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};

// ── Blueprint Progress ───────────────────────────────────────────────────────
// The five core blueprint artifacts that BlueprintAI generates.
// Ordered as they appear in the workflow.
export const BLUEPRINT_STEPS = [
  { key: 'BRD',        label: 'BRD' },
  { key: 'SRS',        label: 'SRS' },
  { key: 'UserStories', label: 'User Stories' },
  { key: 'APISpec',    label: 'REST API' },
  { key: 'DBSchema',   label: 'Database Schema' },
];

/**
 * Derives a placeholder set of completed blueprint steps from the project
 * status field. This is a UI placeholder until the Document API (Phase 2)
 * is wired and can return actual document generation status per project.
 *
 * Mapping rationale (conservative — errs toward showing less progress):
 *   active    → []           (project exists, nothing generated yet)
 *   completed → all 5 steps  (project explicitly marked complete)
 *   archived  → []           (archived; treat as indeterminate)
 *
 * TODO (Phase 2): Replace this function with real document status data
 * fetched from GET /api/projects/:id/documents and passed as a prop.
 *
 * @param {string} status - Project.status enum value
 * @returns {string[]} Array of completed step keys
 */
export const getProgressFromStatus = (status) => {
  switch (status) {
    case 'completed': return BLUEPRINT_STEPS.map((s) => s.key);
    case 'active':
    case 'archived':
    default:          return [];
  }
};

/**
 * Returns a human-readable status label + variant for Badge.
 * @param {string} status - Project.status enum value
 * @returns {{ label: string, color: string }}
 */
export const getStatusMeta = (status) => {
  switch (status) {
    case 'active':    return { label: 'Active',    color: 'green' };
    case 'completed': return { label: 'Completed', color: 'indigo' };
    case 'archived':  return { label: 'Archived',  color: 'slate' };
    default:          return { label: status,      color: 'slate' };
  }
};
