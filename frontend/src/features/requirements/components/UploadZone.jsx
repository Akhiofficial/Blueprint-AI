/**
 * UploadZone.jsx
 * File dropzone & file selected state component.
 */

import { useRef } from 'react';
import InlineError from './InlineError';
import { ACCEPTED_EXTENSIONS } from '../services/requirementService';

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

export default UploadZone;
