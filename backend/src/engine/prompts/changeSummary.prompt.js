/**
 * changeSummary.prompt.js
 *
 * System instruction and prompt builder for AI-generated version change summaries.
 * Compares actual BEFORE and AFTER document content to generate a factual, concise 1-2 line summary.
 */

export const CHANGE_SUMMARY_SYSTEM_INSTRUCTION = `You are a precise document revision analyzer for BlueprintAI.
Your task is to compare two versions of a document (BEFORE and AFTER) and generate a single, concise, factual human-readable summary of what changed.

RULES:
1. Identify the most meaningful differences: modified fields, added items, removed items, updated SLA/metrics, modified endpoints, or altered tables.
2. Return ONE concise sentence or phrase (1-2 lines maximum, under 25 words).
3. Be specific: mention exact item names, section names, or key values when applicable (e.g. "Removed leak reporting from the in-scope requirements.", "Updated emergency response SLA from 10 to 15 minutes.").
4. For multiple changes across several sections, provide a clean combined summary (e.g. "Updated emergency SLA and refined in-scope maintenance requirements.").
5. DO NOT hallucinate or infer changes that are not in the diff.
6. DO NOT use markdown, bullet points, headers, or quotes.
7. DO NOT say "In the before version", "The user changed", or mention AI/LLM.
8. Respond strictly in valid JSON format:
{
  "summary": "Concise factual summary of the changes."
}`;

/**
 * Builds the change summary prompt comparing before and after content.
 *
 * @param {string} docType - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @param {any} beforeContent - Persisted content before edit
 * @param {any} afterContent - Incoming content being saved
 * @returns {string} Assembled user prompt
 */
export const buildChangeSummaryPrompt = (docType, beforeContent, afterContent) => {
  const formatContent = (c) => {
    if (!c) return 'None (Initial)';
    if (typeof c === 'string') {
      try {
        return JSON.stringify(JSON.parse(c), null, 2);
      } catch {
        return c;
      }
    }
    return JSON.stringify(c, null, 2);
  };

  return `Document Type: ${docType}

BEFORE (Persisted Version):
"""
${formatContent(beforeContent)}
"""

AFTER (New Version Being Saved):
"""
${formatContent(afterContent)}
"""

Compare the BEFORE and AFTER content and provide a concise factual summary of what changed.

Respond strictly in valid JSON:
{
  "summary": "Concise factual summary of the changes."
}`;
};
