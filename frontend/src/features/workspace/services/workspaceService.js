/**
 * workspaceService.js
 *
 * Blueprint Workspace Data Layer (Mock for Phase 2 / Phase 3 Pending)
 *
 * PHASE 3 NOTE:
 * The Blueprint AI Engine and document endpoints are not yet implemented
 * on the backend (documentRoutes.js and aiRoutes.js are stubs).
 *
 * This service provides:
 *   1. Typed, structured mock documents for all 5 blueprint artifact types.
 *   2. Simulated loading delays to demonstrate real loading states.
 *   3. Isolated, clearly-annotated [DEMO] data — never presented as real AI output.
 *
 * Migration path (Phase 3):
 *   Replace each exported function with an `api.get(...)` call.
 *   Consumer components receive the same shape — no consumer changes required.
 *
 * Document types mirror the backend Document model enum:
 *   BRD | SRS | UserStories | APISpec | DBSchema
 */

import api from '../../../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Blueprint document list (sidebar navigation order)
// ─────────────────────────────────────────────────────────────────────────────

export const BLUEPRINT_DOCS = [
  { id: 'BRD',        num: '01', label: 'BRD',           subtitle: 'Business Requirement Document' },
  { id: 'SRS',        num: '02', label: 'SRS',           subtitle: 'Software Requirement Specification' },
  { id: 'UserStories',num: '03', label: 'User Stories',  subtitle: 'Structured Story Cards' },
  { id: 'APISpec',    num: '04', label: 'REST API',      subtitle: 'API Design Specification' },
  { id: 'DBSchema',   num: '05', label: 'Database',      subtitle: 'Schema & Entity Diagram' },
];

// Document status options (mirrors backend Document.status)
// 'generating' | 'ready' | 'failed' | 'not_generated'
// 'not_generated' is a frontend-only state (doc record does not exist yet)

// ─────────────────────────────────────────────────────────────────────────────
// Mock Document Data Factory
// Produces structured, typed document data — NOT raw markdown strings.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_BRD = {
  type: 'BRD',
  title: 'Business Requirement Document',
  status: 'ready',
  currentVersion: 2,
  updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  sections: [
    {
      id: 'brd-intro',
      title: '1. Introduction',
      content: 'The Campus Placement Platform (CPP) is a web-based solution designed to digitize and streamline the end-to-end campus recruitment process for educational institutions. It connects students, recruiters, and placement administrators on a unified platform, eliminating manual processes and enabling data-driven placement management.',
    },
    {
      id: 'brd-objectives',
      title: '2. Business Objectives',
      items: [
        'Reduce time-to-hire for campus placements by 60% through automated workflows.',
        'Provide real-time visibility into placement drive status for all stakeholders.',
        'Centralize student profile, resume, and academic data for recruiter access.',
        'Enable placement administrators to manage multiple concurrent drives efficiently.',
        'Generate placement analytics and reports for institutional leadership.',
      ],
    },
    {
      id: 'brd-problem',
      title: '3. Problem Statement',
      content: 'Campus placement processes currently rely on spreadsheets, email communication, and physical documentation. This leads to data inconsistency, delayed communication between students and recruiters, lost application records, and inability to track placement progress in real time. Students miss opportunities due to poor notification systems, while recruiters struggle with manual resume screening.',
    },
    {
      id: 'brd-users',
      title: '4. Target Users',
      table: {
        headers: ['User Type', 'Primary Role', 'Key Need'],
        rows: [
          ['Student', 'Job seeker / applicant', 'Discover and apply to placement opportunities'],
          ['Recruiter', 'Company representative', 'Post jobs, review and shortlist applicants'],
          ['Admin', 'Placement officer', 'Manage drives, users, and generate reports'],
        ],
      },
    },
    {
      id: 'brd-scope',
      title: '5. Business Scope',
      content: 'The platform covers the full placement lifecycle: student onboarding, company registration, job posting, eligibility-based filtering, application submission, shortlisting, interview scheduling, and final offer management. Out of scope for Phase 1: payment processing, video interviews, and third-party ATS integration.',
    },
    {
      id: 'brd-functional-overview',
      title: '6. Functional Overview',
      items: [
        'Student registration and profile management with academic records.',
        'Recruiter portal for company profile creation and job posting.',
        'Eligibility-based job filtering (CGPA, branch, year of graduation).',
        'Application tracking system with status updates and notifications.',
        'Admin dashboard for drive management, student management, and analytics.',
        'Resume upload, parsing, and structured display.',
        'Offer letter generation and acceptance workflow.',
      ],
    },
    {
      id: 'brd-constraints',
      title: '7. Constraints',
      items: [
        'Must integrate with the existing college ERP for academic data import.',
        'All student PII must be stored within institutional servers (data residency).',
        'System must support concurrent access by 500+ students during peak drives.',
        'Mobile-responsive design required — students primarily use smartphones.',
        'Initial deployment target: 3 months from project kickoff.',
      ],
    },
  ],
};

