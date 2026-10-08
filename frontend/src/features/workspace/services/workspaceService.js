/**
 * workspaceService.js
 *
 * Blueprint Workspace Data Layer.
 * Handles API communication with the backend generation engine for all 5 core document types:
 *   1. BRD (Business Requirement Document)
 *   2. SRS (Software Requirement Specification)
 *   3. User Stories (Structured Story Cards)
 *   4. REST API (API Design Specification)
 *   5. Database (Schema & Entity Diagram)
 *
 * Provides typed document transformers to adapt structured backend JSON output into the formats
 * expected by specialized viewer components (ProseDocumentView, UserStoryView, ApiDocumentView, DatabaseView).
 */

import api from '../../../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Blueprint document list (sidebar navigation order)
// ─────────────────────────────────────────────────────────────────────────────

export const BLUEPRINT_DOCS = [
  { id: 'BRD',         num: '01', label: 'BRD',           subtitle: 'Business Requirement Document' },
  { id: 'SRS',         num: '02', label: 'SRS',           subtitle: 'Software Requirement Specification' },
  { id: 'UserStories', num: '03', label: 'User Stories',  subtitle: 'Structured Story Cards' },
  { id: 'APISpec',     num: '04', label: 'REST API',      subtitle: 'API Design Specification' },
  { id: 'DBSchema',    num: '05', label: 'Database',      subtitle: 'Schema & Entity Diagram' },
];

export const DOC_TYPE_MAP = {
  BRD: 'brd',
  SRS: 'srs',
  UserStories: 'user-stories',
  APISpec: 'api',
  DBSchema: 'database',
};

// ─────────────────────────────────────────────────────────────────────────────
// Document Output Normalizers / Transformers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Maps the flat BRD API response into the sections[] format used by ProseDocumentView.
 */
export const normalizeBRDToSections = (brd) => {
  const s = [];
  if (brd.executiveSummary) s.push({ id: 'brd-exec-summary', title: 'Executive Summary', content: brd.executiveSummary });
  if (brd.businessProblem) s.push({ id: 'brd-business-problem', title: 'Business Problem', content: brd.businessProblem });
  if (brd.businessObjectives?.length) s.push({ id: 'brd-objectives', title: 'Business Objectives', items: brd.businessObjectives });
  if (brd.scope?.inScope?.length || brd.scope?.outOfScope?.length) {
    const items = [
      ...(brd.scope.inScope ?? []).map(i => `✓  ${i}`),
      ...(brd.scope.outOfScope ?? []).map(i => `✗  ${i}`),
    ];
    if (items.length) s.push({ id: 'brd-scope', title: 'Scope', items });
  }
  if (brd.stakeholders?.length) s.push({ id: 'brd-stakeholders', title: 'Stakeholders', table: { headers: ['Role', 'Description'], rows: brd.stakeholders.map(x => [x.role, x.description]) } });
  if (brd.targetUsers?.length) s.push({ id: 'brd-target-users', title: 'Target Users', table: { headers: ['Persona', 'Description'], rows: brd.targetUsers.map(x => [x.persona, x.description]) } });
  if (brd.businessRequirements?.length) s.push({ id: 'brd-requirements', title: 'Business Requirements', table: { headers: ['ID', 'Title', 'Priority', 'Description'], rows: brd.businessRequirements.map(x => [x.id || '—', x.title, x.priority, x.description]) } });
  if (brd.functionalOverview?.length) s.push({ id: 'brd-functional', title: 'Functional Overview', table: { headers: ['Category', 'Description'], rows: brd.functionalOverview.map(x => [x.category, x.description]) } });
  if (brd.nonFunctionalOverview?.length) s.push({ id: 'brd-nonfunctional', title: 'Non-Functional Overview', table: { headers: ['Category', 'Description'], rows: brd.nonFunctionalOverview.map(x => [x.category, x.description]) } });
  if (brd.businessRules?.length) s.push({ id: 'brd-rules', title: 'Business Rules', items: brd.businessRules });
  if (brd.assumptions?.length) s.push({ id: 'brd-assumptions', title: 'Assumptions', items: brd.assumptions });
  if (brd.constraints?.length) s.push({ id: 'brd-constraints', title: 'Constraints', items: brd.constraints });
  if (brd.risks?.length) s.push({ id: 'brd-risks', title: 'Risks', table: { headers: ['Risk', 'Impact', 'Mitigation'], rows: brd.risks.map(x => [x.risk, x.impact, x.mitigation || '—']) } });
  if (brd.successCriteria?.length) s.push({ id: 'brd-success', title: 'Success Criteria', items: brd.successCriteria });
  if (brd.dependencies?.length) s.push({ id: 'brd-dependencies', title: 'Dependencies', items: brd.dependencies });
  if (brd.openQuestions?.length) s.push({ id: 'brd-open-questions', title: 'Open Questions', items: brd.openQuestions });
  return s;
};

