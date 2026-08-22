/**
 * analysisService.js
 *
 * AI Analysis Data Layer (Mock for Phase 2)
 *
 * PHASE 3 NOTE:
 * The Blueprint AI Engine is not yet implemented on the backend.
 * This service simulates the network latency and processing stages
 * of the future AI analysis endpoint. It returns strictly labeled
 * mock data so the UI can be built and tested without faking
 * an actual production AI response.
 *
 * When Phase 3 is ready, replace `analyzeRequirements` with an axios call.
 */

import { loadRequirements } from '../../requirements/services/requirementService';

// ── Mock Data Factory ────────────────────────────────────────────────────────

const generateMockAnalysis = (projectId) => {
  // Load original text for the source view
  const { text: originalRequirements } = loadRequirements(projectId);

  return {
    projectId,
    status: 'completed',
    originalRequirements: originalRequirements || 'No requirements provided.',
    
    // Summary counts
    summary: {
      functional: 4,
      nonFunctional: 3,
      roles: 3,
      modules: 4,
    },

    roles: [
      { id: 'ROLE-001', name: '[DEMO] Student', description: 'Primary user who browses and applies for jobs.' },
      { id: 'ROLE-002', name: '[DEMO] Recruiter', description: 'Company representative who posts jobs and reviews applicants.' },
      { id: 'ROLE-003', name: '[DEMO] Administrator', description: 'Platform manager who oversees users and placement drives.' },
    ],

    modules: [
      { id: 'MOD-001', name: '[DEMO] User Authentication', description: 'Handles registration, login, and JWT session management.' },
      { id: 'MOD-002', name: '[DEMO] Student Profiles', description: 'Manages student resumes, academic records, and portfolios.' },
      { id: 'MOD-003', name: '[DEMO] Job Postings', description: 'CRUD operations for job listings and company profiles.' },
      { id: 'MOD-004', name: '[DEMO] Application Tracking', description: 'Workflows for job applications, shortlisting, and status updates.' },
    ],

    functionalRequirements: [
      {
        id: 'FR-001',
        title: '[DEMO] Student Registration',
        description: 'Students should be able to create an account using their college email address.',
        actor: 'Student',
        priority: 'High',
      },
      {
        id: 'FR-002',
        title: '[DEMO] Job Application',
        description: 'Students should be able to apply for jobs for which they meet the eligibility criteria.',
        actor: 'Student',
        priority: 'High',
      },
      {
        id: 'FR-003',
        title: '[DEMO] Create Job Posting',
        description: 'Recruiters should be able to create and publish new job opportunities.',
        actor: 'Recruiter',
        priority: 'High',
      },
      {
        id: 'FR-004',
        title: '[DEMO] Review Applicants',
        description: 'Recruiters must be able to view, filter, and shortlist student applications.',
        actor: 'Recruiter',
        priority: 'Medium',
      },
    ],

    nonFunctionalRequirements: [
      {
        id: 'NFR-001',
        title: '[DEMO] Performance',
        description: 'API response times should be under 200ms for 95% of standard requests.',
        category: 'Performance',
        priority: 'Medium',
      },
      {
        id: 'NFR-002',
        title: '[DEMO] Security',
        description: 'All passwords must be hashed using bcrypt (cost factor 10) before database storage.',
        category: 'Security',
        priority: 'High',
      },
      {
        id: 'NFR-003',
        title: '[DEMO] Availability',
        description: 'The platform must maintain 99.9% uptime during peak placement season.',
        category: 'Availability',
        priority: 'High',
      },
    ]
  };
};

// ── Orchestrator ────────────────────────────────────────────────────────────

export const ANALYSIS_STAGES = [
  { id: 'reading', label: 'Reading requirements' },
  { id: 'scope', label: 'Identifying project scope' },
  { id: 'extract-fr', label: 'Extracting functional requirements' },
  { id: 'extract-nfr', label: 'Identifying non-functional requirements' },
  { id: 'context', label: 'Organizing project context' },
];

/**
 * Simulates the AI analysis process.
 * @param {string} projectId 
 * @param {function(number)} onProgress - Callback receiving the current stage index (0-4)
 * @returns {Promise<Object>} Mock structured analysis payload
 */
export const analyzeRequirements = (projectId, onProgress) => {
  return new Promise((resolve) => {
    let currentStage = 0;
    
    // Simulate real-time progress updates every 800ms
    const interval = setInterval(() => {
      onProgress(currentStage);
      currentStage++;

      if (currentStage >= ANALYSIS_STAGES.length) {
        clearInterval(interval);
        // Wait a final 600ms before returning the result to simulate compilation
        setTimeout(() => {
          resolve(generateMockAnalysis(projectId));
        }, 600);
      }
    }, 800);
  });
};