const MOCK_SRS = {
  type: 'SRS',
  title: 'Software Requirement Specification',
  status: 'ready',
  currentVersion: 1,
  updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  sections: [
    {
      id: 'srs-intro',
      title: '1. Introduction',
      content: 'This Software Requirement Specification defines the functional and non-functional requirements for the Campus Placement Platform. It serves as the contractual technical baseline between the development team and stakeholders, and will be used to validate the delivered system.',
    },
    {
      id: 'srs-overview',
      title: '2. System Overview',
      content: 'The system is a multi-role web application built on a RESTful microservice architecture. The frontend is a React SPA communicating with a Node.js/Express backend. Data is persisted in MongoDB. Authentication uses JWT tokens stored in httpOnly cookies. File storage for resumes uses cloud object storage.',
    },
    {
      id: 'srs-functional',
      title: '3. Functional Requirements',
      table: {
        headers: ['ID', 'Requirement', 'Priority', 'Actor'],
        rows: [
          ['FR-001', 'The system shall allow students to register using their institutional email address.', 'Must Have', 'Student'],
          ['FR-002', 'The system shall enforce CGPA and branch eligibility criteria before allowing a student to apply to a job.', 'Must Have', 'System'],
          ['FR-003', 'Recruiters shall be able to create, publish, and close job postings.', 'Must Have', 'Recruiter'],
          ['FR-004', 'The system shall send email notifications to students when new eligible jobs are posted.', 'Should Have', 'System'],
          ['FR-005', 'Administrators shall be able to generate placement summary reports as PDF.', 'Should Have', 'Admin'],
          ['FR-006', 'The system shall maintain an audit trail of all application status changes.', 'Must Have', 'System'],
        ],
      },
    },
    {
      id: 'srs-nonfunctional',
      title: '4. Non-Functional Requirements',
      items: [
        'Performance: API response time ≤ 200ms for 95th percentile under normal load.',
        'Scalability: Horizontal scaling support via containerized deployment (Docker).',
        'Security: All passwords hashed with bcrypt (cost 10). JWT expiry: 7 days.',
        'Availability: 99.5% uptime during placement season (Oct–Mar). SLA: 2h RTO.',
        'Accessibility: WCAG 2.1 Level AA compliance for all student-facing pages.',
        'Data Integrity: Optimistic locking on concurrent application status updates.',
      ],
    },
    {
      id: 'srs-roles',
      title: '5. User Roles & Permissions',
      table: {
        headers: ['Role', 'Create', 'Read', 'Update', 'Delete'],
        rows: [
          ['Student', 'Own profile, applications', 'Jobs, own profile', 'Own profile', '—'],
          ['Recruiter', 'Job postings', 'Applicants, jobs', 'Own job postings, applicant status', 'Own drafts'],
          ['Admin', 'All entities', 'All entities', 'All entities', 'All entities'],
        ],
      },
    },
    {
      id: 'srs-constraints',
      title: '6. System Constraints',
      items: [
        'Database: MongoDB Atlas M10 cluster minimum for production workload.',
        'File uploads: Maximum 5MB per resume; accepted formats: PDF, DOC, DOCX.',
        'Browser support: Chrome 110+, Firefox 110+, Safari 16+, Edge 110+.',
        'API rate limiting: 100 requests/minute per authenticated user.',
        'Session management: Concurrent session limit of 3 per user account.',
      ],
    },
  ],
};

