/**
 * exportService.js
 *
 * Export generation service for BlueprintAI.
 * Normalizes all 5 core document types (BRD, SRS, User Stories, REST API, Database Schema)
 * from either raw AI generation JSON or edited workspace JSON into a unified export
 * representation, then renders to Markdown or PDF.
 *
 * READ-ONLY GUARANTEE:
 * This service performs read queries only. It NEVER modifies Document, DocumentVersion,
 * or Generation records.
 */

import { ZipArchive } from 'archiver';
import PDFDocument from 'pdfkit';
import Document from '../../models/Document.js';
import Project from '../../models/Project.js';

// ── Supported Document Types (in canonical ordering for All Documents export)
export const SUPPORTED_DOC_TYPES = [
  'BRD',
  'SRS',
  'UserStories',
  'APISpec',
  'DBSchema',
];

// ── Mapping from various aliases / case variations to canonical Document.type
export const DOC_TYPE_ALIASES = {
  'brd':          'BRD',
  'BRD':          'BRD',
  'srs':          'SRS',
  'SRS':          'SRS',
  'userstories':  'UserStories',
  'user-stories': 'UserStories',
  'user_stories': 'UserStories',
  'UserStories':  'UserStories',
  'api':          'APISpec',
  'apispec':      'APISpec',
  'api-spec':     'APISpec',
  'api_spec':     'APISpec',
  'rest-api':     'APISpec',
  'APISpec':      'APISpec',
  'database':     'DBSchema',
  'dbschema':     'DBSchema',
  'db-schema':    'DBSchema',
  'db_schema':    'DBSchema',
  'db':           'DBSchema',
  'DBSchema':     'DBSchema',
};

export const DOC_TYPE_LABELS = {
  BRD:         'Business Requirements Document',
  SRS:         'Software Requirements Specification',
  UserStories: 'User Stories',
  APISpec:     'REST API Design',
  DBSchema:    'Database Schema',
};

export const DOC_TYPE_SEPARATE_FILENAMES = {
  BRD:         'BRD.pdf',
  SRS:         'SRS.pdf',
  UserStories: 'User-Stories.pdf',
  APISpec:     'REST-API.pdf',
  DBSchema:    'Database.pdf',
};

export const DOC_TYPE_SEPARATE_MD_FILENAMES = {
  BRD:         'BRD.md',
  SRS:         'SRS.md',
  UserStories: 'User-Stories.md',
  APISpec:     'REST-API.md',
  DBSchema:    'Database.md',
};

/**
 * Sanitize strings for safe HTTP attachment filenames.
 */
