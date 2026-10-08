/**
 * refinement.prompt.js
 *
 * System instruction and prompt builder for AI document refinement.
 * The LLM receives: the current full document + a user instruction,
 * and must return the complete updated document in the same JSON schema.
 *
 * The response is validated against the same Zod schemas used for generation.
 */

// ─── System instruction ──────────────────────────────────────────────────────

export const REFINEMENT_SYSTEM_INSTRUCTION = `You are an expert document editor for BlueprintAI.
You receive a structured document (JSON) and a user instruction asking you to modify it.

YOUR TASK:
1. Read the current document carefully.
2. Apply ONLY the changes requested by the user instruction.
3. Preserve ALL other fields exactly as they are — do not regenerate, rephrase, or restructure anything that was not asked to change.
4. Return the COMPLETE updated document as a JSON object (same schema as the input).
5. Also return a brief human-readable "message" explaining what you changed.

OUTPUT FORMAT (strict JSON, no markdown, no code fences):
{
  "message": "One or two sentences describing exactly what was changed.",
  "updatedContent": ...complete updated document in the same schema/format as the input...
}

RULES:
- Do NOT invent new fields or remove existing fields unless explicitly asked.
- Do NOT change IDs (e.g., BR-001, EP-001, US-001) unless the user asks.
- If the instruction is ambiguous, make the smallest reasonable change and explain it in "message".
- If you cannot make the change (unsupported or dangerous), set updatedContent to null and explain in "message".
- Output MUST be strictly valid JSON with no surrounding text.`;

// ─── Per-document-type schema hints ──────────────────────────────────────────

const SCHEMA_HINTS = {
  BRD: `The document follows the BRD schema:
{ title, documentVersion, executiveSummary, businessProblem, businessObjectives[], scope{inScope[],outOfScope[]}, stakeholders[{role,description}], targetUsers[{persona,description}], businessRequirements[{id,title,description,priority,rationale}], functionalOverview[{id,category,description}], nonFunctionalOverview[{id,category,description}], businessRules[], assumptions[], constraints[], risks[{id,risk,impact,mitigation}], successCriteria[], dependencies[], openQuestions[] }`,

  SRS: `The document follows the SRS schema:
{ title, documentVersion, systemOverview, userRoles[{roleName,description,permissions[]}], functionalRequirements[{id,category,title,description,priority}], nonFunctionalRequirements[{category,requirement,metric}], systemFeatures[{featureName,description,inputs[],outputs[]}], externalInterfaces[{interfaceType,description,protocolOrFormat}], securityRequirements[], performanceRequirements[], systemConstraints[], assumptionsAndDependencies[], acceptanceCriteria[] }`,

  UserStories: `The document follows the User Stories schema:
{ title, documentVersion, projectSummary, epics[{epicId,epicName,description,stories[{storyId,role,goal,benefit,priority,storyPoints,acceptanceCriteria[],notes[]}]}], totalStories, prioritySummary{mustHave,shouldHave,couldHave,wontHave} }`,

  APISpec: `The document follows the REST API Spec schema:
{ title, version, baseUrl, description, authSchemes[], resourceGroups[{groupName,description,endpoints[{endpointId,method,path,summary,description,authentication,parameters[],requestBody,responses[{statusCode,description,schema}]}]}], totalEndpoints, globalErrors[] }`,

  DBSchema: `The document follows the Database Schema schema:
{ title, databaseType, strategy, description, entities[{name,purpose,fields[{name,type,required,isPrimaryKey,unique,defaultValue,enumValues[],description}],indexes[{name,fields[],unique,type}],relationships[{targetEntity,type,foreignKey,description}]}], mermaidDiagram }`,
};

// ─── Prompt builder ───────────────────────────────────────────────────────────

/**
 * Builds the refinement prompt for a given document type and user instruction.
 *
 * @param {string} docType        - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @param {object} currentContent - The full parsed document JSON (from Document.content)
 * @param {string} instruction    - The user's natural-language modification request
 * @param {object} projectInfo    - { title, description } for context
 * @returns {string}              - The assembled user prompt
 */
export const buildRefinementPrompt = (docType, currentContent, instruction, projectInfo = {}) => {
  const schemaHint = SCHEMA_HINTS[docType] || '';
  const projectContext = [
    projectInfo.title ? `Project: ${projectInfo.title}` : '',
    projectInfo.description ? `Description: ${projectInfo.description}` : '',
  ].filter(Boolean).join('\n');

  return `You are refining a ${docType} document for a software project.

${projectContext ? `PROJECT CONTEXT:\n${projectContext}\n` : ''}
DOCUMENT SCHEMA:
${schemaHint}

CURRENT DOCUMENT (full JSON):
"""
${JSON.stringify(currentContent, null, 2)}
"""

USER INSTRUCTION:
"${instruction}"

Apply ONLY the change described in the instruction. Return the complete updated document in the same schema/format as CURRENT DOCUMENT.

Respond with exactly this JSON structure:
{
  "message": "Brief explanation of what was changed",
  "updatedContent": ...complete updated document in the same format/structure as CURRENT DOCUMENT...
}`;
};