const MOCK_USER_STORIES = {
  type: 'UserStories',
  title: 'User Stories',
  status: 'ready',
  currentVersion: 1,
  updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  stories: [
    {
      id: 'US-001',
      title: 'Student Registration',
      role: 'student',
      want: 'create an account using my institutional email',
      benefit: 'I can access placement opportunities on the platform',
      actor: 'Student',
      priority: 'High',
      acceptanceCriteria: [
        'Student can register with a valid institutional email and password.',
        'Duplicate email addresses are rejected with a clear error message.',
        'Successful registration creates a student profile and sends a verification email.',
        'Unverified accounts cannot access job listings.',
      ],
    },
    {
      id: 'US-002',
      title: 'Browse Job Listings',
      role: 'student',
      want: 'browse all available job postings for which I am eligible',
      benefit: 'I can discover relevant placement opportunities quickly',
      actor: 'Student',
      priority: 'High',
      acceptanceCriteria: [
        'Student sees only jobs for which they meet the eligibility criteria (CGPA, branch).',
        'Jobs display: company, role, CTC, deadline, and eligibility requirements.',
        'Student can filter jobs by company name, CTC range, and job type.',
        'Expired job postings are clearly marked and not shown by default.',
      ],
    },
    {
      id: 'US-003',
      title: 'Submit Job Application',
      role: 'student',
      want: 'apply to a job with a single click',
      benefit: 'I can quickly register my interest without re-entering information',
      actor: 'Student',
      priority: 'High',
      acceptanceCriteria: [
        'Student can apply using their existing profile and uploaded resume.',
        'Duplicate applications to the same job are prevented.',
        'Application confirmation is shown immediately and emailed to the student.',
        'Student can track the status of all submitted applications.',
      ],
    },
    {
      id: 'US-004',
      title: 'Create Job Posting',
      role: 'recruiter',
      want: 'create and publish job postings with eligibility criteria',
      benefit: 'I can reach the right candidates efficiently',
      actor: 'Recruiter',
      priority: 'High',
      acceptanceCriteria: [
        'Recruiter can create a job with: title, description, CTC, deadline, and eligibility criteria.',
        'Eligibility criteria include: minimum CGPA, allowed branches, graduation year.',
        'Draft postings are saved and not visible to students until published.',
        'Published jobs trigger notifications to eligible students.',
      ],
    },
    {
      id: 'US-005',
      title: 'Review & Shortlist Applicants',
      role: 'recruiter',
      want: 'view and filter all applicants for my job postings',
      benefit: 'I can efficiently identify the most suitable candidates',
      actor: 'Recruiter',
      priority: 'High',
      acceptanceCriteria: [
        'Recruiter can view all applicants for each job posting in a structured table.',
        'Recruiter can filter applicants by CGPA, branch, and application date.',
        'Recruiter can update application status: Shortlisted, Rejected, Selected.',
        'Status changes trigger automatic email notifications to the student.',
      ],
    },
    {
      id: 'US-006',
      title: 'Admin Placement Report',
      role: 'administrator',
      want: 'generate a placement summary report for a given date range',
      benefit: 'I can present accurate placement statistics to institutional leadership',
      actor: 'Admin',
      priority: 'Medium',
      acceptanceCriteria: [
        'Admin can select a date range and generate a report.',
        'Report includes: total students placed, average CTC, top recruiting companies.',
        'Report is exportable as PDF and CSV.',
        'Report data reflects real-time application status across all active drives.',
      ],
    },
  ],
};

