/**
 * requirementAnalysis.prompt.js
 *
 * System prompt and prompt builder for analyzing project requirements.
 */

export const SYSTEM_INSTRUCTION = `You are a Senior Software System Architect and Requirements Analyst.
Your task is to analyze raw software project requirements and extract a clean, structured breakdown of the system.

RULES:
1. Extract information ONLY from the provided requirement text and project context.
2. Do NOT invent or hallucinate features, documents (BRD/SRS), API specifications, or database schemas — those belong to future steps.
3. Clearly distinguish between explicit functional requirements, non-functional requirements, business goals, actors/roles, domain entities, constraints, assumptions, ambiguities, risks, and technology hints.
4. Output MUST be strictly valid JSON conforming to the requested JSON schema. Do not include markdown formatting or extra commentary outside the JSON object.`;

export const buildRequirementAnalysisPrompt = (requirementsText, projectInfo = {}) => {
  const projectTitle = projectInfo.title ? `Project Title: ${projectInfo.title}` : '';
  const projectDescription = projectInfo.description ? `Project Description: ${projectInfo.description}` : '';

  return `Please analyze the following software project requirements and provide a structured JSON analysis.

${projectTitle}
${projectDescription}

SOURCE REQUIREMENTS:
"""
${requirementsText}
"""

Return a JSON object with the following exact keys:
{
  "summary": "Concise high-level summary of the software project requirements",
  "complexity": "low | medium | high",
  "actors": [
    { "id": "ACT-001", "name": "Actor/User Role Name", "description": "Role description and responsibilities" }
  ],
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "Short title",
      "description": "Detailed description of what the system must do",
      "actor": "Primary actor name or System",
      "priority": "must-have | should-have | could-have | wont-have",
      "sourceRequirementId": "Reference ID if identifiable, else empty string"
    }
  ],
  "nonFunctionalRequirements": [
    {
      "id": "NFR-001",
      "title": "Short title",
      "description": "Performance, security, availability, or quality attribute requirement",
      "category": "Performance | Security | Availability | Usability | Reliability | General",
      "priority": "must-have | should-have | could-have | wont-have",
      "sourceRequirementId": "Reference ID if identifiable, else empty string"
    }
  ],
  "businessGoals": [ "Core business objectives or targets" ],
  "entities": [
    { "name": "Domain Entity Name (e.g. Student, Application, Job)", "description": "Brief description of the entity" }
  ],
  "userFlows": [
    { "name": "Flow Name (e.g. Apply for Job)", "steps": ["Step 1...", "Step 2..."] }
  ],
  "constraints": [ "Technical, operational, or legal constraints" ],
  "assumptions": [ "Assumptions made in the requirements" ],
  "ambiguities": [ "Unclear or ambiguous points needing clarification" ],
  "risks": [ "Identified technical or project risks" ],
  "technologyHints": [ "Mentioned or suggested technologies/frameworks" ]
}`;
};
