/**
 * userStories.prompt.js
 *
 * Prompt template and system instruction for User Story generation.
 * Consumes prerequisite SRS output and project context.
 */

export const SYSTEM_INSTRUCTION = `You are a Senior Product Manager and Agile Coach.
Your task is to generate a comprehensive set of well-structured User Stories based on the provided Software Requirements Specification (SRS) document and project context.

Follow these strict output rules:
1. Respond with VALID RAW JSON ONLY. No markdown wrapping (no \`\`\`json), no introductory text, no postscripts.
2. The JSON output MUST strictly conform to the expected User Stories schema structure.
3. Every story MUST follow the "As a [role], I want [goal], so that [benefit]" format.
4. Group stories by epic (a high-level feature or domain area).
5. Assign priority using MoSCoW: Must Have, Should Have, Could Have, Won't Have.
6. Include clear, testable acceptance criteria for each story.
7. Assign story point estimates using Fibonacci sequence: 1, 2, 3, 5, 8, 13.
8. Story IDs must be sequential (e.g., US-001, US-002, ...).`;

/**
 * Builds the complete User Stories prompt using SRS output and project metadata.
 *
 * @param {Object} srsOutput - Prerequisite SRS output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @returns {string} Fully assembled user prompt
 */
export const buildUserStoriesPrompt = (srsOutput, projectInfo = {}) => {
  const projectTitle = projectInfo.title || srsOutput.title || 'Software Application';
  const projectDescription = projectInfo.description || srsOutput.systemOverview || '';

  return `Generate a comprehensive set of User Stories for the following project:

PROJECT METADATA:
- Title: ${projectTitle}
- Description: ${projectDescription}

PREREQUISITE SRS CONTEXT:
"""
${JSON.stringify(srsOutput, null, 2)}
"""

Please derive and generate the complete User Stories JSON including:
1. title: "User Stories — ${projectTitle}"
2. documentVersion: "1.0"
3. projectSummary: A short summary of what the product does and who it is for.
4. epics: Array of epics. Each epic has:
   - epicId (e.g., EP-001)
   - epicName (high-level feature area, e.g., "User Authentication", "Dashboard", "Notifications")
   - description (what this epic covers)
   - stories: Array of user stories within this epic. Each story has:
       - storyId (e.g., US-001, globally sequential across all epics)
       - role (the user persona, e.g., "registered user", "admin", "guest")
       - goal (what they want to do)
       - benefit (why — the business/user value)
       - priority (Must Have | Should Have | Could Have | Won't Have)
       - storyPoints (Fibonacci: 1, 2, 3, 5, 8, or 13)
       - acceptanceCriteria: Array of specific, testable conditions (at least 2 per story)
       - notes: Optional implementation hints or edge cases (array of strings, can be empty)
5. totalStories: Total count of all stories across all epics.
6. prioritySummary: Object with counts per priority level:
   { mustHave: N, shouldHave: N, couldHave: N, wontHave: N }

Return valid raw JSON strictly matching the User Stories schema structure.`;
};
