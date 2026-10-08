/**
 * sectionRegeneration.prompt.js
 *
 * Prompt builder for regenerating a single section of a BRD or SRS document.
 * Instructs the model to output the exact structure expected by the document view
 * (prose string in "content", list in "items", or tabular data in "table").
 */

export const SECTION_REGEN_SYSTEM_INSTRUCTION = `You are an expert document editor for BlueprintAI.
Your task is to regenerate ONLY the single requested section of a software requirements document (BRD or SRS).

RULES:
1. Regenerate ONLY the requested section. Do NOT generate other sections.
2. Match the exact data shape of the input section:
   - If currentSection has 'items' (a list), output { "items": [ "...", "..." ] }
   - If currentSection has 'table' (tabular data), output { "table": { "headers": [...], "rows": [[...], [...]] } }
   - If currentSection has 'content' (prose text), output { "content": "..." }
3. Preserve the core domain context, scope, and technical requirements of the project.
4. Improve clarity, professional tone, specificity, and completeness.
5. Do NOT invent unrelated business domains or fictitious external integrations.
6. Return strictly valid JSON with no markdown code fences, headers, or conversational prose.`;

/**
 * Builds the section regeneration prompt.
 *
 * @param {object} params
 * @param {string} params.docType - 'BRD' | 'SRS'
 * @param {string} params.sectionId - e.g. 'brd-objectives', 'brd-scope'
 * @param {object} params.currentSection - { id, title, content?, items?, table? }
 * @param {object} [params.projectInfo] - { title, description }
 * @returns {string} Assembled user prompt
 */
export const buildSectionRegenerationPrompt = ({
  docType,
  sectionId,
  currentSection,
  projectInfo = {},
}) => {
  const projectContext = [
    projectInfo.title ? `Project Title: ${projectInfo.title}` : '',
    projectInfo.description ? `Project Overview: ${projectInfo.description}` : '',
  ].filter(Boolean).join('\n');

  let shapeHint = '';
  if (currentSection.table) {
    shapeHint = `Output shape MUST be a table with the same header schema:
{
  "table": {
    "headers": ${JSON.stringify(currentSection.table.headers || [])},
    "rows": [ ...improved array of row arrays matching the headers... ]
  }
}`;
  } else if (currentSection.items) {
    shapeHint = `Output shape MUST be an items array:
{
  "items": [ ...array of refined, specific, actionable items... ]
}`;
  } else {
    shapeHint = `Output shape MUST be a prose content string:
{
  "content": "...refined, high-clarity professional text..."
}`;
  }

  return `You are refining the following section in a ${docType} document:
Section Title: "${currentSection.title || sectionId}"
Section ID: "${sectionId}"

${projectContext ? `PROJECT CONTEXT:\n${projectContext}\n` : ''}

CURRENT SECTION CONTENT:
"""
${JSON.stringify(currentSection, null, 2)}
"""

REQUIREMENT:
Regenerate and enhance this specific section to be more thorough, concrete, professional, and well-structured.
${shapeHint}

Respond strictly in valid JSON format only:`;
};
