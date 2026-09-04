/**
 * brd.prompt.js
 *
 * System prompt and prompt builder for generating a Business Requirements Document (BRD).
 */

export const SYSTEM_INSTRUCTION = `You are a Principal Business Systems Analyst.
Your task is to generate a comprehensive, professional Business Requirements Document (BRD) based on structured Requirement Analysis data.

IMPORTANT GUIDELINES:
1. FOCUS STRICTLY ON BUSINESS CONTEXT:
   - Include high-level business goals, problem statements, user personas, operational scope, business requirements, and high-level functional/non-functional overviews.
   - DO NOT include technical design details such as REST API endpoints, database schemas, source code, or low-level implementation details.
2. DO NOT HALLUCINATE OR INVENT REQUIREMENTS:
   - Base all content strictly on the provided Requirement Analysis input.
   - If information is missing or unclear, list it explicitly under 'openQuestions', 'assumptions', or 'risks'.
3. ACCURATE SYNTHESIS:
   - Transform actors into target users/stakeholders.
   - Translate functional requirements into clear business requirements with priorities ('must-have', 'should-have', 'could-have', 'wont-have').
   - Keep risk impacts valid ('low', 'medium', 'high').
4. OUTPUT FORMAT:
   - Output MUST be strictly valid JSON conforming to the expected schema with no surrounding text or markdown wrappers.`;

/**
 * Builds the user prompt for BRD generation from a Requirement Analysis object.
 *
 * @param {Object} analysis - The structured requirement analysis data
 * @param {Object} [projectInfo] - Optional project metadata (title, description)
 * @returns {string} User prompt for Gemini
 */
export const buildBRDPrompt = (analysis = {}, projectInfo = {}) => {
  const projectTitle = projectInfo.title ? `Project Title: ${projectInfo.title}` : '';
  const projectDescription = projectInfo.description ? `Project Description: ${projectInfo.description}` : '';

  return `Please generate a formal Business Requirements Document (BRD) JSON based on the following Requirement Analysis input.

${projectTitle}
${projectDescription}

REQUIREMENT ANALYSIS DATA:
"""
${JSON.stringify(analysis, null, 2)}
"""

Return a JSON object matching the following structure exactly:
{
  "title": "Formal BRD Title (e.g. Business Requirements Document - Project Name)",
  "documentVersion": "1.0",
  "executiveSummary": "High-level summary of the document and project business objectives",
  "businessProblem": "Detailed description of the core business problem being addressed",
  "businessObjectives": [ "Objective 1", "Objective 2" ],
  "scope": {
    "inScope": [ "In-scope feature or operational area 1" ],
    "outOfScope": [ "Out-of-scope feature or operational area 1" ]
  },
  "stakeholders": [
    { "role": "Stakeholder Role", "description": "Key interest and responsibility" }
  ],
  "targetUsers": [
    { "persona": "User Persona / Role Name", "description": "Needs and usage context" }
  ],
  "businessRequirements": [
    {
      "id": "BR-001",
      "title": "Business Requirement Title",
      "description": "Clear statement of business requirement",
      "priority": "must-have | should-have | could-have | wont-have",
      "rationale": "Business justification for this requirement"
    }
  ],
  "functionalOverview": [
    {
      "id": "FO-001",
      "category": "Functional Area Name",
      "description": "High-level functional overview description"
    }
  ],
  "nonFunctionalOverview": [
    {
      "id": "NFO-001",
      "category": "Performance | Security | Usability | Reliability | General",
      "description": "High-level non-functional overview description"
    }
  ],
  "businessRules": [ "Business rule or governance policy 1" ],
  "assumptions": [ "Operational or business assumption 1" ],
  "constraints": [ "Constraint 1" ],
  "risks": [
    {
      "id": "R-001",
      "risk": "Risk description",
      "impact": "low | medium | high",
      "mitigation": "Mitigation strategy"
    }
  ],
  "successCriteria": [ "Measurable success criterion 1" ],
  "dependencies": [ "Dependency 1" ],
  "openQuestions": [ "Unresolved business question 1" ]
}`;
};