/**
 * Maps the structured SRS API response into the sections[] format used by ProseDocumentView.
 */
export const normalizeSRSToSections = (srs) => {
  const s = [];
  if (srs.systemOverview) {
    s.push({ id: 'srs-overview', title: '1. System Overview', content: srs.systemOverview });
  }
  if (srs.userRoles?.length) {
    s.push({
      id: 'srs-roles',
      title: '2. User Roles & Permissions',
      table: {
        headers: ['Role', 'Description', 'Permissions'],
        rows: srs.userRoles.map(r => [
          r.roleName,
          r.description,
          Array.isArray(r.permissions) ? r.permissions.join(', ') : (r.permissions || '—')
        ])
      }
    });
  }
  if (srs.functionalRequirements?.length) {
    s.push({
      id: 'srs-functional',
      title: '3. Functional Requirements',
      table: {
        headers: ['ID', 'Category', 'Title', 'Priority', 'Description'],
        rows: srs.functionalRequirements.map(f => [
          f.id || '—',
          f.category || '—',
          f.title || '—',
          f.priority || 'High',
          f.description || '—'
        ])
      }
    });
  }
  if (srs.nonFunctionalRequirements?.length) {
    s.push({
      id: 'srs-nonfunctional',
      title: '4. Non-Functional Requirements',
      table: {
        headers: ['Category', 'Requirement', 'Metric / SLA'],
        rows: srs.nonFunctionalRequirements.map(n => [
          n.category || '—',
          n.requirement || '—',
          n.metric || 'Target SLA'
        ])
      }
    });
  }
  if (srs.systemFeatures?.length) {
    s.push({
      id: 'srs-features',
      title: '5. System Features',
      table: {
        headers: ['Feature', 'Description', 'Inputs', 'Outputs'],
        rows: srs.systemFeatures.map(sf => [
          sf.featureName || '—',
          sf.description || '—',
          Array.isArray(sf.inputs) ? sf.inputs.join(', ') : (sf.inputs || '—'),
          Array.isArray(sf.outputs) ? sf.outputs.join(', ') : (sf.outputs || '—')
        ])
      }
    });
  }
  if (srs.externalInterfaces?.length) {
    s.push({
      id: 'srs-interfaces',
      title: '6. External Interfaces',
      table: {
        headers: ['Interface Type', 'Protocol / Format', 'Description'],
        rows: srs.externalInterfaces.map(ei => [
          ei.interfaceType || '—',
          ei.protocolOrFormat || 'REST/JSON',
          ei.description || '—'
        ])
      }
    });
  }
  if (srs.securityRequirements?.length) {
    s.push({ id: 'srs-security', title: '7. Security Requirements', items: srs.securityRequirements });
  }
  if (srs.performanceRequirements?.length) {
    s.push({ id: 'srs-performance', title: '8. Performance Requirements', items: srs.performanceRequirements });
  }
  if (srs.systemConstraints?.length) {
    s.push({ id: 'srs-constraints', title: '9. System Constraints', items: srs.systemConstraints });
  }
  if (srs.assumptionsAndDependencies?.length) {
    s.push({ id: 'srs-assumptions', title: '10. Assumptions & Dependencies', items: srs.assumptionsAndDependencies });
  }
  if (srs.acceptanceCriteria?.length) {
    s.push({ id: 'srs-acceptance', title: '11. Acceptance Criteria', items: srs.acceptanceCriteria });
  }
  return s;
};

