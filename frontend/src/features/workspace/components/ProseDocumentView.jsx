/**
 * ProseDocumentView.jsx
 *
 * Renders BRD and SRS documents as professional structured documentation.
 * Each section supports:
 *   - View mode: rich typography, tables, lists
 *   - Inline "Regenerate Section" chip
 *   - Edit mode: textarea per section (triggered from parent)
 *
 * Section shape from workspaceService:
 *   { id, title, content?, items?, table? }
 */

import { useState } from 'react';

// ─── Section-level Regenerate UI ────────────────────────────────────────────

const SectionRegenButton = ({ onRegen, isRegenerating }) => {
  const [confirmed, setConfirmed] = useState(false);

  if (isRegenerating) {
    return (
      <span
        className="flex items-center gap-1.5 text-xs animate-pulse"
        style={{ color: '#60A5FA' }}
      >
        <span className="w-2.5 h-2.5 rounded-full border-2 border-blue-400/30 border-t-blue-400 animate-spin" />
        Regenerating…
      </span>
    );
  }

  if (confirmed) {
    return (
      <span className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
        <span>Regenerate this section?</span>
        <button
          className="font-semibold transition-colors"
          style={{ color: '#60A5FA' }}
          onClick={() => { setConfirmed(false); onRegen?.(); }}
          onMouseEnter={e => { e.currentTarget.style.color = '#93C5FD'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#60A5FA'; }}
        >
          Confirm
        </button>
        <button
          style={{ color: 'rgba(255,255,255,0.3)' }}
          className="hover:text-white transition-colors"
          onClick={() => setConfirmed(false)}
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirmed(true)}
      className="flex items-center gap-1 text-xs transition-all opacity-0 group-hover:opacity-100"
      style={{ color: 'rgba(255,255,255,0.25)' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#60A5FA'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.25)'; }}
      title="Regenerate this section only"
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
        <path d="M9 5A4 4 0 1 1 6.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <path d="M6.5 0v2.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Regenerate section
    </button>
  );
};

// ─── Section Renderers ────────────────────────────────────────────────────────

const SectionTable = ({ table }) => (
  <div className="overflow-x-auto mt-3">
    <table className="ws-entity-table">
      <thead>
        <tr>
          {table.headers.map(h => <th key={h}>{h}</th>)}
        </tr>
      </thead>
      <tbody>
        {table.rows.map((row, ri) => (
          <tr key={ri}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ color: ci === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.6)' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SectionContent = ({ section }) => {
  if (section.table) {
    return (
      <>
        {section.content && (
          <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {section.content}
          </p>
        )}
        <SectionTable table={section.table} />
      </>
    );
  }

  if (section.items) {
    return (
      <ul className="space-y-2 mt-2">
        {section.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <span className="shrink-0 mt-1.5" style={{ width: 5, height: 5, borderRadius: '50%', background: '#3B82F6', display: 'inline-block' }} />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.75 }}>
      {section.content}
    </p>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ProseDocumentView = ({ document, isEditing, onFieldChange, regenSectionId, onRegenSection }) => {
  if (!document?.sections) return null;

  return (
    <div className="space-y-1 ws-enter-up">
      {document.sections.map((section, idx) => {
        const isThisRegenerating = regenSectionId === section.id;

        return (
          <div
            key={section.id}
            className="ws-doc-section group px-6 py-5"
            style={{ animationDelay: `${idx * 40}ms` }}
          >
            {/* Section header */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3
                className="text-sm font-semibold tracking-tight"
                style={{ color: 'rgba(255,255,255,0.88)' }}
              >
                {section.title}
              </h3>
              <div className="shrink-0 pt-0.5">
                <SectionRegenButton
                  onRegen={() => onRegenSection?.(section.id)}
                  isRegenerating={isThisRegenerating}
                />
              </div>
            </div>

            {/* Section content — view or edit mode */}
            {isEditing ? (
              <textarea
                id={`ws-edit-${section.id}`}
                key={`edit-${section.id}-${section.content || (section.items ? section.items.join('|') : '') || (section.table ? section.table.rows?.length : '')}`}
                className="w-full rounded-lg px-4 py-3 text-sm leading-relaxed transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: 'rgba(255,255,255,0.8)',
                  outline: 'none',
                  minHeight: 100,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                defaultValue={
                  section.content ||
                  (section.items ? section.items.join('\n') : '') ||
                  (section.table ? JSON.stringify(section.table.rows, null, 2) : '')
                }
                onChange={(e) => onFieldChange?.(section.id, e.target.value)}
                onFocus={e => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)'; }}
                onBlur={e => { e.currentTarget.style.boxShadow = 'none'; }}
              />
            ) : (
              isThisRegenerating ? (
                <div className="h-16 rounded-lg skeleton" />
              ) : (
                <SectionContent section={section} />
              )
            )}

            {/* Divider between sections */}
            {idx < document.sections.length - 1 && (
              <div className="mt-5" style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProseDocumentView;
