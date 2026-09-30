/**
 * ApiDocumentView.jsx
 *
 * Renders the REST API specification in API-documentation style with view and edit modes.
 * In edit mode, supports modifying:
 *   - Method (GET/POST/PUT/DELETE/PATCH), Path, Title, Description
 *   - Group name
 *   - Auth requirement toggle
 *   - Query Parameters (key: description / schema)
 *   - Request Body schema
 *   - Responses mapping
 *   - Adding and deleting endpoints
 */

import { useState, useEffect, useCallback, memo } from 'react';

// HTTP method badge
const MethodBadge = ({ method }) => (
  <span className={`ws-method ws-method-${method}`}>{method}</span>
);

// JSON display block
const JsonBlock = ({ data, label }) => {
  if (!data) return null;
  const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
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
  const entries = typeof params === 'object' && !Array.isArray(params)
    ? Object.entries(params)
    : [];
  if (entries.length === 0) return null;

  return (
    <div className="mt-2">
      <p
        className="bp-mono uppercase mb-1.5"
        style={{ fontSize: '0.58rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}
      >
        Query Parameters
      </p>
      <div className="overflow-x-auto">
        <table className="ws-entity-table min-w-full">
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
                <td style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.78rem' }}>
                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Single endpoint card (memoized for performance)
const EndpointCard = memo(({
  endpoint,
  isOpen,
  onToggle,
  isEditing,
  onEndpointChange,
  onDelete
}) => {
  const handleFieldChange = (field, value) => {
    onEndpointChange?.({ ...endpoint, [field]: value });
  };

  const handleJsonFieldChange = (field, rawText) => {
    try {
      const parsed = JSON.parse(rawText);
      handleFieldChange(field, parsed);
    } catch {
      handleFieldChange(field, rawText);
    }
  };

  if (isEditing) {
    return (
      <div
        className="rounded-xl overflow-hidden p-4 space-y-4 mb-3"
        style={{
          background: '#11161D',
          border: '1px solid rgba(59,130,246,0.3)',
        }}
      >
        {/* Method & Path Header */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={endpoint.method || 'GET'}
            onChange={(e) => handleFieldChange('method', e.target.value)}
            className="rounded px-2.5 py-1 text-xs font-bold uppercase bg-white/5 border border-white/15 text-white outline-none cursor-pointer"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input
            type="text"
            className="flex-1 min-w-[200px] rounded px-3 py-1 text-xs bp-mono bg-white/5 border border-white/10 text-cyan-300 focus:border-blue-500 outline-none"
            value={endpoint.path || ''}
            onChange={(e) => handleFieldChange('path', e.target.value)}
            placeholder="/api/v1/resource"
          />
          <input
            type="text"
            className="w-48 rounded px-3 py-1 text-xs bg-white/5 border border-white/10 text-white/80 focus:border-blue-500 outline-none"
            value={endpoint.title || ''}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            placeholder="Endpoint Title"
          />
          <input
            type="text"
            className="w-32 rounded px-2.5 py-1 text-xs bg-white/5 border border-white/10 text-white/70 focus:border-blue-500 outline-none"
            value={endpoint.group || ''}
            onChange={(e) => handleFieldChange('group', e.target.value)}
            placeholder="Group (e.g. Auth)"
          />
          <label className="flex items-center gap-1.5 text-xs text-amber-300/90 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!endpoint.auth}
              onChange={(e) => handleFieldChange('auth', e.target.checked)}
              className="rounded accent-amber-500"
            />
            Auth Required
          </label>
          <button
            type="button"
            onClick={onDelete}
            className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-500/10 transition-colors ml-auto"
            title="Delete this endpoint"
          >
            Delete
          </button>
        </div>

        {/* Description */}
        <div>
          <label className="block bp-mono uppercase mb-1 text-[0.6rem] tracking-wider text-white/40">
            Description
          </label>
          <textarea
            className="w-full rounded-lg px-3 py-1.5 text-xs bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none min-h-[50px]"
            value={endpoint.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Endpoint purpose and functionality"
          />
        </div>

        {/* Request Body, Query Params & Response JSON */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block bp-mono uppercase mb-1 text-[0.6rem] tracking-wider text-white/40">
              Query Parameters (JSON)
            </label>
            <textarea
              className="w-full rounded-lg px-3 py-2 text-xs bp-mono bg-white/5 border border-white/10 text-cyan-200 focus:border-blue-500 outline-none min-h-[90px]"
              value={
                endpoint.queryParams
                  ? (typeof endpoint.queryParams === 'string'
                      ? endpoint.queryParams
                      : JSON.stringify(endpoint.queryParams, null, 2))
                  : ''
              }
              onChange={(e) => handleJsonFieldChange('queryParams', e.target.value)}
              placeholder='{\n  "page": "number (optional)"\n}'
            />
          </div>
          <div>
            <label className="block bp-mono uppercase mb-1 text-[0.6rem] tracking-wider text-white/40">
              Request Body (JSON Schema)
            </label>
            <textarea
              className="w-full rounded-lg px-3 py-2 text-xs bp-mono bg-white/5 border border-white/10 text-cyan-200 focus:border-blue-500 outline-none min-h-[90px]"
              value={
                endpoint.requestBody
                  ? (typeof endpoint.requestBody === 'string'
                      ? endpoint.requestBody
                      : JSON.stringify(endpoint.requestBody, null, 2))
                  : ''
              }
              onChange={(e) => handleJsonFieldChange('requestBody', e.target.value)}
              placeholder='{\n  "email": "string (required)"\n}'
            />
          </div>
          <div>
            <label className="block bp-mono uppercase mb-1 text-[0.6rem] tracking-wider text-white/40">
              Responses (Status Map JSON)
            </label>
            <textarea
              className="w-full rounded-lg px-3 py-2 text-xs bp-mono bg-white/5 border border-white/10 text-emerald-200 focus:border-blue-500 outline-none min-h-[90px]"
              value={
                endpoint.response
                  ? (typeof endpoint.response === 'string'
                      ? endpoint.response
                      : JSON.stringify(endpoint.response, null, 2))
                  : ''
              }
              onChange={(e) => handleJsonFieldChange('response', e.target.value)}
              placeholder='{\n  "200": "OK - Success",\n  "400": "Bad Request"\n}'
            />
          </div>
        </div>
      </div>
    );
  }

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
});

EndpointCard.displayName = 'EndpointCard';

// ─── Main Component ───────────────────────────────────────────────────────────

const ApiDocumentView = ({ document, isEditing, onEndpointsChange }) => {
  const [openId, setOpenId] = useState(null);
  const [draftEndpoints, setDraftEndpoints] = useState(() => document?.endpoints || []);

  // Sync draftEndpoints whenever document updates or edit mode toggles
  useEffect(() => {
    if (document?.endpoints) {
      setDraftEndpoints(document.endpoints);
    }
  }, [document?.endpoints, isEditing]);

  const handleEndpointChange = useCallback((idx, updatedEndpoint) => {
    setDraftEndpoints(prev => {
      const next = [...prev];
      next[idx] = updatedEndpoint;
      onEndpointsChange?.(next);
      return next;
    });
  }, [onEndpointsChange]);

  const handleAddEndpoint = useCallback(() => {
    const newId = `ep-${Date.now()}`;
    const newEndpoint = {
      id: newId,
      group: 'General',
      method: 'GET',
      path: '/api/v1/resource',
      title: 'New Endpoint',
      description: 'Endpoint description and functionality',
      auth: false,
      queryParams: null,
      requestBody: null,
      response: { '200': 'Success' },
    };
    setDraftEndpoints(prev => {
      const next = [...prev, newEndpoint];
      onEndpointsChange?.(next);
      return next;
    });
  }, [onEndpointsChange]);

  const handleDeleteEndpoint = useCallback((idx) => {
    setDraftEndpoints(prev => {
      const next = prev.filter((_, i) => i !== idx);
      onEndpointsChange?.(next);
      return next;
    });
  }, [onEndpointsChange]);

  if (!document?.endpoints && draftEndpoints.length === 0) return null;

  const currentList = isEditing ? draftEndpoints : (document?.endpoints || []);

  // Group endpoints by their group field (keeping original indices)
  const groups = currentList.reduce((acc, ep, index) => {
    const groupName = ep.group || 'General';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push({ ep, index });
    return acc;
  }, {});

  return (
    <div className="px-6 py-5 ws-enter-up">
      {/* Header bar */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
            {document?.baseUrl || '/api/v1'}
          </code>
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {currentList.length} endpoints
          </span>
        </div>
        {isEditing && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-blue-400 font-medium">
              Editing Endpoints
            </span>
            <button
              onClick={handleAddEndpoint}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-900/20"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Endpoint
            </button>
          </div>
        )}
      </div>

      {/* Endpoint groups */}
      <div className="space-y-6">
        {Object.entries(groups).map(([groupName, items]) => (
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
              {items.map(({ ep, index }) => (
                <EndpointCard
                  key={ep.id || index}
                  endpoint={ep}
                  isOpen={isEditing || openId === ep.id}
                  onToggle={() => setOpenId(prev => prev === ep.id ? null : ep.id)}
                  isEditing={isEditing}
                  onEndpointChange={(updated) => handleEndpointChange(index, updated)}
                  onDelete={() => handleDeleteEndpoint(index)}
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
