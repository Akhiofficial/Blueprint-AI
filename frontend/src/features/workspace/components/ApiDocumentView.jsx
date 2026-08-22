/**
 * ApiDocumentView.jsx
 *
 * Renders the REST API specification in API-documentation style.
 * Each endpoint shows: method badge, path, title, description,
 * auth requirement, query params, request body, and response.
 *
 * NOT a generic text document — purpose-built for API specs.
 */

import { useState } from 'react';

// HTTP method badge
const MethodBadge = ({ method }) => (
  <span className={`ws-method ws-method-${method}`}>{method}</span>
);

// JSON display block
const JsonBlock = ({ data, label }) => {
  if (!data) return null;
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="mt-2">
      {label && (
        <p
          className="bp-mono uppercase mb-1.5"
          style={{ fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}
        >
          {label}
        </p>
      )}
      <div className="ws-code-block">{json}</div>
    </div>
  );
};

// Query params table
const ParamsTable = ({ params }) => {
  if (!params) return null;
  const entries = Object.entries(params);
  return (
    <div className="mt-2">
      <p
        className="bp-mono uppercase mb-1.5"
        style={{ fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}
      >
        Query Parameters
      </p>
      <table className="ws-entity-table">
        <thead>
          <tr>
            <th>Parameter</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, val]) => (
            <tr key={key}>
              <td>
                <span className="bp-mono text-xs" style={{ color: '#22D3EE' }}>{key}</span>
              </td>
              <td style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Single endpoint card
const EndpointCard = ({ endpoint, isOpen, onToggle }) => {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: '#11161D',
        border: `1px solid ${isOpen ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: isOpen ? '0 0 0 1px rgba(59,130,246,0.06)' : 'none',
      }}
    >
      {/* Endpoint header — clickable to expand */}
      <button
        id={`ws-endpoint-${endpoint.id}`}
        onClick={onToggle}
        className="w-full text-left flex items-center gap-3 px-4 py-3 transition-colors"
        style={{ background: isOpen ? 'rgba(59,130,246,0.04)' : 'transparent' }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = 'transparent'; }}
      >
        <MethodBadge method={endpoint.method} />
        <span
          className="bp-mono text-xs flex-1 truncate"
          style={{ color: 'rgba(255,255,255,0.75)', letterSpacing: '0.04em' }}
        >
          {endpoint.path}
        </span>
        <span className="text-xs hidden sm:block" style={{ color: 'rgba(255,255,255,0.5)', flex: '0 0 auto' }}>
          {endpoint.title}
        </span>
        {endpoint.auth && (
          <span
            className="hidden sm:flex items-center gap-1 text-xs px-2 py-0.5 rounded"
            style={{ background: 'rgba(245,158,11,0.08)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.15)', flexShrink: 0 }}
          >
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden>
              <rect x="1" y="4" width="7" height="4.5" rx="1" stroke="currentColor" strokeWidth="1" />
              <path d="M2.5 4V3a2 2 0 0 1 4 0v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            </svg>
            Auth
          </span>
        )}
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{
            color: 'rgba(255,255,255,0.3)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s ease',
            flexShrink: 0,
          }}
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div className="px-4 pb-5 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Description */}
          <p className="text-sm mt-3 mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            {endpoint.description}
          </p>

          {/* Auth requirement */}
          {endpoint.auth !== undefined && (
            <div className="flex items-center gap-2 mb-4">
              <span className="bp-mono uppercase" style={{ fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}>
                Authentication
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={endpoint.auth
                  ? { background: 'rgba(245,158,11,0.08)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.15)' }
                  : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {endpoint.auth ? 'Required (JWT Bearer)' : 'Not required'}
              </span>
            </div>
          )}

          {/* Params, body, response */}
          <ParamsTable params={endpoint.queryParams} />
          {endpoint.requestBody && <JsonBlock data={endpoint.requestBody} label="Request Body" />}
          {endpoint.response && <JsonBlock data={endpoint.response} label="Response" />}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ApiDocumentView = ({ document }) => {
  const [openId, setOpenId] = useState(null);

  if (!document?.endpoints) return null;

  // Group endpoints by their group field
  const groups = document.endpoints.reduce((acc, ep) => {
    if (!acc[ep.group]) acc[ep.group] = [];
    acc[ep.group].push(ep);
    return acc;
  }, {});

  return (
    <div className="px-6 py-5 ws-enter-up">
      {/* Base URL */}
      <div className="mb-5 flex items-center gap-3">
        <p
          className="bp-mono uppercase"
          style={{ fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}
        >
          Base URL
        </p>
        <code
          className="bp-mono text-xs px-2.5 py-1 rounded-lg"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#22D3EE',
          }}
        >
          {document.baseUrl}
        </code>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {document.endpoints.length} endpoints
        </span>
      </div>

      {/* Endpoint groups */}
      <div className="space-y-6">
        {Object.entries(groups).map(([groupName, endpoints]) => (
          <section key={groupName}>
            <h3
              className="bp-mono uppercase mb-3"
              style={{
                fontSize: '0.6rem',
                letterSpacing: '0.14em',
                color: 'rgba(255,255,255,0.25)',
                paddingBottom: 8,
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              {groupName}
            </h3>
            <div className="space-y-2">
              {endpoints.map(ep => (
                <EndpointCard
                  key={ep.id}
                  endpoint={ep}
                  isOpen={openId === ep.id}
                  onToggle={() => setOpenId(prev => prev === ep.id ? null : ep.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default ApiDocumentView;