export const sanitizeFilename = (name) => {
  if (!name || typeof name !== 'string') return 'BlueprintAI';
  const clean = name.replace(/[^a-zA-Z0-9_\-]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  return clean || 'BlueprintAI';
};

// ─────────────────────────────────────────────────────────────────────────────
// Content Normalization Layer
// Adapts raw AI JSON or edited workspace JSON into a unified export structure.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parses content whether it's a JSON string or an object.
 */
const parseContent = (content) => {
  if (!content) return null;
  if (typeof content === 'object') return content;
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
};

/**
 * Normalize BRD content into export sections.
 */
const normalizeBRD = (raw) => {
  const sections = [];

  // Workspace edited format (sections array)
  if (raw.sections && Array.isArray(raw.sections)) {
    raw.sections.forEach(sec => {
      sections.push({
        title: sec.title || 'Section',
        paragraphs: sec.content ? [sec.content] : [],
        items: Array.isArray(sec.items) ? sec.items : [],
        table: sec.table && sec.table.headers ? sec.table : null,
      });
    });
    return sections;
  }

  // Raw AI generation format
  if (raw.executiveSummary) {
    sections.push({ title: 'Executive Summary', paragraphs: [raw.executiveSummary] });
  }
  if (raw.businessProblem) {
    sections.push({ title: 'Business Problem', paragraphs: [raw.businessProblem] });
  }
  if (raw.businessObjectives?.length) {
    sections.push({ title: 'Business Objectives', items: raw.businessObjectives });
  }
  if (raw.scope?.inScope?.length || raw.scope?.outOfScope?.length) {
    const items = [
      ...(raw.scope.inScope || []).map(i => `[In Scope] ${i}`),
      ...(raw.scope.outOfScope || []).map(i => `[Out of Scope] ${i}`),
    ];
    sections.push({ title: 'Project Scope', items });
  }
  if (raw.stakeholders?.length) {
    sections.push({
      title: 'Stakeholders',
      table: {
        headers: ['Role', 'Description'],
        rows: raw.stakeholders.map(s => [s.role || '—', s.description || '—']),
      },
    });
  }
  if (raw.targetUsers?.length) {
    sections.push({
      title: 'Target Users',
      table: {
        headers: ['Persona', 'Description'],
        rows: raw.targetUsers.map(u => [u.persona || '—', u.description || '—']),
      },
    });
  }
  if (raw.businessRequirements?.length) {
    sections.push({
      title: 'Business Requirements',
      table: {
        headers: ['ID', 'Title', 'Priority', 'Description'],
        rows: raw.businessRequirements.map(r => [r.id || '—', r.title || '—', r.priority || 'Medium', r.description || '—']),
      },
    });
  }
  if (raw.functionalOverview?.length) {
    sections.push({
      title: 'Functional Overview',
      table: {
        headers: ['Category', 'Description'],
        rows: raw.functionalOverview.map(f => [f.category || '—', f.description || '—']),
      },
    });
  }
  if (raw.nonFunctionalOverview?.length) {
    sections.push({
      title: 'Non-Functional Overview',
      table: {
        headers: ['Category', 'Description'],
        rows: raw.nonFunctionalOverview.map(n => [n.category || '—', n.description || '—']),
      },
    });
  }
  if (raw.businessRules?.length) {
    sections.push({ title: 'Business Rules', items: raw.businessRules });
  }
  if (raw.assumptions?.length) {
    sections.push({ title: 'Assumptions', items: raw.assumptions });
  }
  if (raw.constraints?.length) {
    sections.push({ title: 'Constraints', items: raw.constraints });
  }
  if (raw.risks?.length) {
    sections.push({
      title: 'Risks & Mitigations',
      table: {
        headers: ['Risk', 'Impact', 'Mitigation'],
        rows: raw.risks.map(r => [r.risk || '—', r.impact || 'Medium', r.mitigation || '—']),
      },
    });
  }
  if (raw.successCriteria?.length) {
    sections.push({ title: 'Success Criteria', items: raw.successCriteria });
  }
  if (raw.dependencies?.length) {
    sections.push({ title: 'Dependencies', items: raw.dependencies });
  }
  if (raw.openQuestions?.length) {
    sections.push({ title: 'Open Questions', items: raw.openQuestions });
  }

  return sections;
};

/**
 * Normalize SRS content into export sections.
 */
const normalizeSRS = (raw) => {
  const sections = [];

  // Workspace edited format (sections array)
  if (raw.sections && Array.isArray(raw.sections)) {
    raw.sections.forEach(sec => {
      sections.push({
        title: sec.title || 'Section',
        paragraphs: sec.content ? [sec.content] : [],
        items: Array.isArray(sec.items) ? sec.items : [],
        table: sec.table && sec.table.headers ? sec.table : null,
      });
    });
    return sections;
  }

  // Raw AI generation format
  if (raw.systemOverview) {
    sections.push({ title: '1. System Overview', paragraphs: [raw.systemOverview] });
  }
  if (raw.userRoles?.length) {
    sections.push({
      title: '2. User Roles & Permissions',
      table: {
        headers: ['Role', 'Description', 'Permissions'],
        rows: raw.userRoles.map(r => [
          r.roleName || '—',
          r.description || '—',
          Array.isArray(r.permissions) ? r.permissions.join(', ') : (r.permissions || '—'),
        ]),
      },
    });
  }
  if (raw.functionalRequirements?.length) {
    sections.push({
      title: '3. Functional Requirements',
      table: {
        headers: ['ID', 'Category', 'Title', 'Priority', 'Description'],
        rows: raw.functionalRequirements.map(f => [
          f.id || '—',
          f.category || '—',
          f.title || '—',
          f.priority || 'High',
          f.description || '—',
        ]),
      },
    });
  }
  if (raw.nonFunctionalRequirements?.length) {
    sections.push({
      title: '4. Non-Functional Requirements',
      table: {
        headers: ['Category', 'Requirement', 'Metric / SLA'],
        rows: raw.nonFunctionalRequirements.map(n => [
          n.category || '—',
          n.requirement || '—',
          n.metric || 'Target SLA',
        ]),
      },
    });
  }
  if (raw.systemFeatures?.length) {
    sections.push({
      title: '5. System Features',
      table: {
        headers: ['Feature', 'Description', 'Inputs', 'Outputs'],
        rows: raw.systemFeatures.map(sf => [
          sf.featureName || '—',
          sf.description || '—',
          Array.isArray(sf.inputs) ? sf.inputs.join(', ') : (sf.inputs || '—'),
          Array.isArray(sf.outputs) ? sf.outputs.join(', ') : (sf.outputs || '—'),
        ]),
      },
    });
  }
  if (raw.externalInterfaces?.length) {
    sections.push({
      title: '6. External Interfaces',
      table: {
        headers: ['Interface Type', 'Protocol / Format', 'Description'],
        rows: raw.externalInterfaces.map(ei => [
          ei.interfaceType || '—',
          ei.protocolOrFormat || 'REST/JSON',
          ei.description || '—',
        ]),
      },
    });
  }
  if (raw.securityRequirements?.length) {
    sections.push({ title: '7. Security Requirements', items: raw.securityRequirements });
  }
  if (raw.performanceRequirements?.length) {
    sections.push({ title: '8. Performance Requirements', items: raw.performanceRequirements });
  }
  if (raw.systemConstraints?.length) {
    sections.push({ title: '9. System Constraints', items: raw.systemConstraints });
  }
  if (raw.assumptionsAndDependencies?.length) {
    sections.push({ title: '10. Assumptions & Dependencies', items: raw.assumptionsAndDependencies });
  }
  if (raw.acceptanceCriteria?.length) {
    sections.push({ title: '11. Acceptance Criteria', items: raw.acceptanceCriteria });
  }

  return sections;
};

/**
 * Normalize User Stories content into export sections.
 */
const normalizeUserStories = (raw) => {
  const sections = [];
  const storiesList = [];

  // Workspace edited format
  if (raw.stories && Array.isArray(raw.stories)) {
    raw.stories.forEach(s => storiesList.push(s));
  } else if (Array.isArray(raw)) {
    raw.forEach(s => storiesList.push(s));
  } else if (raw.epics && Array.isArray(raw.epics)) {
    // Raw AI format with epics
    raw.epics.forEach(epic => {
      const epicStories = [];
      (epic.stories || []).forEach(s => {
        epicStories.push({
          id: s.storyId || s.id,
          title: s.title || `${epic.epicName} — ${s.goal || s.want || 'Story'}`,
          role: s.role || 'User',
          want: s.goal || s.want || '',
          benefit: s.benefit || '',
          priority: s.priority || 'Medium',
          acceptanceCriteria: s.acceptanceCriteria || [],
        });
      });

      sections.push({
        title: `Epic: ${epic.epicName || epic.title || 'General'}`,
        paragraphs: epic.description ? [epic.description] : [],
        cards: epicStories.map(s => ({
          title: s.id ? `[${s.id}] ${s.title}` : s.title,
          badge: s.priority,
          fields: [
            { label: 'As a', value: s.role },
            { label: 'I want', value: s.want },
            { label: 'So that', value: s.benefit },
          ].filter(f => f.value),
          items: s.acceptanceCriteria?.length ? s.acceptanceCriteria : [],
        })),
      });
    });
    return sections;
  }

  if (storiesList.length) {
    sections.push({
      title: 'User Story Cards',
      cards: storiesList.map(s => ({
        title: s.id ? `[${s.id}] ${s.title || s.want || 'Story'}` : (s.title || s.want || 'Story'),
        badge: s.priority || 'Medium',
        fields: [
          { label: 'As a', value: s.role || s.actor },
          { label: 'I want', value: s.want },
          { label: 'So that', value: s.benefit },
        ].filter(f => f.value),
        items: s.acceptanceCriteria?.length ? s.acceptanceCriteria : [],
      })),
    });
  }

  return sections;
};

/**
 * Normalize REST API content into export sections.
 */
const normalizeAPISpec = (raw) => {
  const sections = [];
  const baseUrl = raw.baseUrl || '/api/v1';

  sections.push({
    title: 'API Overview & Base URL',
    paragraphs: [`**Base URL:** \`${baseUrl}\``],
  });

  // Workspace edited format
  if (raw.endpoints && Array.isArray(raw.endpoints)) {
    const grouped = {};
    raw.endpoints.forEach(ep => {
      const g = ep.group || 'Endpoints';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(ep);
    });

    Object.entries(grouped).forEach(([groupName, eps]) => {
      sections.push({
        title: `Resource Group: ${groupName}`,
        cards: eps.map(ep => {
          const rows = [];
          if (ep.queryParams && typeof ep.queryParams === 'object') {
            Object.entries(ep.queryParams).forEach(([k, v]) => {
              rows.push([k, 'query', String(v)]);
            });
          }
          if (ep.response && typeof ep.response === 'object') {
            Object.entries(ep.response).forEach(([code, desc]) => {
              rows.push([code, 'response', String(desc)]);
            });
          }

          return {
            title: `${ep.method || 'GET'} ${ep.path}`,
            subtitle: ep.title || ep.description || '',
            badge: ep.auth ? 'Requires Auth' : 'Public',
            paragraphs: ep.description && ep.description !== ep.title ? [ep.description] : [],
            table: rows.length ? { headers: ['Field/Code', 'Type', 'Description'], rows } : null,
            code: ep.requestBody ? {
              language: 'json',
              content: typeof ep.requestBody === 'string' ? ep.requestBody : JSON.stringify(ep.requestBody, null, 2),
            } : null,
          };
        }),
      });
    });
    return sections;
  }

  // Raw AI generation format
  if (raw.resourceGroups && Array.isArray(raw.resourceGroups)) {
    raw.resourceGroups.forEach(group => {
      const endpoints = (group.endpoints || []).map(ep => {
        const rows = [];
        (ep.parameters || []).forEach(p => {
          rows.push([p.name || '—', p.in || 'query', `${p.type || 'string'}${p.required ? ' (req)' : ''}: ${p.description || ''}`]);
        });
        (ep.responses || []).forEach(r => {
          rows.push([String(r.statusCode || 200), 'response', `${r.description || ''}${r.schema ? ` [${r.schema}]` : ''}`]);
        });

        return {
          title: `${ep.method || 'GET'} ${ep.path}`,
          subtitle: ep.summary || ep.description || '',
          badge: ep.authentication && ep.authentication !== 'None' ? 'Requires Auth' : 'Public',
          paragraphs: ep.description && ep.description !== ep.summary ? [ep.description] : [],
          table: rows.length ? { headers: ['Parameter/Code', 'Type', 'Details'], rows } : null,
          code: ep.requestBody?.schema ? {
            language: 'json',
            content: typeof ep.requestBody.schema === 'string' ? ep.requestBody.schema : JSON.stringify(ep.requestBody.schema, null, 2),
          } : null,
        };
      });

      sections.push({
        title: `Resource Group: ${group.groupName || 'API Endpoints'}`,
        paragraphs: group.description ? [group.description] : [],
        cards: endpoints,
      });
    });
    return sections;
  }

  return sections;
};

/**
 * Normalize Database Schema content into export sections.
 */
const normalizeDBSchema = (raw) => {
  const sections = [];

  const entities = raw.entities || raw.tables || raw.collections || (Array.isArray(raw) ? raw : []);

  if (entities.length) {
    sections.push({
      title: 'Database Entities & Schemas',
      cards: entities.map(e => {
        const fieldRows = (e.fields || []).map(f => [
          f.name || '—',
          f.type || '—',
          f.constraint || [
            f.isPrimaryKey ? 'PK' : '',
            f.unique ? 'Unique' : '',
            f.required ? 'Required' : '',
            f.defaultValue !== undefined && f.defaultValue !== null ? `Default: ${f.defaultValue}` : '',
          ].filter(Boolean).join(', ') || '—',
        ]);

        const rels = e.relations || (e.relationships || []).map(r => `${r.type || '1:N'} → ${r.targetEntity || ''}${r.foreignKey ? ` (${r.foreignKey})` : ''}`);

        return {
          title: `Table: ${e.name}`,
          subtitle: e.description || e.purpose || '',
          table: fieldRows.length ? { headers: ['Field', 'Type', 'Constraints'], rows: fieldRows } : null,
          items: rels.length ? rels.map(r => `Relationship: ${r}`) : [],
        };
      }),
    });
  }

  if (raw.sqlCode || raw.mermaidDiagram) {
    sections.push({
      title: 'Entity Relationship Diagram & Schema Definition',
      code: {
        language: 'mermaid',
        content: raw.sqlCode || raw.mermaidDiagram,
      },
    });
  }

  return sections;
};

/**
 * Main normalizer taking a persisted Document record and returning the standard export document.
 */
export const normalizeDocumentForExport = (doc, projectTitle = 'Project') => {
  if (!doc) return null;
  const parsed = parseContent(doc.content) || {};
  const docType = doc.type;
  const title = doc.title || DOC_TYPE_LABELS[docType] || docType;
  const version = doc.currentVersion || 1;
  const updatedAt = doc.updatedAt || new Date();

  let sections = [];
  switch (docType) {
    case 'BRD':
      sections = normalizeBRD(parsed);
      break;
    case 'SRS':
      sections = normalizeSRS(parsed);
      break;
    case 'UserStories':
      sections = normalizeUserStories(parsed);
      break;
    case 'APISpec':
      sections = normalizeAPISpec(parsed);
      break;
    case 'DBSchema':
      sections = normalizeDBSchema(parsed);
      break;
    default:
      sections = [{ title: 'Content', paragraphs: [typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)] }];
  }

  return {
    type: docType,
    typeLabel: DOC_TYPE_LABELS[docType] || docType,
    title,
    projectTitle,
    version,
    updatedAt,
    sections,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Markdown Exporter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a single normalized document into clean, readable Markdown.
 */
export const renderDocumentToMarkdown = (doc) => {
  const lines = [];

  lines.push(`# ${doc.title}`);
  lines.push('');
  lines.push(`> **Document Type:** ${doc.typeLabel}  `);
  lines.push(`> **Project:** ${doc.projectTitle}  `);
  lines.push(`> **Version:** V${doc.version}  `);
  lines.push(`> **Generated / Updated:** ${new Date(doc.updatedAt).toLocaleDateString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  doc.sections.forEach(sec => {
    lines.push(`## ${sec.title}`);
    lines.push('');

    if (sec.paragraphs && sec.paragraphs.length) {
      sec.paragraphs.forEach(p => {
        lines.push(p);
        lines.push('');
      });
    }

    if (sec.items && sec.items.length) {
      sec.items.forEach(item => {
        lines.push(`- ${item}`);
      });
      lines.push('');
    }

    if (sec.table && sec.table.headers && sec.table.headers.length) {
      const headers = sec.table.headers;
      lines.push(`| ${headers.join(' | ')} |`);
      lines.push(`| ${headers.map(() => '---').join(' | ')} |`);
      (sec.table.rows || []).forEach(row => {
        const sanitizedRow = row.map(cell => String(cell || '—').replace(/\|/g, '\\|').replace(/\n/g, ' '));
        lines.push(`| ${sanitizedRow.join(' | ')} |`);
      });
      lines.push('');
    }

    if (sec.cards && sec.cards.length) {
      sec.cards.forEach(card => {
        lines.push(`### ${card.title}`);
        if (card.badge) {
          lines.push(`*Priority / Status: ${card.badge}*  `);
        }
        if (card.subtitle) {
          lines.push(`${card.subtitle}  `);
        }
        lines.push('');

        if (card.fields && card.fields.length) {
          card.fields.forEach(f => {
            lines.push(`**${f.label}:** ${f.value}  `);
          });
          lines.push('');
        }

        if (card.paragraphs && card.paragraphs.length) {
          card.paragraphs.forEach(p => {
            lines.push(p);
            lines.push('');
          });
        }

        if (card.table && card.table.headers && card.table.headers.length) {
          lines.push(`| ${card.table.headers.join(' | ')} |`);
          lines.push(`| ${card.table.headers.map(() => '---').join(' | ')} |`);
          (card.table.rows || []).forEach(row => {
            const sanitizedRow = row.map(cell => String(cell || '—').replace(/\|/g, '\\|').replace(/\n/g, ' '));
            lines.push(`| ${sanitizedRow.join(' | ')} |`);
          });
          lines.push('');
        }

        if (card.items && card.items.length) {
          lines.push('**Acceptance Criteria / Details:**');
          card.items.forEach(item => {
            lines.push(`- ${item}`);
          });
          lines.push('');
        }

        if (card.code && card.code.content) {
          lines.push(`\`\`\`${card.code.language || ''}`);
          lines.push(card.code.content.trim());
          lines.push('```');
          lines.push('');
        }
      });
    }

    if (sec.code && sec.code.content) {
      lines.push(`\`\`\`${sec.code.language || ''}`);
      lines.push(sec.code.content.trim());
      lines.push('```');
      lines.push('');
    }
  });

  return lines.join('\n');
};

/**
 * Format all normalized documents into a unified multi-document Markdown dossier.
 */
export const renderAllDocumentsToMarkdown = (docs, projectTitle = 'Project') => {
  const lines = [];

  lines.push(`# Blueprint Specification — ${projectTitle}`);
  lines.push('');
  lines.push(`> **Project Dossier:** Complete Architectural & Functional Blueprint  `);
  lines.push(`> **Documents Included:** ${docs.length}  `);
  lines.push(`> **Export Date:** ${new Date().toLocaleDateString()}`);
  lines.push('');
  lines.push('## Table of Contents');
  lines.push('');
  docs.forEach((doc, idx) => {
    lines.push(`${idx + 1}. [${doc.typeLabel} — ${doc.title}](#${doc.type.toLowerCase()}-${doc.title.toLowerCase().replace(/[^a-z0-9]/g, '-')})`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');

  docs.forEach((doc, idx) => {
    lines.push(renderDocumentToMarkdown(doc));
    if (idx < docs.length - 1) {
      lines.push('');
      lines.push('---');
      lines.push('');
    }
  });

  return lines.join('\n');
};

// ─────────────────────────────────────────────────────────────────────────────
// PDF Exporter (PDFKit)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Proportional column width calculator.
 * Ensures tables fit page width cleanly, giving text columns maximum space.
 */
const calculateColumnWidths = (headers, totalWidth) => {
  const colCount = headers.length;
  if (colCount <= 1) return [totalWidth];

  const weights = headers.map(h => {
    const norm = String(h).trim().toLowerCase();
    if (['id', 'pk', 'index', 'in', 'method'].includes(norm)) return 1.0;
    if (['priority', 'required', 'type', 'status', 'impact'].includes(norm)) return 1.2;
    if (['category', 'role', 'persona', 'field', 'name', 'target', 'constraint'].includes(norm)) return 1.8;
    if (['title', 'risk', 'mitigation'].includes(norm)) return 2.2;
    if (['description', 'requirement', 'overview', 'content', 'notes', 'permissions'].includes(norm)) return 4.0;
    return 2.0;
  });

  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  const widths = weights.map(w => Math.floor((w / totalWeight) * totalWidth));

  const sum = widths.reduce((acc, w) => acc + w, 0);
  const diff = totalWidth - sum;
  if (diff > 0) {
    const maxIdx = weights.indexOf(Math.max(...weights));
    widths[maxIdx] += diff;
  }

  return widths;
};

/**
 * Safe page break helpers to prevent empty / blank pages.
 */
const safeAddPage = (pdfDoc) => {
  const topMargin = pdfDoc.page.margins?.top || 40;
  // If we are already at the top of a fresh page, do not create another blank page!
  if (pdfDoc.y > topMargin + 5) {
    pdfDoc.addPage();
  }
};

const checkPageSpace = (pdfDoc, requiredHeight) => {
  const bottomMargin = pdfDoc.page.margins?.bottom || 45;
  const topMargin = pdfDoc.page.margins?.top || 40;
  if (pdfDoc.y + requiredHeight > pdfDoc.page.height - bottomMargin) {
    if (pdfDoc.y > topMargin + 5) {
      pdfDoc.addPage();
    }
  }
};

/**
 * Render structured table to PDFKit with header row, repeatable headers, and cell wrapping.
 */
const renderTableToPDF = (pdfDoc, table, pageWidth) => {
  const headers = table.headers || [];
  const rows = table.rows || [];
  if (!headers.length) return;

  const colWidths = calculateColumnWidths(headers, pageWidth);
  const startX = pdfDoc.page.margins.left;
  const bottomMargin = pdfDoc.page.margins.bottom;

  const drawHeader = () => {
    pdfDoc.x = startX;
    const headerHeight = 18;
    const hY = pdfDoc.y;
    pdfDoc.save();
    pdfDoc.rect(startX, hY, pageWidth, headerHeight).fill('#F8FAFC');
    pdfDoc.strokeColor('#CBD5E1').lineWidth(0.5).rect(startX, hY, pageWidth, headerHeight).stroke();
    pdfDoc.restore();

    let currX = startX;
    headers.forEach((h, i) => {
      pdfDoc
        .fontSize(8)
        .fillColor('#1E293B')
        .font('Helvetica-Bold')
        .text(String(h || ''), currX + 4, hY + 4, {
          width: colWidths[i] - 8,
          align: 'left',
          ellipsis: true,
          lineBreak: false,
        });
      currX += colWidths[i];
    });

    pdfDoc.y = hY + headerHeight;
    pdfDoc.x = startX;
  };

  // If table cannot fit at least header and one small row, add page safely
  checkPageSpace(pdfDoc, 36);

  pdfDoc.y += 4;
  drawHeader();

  // Render rows
  rows.forEach((row, rowIdx) => {
    // Measure row height dynamically using heightOfString
    pdfDoc.fontSize(8).font('Helvetica');
    let maxCellHeight = 16;
    row.forEach((cell, i) => {
      const text = String(cell || '—');
      const w = colWidths[i] - 8;
      const h = pdfDoc.heightOfString(text, { width: w }) + 8;
      if (h > maxCellHeight) maxCellHeight = h;
    });

    // Check if row fits on current page
    if (pdfDoc.y + maxCellHeight > pdfDoc.page.height - bottomMargin) {
      safeAddPage(pdfDoc);
      drawHeader();
    }

    const rowY = pdfDoc.y;

    pdfDoc.save();
    if (rowIdx % 2 === 1) {
      pdfDoc.rect(startX, rowY, pageWidth, maxCellHeight).fill('#F8FAFC');
    }
    pdfDoc.strokeColor('#E2E8F0').lineWidth(0.5).rect(startX, rowY, pageWidth, maxCellHeight).stroke();
    pdfDoc.restore();

    let cellX = startX;
    row.forEach((cell, i) => {
      pdfDoc
        .fontSize(8)
        .fillColor('#334155')
        .font('Helvetica')
        .text(String(cell || '—'), cellX + 4, rowY + 4, {
          width: colWidths[i] - 8,
          align: 'left',
          lineBreak: false,
        });
      cellX += colWidths[i];
    });

    pdfDoc.y = rowY + maxCellHeight;
    pdfDoc.x = startX;
  });

  pdfDoc.x = startX;
  pdfDoc.y += 6;
};

/**
 * Render a code block to PDF with mono font and light gray background.
 */
const renderCodeBlockToPDF = (pdfDoc, codeString, pageWidth) => {
  if (!codeString) return;
  const startX = pdfDoc.page.margins.left;
  const lines = codeString.split('\n');
  // Estimate height; cap at 220pt to avoid a code block consuming a full page
  const boxHeight = Math.min(220, lines.length * 10 + 20);

  checkPageSpace(pdfDoc, boxHeight + 10);

  const boxY = pdfDoc.y;

  // Draw background and border FIRST (doesn't move pdfDoc.y)
  pdfDoc.save();
  pdfDoc.rect(startX, boxY, pageWidth, boxHeight).fill('#F1F5F9');
  pdfDoc.strokeColor('#CBD5E1').lineWidth(0.5).rect(startX, boxY, pageWidth, boxHeight).stroke();
  pdfDoc.restore();

  // Draw text at explicit position
  pdfDoc
    .fontSize(7.5)
    .font('Courier')
    .fillColor('#0F172A')
    .text(codeString.slice(0, 2000), startX + 8, boxY + 8, {
      width: pageWidth - 16,
      height: boxHeight - 16,
      ellipsis: true,
      lineBreak: true,
    });

  // Manually advance past the box — do NOT rely on where PDFKit left the cursor
  pdfDoc.y = boxY + boxHeight + 8;
  pdfDoc.x = startX;
};

/**
 * Helper to render sections into a PDFKit document stream.
 * Uses explicit (x, y) coordinates for every text/draw call to prevent
 * PDFKit cursor drift from stacking moveDown() with auto-advance.
 */
const renderSectionsToPDF = (pdfDoc, sections) => {
  const startX = pdfDoc.page.margins.left;
  const pageWidth = pdfDoc.page.width - pdfDoc.page.margins.left - pdfDoc.page.margins.right;

  sections.forEach(sec => {
    // Guard: if less than 60pt remain, start a new page before the heading
    checkPageSpace(pdfDoc, 60);

    // ── Section Heading ──────────────────────────────────────────────────────
    // Add a fixed 10pt gap before each section heading
    pdfDoc.y += 10;
    const headingY = pdfDoc.y;

    pdfDoc
      .fontSize(12)
      .fillColor('#1E293B')
      .font('Helvetica-Bold')
      .text(sec.title, startX, headingY, { width: pageWidth, lineBreak: false });

    // Place divider 4pt below heading text (heading font=12, ~14.4pt line height)
    const dividerY = headingY + 16;
    pdfDoc.save();
    pdfDoc
      .strokeColor('#E2E8F0')
      .lineWidth(0.75)
      .moveTo(startX, dividerY)
      .lineTo(startX + pageWidth, dividerY)
      .stroke();
    pdfDoc.restore();

    // Content starts 8pt below the divider
    pdfDoc.y = dividerY + 8;
    pdfDoc.x = startX;

    // ── Paragraphs ───────────────────────────────────────────────────────────
    if (sec.paragraphs && sec.paragraphs.length) {
      sec.paragraphs.forEach(p => {
        checkPageSpace(pdfDoc, 20);
        const paraY = pdfDoc.y;
        pdfDoc
          .fontSize(9)
          .fillColor('#334155')
          .font('Helvetica')
          .text(
            p.replace(/\*\*/g, '').replace(/`/g, ''),
            startX,
            paraY,
            { lineGap: 2, width: pageWidth }
          );
        // After text(), pdfDoc.y is already advanced — just add a small gap
        pdfDoc.y += 4;
        pdfDoc.x = startX;
      });
    }

    // ── Bullet Items ─────────────────────────────────────────────────────────
    if (sec.items && sec.items.length) {
      sec.items.forEach(item => {
        checkPageSpace(pdfDoc, 14);
        const itemY = pdfDoc.y;
        pdfDoc
          .fontSize(9)
          .fillColor('#334155')
          .font('Helvetica')
          .text(`\u2022  ${String(item)}`, startX + 8, itemY, {
            lineGap: 1.5,
            width: pageWidth - 8,
          });
        pdfDoc.y += 2;
        pdfDoc.x = startX;
      });
      pdfDoc.y += 4;
    }

    // ── Table ────────────────────────────────────────────────────────────────
    if (sec.table && sec.table.headers && sec.table.headers.length) {
      pdfDoc.x = startX;
      renderTableToPDF(pdfDoc, sec.table, pageWidth);
      pdfDoc.x = startX;
    }

    // ── Cards (User stories, endpoints, entities) ────────────────────────────
    if (sec.cards && sec.cards.length) {
      sec.cards.forEach(card => {
        checkPageSpace(pdfDoc, 50);

        pdfDoc.y += 6;
        pdfDoc.x = startX;

        // Card title
        const cardTitleY = pdfDoc.y;
        pdfDoc
          .fontSize(10)
          .fillColor('#0F172A')
          .font('Helvetica-Bold')
          .text(String(card.title || ''), startX, cardTitleY, { width: pageWidth });
        pdfDoc.y += 2;
        pdfDoc.x = startX;

        if (card.badge) {
          const badgeY = pdfDoc.y;
          pdfDoc
            .fontSize(8)
            .fillColor('#2563EB')
            .font('Helvetica-Bold')
            .text(`[ ${card.badge} ]`, startX, badgeY, { width: pageWidth });
          pdfDoc.y += 2;
          pdfDoc.x = startX;
        }

        if (card.subtitle) {
          const subtitleY = pdfDoc.y;
          pdfDoc
            .fontSize(8.5)
            .fillColor('#64748B')
            .font('Helvetica-Oblique')
            .text(String(card.subtitle), startX, subtitleY, { width: pageWidth });
          pdfDoc.y += 2;
          pdfDoc.x = startX;
        }

        if (card.fields && card.fields.length) {
          card.fields.forEach(f => {
            checkPageSpace(pdfDoc, 12);
            const fieldY = pdfDoc.y;
            // Render label + value on same line using continued:true
            pdfDoc
              .fontSize(8.5)
              .fillColor('#1E293B')
              .font('Helvetica-Bold')
              .text(`${f.label}: `, startX, fieldY, { continued: true, lineBreak: false })
              .font('Helvetica')
              .fillColor('#334155')
              .text(String(f.value || ''), { lineBreak: true, width: pageWidth - 60 });
            pdfDoc.y += 1;
            pdfDoc.x = startX;
          });
          pdfDoc.y += 3;
        }

        if (card.paragraphs && card.paragraphs.length) {
          card.paragraphs.forEach(p => {
            checkPageSpace(pdfDoc, 14);
            const pY = pdfDoc.y;
            pdfDoc
              .fontSize(8.5)
              .fillColor('#334155')
              .font('Helvetica')
              .text(String(p), startX, pY, { lineGap: 1.5, width: pageWidth });
            pdfDoc.y += 2;
            pdfDoc.x = startX;
          });
        }

        if (card.table && card.table.headers && card.table.headers.length) {
          pdfDoc.x = startX;
          renderTableToPDF(pdfDoc, card.table, pageWidth);
          pdfDoc.x = startX;
        }

        if (card.items && card.items.length) {
          checkPageSpace(pdfDoc, 16);
          const notesLabelY = pdfDoc.y;
          pdfDoc
            .fontSize(8.5)
            .fillColor('#475569')
            .font('Helvetica-Bold')
            .text('Acceptance Criteria / Notes:', startX, notesLabelY, { width: pageWidth });
          pdfDoc.y += 2;
          pdfDoc.x = startX;
          card.items.forEach(item => {
            checkPageSpace(pdfDoc, 12);
            const iY = pdfDoc.y;
            pdfDoc
              .fontSize(8)
              .fillColor('#334155')
              .font('Helvetica')
              .text(`- ${String(item)}`, startX + 8, iY, { lineGap: 1.5, width: pageWidth - 8 });
            pdfDoc.y += 1;
            pdfDoc.x = startX;
          });
          pdfDoc.y += 3;
        }

        if (card.code && card.code.content) {
          pdfDoc.x = startX;
          renderCodeBlockToPDF(pdfDoc, card.code.content, pageWidth);
          pdfDoc.x = startX;
        }

        pdfDoc.x = startX;
      });
      pdfDoc.y += 4;
    }

    // ── Section-level code block ─────────────────────────────────────────────
    if (sec.code && sec.code.content) {
      pdfDoc.x = startX;
      renderCodeBlockToPDF(pdfDoc, sec.code.content, pageWidth);
      pdfDoc.x = startX;
    }
  });
};

/**
 * Generate a PDF stream for a single document.
 */
export const buildSingleDocumentPDF = (doc, stream) => {
  const pdfDoc = new PDFDocument({
    bufferPages: true,
    size: 'A4',
    margins: { top: 40, bottom: 45, left: 40, right: 40 },
  });

  pdfDoc.pipe(stream);

  // Document Header Banner
  const startX = pdfDoc.page.margins.left;
  pdfDoc
    .fontSize(18)
    .fillColor('#1E3A8A')
    .font('Helvetica-Bold')
    .text(doc.title, startX, pdfDoc.y);

  pdfDoc.moveDown(0.2);

  pdfDoc
    .fontSize(9)
    .fillColor('#64748B')
    .font('Helvetica')
    .text(`Project: ${doc.projectTitle}   |   Type: ${doc.typeLabel}   |   Version: V${doc.version}   |   Updated: ${new Date(doc.updatedAt).toLocaleDateString()}`, startX, pdfDoc.y);

  pdfDoc.moveDown(0.4);
  pdfDoc.x = startX;

  renderSectionsToPDF(pdfDoc, doc.sections);

  // Add Page Numbers to all pages.
  // CRITICAL: Temporarily set margins.bottom = 0 so PDFKit's line checker never triggers accidental addPage() during footer rendering!
  const range = pdfDoc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    pdfDoc.switchToPage(i);
    const oldBottom = pdfDoc.page.margins.bottom;
    pdfDoc.page.margins.bottom = 0;
    pdfDoc
      .fontSize(8)
      .fillColor('#94A3B8')
      .font('Helvetica')
      .text(
        `BlueprintAI — ${doc.projectTitle}  |  ${doc.typeLabel}  |  Page ${i + 1} of ${range.count}`,
        40,
        pdfDoc.page.height - 30,
        {
          align: 'center',
          width: pdfDoc.page.width - 80,
          lineBreak: false,
        }
      );
    pdfDoc.page.margins.bottom = oldBottom;
  }

  pdfDoc.end();
  return pdfDoc;
};

/**
 * Generate a single document PDF into an in-memory Buffer for archiving.
 */
export const buildDocumentPDFBuffer = (doc) => {
  return new Promise((resolve, reject) => {
    const pdfDoc = new PDFDocument({
      bufferPages: true,
      size: 'A4',
      margins: { top: 40, bottom: 45, left: 40, right: 40 },
    });

    const chunks = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', err => reject(err));

    const startX = pdfDoc.page.margins.left;
    pdfDoc
      .fontSize(18)
      .fillColor('#1E3A8A')
      .font('Helvetica-Bold')
      .text(doc.title, startX, pdfDoc.y);

    pdfDoc.moveDown(0.2);

    pdfDoc
      .fontSize(9)
      .fillColor('#64748B')
      .font('Helvetica')
      .text(`Project: ${doc.projectTitle}   |   Type: ${doc.typeLabel}   |   Version: V${doc.version}   |   Updated: ${new Date(doc.updatedAt).toLocaleDateString()}`, startX, pdfDoc.y);

    pdfDoc.moveDown(0.4);
    pdfDoc.x = startX;

    renderSectionsToPDF(pdfDoc, doc.sections);

    const range = pdfDoc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      pdfDoc.switchToPage(i);
      const oldBottom = pdfDoc.page.margins.bottom;
      pdfDoc.page.margins.bottom = 0;
      pdfDoc
        .fontSize(8)
        .fillColor('#94A3B8')
        .font('Helvetica')
        .text(
          `BlueprintAI — ${doc.projectTitle}  |  ${doc.typeLabel}  |  Page ${i + 1} of ${range.count}`,
          40,
          pdfDoc.page.height - 30,
          {
            align: 'center',
            width: pdfDoc.page.width - 80,
            lineBreak: false,
          }
        );
      pdfDoc.page.margins.bottom = oldBottom;
    }

    pdfDoc.end();
  });
};

/**
 * Generate a combined PDF stream for All / Selected Documents.
 */
export const buildAllDocumentsPDF = (docs, projectTitle, stream) => {
  const pdfDoc = new PDFDocument({
    bufferPages: true,
    size: 'A4',
    margins: { top: 40, bottom: 45, left: 40, right: 40 },
  });

  pdfDoc.pipe(stream);

  const startX = pdfDoc.page.margins.left;

  // Cover / Header Page
  pdfDoc
    .fontSize(22)
    .fillColor('#1E3A8A')
    .font('Helvetica-Bold')
    .text('Blueprint Specification Dossier', startX, 80, { align: 'center', width: pdfDoc.page.width - 80 });

  pdfDoc.moveDown(0.3);

  pdfDoc
    .fontSize(14)
    .fillColor('#334155')
    .font('Helvetica-Bold')
    .text(projectTitle, startX, pdfDoc.y, { align: 'center', width: pdfDoc.page.width - 80 });

  pdfDoc.moveDown(0.3);

  pdfDoc
    .fontSize(9)
    .fillColor('#64748B')
    .font('Helvetica')
    .text(`Generated by BlueprintAI on ${new Date().toLocaleDateString()}`, startX, pdfDoc.y, { align: 'center', width: pdfDoc.page.width - 80 });

  pdfDoc.moveDown(1.5);

  // Table of contents box
  const pageWidth = pdfDoc.page.width - pdfDoc.page.margins.left - pdfDoc.page.margins.right;
  const tocY = pdfDoc.y;
  const tocHeight = docs.length * 20 + 35;
  pdfDoc.rect(startX, tocY, pageWidth, tocHeight).fill('#F8FAFC');
  pdfDoc.strokeColor('#CBD5E1').lineWidth(0.75).rect(startX, tocY, pageWidth, tocHeight).stroke();

  pdfDoc
    .fontSize(11)
    .fillColor('#1E293B')
    .font('Helvetica-Bold')
    .text('Documents Included', startX + 12, tocY + 10, { lineBreak: false });

  docs.forEach((d, idx) => {
    pdfDoc
      .fontSize(9.5)
      .fillColor('#2563EB')
      .font('Helvetica-Bold')
      .text(`${idx + 1}. `, startX + 16, tocY + 30 + idx * 20, { continued: true, lineBreak: false })
      .fillColor('#1E293B')
      .font('Helvetica')
      .text(`${d.typeLabel} — ${d.title} (V${d.version})`, { lineBreak: false });
  });

  pdfDoc.y = tocY + tocHeight + 30;
  pdfDoc.x = startX;

  // Render each document starting on its own page
  docs.forEach(doc => {
    pdfDoc.addPage();
    pdfDoc.x = startX;

    pdfDoc
      .fontSize(16)
      .fillColor('#1E3A8A')
      .font('Helvetica-Bold')
      .text(doc.title, startX, pdfDoc.y);

    pdfDoc.moveDown(0.2);

    pdfDoc
      .fontSize(8.5)
      .fillColor('#64748B')
      .font('Helvetica')
      .text(`Type: ${doc.typeLabel}   |   Version: V${doc.version}   |   Updated: ${new Date(doc.updatedAt).toLocaleDateString()}`, startX, pdfDoc.y);

    pdfDoc.moveDown(0.4);
    pdfDoc.x = startX;

    renderSectionsToPDF(pdfDoc, doc.sections);
  });

  // Add Page Numbers with margins.bottom = 0 protection
  const range = pdfDoc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    pdfDoc.switchToPage(i);
    const oldBottom = pdfDoc.page.margins.bottom;
    pdfDoc.page.margins.bottom = 0;
    pdfDoc
      .fontSize(8)
      .fillColor('#94A3B8')
      .font('Helvetica')
      .text(
        `BlueprintAI — ${projectTitle}  |  Specification Dossier  |  Page ${i + 1} of ${range.count}`,
        40,
        pdfDoc.page.height - 30,
        {
          align: 'center',
          width: pdfDoc.page.width - 80,
          lineBreak: false,
        }
      );
    pdfDoc.page.margins.bottom = oldBottom;
  }

  pdfDoc.end();
  return pdfDoc;
};

// ─────────────────────────────────────────────────────────────────────────────
// Export Service Entry Points
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch and export a single document for a project.
 *
 * @param {object} params
 * @param {string} params.projectId  - MongoDB project ObjectId
 * @param {string} params.ownerId    - Authenticated user ID
 * @param {string} params.docType    - Canonical or alias document type
 * @param {string} params.format     - 'markdown' | 'pdf'
 * @param {string} [params.mode]     - 'combined' | 'separate'
 * @param {object} res               - Express response object
 */
export const exportSingleDocument = async ({ projectId, ownerId, docType, format, mode = 'combined', res }) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    res.status(404);
    throw new Error('Project not found or unauthorized.');
  }

  const canonicalType = DOC_TYPE_ALIASES[docType] || docType;
  if (!SUPPORTED_DOC_TYPES.includes(canonicalType)) {
    res.status(400);
    throw new Error(`Unsupported docType '${docType}'. Supported types: ${SUPPORTED_DOC_TYPES.join(', ')}`);
  }

  const document = await Document.findOne({ project: projectId, type: canonicalType });
  if (!document || !document.content || document.status === 'generating') {
    res.status(404);
    throw new Error(`Document '${canonicalType}' has not been generated or is not ready yet.`);
  }

  const normalized = normalizeDocumentForExport(document, project.title);
  const safeProjectName = sanitizeFilename(project.title);
  const safeDocType = sanitizeFilename(canonicalType);

  if (format === 'markdown') {
    const markdown = renderDocumentToMarkdown(normalized);
    const filename = mode === 'separate'
      ? (DOC_TYPE_SEPARATE_MD_FILENAMES[canonicalType] || `BlueprintAI_${safeProjectName}_${safeDocType}.md`)
      : `BlueprintAI_${safeProjectName}_${safeDocType}.md`;
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(markdown);
  }

  if (format === 'pdf') {
    const filename = mode === 'separate'
      ? (DOC_TYPE_SEPARATE_FILENAMES[canonicalType] || `BlueprintAI_${safeProjectName}_${safeDocType}.pdf`)
      : `BlueprintAI_${safeProjectName}_${safeDocType}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    buildSingleDocumentPDF(normalized, res);
    return;
  }

  res.status(400);
  throw new Error(`Invalid format '${format}'. Must be 'markdown' or 'pdf'.`);
};

/**
 * Fetch and export all ready documents for a project.
 *
 * @param {object} params
 * @param {string} params.projectId  - MongoDB project ObjectId
 * @param {string} params.ownerId    - Authenticated user ID
 * @param {string} params.format     - 'markdown' | 'pdf'
 * @param {string[]} [params.docTypes] - Subset of document types to export
 * @param {string} [params.mode]     - 'combined' | 'separate'
 * @param {object} res               - Express response object
 */
export const exportAllDocuments = async ({ projectId, ownerId, format, docTypes, mode = 'combined', res }) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) {
    res.status(404);
    throw new Error('Project not found or unauthorized.');
  }

  // Filter requested document types if provided
  let targetTypes = SUPPORTED_DOC_TYPES;
  if (docTypes && Array.isArray(docTypes) && docTypes.length > 0) {
    const resolved = docTypes
      .map(t => DOC_TYPE_ALIASES[String(t).trim()] || String(t).trim())
      .filter(t => SUPPORTED_DOC_TYPES.includes(t));

    if (resolved.length > 0) {
      targetTypes = resolved;
    }
  }

  const documents = await Document.find({
    project: projectId,
    type: { $in: targetTypes },
  });

  const readyDocs = documents.filter(d => d.status === 'ready' && d.content);

  if (!readyDocs.length) {
    res.status(404);
    throw new Error('No ready documents found matching the selection to export for this project.');
  }

  // Sort in canonical ordering: BRD → SRS → UserStories → APISpec → DBSchema
  const sortedDocs = readyDocs.sort((a, b) => {
    return SUPPORTED_DOC_TYPES.indexOf(a.type) - SUPPORTED_DOC_TYPES.indexOf(b.type);
  });

  const normalizedDocs = sortedDocs.map(d => normalizeDocumentForExport(d, project.title));
  const safeProjectName = sanitizeFilename(project.title);

  // ── SEPARATE MODE: Individual documents packaged or downloaded directly ──
  if (mode === 'separate') {
    if (normalizedDocs.length === 1) {
      const singleDoc = normalizedDocs[0];
      if (format === 'pdf') {
        const filename = DOC_TYPE_SEPARATE_FILENAMES[singleDoc.type] || `${sanitizeFilename(singleDoc.typeLabel)}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        buildSingleDocumentPDF(singleDoc, res);
        return;
      }
      if (format === 'markdown') {
        const markdown = renderDocumentToMarkdown(singleDoc);
        const filename = DOC_TYPE_SEPARATE_MD_FILENAMES[singleDoc.type] || `${sanitizeFilename(singleDoc.typeLabel)}.md`;
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(markdown);
      }
    }

    // Multiple documents in separate mode -> Package into ZIP
    const zip = new ZipArchive({ zlib: { level: 9 } });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="BlueprintAI_Export.zip"');
    zip.pipe(res);

    if (format === 'pdf') {
      for (const doc of normalizedDocs) {
        const pdfBuffer = await buildDocumentPDFBuffer(doc);
        const entryName = DOC_TYPE_SEPARATE_FILENAMES[doc.type] || `${sanitizeFilename(doc.typeLabel)}.pdf`;
        zip.append(pdfBuffer, { name: entryName });
      }
      await zip.finalize();
      return;
    }

    if (format === 'markdown') {
      for (const doc of normalizedDocs) {
        const markdown = renderDocumentToMarkdown(doc);
        const entryName = DOC_TYPE_SEPARATE_MD_FILENAMES[doc.type] || `${sanitizeFilename(doc.typeLabel)}.md`;
        zip.append(markdown, { name: entryName });
      }
      await zip.finalize();
      return;
    }
  }

  // ── COMBINED MODE: Single merged document or dossier ──
  const isFullSet = normalizedDocs.length === SUPPORTED_DOC_TYPES.length;
  const isSingle = normalizedDocs.length === 1;
  const docDescriptor = isFullSet ? 'All_Documents' : (isSingle ? sanitizeFilename(normalizedDocs[0].typeLabel) : 'Blueprint');

  if (format === 'markdown') {
    const markdown = renderAllDocumentsToMarkdown(normalizedDocs, project.title);
    const filename = `BlueprintAI_${safeProjectName}_${docDescriptor}.md`;
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(markdown);
  }

  if (format === 'pdf') {
    const filename = `BlueprintAI_${safeProjectName}_${docDescriptor}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    buildAllDocumentsPDF(normalizedDocs, project.title, res);
    return;
  }

  res.status(400);
  throw new Error(`Invalid format '${format}'. Must be 'markdown' or 'pdf'.`);
};
