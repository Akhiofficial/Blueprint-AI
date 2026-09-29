/**
 * database.prompt.js
 *
 * Prompt template and system instruction for Database Schema generation.
 * Consumes prerequisite SRS output and project context.
 */

export const SYSTEM_INSTRUCTION = `You are a Principal Database Architect and Data Modeler.
Your task is to generate a comprehensive, structured Database Schema design based on the provided Software Requirements Specification (SRS) and project context.

Follow these strict output rules:
1. Respond with VALID RAW JSON ONLY. No markdown wrapping (no \`\`\`json), no introductory text, no conversational text.
2. The JSON output MUST strictly conform to the expected Database Schema structure.
3. Derive entities/tables directly from the project's actual functional requirements and domain model. Do NOT invent unrelated entities.
4. Define realistic, practical field types, constraints (required, unique, primaryKey), default values, and foreign keys.
5. Provide a valid Mermaid erDiagram code string in "mermaidDiagram" representing the entity relationships.
6. Choose the most appropriate database type/strategy (e.g., PostgreSQL for relational data, MongoDB for document storage, etc.) based on the project requirements.`;

/**
 * Builds the complete database schema prompt using SRS output and project metadata.
 *
 * @param {Object} srsOutput - Prerequisite SRS output object
 * @param {Object} [projectInfo] - Optional project metadata ({ title, description })
 * @returns {string} Fully assembled user prompt
 */
export const buildDatabasePrompt = (srsOutput, projectInfo = {}) => {
  const projectTitle = projectInfo.title || srsOutput.title || 'Software Application';
  const projectDescription = projectInfo.description || srsOutput.systemOverview || '';

  return `Generate a comprehensive Database Schema design for the following project:

PROJECT METADATA:
- Title: ${projectTitle}
- Description: ${projectDescription}

PREREQUISITE SRS CONTEXT:
"""
${JSON.stringify(srsOutput, null, 2)}
"""

Please derive and generate the complete Database Schema JSON strictly adhering to this structure:
{
  "title": "Database Schema — ${projectTitle}",
  "databaseType": "PostgreSQL", // or appropriate DB technology: PostgreSQL, MongoDB, MySQL, etc.
  "strategy": "Relational",    // "Relational", "Document", or "Hybrid"
  "description": "Architectural summary of the data layer, storage choices, and modeling strategy.",
  "entities": [
    {
      "name": "users", // table/collection name in snake_case or lowercase
      "purpose": "Stores registered user accounts and authentication credentials",
      "fields": [
        {
          "name": "id",
          "type": "UUID",
          "required": true,
          "isPrimaryKey": true,
          "unique": true,
          "defaultValue": "gen_random_uuid()",
          "enumValues": [],
          "description": "Unique identifier for the user"
        },
        {
          "name": "role",
          "type": "VARCHAR(50)",
          "required": true,
          "isPrimaryKey": false,
          "unique": false,
          "defaultValue": "student",
          "enumValues": ["student", "recruiter", "admin"],
          "description": "System access level"
        }
      ],
      "indexes": [
        {
          "name": "idx_users_email",
          "fields": ["email"],
          "unique": true,
          "type": "BTREE"
        }
      ],
      "relationships": [
        {
          "targetEntity": "applications",
          "type": "1:N",
          "foreignKey": "applicant_id",
          "description": "One user can submit multiple applications"
        }
      ]
    }
  ],
  "mermaidDiagram": "erDiagram\\n    USERS ||--o{ APPLICATIONS : submits\\n    JOBS ||--o{ APPLICATIONS : receives"
}

Ensure all functional domain entities in the SRS are fully represented with appropriate keys, relationships, and constraints. Return valid raw JSON only.`;
};