/**
 * Maps the structured User Stories API response into the stories[] format used by UserStoryView.
 */
export const normalizeUserStories = (raw, updatedAt) => {
  const stories = [];
  (raw.epics || []).forEach(epic => {
    (epic.stories || []).forEach(s => {
      stories.push({
        id: s.storyId || s.id,
        title: `${epic.epicName} — ${s.goal || s.want || 'Story'}`,
        role: s.role,
        want: s.goal || s.want || '',
        benefit: s.benefit || '',
        actor: s.role || 'User',
        priority: s.priority || 'Medium',
        acceptanceCriteria: s.acceptanceCriteria || [],
      });
    });
  });

  return {
    type: 'UserStories',
    title: raw.title || 'User Stories',
    status: 'ready',
    currentVersion: 1,
    updatedAt: updatedAt || new Date().toISOString(),
    stories,
  };
};

/**
 * Maps the structured REST API Design response into the endpoints[] format used by ApiDocumentView.
 */
export const normalizeApiSpec = (raw, updatedAt) => {
  const endpoints = [];
  (raw.resourceGroups || []).forEach(group => {
    (group.endpoints || []).forEach(ep => {
      const queryParams = {};
      (ep.parameters || []).filter(p => p.in === 'query').forEach(p => {
        queryParams[p.name] = `${p.type || 'string'}${p.required ? ' (required)' : ''}${p.description ? `: ${p.description}` : ''}`;
      });

      endpoints.push({
        id: ep.endpointId || ep.id,
        group: group.groupName || 'General',
        method: ep.method || 'GET',
        path: ep.path,
        title: ep.summary || ep.title || '',
        description: ep.description || ep.summary || '',
        auth: ep.authentication && ep.authentication !== 'None',
        queryParams: Object.keys(queryParams).length ? queryParams : null,
        requestBody: ep.requestBody?.schema || null,
        response: (ep.responses || []).reduce((acc, r) => {
          acc[r.statusCode] = r.description + (r.schema ? ` (${r.schema})` : '');
          return acc;
        }, {}),
      });
    });
  });

  return {
    type: 'APISpec',
    title: raw.title || 'REST API Design',
    status: 'ready',
    currentVersion: 1,
    updatedAt: updatedAt || new Date().toISOString(),
    baseUrl: raw.baseUrl || '/api/v1',
    endpoints,
  };
};

/**
 * Maps the structured Database Schema response into the format used by DatabaseView.
 */