const MOCK_API_SPEC = {
  type: 'APISpec',
  title: 'REST API Design',
  status: 'ready',
  currentVersion: 1,
  updatedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  baseUrl: '/api/v1',
  endpoints: [
    {
      id: 'auth-register',
      group: 'Authentication',
      method: 'POST',
      path: '/auth/register',
      title: 'Register User',
      description: 'Creates a new user account. Sends a verification email upon success.',
      auth: false,
      requestBody: {
        name: 'string',
        email: 'string (institutional email)',
        password: 'string (min 8 chars)',
        role: '"student" | "recruiter"',
      },
      response: {
        success: true,
        user: { _id: 'ObjectId', name: 'string', email: 'string', role: 'string' },
        token: 'JWT (also set as httpOnly cookie)',
      },
    },
    {
      id: 'auth-login',
      group: 'Authentication',
      method: 'POST',
      path: '/auth/login',
      title: 'Login',
      description: 'Authenticates a user and returns a JWT token in an httpOnly cookie.',
      auth: false,
      requestBody: { email: 'string', password: 'string' },
      response: {
        success: true,
        user: { _id: 'ObjectId', name: 'string', email: 'string', role: 'string' },
      },
    },
    {
      id: 'jobs-list',
      group: 'Jobs',
      method: 'GET',
      path: '/jobs',
      title: 'List Eligible Jobs',
      description: 'Returns all published jobs for which the authenticated student is eligible. Filtered by eligibility criteria server-side.',
      auth: true,
      queryParams: {
        page: 'number (default: 1)',
        limit: 'number (default: 20)',
        search: 'string (optional)',
        sortBy: '"deadline" | "ctc" | "createdAt" (default: createdAt)',
      },
      response: {
        success: true,
        jobs: [{ _id: 'ObjectId', title: 'string', company: 'string', ctc: 'number', deadline: 'ISO date' }],
        total: 'number',
        page: 'number',
      },
    },
    {
      id: 'jobs-create',
      group: 'Jobs',
      method: 'POST',
      path: '/jobs',
      title: 'Create Job Posting',
      description: 'Creates a new job posting. Only accessible by authenticated Recruiters. Returns job in draft status.',
      auth: true,
      requestBody: {
        title: 'string',
        description: 'string',
        ctc: 'number (LPA)',
        deadline: 'ISO date string',
        eligibility: { minCGPA: 'number', branches: 'string[]', graduationYear: 'number' },
      },
      response: {
        success: true,
        job: { _id: 'ObjectId', title: 'string', status: '"draft"', createdAt: 'ISO date' },
      },
    },
    {
      id: 'applications-create',
      group: 'Applications',
      method: 'POST',
      path: '/jobs/:jobId/applications',
      title: 'Submit Application',
      description: 'Submits a job application for the authenticated student. Validates eligibility before creating the record.',
      auth: true,
      requestBody: { resumeId: 'ObjectId (optional, uses default resume if omitted)' },
      response: {
        success: true,
        application: { _id: 'ObjectId', status: '"applied"', appliedAt: 'ISO date' },
      },
    },
    {
      id: 'applications-update-status',
      group: 'Applications',
      method: 'PATCH',
      path: '/applications/:id/status',
      title: 'Update Application Status',
      description: 'Updates the status of an application. Only accessible by the Recruiter who owns the associated job.',
      auth: true,
      requestBody: { status: '"shortlisted" | "rejected" | "selected"', note: 'string (optional)' },
      response: {
        success: true,
        application: { _id: 'ObjectId', status: 'string', updatedAt: 'ISO date' },
      },
    },
  ],
};

