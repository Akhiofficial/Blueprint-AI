/**
 * api.prompt.js
 *
 * Prompt template and system instruction for REST API Specification generation.
 * Consumes prerequisite SRS output and project context.
 */

export const SYSTEM_INSTRUCTION = `You are a Senior Backend Engineer and API Architect.
Your task is to generate a comprehensive, structured REST API specification based on the provided Software Requirements Specification (SRS) and project context.

Follow these strict output rules:
1. Respond with VALID RAW JSON ONLY. No markdown wrapping (no \`\`\`json), no introductory text, no postscripts.
2. The JSON output MUST strictly conform to the expected API specification schema structure.
3. Define all endpoints required to fulfil the functional requirements in the SRS.
4. Use standard HTTP methods: GET, POST, PUT, PATCH, DELETE.
5. Group endpoints by resource/domain (e.g., Auth, Users, Projects).
6. Every endpoint MUST include request details and at least one success and one error response.
7. Authentication must be specified as: "Bearer Token", "API Key", "None", or "Session".
8. HTTP methods must be uppercase: GET, POST, PUT, PATCH, DELETE.
9. Parameter location must be one of: "path", "query", "header", "body".`;

/**
 * Builds the complete API specification prompt using SRS output and project metadata.
 *
 * @param {Object} srsOutput - Prerequisite SRS output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @returns {string} Fully assembled user prompt
 */
export const buildApiPrompt = (srsOutput, projectInfo = {}) => {
  const projectTitle = projectInfo.title || srsOutput.title || 'Software Application';
  const projectDescription = projectInfo.description || srsOutput.systemOverview || '';

  return `Generate a comprehensive REST API Specification for the following project:

PROJECT METADATA:
- Title: ${projectTitle}
- Description: ${projectDescription}

PREREQUISITE SRS CONTEXT:
"""
${JSON.stringify(srsOutput, null, 2)}
"""

Please derive and generate the complete API Specification JSON including:
1. title: "REST API Specification — ${projectTitle}"
2. version: "v1.0"
3. baseUrl: "/api/v1" (or appropriate base path)
4. description: A short summary of the API's purpose.
5. authSchemes: Array of authentication schemes used (e.g., ["Bearer Token"]).
6. resourceGroups: Array of resource groups. Each group has:
   - groupName (e.g., "Authentication", "Users", "Projects")
   - description (what this group of endpoints covers)
   - endpoints: Array of endpoint definitions. Each endpoint has:
       - endpointId (e.g., EP-001, globally sequential across all groups)
       - method (uppercase: GET, POST, PUT, PATCH, DELETE)
       - path (e.g., "/auth/login", "/users/:id")
       - summary (short description of what this endpoint does)
       - description (detailed description)
       - authentication (one of: "Bearer Token", "API Key", "None", "Session")
       - parameters: Array of parameters, each with:
           - name (parameter name)
           - in (one of: "path", "query", "header", "body")
           - required (boolean)
           - type (e.g., "string", "number", "boolean", "object", "array")
           - description
       - requestBody: Object or null. If present:
           - contentType (e.g., "application/json")
           - schema: Object with field names as keys and { type, required, description } as values
       - responses: Array of response definitions, each with:
           - statusCode (number, e.g., 200, 201, 400, 401, 404, 500)
           - description (what this response means)
           - schema: Brief description of response body structure (string)
7. totalEndpoints: Total count of all endpoints across all resource groups.
8. globalErrors: Array of error responses common across all endpoints
   (e.g., 401 Unauthorized, 403 Forbidden, 500 Internal Server Error).
   Each has: statusCode, description.

Return valid raw JSON strictly matching the API Specification schema structure.`;
};
