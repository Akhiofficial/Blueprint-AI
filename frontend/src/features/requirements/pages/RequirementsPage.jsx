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
import {
  loadRequirements,
  saveRequirements,
  validateFile,
  ACCEPTED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from '../services/requirementService';

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

import WorkflowIndicator from '../../../components/common/WorkflowIndicator';

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p
    className="bp-mono uppercase mb-3"
    style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.28)' }}
  >
    {children}
  </p>
);

// ── Inline error ──────────────────────────────────────────────────────────────
const InlineError = ({ message }) =>
  message ? (
    <p
      role="alert"
      className="flex items-center gap-1.5 text-xs mt-2"
      style={{ color: '#F87171' }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="5" stroke="#F87171" strokeWidth="1.2" />
        <path d="M6 4v3M6 8.5v.5" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {message}
    </p>
  ) : null;

// ── Upload drop zone ──────────────────────────────────────────────────────────
const UploadZone = ({ file, onFile, onRemove, error, isDragging, onDragOver, onDragLeave, onDrop }) => {
  const fileInputRef = useRef(null);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      {file ? (
        /* ── File selected state ── */
        <div
          className="rounded-xl p-4 flex items-center gap-3 animate-fade-in"
          style={{
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.25)',
            borderRadius: '10px',
          }}
        >
          {/* File icon */}
          <div
            className="flex items-center justify-center shrink-0 rounded-lg"
            style={{
              width: 40, height: 40,
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 1.5h6.5L14 5v11.5H4z" stroke="#3B82F6" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M10.5 1.5V5H14" stroke="#3B82F6" strokeWidth="1.2" strokeLinejoin="round" />
              <path d="M6 8.5h6M6 11h4" stroke="#22D3EE" strokeWidth="1.1" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium truncate"
              style={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {file.name}
            </p>
            <p className="flex items-center gap-1.5 mt-0.5">
              <span
                className="text-xs bp-mono"
                style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}
              >
                {formatSize(file.size)}
              </span>
              <span style={{ color: '#34D399', fontSize: '0.7rem' }}>✓ Ready</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 text-xs px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{
              color: 'rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(239,68,68,0.7)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
            aria-label="Remove selected file"
          >
            Remove
          </button>
        </div>
      ) : (
        /* ── Drop zone ── */
        <div
          className="rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer"
          style={{
            padding: '2.5rem 1.5rem',
            border: isDragging
              ? '1.5px dashed rgba(59,130,246,0.6)'
              : '1.5px dashed rgba(255,255,255,0.1)',
            background: isDragging
              ? 'rgba(59,130,246,0.06)'
              : 'rgba(255,255,255,0.02)',
            borderRadius: '10px',
          }}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
          aria-label="Upload requirements document — click or drag and drop"
        >
          {/* Upload icon */}
          <div
            className="flex items-center justify-center mb-3 rounded-xl"
            style={{
              width: 44, height: 44,
              background: isDragging ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${isDragging ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M10 13V4M6.5 7L10 3.5 13.5 7"
                stroke={isDragging ? '#3B82F6' : 'rgba(255,255,255,0.4)'}
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 14v2a1 1 0 001 1h12a1 1 0 001-1v-2"
                stroke={isDragging ? '#22D3EE' : 'rgba(255,255,255,0.2)'}
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p
            className="text-sm mb-1"
            style={{ color: isDragging ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.45)' }}
          >
            {isDragging ? 'Release to upload' : (
              <>
                Drop your document here or{' '}
                <span style={{ color: '#3B82F6' }}>browse files</span>
              </>
            )}
          </p>
          <p
            className="bp-mono"
            style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.2)' }}
          >
            PDF · DOCX &nbsp;·&nbsp; MAX 10 MB
          </p>

          <input
            ref={fileInputRef}
            type="file"
            id="requirement-file-input"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            className="sr-only"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            aria-label="Choose a requirements document"
          />
        </div>
      )}

      <InlineError message={error} />
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const RequirementsPage = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, loading: projectLoading } = useProjectsContext();
  const { handleFetchProjectById } = useProjects();

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

  // ── Load saved text from localStorage ────────────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    const saved = loadRequirements(projectId);
    if (saved.text) {
      setText(saved.text);
      setLastSaved(saved.updatedAt);
    }
  }, [projectId]);

  // ── Auto-save on text change (debounced 800ms) ────────────────────────────
  useEffect(() => {
    if (!projectId) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (text.trim()) {
        const saved = saveRequirements(projectId, text);
        setLastSaved(saved.updatedAt);
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
  };

  // ── Switch mode ───────────────────────────────────────────────────────────
  const switchMode = (next) => {
    setMode(next);
    setTextError('');
    setFileError('');
    setSubmitError('');
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
      // Persist to localStorage
      saveRequirements(projectId, text);
      setLastSaved(new Date().toISOString());
    }

    if (mode === 'upload') {
      if (!file) {
        setFileError('Please select a file before continuing.');
        return;
      }
    }

    // Navigate to AI Analysis (Phase 2 route)
    // Phase 2: the analysis page will read from localStorage or call the API.
    setIsSubmitting(true);
    try {
      // Simulate a brief save acknowledgment before navigation
      await new Promise((r) => setTimeout(r, 400));
      navigate(`/projects/${projectId}/analysis`);
    } catch {
      setSubmitError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
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

                  {/* Phase 2 note */}
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
                      Document parsing (PDF / DOCX) will be processed server-side during analysis.
                      Ensure your document is clearly written and in English.
                    </p>
                  </div>
                </div>
              )}

              {/* Submit error */}
              {submitError && <InlineError message={submitError} />}
            </div>
          </div>

          {/* ── Right panel (guidance + action) ── */}
          <div className="flex flex-col gap-4">

            {/* Tips card */}
            <div style={CARD_STYLE} className="p-5">
              <SectionLabel>Writing tips</SectionLabel>
              <ul className="space-y-3 mt-1">
                {[
                  { icon: '👥', text: 'Describe your target users and their roles' },
                  { icon: '⚙️', text: 'List key features and functionality' },
                  { icon: '🔄', text: 'Outline core user workflows' },
                  { icon: '🚫', text: 'Note any constraints or assumptions' },
                  { icon: '📊', text: 'Mention performance or scale requirements' },
                ].map(({ icon, text }) => (
                  <li key={text} className="flex gap-2.5">
                    <span style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>{icon}</span>
                    <span
                      className="text-xs leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.3)' }}
                    >
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What BlueprintAI generates */}
            <div style={CARD_STYLE} className="p-5">
              <SectionLabel>Will generate</SectionLabel>
              <div className="space-y-2 mt-1">
                {['BRD', 'SRS', 'User Stories', 'REST API Design', 'Database Schema'].map((doc) => (
                  <div
                    key={doc}
                    className="flex items-center gap-2"
                  >
                    <div
                      style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: 'rgba(34,211,238,0.4)',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      className="text-xs"
                      style={{ color: 'rgba(255,255,255,0.28)' }}
                    >
                      {doc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div style={CARD_STYLE} className="p-5 flex flex-col gap-3">
              {/* Analyze button */}
              <button
                id="analyze-requirements-btn"
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 text-sm px-4 py-3 transition-all duration-150"
                style={{
                  background: isSubmitting
                    ? 'rgba(59,130,246,0.4)'
                    : 'linear-gradient(135deg,#1E40AF 0%,#2563EB 55%,#3B82F6 100%)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: 500,
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: isSubmitting ? 'none' : '0 1px 3px rgba(0,0,0,0.4),0 0 16px rgba(59,130,246,0.18)',
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5),0 0 24px rgba(59,130,246,0.28)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4),0 0 16px rgba(59,130,246,0.18)';
                  e.currentTarget.style.transform = 'none';
                }}
                aria-busy={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden />
                    Saving…
                  </>
                ) : (
                  <>
                    Analyze Requirements
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                      <path d="M2 6h8M6.5 3L9.5 6l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </>
                )}
              </button>

              {/* Back link */}
              <Link
                to={`/projects/${projectId}`}
                className="text-center text-xs transition-colors duration-150"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
              >
                ← Back to project
              </Link>

              {/* Phase 2 note for the analyze button */}
              <p
                className="bp-mono text-center"
                style={{ fontSize: '0.57rem', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.14)' }}
              >
                AI analysis is the next step
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RequirementsPage;