export const normalizeDBSchema = (raw, updatedAt) => {
  const entities = (raw.entities || []).map(e => ({
    id: `ent-${e.name}`,
    name: e.name,
    description: e.purpose || e.description || '',
    fields: (e.fields || []).map(f => ({
      name: f.name,
      type: f.type,
      constraint: [
        f.isPrimaryKey ? 'PK' : '',
        f.unique ? 'Unique' : '',
        f.required ? 'Required' : '',
        f.defaultValue !== null && f.defaultValue !== undefined ? `Default: ${f.defaultValue}` : ''
      ].filter(Boolean).join(', ') || '—',
    })),
    relations: (e.relationships || []).map(r => `${r.type || '1:N'} → ${r.targetEntity}${r.foreignKey ? ` (${r.foreignKey})` : ''}`),
  }));

  return {
    type: 'DBSchema',
    title: raw.title || 'Database Schema',
    status: 'ready',
    currentVersion: 1,
    updatedAt: updatedAt || new Date().toISOString(),
    entities,
    sqlCode: raw.mermaidDiagram || '',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API Methods
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Reconstruct a viewable document object from any content shape (raw AI or edited sections/arrays).
 *
 * @param {string} docType   - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @param {*}      content   - Raw JSON, parsed array, or structured document content
 * @param {object} docMeta   - Document metadata ({ title, status, currentVersion, updatedAt, projectId })
 * @returns {object}         - Reconstructed document ready for DocRenderer
 */
export const normalizeDocumentContent = (docType, content, docMeta = {}) => {
  if (!content) return null;

  const isArray = Array.isArray(content);
  const updatedAt = docMeta.updatedAt || new Date().toISOString();
  const currentVersion = docMeta.currentVersion || 1;
  const status = docMeta.status || 'ready';
  const projectId = docMeta.projectId;

  switch (docType) {
    case 'BRD': {
      let sections = [];
      if (isArray) {
        sections = content;
      } else if (content.sections && Array.isArray(content.sections)) {
        sections = content.sections;
      } else if (content.executiveSummary || content.businessProblem || content.businessObjectives) {
        sections = normalizeBRDToSections(content);
      }
      return {
        type: 'BRD',
        title: docMeta.title || content.title || 'Business Requirements Document',
        status,
        currentVersion,
        updatedAt,
        sections,
        projectId,
      };
    }

    case 'SRS': {
      let sections = [];
      if (isArray) {
        sections = content;
      } else if (content.sections && Array.isArray(content.sections)) {
        sections = content.sections;
      } else if (content.systemOverview || content.functionalRequirements || content.userRoles) {
        sections = normalizeSRSToSections(content);
      }
      return {
        type: 'SRS',
        title: docMeta.title || content.title || 'Software Requirements Specification',
        status,
        currentVersion,
        updatedAt,
        sections,
        projectId,
      };
    }

    case 'UserStories': {
      if (content.epics && Array.isArray(content.epics)) {
        return normalizeUserStories(content, updatedAt);
      }
      const stories = isArray ? content : (content.stories || []);
      return {
        type: 'UserStories',
        title: docMeta.title || content.title || 'User Stories',
        status,
        currentVersion,
        updatedAt,
        stories,
        projectId,
      };
    }

    case 'APISpec': {
      if (content.resourceGroups && Array.isArray(content.resourceGroups)) {
        return normalizeApiSpec(content, updatedAt);
      }
      const endpoints = isArray ? content : (content.endpoints || []);
      return {
        type: 'APISpec',
        title: docMeta.title || content.title || 'REST API Design',
        status,
        currentVersion,
        updatedAt,
        baseUrl: content.baseUrl || '/api/v1',
        endpoints,
        projectId,
      };
    }

    case 'DBSchema': {
      if (content.entities && Array.isArray(content.entities) && content.entities.some(e => e.purpose || e.relationships)) {
        return normalizeDBSchema(content, updatedAt);
      }
      const entities = isArray ? content : (content.entities || []);
      return {
        type: 'DBSchema',
        title: docMeta.title || content.title || 'Database Schema',
        status,
        currentVersion,
        updatedAt,
        entities,
        sqlCode: content.sqlCode || content.mermaidDiagram || '',
        projectId,
      };
    }

    default:
      return {
        type: docType,
        title: docMeta.title || docType,
        status,
        currentVersion,
        updatedAt,
        content,
        projectId,
      };
  }
};

/**
 * Fetch the status of all 5 blueprint documents for a project.
 * Checks the Document collection first, falling back to generations.
 *
 * @param {string} projectId
 * @returns {Promise<Object>} Map of docType → { status: 'ready' | 'not_generated', currentVersion: number }
 */
export const fetchDocumentStatuses = async (projectId) => {
  const statuses = {};
  const docTypes = Object.entries(DOC_TYPE_MAP);

  // 1. First try to load all saved Documents for the project
  try {
    const docRes = await api.get(`/api/projects/${projectId}/documents`);
    const docList = docRes.data?.data || [];
    docList.forEach(doc => {
      // Map Document.type enum back to frontend ID
      const frontendId = Object.keys(DOC_TYPE_MAP).find(k => k.toUpperCase() === (doc.type || '').toUpperCase()) || doc.type;
      if (frontendId) {
        statuses[frontendId] = {
          status: doc.status || 'ready',
          currentVersion: doc.currentVersion || 1,
        };
      }
    });
  } catch {
    // Ignore error and proceed to generation check
  }

  // 2. For any docType not found in Document collection, check Generation
  const missingDocTypes = docTypes.filter(([frontendId]) => !statuses[frontendId]);

  if (missingDocTypes.length > 0) {
    const results = await Promise.allSettled(
      missingDocTypes.map(async ([frontendId, backendType]) => {
        try {
          const response = await api.get(`/api/projects/${projectId}/generations/${backendType}`);
          const data = response.data?.data;
          if (data) {
            return { frontendId, status: 'ready', currentVersion: 1 };
          }
          return { frontendId, status: 'not_generated', currentVersion: 0 };
        } catch {
          return { frontendId, status: 'not_generated', currentVersion: 0 };
        }
      })
    );

    results.forEach(res => {
      if (res.status === 'fulfilled' && res.value) {
        statuses[res.value.frontendId] = {
          status: res.value.status,
          currentVersion: res.value.currentVersion,
        };
      }
    });
  }

  return statuses;
};

/**
 * Fetch a single blueprint document and normalize it for the specialized viewer.
 * Checks Document collection first (persisted edits / versions), then falls back to Generation.
 *
 * @param {string} projectId
 * @param {string} docType - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @returns {Promise<Object>} Structured document data
 */
export const fetchDocument = async (projectId, docType) => {
  const backendType = DOC_TYPE_MAP[docType];
  if (!backendType) {
    throw new Error(`Unsupported document type: ${docType}`);
  }

  const docTypeEnum = {
    BRD:        'BRD',
    SRS:        'SRS',
    UserStories:'UserStories',
    APISpec:    'APISpec',
    DBSchema:   'DBSchema',
  }[docType] || docType;

  // 1. Try to fetch from Document API first (contains latest manual edits & version)
  try {
    const docResponse = await api.get(`/api/projects/${projectId}/documents/${docTypeEnum}`);
    const docData = docResponse.data?.data;
    if (docData && docData.content) {
      const normalized = normalizeDocumentContent(docType, docData.content, {
        title: docData.title,
        status: docData.status,
        currentVersion: docData.currentVersion,
        updatedAt: docData.updatedAt,
        projectId,
      });
      if (normalized) return normalized;
    }
  } catch (err) {
    // If not a 404, log but proceed to generation fallback
  }

  // 2. Fallback to Generation API
  try {
    const genResponse = await api.get(`/api/projects/${projectId}/generations/${backendType}`);
    const rawData = genResponse.data?.data;
    if (!rawData) throw new Error('NOT_GENERATED');

    const updatedAt = genResponse.data.updatedAt;

    return normalizeDocumentContent(docType, rawData, {
      title: rawData.title,
      status: 'ready',
      currentVersion: 1,
      updatedAt,
      projectId,
    });
  } catch (err) {
    const is404 = err?.status === 404 || err?.response?.status === 404;
    const isNotGenMsg = typeof err?.message === 'string' && (
      err.message === 'NOT_GENERATED' ||
      err.message.includes('No completed') ||
      err.message.includes('not found')
    );

    if (is404 || isNotGenMsg) {
      const notGenErr = new Error('NOT_GENERATED');
      notGenErr.isNotGenerated = true;
      throw notGenErr;
    }
    throw err;
  }
};

/**
 * Trigger generation for any of the 5 supported document types.
 *
 * @param {string} projectId
 * @param {string} docType - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @returns {Promise<Object>} { success, generationId, data, generationType }
 */
export const generateDocument = async (projectId, docType) => {
  const backendType = DOC_TYPE_MAP[docType];
  if (!backendType) {
    throw new Error(`Unsupported document type: ${docType}`);
  }

  const response = await api.post(`/api/projects/${projectId}/generations/${backendType}`);
  return response.data;
};

/**
 * Backward compatibility alias for BRD generation.
 */
export const generateBRD = async (projectId) => {
  return generateDocument(projectId, 'BRD');
};

/**
 * Save edited document content to the backend and create a new version.
 *
 * @param {string} projectId
 * @param {string} docType - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @param {object} content - The updated structured content object
 * @returns {Promise<Object>} Updated document metadata
 */
export const saveDocument = async (projectId, docType, content) => {
  const docTypeEnum = {
    BRD:        'BRD',
    SRS:        'SRS',
    UserStories:'UserStories',
    APISpec:    'APISpec',
    DBSchema:   'DBSchema',
  }[docType] || docType;

  const response = await api.put(
    `/api/projects/${projectId}/documents/${docTypeEnum}`,
    { content }
  );
  return response.data;
};

/**
 * Restore a document to a previous version snapshot.
 *
 * @param {string} projectId
 * @param {string} docType - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @param {number} versionNumber - Version number to restore
 * @returns {Promise<Object>} Restored document data
 */
export const restoreDocumentVersion = async (projectId, docType, versionNumber) => {
  const docTypeEnum = {
    BRD:        'BRD',
    SRS:        'SRS',
    UserStories:'UserStories',
    APISpec:    'APISpec',
    DBSchema:   'DBSchema',
  }[docType] || docType;

  const response = await api.put(
    `/api/projects/${projectId}/documents/${docTypeEnum}/restore/${versionNumber}`
  );
  return response.data;
};

/**
 * Fetch real version history for a document from the backend.
 *
 * @param {string} docId - Frontend doc ID like 'BRD', 'SRS', etc.
 * @param {string} projectId - MongoDB project ID (must be passed from context)
 * @returns {Promise<Array>} Ordered version history (newest first)
 */
export const fetchVersionHistory = async (docId, projectId) => {
  if (!projectId) return [];

  // Map frontend docId → Document.type enum
  const docTypeEnum = {
    BRD:        'BRD',
    SRS:        'SRS',
    UserStories:'UserStories',
    APISpec:    'APISpec',
    DBSchema:   'DBSchema',
  }[docId] || docId;

  try {
    const response = await api.get(
      `/api/projects/${projectId}/documents/${docTypeEnum}/versions`
    );
    return response.data?.data || [];
  } catch {
    return [];
  }
};

/**
 * Reconstruct a viewable document object from a stored version's content blob.
 *
 * @param {string} docType   - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @param {*}      content   - Parsed content from DocumentVersion.content
 * @param {object} baseDoc   - The current document (for title/type metadata)
 * @returns {object}         - Reconstructed document ready for DocRenderer
 */
export const normalizeVersionContent = (docType, content, baseDoc) => {
  if (!content) return baseDoc;

  const reconstructed = normalizeDocumentContent(docType, content, {
    title: baseDoc?.title,
    status: baseDoc?.status || 'ready',
    currentVersion: baseDoc?.currentVersion || 1,
    updatedAt: baseDoc?.updatedAt,
    projectId: baseDoc?.projectId,
  });

  return reconstructed || baseDoc;
};

/**
 * Fetch initial chat message for a document (session-local welcome message).
 * No backend call — chat history is session-local only.
 * Resets when the user switches documents (called with new activeDocId).
 */
export const fetchDocumentChat = async (_projectId, _docType) => {
  return [
    {
      id: 'welcome',
      role: 'assistant',
      content: 'I can help you refine this document. Describe what you\'d like to change and I\'ll update the local draft. You\'ll still need to Save manually.',
    },
  ];
};

/**
 * Refine a document with an AI instruction.
 * Calls the backend refinement API which proposes changes WITHOUT persisting.
 * The frontend applies the result to the LOCAL DRAFT only.
 * The user must explicitly Save to persist.
 *
 * @param {string} projectId    - MongoDB project ID
 * @param {string} docType      - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @param {string} instruction  - User\'s natural-language instruction
 * @returns {Promise<{ message: string, updatedContent: object }>}
 */
export const refineDocument = async (projectId, docType, instruction) => {
  const response = await api.post(
    `/api/projects/${projectId}/documents/${docType}/refine`,
    { instruction }
  );
  const { message, updatedContent } = response.data;
  return { message, updatedContent };
};

// ─────────────────────────────────────────────────────────────────────────────
// Document Export API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Downloads exported document(s) from the backend as a Blob stream.
 *
 * @param {object} params
 * @param {string} params.projectId - MongoDB project ID
 * @param {'current' | 'all'} params.scope - Export scope
 * @param {string} [params.docType] - Document type ('BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema')
 * @param {'pdf' | 'markdown'} params.format - Format: 'pdf' | 'markdown'
 * @returns {Promise<import('axios').AxiosResponse<Blob>>} Full Axios response with Blob data and headers
 */
export const downloadExport = async ({ projectId, scope, docType, docTypes, format, mode = 'combined' }) => {
  const params = {};

  if (scope === 'all') {
    params.scope = 'all';
  } else if (docType) {
    params.docType = docType;
  }

  if (docTypes && Array.isArray(docTypes) && docTypes.length > 0) {
    params.docTypes = docTypes.join(',');
  } else if (typeof docTypes === 'string' && docTypes) {
    params.docTypes = docTypes;
  }

  params.format = format;
  if (mode) {
    params.mode = mode;
  }

  const response = await api.get(`/api/projects/${projectId}/export`, {
    params,
    responseType: 'blob',
  });

  return response;
};

/**
 * Extract safe download filename from Axios response headers or fallback.
 */
export const getExportFilename = ({ response, projectName, docType, scope, format, mode = 'combined' }) => {
  const disposition = response?.headers?.['content-disposition'] || response?.headers?.['Content-Disposition'];
  if (disposition) {
    const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  const cleanProject = (projectName || 'Project')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'Project';

  if (mode === 'separate') {
    if (scope === 'all') {
      return 'BlueprintAI_Export.zip';
    }
    const docMap = {
      BRD: 'BRD',
      SRS: 'SRS',
      UserStories: 'User-Stories',
      APISpec: 'REST-API',
      DBSchema: 'Database',
    };
    const name = docMap[docType] || (docType || 'Document');
    const ext = format === 'markdown' ? 'md' : 'pdf';
    return `${name}.${ext}`;
  }

  const ext = format === 'markdown' ? 'md' : 'pdf';

  if (scope === 'all') {
    return `BlueprintAI_${cleanProject}_All_Documents.${ext}`;
  }

  const cleanDoc = (docType || 'Document')
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '') || 'Document';

  return `BlueprintAI_${cleanProject}_${cleanDoc}.${ext}`;
};

/**
 * Triggers browser download for a Blob and cleans up object URL.
 */
export const triggerBlobDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * Safely extracts error message from export errors (handling potential Blob bodies).
 */
export const extractExportErrorMessage = async (err, defaultMsg = 'Failed to export document. Please try again.') => {
  if (!err) return defaultMsg;

  if (typeof err.message === 'string' && err.message && !err.message.startsWith('Request failed with')) {
    return err.message;
  }

  const blob = err.data instanceof Blob ? err.data : err.response?.data instanceof Blob ? err.response.data : null;
  if (blob) {
    try {
      const text = await blob.text();
      const parsed = JSON.parse(text);
      if (parsed.message) return parsed.message;
    } catch {
      // not JSON
    }
  }

  return err.message || defaultMsg;
};


