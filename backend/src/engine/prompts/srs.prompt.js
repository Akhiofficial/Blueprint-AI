/**
 * srs.prompt.js
 *
 * Prompt template and system instruction for Software Requirements Specification (SRS) generation.
 * Consumes prerequisite Business Requirements Document (BRD) output and project context.
 */

export const SYSTEM_INSTRUCTION = `You are a Principal Software Architect and Lead Technical Author.
Your task is to generate a comprehensive, highly technical, and production-ready Software Requirements Specification (SRS) document based on the provided Business Requirements Document (BRD) and project context.

Follow these strict output rules:
1. Respond with VALID RAW JSON ONLY. No markdown wrapping (no \`\`\`json), no introductory text, no postscripts.
2. The JSON output MUST strictly conform to the expected SRS schema structure.
3. Be specific, actionable, and precise in technical requirements.
4. Translate business-level goals from the BRD into concrete software specifications (functional requirements, user roles, system features, API/interface boundaries, security/performance standards).
5. Format requirement IDs clearly (e.g. FR-001, NFR-001).`;

/**
 * Builds the complete SRS prompt using BRD output and project metadata.
 *
 * @param {Object} brdOutput - Prerequisite BRD output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @returns {string} Fully assembled user prompt
 */
export const buildSRSPrompt = (brdOutput, projectInfo = {}) => {
  const projectTitle = projectInfo.title || brdOutput.title || 'Software Application';
  const projectDescription = projectInfo.description || brdOutput.executiveSummary || '';

  return `Generate a comprehensive Software Requirements Specification (SRS) document for the following project:

PROJECT METADATA:
- Title: ${projectTitle}
- Description: ${projectDescription}

PREREQUISITE BRD CONTEXT:
"""
${JSON.stringify(brdOutput, null, 2)}
"""

Please derive and generate the complete SRS JSON including:
1. title: "Software Requirements Specification - ${projectTitle}"
2. documentVersion: "1.0"
3. systemOverview: Detailed architectural and functional breakdown of the software.
4. userRoles: Array of roles with roleName, description, permissions.
5. functionalRequirements: Detailed array of FRs with id (e.g., FR-001), category, title, description, priority (High/Medium/Low/Critical).
6. nonFunctionalRequirements: Array of NFRs with category, requirement, metric.
7. systemFeatures: Core software features with featureName, description, inputs, outputs.
8. externalInterfaces: Hardware, UI, software/API integration endpoints with interfaceType, description, protocolOrFormat.
9. systemConstraints: Key technical, architectural, and operational constraints.
10. assumptionsAndDependencies: Critical deployment and technical assumptions.
11. securityRequirements: Specific security, auth, encryption, and compliance constraints.
12. performanceRequirements: Specific latency, throughput, scale, and availability requirements.
13. acceptanceCriteria: Specific testable software acceptance criteria.

Return valid raw JSON strictly matching the SRS schema structure.`;
};