const MOCK_DB_SCHEMA = {
  type: 'DBSchema',
  title: 'Database Schema',
  status: 'ready',
  currentVersion: 1,
  updatedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  entities: [
    {
      id: 'ent-user',
      name: 'User',
      description: 'Core authentication entity. Extended by student/recruiter profiles.',
      fields: [
        { name: '_id', type: 'ObjectId', constraint: 'PK' },
        { name: 'name', type: 'String', constraint: 'Required' },
        { name: 'email', type: 'String', constraint: 'Unique, Required' },
        { name: 'password', type: 'String', constraint: 'Bcrypt hashed' },
        { name: 'role', type: 'Enum', constraint: 'student | recruiter | admin' },
        { name: 'isVerified', type: 'Boolean', constraint: 'Default: false' },
        { name: 'createdAt', type: 'Date', constraint: 'Auto' },
        { name: 'updatedAt', type: 'Date', constraint: 'Auto' },
      ],
      relations: ['Job (via createdBy)', 'Application (via student)'],
    },
    {
      id: 'ent-job',
      name: 'Job',
      description: 'Job posting created by a recruiter. Contains eligibility criteria.',
      fields: [
        { name: '_id', type: 'ObjectId', constraint: 'PK' },
        { name: 'createdBy', type: 'ObjectId', constraint: 'FK → User (Recruiter)' },
        { name: 'title', type: 'String', constraint: 'Required' },
        { name: 'description', type: 'String', constraint: '' },
        { name: 'ctc', type: 'Number', constraint: 'LPA' },
        { name: 'deadline', type: 'Date', constraint: 'Required' },
        { name: 'status', type: 'Enum', constraint: 'draft | published | closed' },
        { name: 'eligibility', type: 'Object', constraint: 'minCGPA, branches[], year' },
        { name: 'createdAt', type: 'Date', constraint: 'Auto' },
      ],
      relations: ['User (createdBy FK)', 'Application (jobId FK)'],
    },
    {
      id: 'ent-application',
      name: 'Application',
      description: 'Junction entity linking a student to a job posting.',
      fields: [
        { name: '_id', type: 'ObjectId', constraint: 'PK' },
        { name: 'student', type: 'ObjectId', constraint: 'FK → User (Student)' },
        { name: 'job', type: 'ObjectId', constraint: 'FK → Job' },
        { name: 'resume', type: 'ObjectId', constraint: 'FK → Resume (optional)' },
        { name: 'status', type: 'Enum', constraint: 'applied | shortlisted | rejected | selected' },
        { name: 'appliedAt', type: 'Date', constraint: 'Auto' },
        { name: 'updatedAt', type: 'Date', constraint: 'Auto' },
      ],
      relations: ['User (student FK)', 'Job (job FK)', 'Resume (optional)'],
    },
    {
      id: 'ent-profile',
      name: 'StudentProfile',
      description: 'Extended profile for Student users. Linked 1:1 to User.',
      fields: [
        { name: '_id', type: 'ObjectId', constraint: 'PK' },
        { name: 'user', type: 'ObjectId', constraint: 'FK → User, Unique' },
        { name: 'cgpa', type: 'Number', constraint: 'Required, 0–10' },
        { name: 'branch', type: 'String', constraint: 'Required' },
        { name: 'graduationYear', type: 'Number', constraint: 'Required' },
        { name: 'skills', type: 'String[]', constraint: '' },
        { name: 'resumeUrl', type: 'String', constraint: 'Cloud storage URL' },
      ],
      relations: ['User (1:1)'],
    },
  ],
  sqlCode: `-- Users
CREATE TABLE users (
  _id       VARCHAR(24) PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(255) UNIQUE NOT NULL,
  password  VARCHAR(255) NOT NULL,
  role      ENUM('student','recruiter','admin') NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
  _id         VARCHAR(24) PRIMARY KEY,
  created_by  VARCHAR(24) REFERENCES users(_id),
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  ctc         DECIMAL(5,2),
  deadline    TIMESTAMP NOT NULL,
  status      ENUM('draft','published','closed') DEFAULT 'draft',
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
  _id        VARCHAR(24) PRIMARY KEY,
  student    VARCHAR(24) REFERENCES users(_id),
  job        VARCHAR(24) REFERENCES jobs(_id),
  status     ENUM('applied','shortlisted','rejected','selected') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (student, job)
);`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Status map for the sidebar — tracks which docs are "generated"
// In Phase 3 this comes from the API response.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_STATUS_MAP = {
  BRD:         { status: 'ready',         currentVersion: 2 },
  SRS:         { status: 'ready',         currentVersion: 1 },
  UserStories: { status: 'ready',         currentVersion: 1 },
  APISpec:     { status: 'ready',         currentVersion: 1 },
  DBSchema:    { status: 'ready',         currentVersion: 1 },
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_DOCS = { BRD: MOCK_BRD, SRS: MOCK_SRS, UserStories: MOCK_USER_STORIES, APISpec: MOCK_API_SPEC, DBSchema: MOCK_DB_SCHEMA };

/**
 * Fetch the status of all blueprint documents for a project.
 * Phase 3: GET /api/projects/:projectId/documents
 * @param {string} projectId
 * @returns {Promise<Object>} Map of docType → { status, currentVersion }
 */
export const fetchDocumentStatuses = async (projectId) => {
  // [DEMO] Mock — Phase 3: replace with api.get(`/api/projects/${projectId}/documents`)
  await new Promise(r => setTimeout(r, 600));
  return { ...MOCK_STATUS_MAP };
};

/**
 * Fetch a single blueprint document.
 * Phase 3: GET /api/projects/:projectId/documents/:type
 * @param {string} projectId
 * @param {string} docType - 'BRD' | 'SRS' | 'UserStories' | 'APISpec' | 'DBSchema'
 * @returns {Promise<Object>} Structured document data
 */
export const fetchDocument = async (projectId, docType) => {
  // [DEMO] Mock — Phase 3: replace with api.get(`/api/projects/${projectId}/documents/${docType}`)
  await new Promise(r => setTimeout(r, 400));
  const doc = MOCK_DOCS[docType];
  if (!doc) throw new Error(`Unknown document type: ${docType}`);
  // Only return "ready" docs; others throw to trigger empty state
  if (MOCK_STATUS_MAP[docType]?.status !== 'ready') {
    throw new Error('NOT_GENERATED');
  }
  return { ...doc, projectId };
};

/**
 * Save document content (edit mode).
 * Phase 3: PUT /api/projects/:projectId/documents/:type
 * @param {string} projectId
 * @param {string} docType
 * @param {Object} content - Updated document content
 * @returns {Promise<Object>} Saved document
 */
export const saveDocument = async (projectId, docType, content) => {
  // [DEMO] Mock — Phase 3: replace with api.put(...)
  await new Promise(r => setTimeout(r, 800));
  return { ...content, updatedAt: new Date().toISOString() };
};

/**
 * Fetch version history for a document.
 * Phase 3: GET /api/documents/:id/versions
 * @param {string} documentId
 * @returns {Promise<Array>} Array of version records
 */
export const fetchVersionHistory = async (documentId) => {
  // [DEMO] Mock — Phase 3: replace with api.get(`/api/documents/${documentId}/versions`)
  await new Promise(r => setTimeout(r, 300));
  return [
    { versionNumber: 2, changes: 'Refined business objectives and scope section.', createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { versionNumber: 1, changes: 'Initial AI generation.', createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  ];
};

// ─────────────────────────────────────────────────────────────────────────────
// Document Refinement (Mock Chat API)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_CHAT_HISTORY = {
  BRD: [],
  SRS: [],
  UserStories: [],
  APISpec: [],
  DBSchema: [],
};

/**
 * Fetch the chat history for a specific document.
 * Phase 3: GET /api/projects/:projectId/documents/:docType/chat
 */
export const fetchDocumentChat = async (projectId, docType) => {
  await new Promise(r => setTimeout(r, 400));
  return MOCK_CHAT_HISTORY[docType] || [];
};

/**
 * Send a prompt to refine the document.
 * Phase 3: POST /api/projects/:projectId/documents/:docType/refine
 */
export const refineDocument = async (projectId, docType, prompt) => {
  // 1. Add user message to mock history
  MOCK_CHAT_HISTORY[docType].push({
    id: Date.now().toString(),
    role: 'user',
    content: prompt,
    createdAt: new Date().toISOString(),
  });

  // 2. Simulate AI processing time (1.5s to 3s)
  await new Promise(r => setTimeout(r, 1500 + Math.random() * 1500));

  // 3. Mutate the mock document slightly to simulate a change
  const doc = MOCK_DOCS[docType];
  if (doc) {
    doc.currentVersion += 1;
    doc.updatedAt = new Date().toISOString();
    
    // Add a generic section or item based on type
    if (docType === 'BRD' || docType === 'SRS') {
      doc.sections.push({
        id: `section-refined-${Date.now()}`,
        title: 'Refined AI Addition',
        content: `This section was added as a result of the refinement request: "${prompt}".`,
      });
    } else if (docType === 'UserStories') {
      doc.stories.push({
        id: `US-${doc.stories.length + 1}`.padStart(6, '0'),
        title: 'Refined User Story',
        role: 'user',
        want: 'see the refined output',
        benefit: 'I know the chat works',
        actor: 'User',
        priority: 'Medium',
        acceptanceCriteria: ['Output is updated based on chat.'],
      });
    } else if (docType === 'APISpec') {
      doc.endpoints.push({
        id: `ep-refined-${Date.now()}`,
        group: 'Refined Endpoints',
        method: 'GET',
        path: '/api/v1/refined',
        title: 'Refined Endpoint',
        description: `Generated from request: ${prompt}`,
        auth: true,
      });
    } else if (docType === 'DBSchema') {
      doc.entities.push({
        id: `ent-refined-${Date.now()}`,
        name: 'RefinedEntity',
        description: `Added based on chat prompt: ${prompt}`,
        fields: [
          { name: '_id', type: 'ObjectId', constraint: 'PK' },
          { name: 'data', type: 'String', constraint: 'Added via chat' }
        ],
        relations: []
      });
    }
  }

  // 4. Add AI response to history
  const aiMessage = {
    id: (Date.now() + 1).toString(),
    role: 'ai',
    content: `I've updated the ${docType} based on your request. You should see the new content reflected in the document viewer.`,
    createdAt: new Date().toISOString(),
  };
  MOCK_CHAT_HISTORY[docType].push(aiMessage);

  return { message: aiMessage, updatedDocument: doc };
};
