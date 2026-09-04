/**
 * RequirementsPage.jsx
 *
 * Route: /projects/:id/requirements
 *
 * Step 3 in the BlueprintAI workflow:
 *   01 Project → 02 Requirements → 03 Analysis → 04 Blueprint
 *
 * The user enters their software requirements either by:
 *   A. Writing them manually in the text editor
 *   B. Uploading a PDF or DOCX document
 *
 * Phase 1 persistence: localStorage keyed by projectId
 * Phase 2: wire to POST /api/projects/:projectId/requirements
 *
 * Does NOT implement AI analysis — that is the next page.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import { useProjectsContext } from '../../projects/projects.context';
import useProjects from '../../projects/hooks/useProjects';
import useRequirements from '../hooks/useRequirements';
import {
  loadRequirements,
  saveRequirements,
  validateFile,
} from '../services/requirementService';
import WorkflowIndicator from '../../../components/common/WorkflowIndicator';
import SectionLabel from '../components/SectionLabel';
import InlineError from '../components/InlineError';
import UploadZone from '../components/UploadZone';
import RequirementsSidebar from '../components/RequirementsSidebar';

// ── Design tokens (match the rest of the app) ────────────────────────────────
const CARD_STYLE = {
  background: '#11161D',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 40px rgba(0,0,0,0.4)',
};

const FIELD_BASE = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '8px',
  color: 'rgba(255,255,255,0.8)',
  outline: 'none',
  fontSize: '0.875rem',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const FOCUS_STYLE = {
  borderColor: 'rgba(59,130,246,0.55)',
  boxShadow: '0 0 0 3px rgba(59,130,246,0.1)',
};

const BLUR_STYLE = {
  borderColor: 'rgba(255,255,255,0.09)',
  boxShadow: 'none',
};

// ── Minimum character threshold ───────────────────────────────────────────────
const MIN_CHARS = 30;

// ── Main Page ─────────────────────────────────────────────────────────────────
const RequirementsPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading: projectLoading } = useProjectsContext();
  const { handleFetchProjectById } = useProjects();
  const {
    uploadState,
    uploadError,
    uploadedDoc,
    handleUploadDocument,
    resetUpload,
  } = useRequirements();

  // ── Mode: 'write' | 'upload' ──────────────────────────────────────────────
  const [mode, setMode] = useState('write');

  // ── Write mode state ──────────────────────────────────────────────────────
  const [text, setText] = useState('');
  const [textError, setTextError] = useState('');
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimerRef = useRef(null);

  // ── Upload mode state ─────────────────────────────────────────────────────
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // ── Submit state ──────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ── Load project if not already in context ────────────────────────────────
  useEffect(() => {
    if (!currentProject || currentProject._id !== projectId) {
      handleFetchProjectById(projectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // ── Load saved text from API ────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    let isMounted = true;
    loadRequirements(projectId).then((saved) => {
      if (isMounted && saved.text) {
        setText(saved.text);
        setLastSaved(saved.updatedAt);
      }
    });
    return () => { isMounted = false; };
  }, [projectId]);

  // ── Auto-save on text change (debounced 800ms) ────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (text.trim()) {
        saveRequirements(projectId, text).then((saved) => {
          if (saved && saved.updatedAt) {
            setLastSaved(saved.updatedAt);
          }
        }).catch(err => console.error(err));
      }
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [text, projectId]);

  // ── Drag-and-drop handlers ────────────────────────────────────────────────
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    handleFileSelect(dropped);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileSelect = (selected) => {
    setFileError('');
    if (!selected) return;
    const err = validateFile(selected);
    if (err) {
      setFileError(err);
      return;
    }
    setFile(selected);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError('');
    resetUpload(); // clear hook state when user removes the file
  };

  // ── Switch mode ───────────────────────────────────────────────────────────
  const switchMode = (next) => {
    setMode(next);
    setTextError('');
    setFileError('');
    setSubmitError('');
    resetUpload();
  };

  // ── Validate and submit ───────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitError('');
    setTextError('');
    setFileError('');

    if (mode === 'write') {
      if (!text.trim()) {
        setTextError('Please describe your requirements before continuing.');
        return;
      }
      if (text.trim().length < MIN_CHARS) {
        setTextError(`Please add at least ${MIN_CHARS} characters to continue.`);
        return;
      }
      setIsSubmitting(true);
      try {
        await saveRequirements(projectId, text);
        setLastSaved(new Date().toISOString());
        navigate(`/projects/${projectId}/analysis`);
      } catch {
        setSubmitError('Something went wrong saving requirements. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (mode === 'upload') {
      if (!file) {
        setFileError('Please select a file before continuing.');
        return;
      }
      // Upload the file — the hook manages uploading/success/error states
      setIsSubmitting(true);
      try {
        const result = await handleUploadDocument(projectId, file);
        if (result) {
          // Populate the write-mode editor with the extracted text so the
          // user can review and edit it before running AI analysis.
          setText(result.extractedText);
          // Save the extracted text as a requirement record
          await saveRequirements(projectId, result.extractedText);
          setLastSaved(new Date().toISOString());
          // Switch to write mode so the user can see and edit the extracted text
          setMode('write');
          setFile(null);
        }
      } catch {
        setSubmitError('Upload failed. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ── Formatted last-saved timestamp ───────────────────────────────────────
  const savedLabel = lastSaved
    ? `Saved ${new Date(lastSaved).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    : null;

  const charCount = text.length;

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl animate-fade-in">

        {/* ── Workflow indicator ── */}
        <WorkflowIndicator current={1} />

        {/* ── Page header ── */}
        <header className="mb-7">
          {/* Eyebrow breadcrumb */}
          <div className="flex items-center gap-2 mb-3">
            <p
              className="bp-mono uppercase"
              style={{ fontSize: '0.62rem', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.22)' }}
            >
              <Link
                to={`/projects/${projectId}`}
                style={{ color: 'rgba(255,255,255,0.22)', transition: 'color 0.15s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; }}
              >
                {projectLoading ? '…' : currentProject?.title ?? 'Project'}
              </Link>
              <span className="mx-2" style={{ color: 'rgba(255,255,255,0.12)' }}>/</span>
              <span style={{ color: '#22D3EE' }}>Requirements</span>
            </p>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            <span
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Requirements
            </span>
          </h1>
          <p
            className="text-sm leading-relaxed max-w-lg"
            style={{ color: 'rgba(255,255,255,0.32)' }}
          >
            Describe your software requirements or upload an existing requirements document.
            BlueprintAI will use this information for requirement analysis.
          </p>
        </header>

        {/* ── Mode toggle ── */}
        <div
          className="flex gap-1 p-1 mb-6 w-fit rounded-lg"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
          role="tablist"
          aria-label="Input method"
        >
          {[
            { key: 'write',  label: 'Write Requirements' },
            { key: 'upload', label: 'Upload Document' },
          ].map(({ key, label }) => {
            const isActive = mode === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => switchMode(key)}
                id={`mode-tab-${key}`}
                className="px-4 py-2 text-xs font-medium rounded-md transition-all duration-150"
                style={{
                  background: isActive ? '#11161D' : 'transparent',
                  color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
                  border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                  boxShadow: isActive ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Content panels ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left panel (main input) ── */}
          <div className="lg:col-span-2">
            <div style={CARD_STYLE} className="p-6">

              {/* ── Write mode ── */}
              {mode === 'write' && (
                <div>
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <SectionLabel>Write your requirements</SectionLabel>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.28)', marginTop: '-0.5rem' }}
                      >
                        Describe your software idea, users, features, workflows and expectations.
                      </p>
                    </div>
                    {savedLabel && (
                      <span
                        className="text-xs bp-mono shrink-0 ml-3"
                        style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.6rem' }}
                      >
                        {savedLabel}
                      </span>
                    )}
                  </div>

                  <textarea
                    id="requirements-text"
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      if (textError) setTextError('');
                    }}
                    rows={18}
                    placeholder={`We are building a campus placement management platform for colleges.\n\nStudents should be able to:\n- Create and update their profiles\n- Browse eligible job postings\n- Apply for opportunities\n- Track application status\n\nRecruiters should be able to:\n- Create and manage job postings\n- Review and shortlist applicants\n\nAdministrators should:\n- Manage students, recruiters, and placement drives\n- Generate placement reports`}
                    style={{
                      ...FIELD_BASE,
                      width: '100%',
                      padding: '0.875rem 1rem',
                      resize: 'vertical',
                      minHeight: '380px',
                      lineHeight: 1.75,
                      fontFamily: 'inherit',
                    }}
                    onFocus={(e) => Object.assign(e.target.style, FOCUS_STYLE)}
                    onBlur={(e) => Object.assign(e.target.style, BLUR_STYLE)}
                    aria-label="Software requirements text"
                    aria-describedby={textError ? 'text-error' : undefined}
                  />

                  {/* Character count + error */}
                  <div className="flex items-center justify-between mt-2">
                    <InlineError message={textError} />
                    <span
                      className="ml-auto text-xs bp-mono"
                      style={{
                        color: charCount < MIN_CHARS ? 'rgba(255,255,255,0.2)' : 'rgba(34,211,238,0.45)',
                        fontSize: '0.6rem',
                      }}
                    >
                      {charCount} chars
                    </span>
                  </div>
                </div>
              )}

              {/* ── Upload mode ── */}
              {mode === 'upload' && (
                <div>
                  <SectionLabel>Upload requirements</SectionLabel>
                  <p
                    className="text-xs leading-relaxed mb-5"
                    style={{ color: 'rgba(255,255,255,0.28)', marginTop: '-0.5rem' }}
                  >
                    Already have a requirements document? Upload it here.
                  </p>

                  {/* Hide drop zone while upload is in progress or complete */}
                  {uploadState !== 'uploading' && uploadState !== 'success' && (
                    <UploadZone
                      file={file}
                      onFile={handleFileSelect}
                      onRemove={handleRemoveFile}
                      error={fileError}
                      isDragging={isDragging}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    />
                  )}

                  {/* ── Upload status feedback ── */}
                  {uploadState === 'uploading' && (
                    <div
                      className="flex items-center gap-3 rounded-xl p-4"
                      style={{
                        background: 'rgba(59,130,246,0.05)',
                        border: '1px solid rgba(59,130,246,0.15)',
                        borderRadius: '10px',
                      }}
                    >
                      <span
                        className="h-4 w-4 rounded-full border-2 border-white/20 border-t-blue-400 animate-spin shrink-0"
                        aria-hidden
                      />
                      <div>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Uploading…</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>Processing document text on the server</p>
                      </div>
                    </div>
                  )}

                  {uploadState === 'success' && uploadedDoc && (
                    <div
                      className="flex items-start gap-3 rounded-xl p-4"
                      style={{
                        background: 'rgba(52,211,153,0.05)',
                        border: '1px solid rgba(52,211,153,0.2)',
                        borderRadius: '10px',
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 mt-0.5">
                        <circle cx="8" cy="8" r="6" stroke="#34D399" strokeWidth="1.2" />
                        <path d="M5 8l2.5 2.5L11 5.5" stroke="#34D399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>
                          {uploadedDoc.filename} extracted successfully
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          Text has been loaded into the editor. Switching to Write mode…
                        </p>
                      </div>
                    </div>
                  )}

                  {uploadState === 'error' && uploadError && (
                    <InlineError message={uploadError} />
                  )}

                  {/* Supported formats info */}
                  {uploadState === 'idle' && (
                    <div
                      className="mt-5 flex gap-2.5 rounded-lg p-3.5"
                      style={{
                        background: 'rgba(59,130,246,0.05)',
                        border: '1px solid rgba(59,130,246,0.12)',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0 mt-0.5">
                        <circle cx="7" cy="7" r="5.5" stroke="#3B82F6" strokeWidth="1.1" />
                        <path d="M7 6v4M7 4.5v.5" stroke="#3B82F6" strokeWidth="1.1" strokeLinecap="round" />
                      </svg>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: 'rgba(255,255,255,0.3)' }}
                      >
                        Supported formats: PDF, DOCX, TXT (max 10 MB). Text is extracted
                        server-side and loaded into the editor for review.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Submit error */}
              {submitError && <InlineError message={submitError} />}
            </div>
          </div>

          {/* ── Right panel (guidance + action) ── */}
          <RequirementsSidebar
            projectId={projectId}
            mode={mode}
            file={file}
            isSubmitting={isSubmitting}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequirementsPage;
