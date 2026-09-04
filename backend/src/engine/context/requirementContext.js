/**
 * requirementContext.js
 *
 * Builds the requirement-level context from analyzed requirements.
 * Formats requirements for injection into prompt templates.
 */

/**
 * Normalizes an array of requirement objects into a structured text format for the AI prompt.
 *
 * @param {Array} requirements - Array of requirement documents from the database
 * @returns {string} - Formatted requirements string
 */
export const buildRequirementContext = (requirements) => {
  if (!requirements || !Array.isArray(requirements)) {
    return '';
  }

  const textParts = requirements
    .map((r) => {
      const titleStr = r.title && r.title !== 'Project Requirements' ? `### ${r.title}\n` : '';
      const descStr = r.description ? r.description.trim() : '';
      return `${titleStr}${descStr}`.trim();
    })
    .filter(Boolean);

  return textParts.join('\n\n');
};
