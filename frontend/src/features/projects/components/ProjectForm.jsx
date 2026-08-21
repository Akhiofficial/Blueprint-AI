import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';

// ── Constants (unchanged from original) ─────────────────────────────────────
const CATEGORIES = ['Web App', 'Mobile', 'API', 'DevOps', 'AI / ML', 'Other'];

// ── Shared field label style ─────────────────────────────────────────────────
const FieldLabel = ({ htmlFor, children, required, hint }) => (
  <div className="flex items-baseline justify-between gap-2 mb-1.5">
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium"
      style={{ color: 'rgba(255,255,255,0.55)' }}
    >
      {children}
      {required && (
        <span style={{ color: '#22D3EE', marginLeft: '0.2rem' }}>*</span>
      )}
    </label>
    {hint && (
      <span
        className="bp-mono"
        style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.05em' }}
      >
        {hint}
      </span>
    )}
  </div>
);

// ── Shared input/textarea/select base styles ─────────────────────────────────
const fieldBase = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '8px',
  color: 'rgba(255,255,255,0.8)',
  outline: 'none',
  width: '100%',
  fontSize: '0.8125rem',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
};

const focusStyle = {
  borderColor: 'rgba(59,130,246,0.55)',
  boxShadow: '0 0 0 3px rgba(59,130,246,0.1)',
};

const blurStyle = {
  borderColor: 'rgba(255,255,255,0.09)',
  boxShadow: 'none',
};

// ── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ children, className = '' }) => (
  <div className={`flex flex-col ${className}`}>{children}</div>
);

// ── Section divider with label ────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div
    className="flex items-center gap-3 mb-5"
    style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem' }}
  >
    <span
      className="bp-mono uppercase whitespace-nowrap"
      style={{ fontSize: '0.58rem', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.25)' }}
    >
      {children}
    </span>
    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.04)' }} />
  </div>
);

// ── ProjectForm ──────────────────────────────────────────────────────────────
// Reusable for both Create and Edit (same contract as original).
// Props: onSubmit, defaultValues, isLoading, error, submitLabel
// ALL form logic, fields, and submission behaviour are preserved unchanged.
const ProjectForm = ({
  onSubmit,
  defaultValues = {},
  isLoading,
  error,
  submitLabel = 'Save Project',
  onCancel,
}) => {
  const [form, setForm] = useState({
    title:        defaultValues.title        || '',
    description:  defaultValues.description  || '',
    category:     defaultValues.category     || '',
    techStack:    defaultValues.techStack    || [],
    projectType:  defaultValues.projectType  || '',
    businessGoal: defaultValues.businessGoal || '',
    status:       defaultValues.status       || 'active',
  });
  const [tagInput, setTagInput] = useState('');

  // Sync when defaultValues change (edit mode) — logic unchanged
  useEffect(() => {
    if (defaultValues.title) {
      setForm({
        title:        defaultValues.title        || '',
        description:  defaultValues.description  || '',
        category:     defaultValues.category     || '',
        techStack:    defaultValues.techStack    || [],
        projectType:  defaultValues.projectType  || '',
        businessGoal: defaultValues.businessGoal || '',
        status:       defaultValues.status       || 'active',
      });
    }
  }, [defaultValues.title, defaultValues.projectType, defaultValues.businessGoal, defaultValues.status]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Tag chip logic — unchanged
  const addTag = (value) => {
    const tag = value.trim().replace(/,+$/, '');
    if (tag && !form.techStack.includes(tag)) {
      setForm({ ...form, techStack: [...form.techStack, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag) =>
    setForm({ ...form, techStack: form.techStack.filter((t) => t !== tag) });

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && form.techStack.length) {
      removeTag(form.techStack[form.techStack.length - 1]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);   // unchanged — calls the existing handler
  };

  return (
    <form id="project-form" onSubmit={handleSubmit} noValidate>
      {/* API error */}
      {error && <ErrorMessage message={error} className="mb-5" />}

      {/* ── Section: Project Identity ─────────────────────────── */}
      <div className="space-y-4 mb-0">

        {/* Title */}
        <Field>
          <FieldLabel htmlFor="title" required hint="REQUIRED">
            Project Name
          </FieldLabel>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            required
            placeholder="e.g. Campus Placement Platform"
            style={{ ...fieldBase, padding: '0.625rem 0.875rem' }}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            autoComplete="off"
          />
        </Field>

        {/* Description */}
        <Field>
          <FieldLabel htmlFor="description" required hint="REQUIRED · MIN 10 CHARS">
            Idea Description
          </FieldLabel>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Describe your software idea — what it does, who uses it, core features…"
            style={{ ...fieldBase, padding: '0.625rem 0.875rem', resize: 'vertical', minHeight: '96px' }}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, blurStyle)}
          />
        </Field>
      </div>

      <SectionLabel>Project Details</SectionLabel>

      <div className="space-y-4 mb-0">
        {/* Project Type */}
        <Field>
          <FieldLabel htmlFor="projectType" hint="OPTIONAL">
            Project Type
          </FieldLabel>
          <input
            id="projectType"
            name="projectType"
            type="text"
            value={form.projectType}
            onChange={handleChange}
            placeholder="e.g. SaaS, Marketplace, Internal Tool, Mobile App"
            style={{ ...fieldBase, padding: '0.625rem 0.875rem' }}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            autoComplete="off"
          />
        </Field>

        {/* Business Goal */}
        <Field>
          <FieldLabel htmlFor="businessGoal" hint="OPTIONAL">
            Business Goal
          </FieldLabel>
          <textarea
            id="businessGoal"
            name="businessGoal"
            value={form.businessGoal}
            onChange={handleChange}
            rows={3}
            placeholder="What is the primary business goal? e.g. Automate internal workflow, monetize via subscriptions…"
            style={{ ...fieldBase, padding: '0.625rem 0.875rem', resize: 'vertical', minHeight: '76px' }}
            onFocus={(e) => Object.assign(e.target.style, focusStyle)}
            onBlur={(e) => Object.assign(e.target.style, blurStyle)}
          />
        </Field>

        {/* Category + Status — two columns on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <Field>
            <FieldLabel htmlFor="category" hint="OPTIONAL">
              Category
            </FieldLabel>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ ...fieldBase, padding: '0.625rem 0.875rem', cursor: 'pointer', colorScheme: 'dark' }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            >
              <option value="" style={{ background: '#11161D', color: 'rgba(255,255,255,0.7)' }}>Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{ background: '#11161D', color: 'rgba(255,255,255,0.85)' }}>{c}</option>
              ))}
            </select>
          </Field>

          {/* Status */}
          <Field>
            <FieldLabel htmlFor="status" hint="OPTIONAL">
              Status
            </FieldLabel>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              style={{ ...fieldBase, padding: '0.625rem 0.875rem', cursor: 'pointer', colorScheme: 'dark' }}
              onFocus={(e) => Object.assign(e.target.style, focusStyle)}
              onBlur={(e) => Object.assign(e.target.style, blurStyle)}
            >
              <option value="active"    style={{ background: '#11161D', color: 'rgba(255,255,255,0.85)' }}>Active</option>
              <option value="archived"  style={{ background: '#11161D', color: 'rgba(255,255,255,0.85)' }}>Archived</option>
              <option value="completed" style={{ background: '#11161D', color: 'rgba(255,255,255,0.85)' }}>Completed</option>
            </select>
          </Field>
        </div>

        {/* Tech Stack — tag chip input (logic unchanged) */}
        <Field>
          <FieldLabel htmlFor="techStackInput" hint="ENTER OR COMMA TO ADD">
            Tech Stack
          </FieldLabel>
          {/* Chip container — no border, just subtle background */}
          <div
            className="flex flex-wrap items-center gap-1.5 min-h-[44px] transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '8px',
              border: 'none',
              padding: '0.4rem 0.75rem',
              cursor: 'text',
            }}
            tabIndex={-1}
          >
            {form.techStack.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bp-mono"
                style={{
                  background: 'rgba(59,130,246,0.12)',
                  border: '1px solid rgba(59,130,246,0.28)',
                  color: '#93C5FD',
                }}
              >
                {tag}
                <button
                  type="button"
                  id={`remove-tag-${tag}`}
                  onClick={() => removeTag(tag)}
                  className="transition-colors"
                  style={{ color: 'rgba(147,197,253,0.5)', lineHeight: 1 }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(239,68,68,0.8)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(147,197,253,0.5)'; }}
                  aria-label={`Remove ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="techStackInput"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => tagInput && addTag(tagInput)}
              placeholder={form.techStack.length ? '' : 'React, Node.js, MongoDB…'}
              className="flex-1 min-w-[130px] bg-transparent"
              style={{
                fontSize: '0.8125rem',
                color: 'rgba(255,255,255,0.75)',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                background: 'transparent',
              }}
              aria-label="Add technology to tech stack"
            />
          </div>
          <p
            className="mt-1.5 bp-mono"
            style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em' }}
          >
            Press Enter or comma to add a tag · Backspace to remove last
          </p>
        </Field>
      </div>

      {/* ── Actions ──────────────────────────────────────────── */}
      <div
        className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-8 pt-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Cancel */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto text-sm px-4 py-2 rounded-lg transition-all duration-150"
            style={{
              color: 'rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.35)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            Cancel
          </button>
        )}

        {/* Submit */}
        <button
          id="project-submit"
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-sm px-6 py-2.5 transition-all duration-150"
          style={{
            background: isLoading
              ? 'rgba(59,130,246,0.4)'
              : 'linear-gradient(135deg, #1E40AF 0%, #2563EB 55%, #3B82F6 100%)',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 500,
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: isLoading ? 'none' : '0 1px 3px rgba(0,0,0,0.4), 0 0 16px rgba(59,130,246,0.18)',
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.5), 0 0 24px rgba(59,130,246,0.28)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4), 0 0 16px rgba(59,130,246,0.18)';
            e.currentTarget.style.transform = 'none';
          }}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <span
                className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                aria-hidden
              />
              Creating Project…
            </>
          ) : (
            <>
              {submitLabel}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 6h8M6.5 3L9.5 6l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
