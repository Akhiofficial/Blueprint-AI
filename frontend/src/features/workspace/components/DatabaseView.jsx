/**
 * DatabaseView.jsx
 *
 * Database Schema document viewer with three tabs:
 *   [Diagram] — Visual ER-style entity relationship diagram (SVG/CSS)
 *   [Schema]  — Structured entity + field tables
 *   [Code]    — SQL DDL / Mongoose schema code
 *
 * Mermaid.js is NOT installed. The diagram is built with
 * inline SVG and CSS — visually equivalent, zero new dependencies.
 */

import { useState } from 'react';

// ─── Tab Button ───────────────────────────────────────────────────────────────

const Tab = ({ label, isActive, onClick, id }) => (
  <button
    id={id}
    onClick={onClick}
    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
    style={{
      background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
      color: isActive ? '#60A5FA' : 'rgba(255,255,255,0.35)',
      border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
    }}
    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
  >
    {label}
  </button>
);

// ─── Diagram Tab — CSS Entity-Relationship Diagram ───────────────────────────

const EntityBox = ({ entity, x, y }) => (
  <g transform={`translate(${x}, ${y})`}>
    {/* Box background */}
    <rect
      width="160" height={32 + entity.fields.slice(0, 5).length * 22}
      rx="8" fill="#11161D"
      stroke="rgba(59,130,246,0.3)" strokeWidth="1"
    />
    {/* Header bar */}
    <rect width="160" height="28" rx="8" fill="rgba(59,130,246,0.12)" />
    <rect y="20" width="160" height="8" fill="rgba(59,130,246,0.12)" />
    <text x="12" y="18" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.9)" fontFamily="Inter, sans-serif">
      {entity.name}
    </text>
    {/* Fields */}
    {entity.fields.slice(0, 5).map((field, i) => (
      <g key={field.name} transform={`translate(0, ${28 + i * 22})`}>
        <text x="12" y="15" fontSize="9.5" fill="rgba(255,255,255,0.55)" fontFamily="'JetBrains Mono', monospace">
          {field.name}
        </text>
        <text x="148" y="15" fontSize="9" fill="rgba(34,211,238,0.7)" fontFamily="'JetBrains Mono', monospace" textAnchor="end">
          {field.type}
        </text>
      </g>
    ))}
    {entity.fields.length > 5 && (
      <text x="12" y={28 + 5 * 22 - 5} fontSize="9" fill="rgba(255,255,255,0.25)" fontFamily="inherit">
        +{entity.fields.length - 5} more fields
      </text>
    )}
  </g>
);

// Relation lines between entities (simplified layout)
const ENTITY_POSITIONS = {
  0: { x: 20,  y: 80 },
  1: { x: 220, y: 20 },
  2: { x: 220, y: 240 },
  3: { x: 420, y: 80 },
};

const DiagramTab = ({ entities }) => {
  const positions = entities.map((e, i) => ({ ...e, ...ENTITY_POSITIONS[i] }));

  // Relation connector: center-right of source → center-left of target
  const getConnector = (fromIdx, toIdx) => {
    const from = ENTITY_POSITIONS[fromIdx];
    const to   = ENTITY_POSITIONS[toIdx];
    if (!from || !to) return null;
    const fx = from.x + 160;
    const fy = from.y + 50;
    const tx = to.x;
    const ty = to.y + 50;
    const mx = (fx + tx) / 2;
    return `M${fx},${fy} C${mx},${fy} ${mx},${ty} ${tx},${ty}`;
  };

  const connectors = [
    { from: 0, to: 1, label: '1:N' },
    { from: 0, to: 2, label: '1:N' },
    { from: 1, to: 2, label: '1:N' },
    { from: 0, to: 3, label: '1:1' },
  ];

  return (
    <div className="ws-enter-up">
      <div
        className="rounded-xl overflow-auto"
        style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <svg
          viewBox="0 0 620 430"
          width="100%"
          style={{ minWidth: 500, display: 'block' }}
          aria-label="Entity relationship diagram"
        >
          {/* Grid dots background */}
          <defs>
            <pattern id="db-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.8" fill="rgba(255,255,255,0.06)" />
            </pattern>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="rgba(59,130,246,0.4)" />
            </marker>
          </defs>
          <rect width="100%" height="100%" fill="url(#db-grid)" />

          {/* Connector lines */}
          {connectors.map((c, i) => {
            const path = getConnector(c.from, c.to);
            if (!path) return null;
            return (
              <g key={i}>
                <path
                  d={path}
                  stroke="rgba(59,130,246,0.3)"
                  strokeWidth="1.5"
                  fill="none"
                  strokeDasharray="5 3"
                  markerEnd="url(#arrow)"
                />
              </g>
            );
          })}

          {/* Entity boxes */}
          {positions.map((entity, i) => (
            <EntityBox key={entity.id} entity={entity} x={entity.x} y={entity.y} />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <span className="flex items-center gap-1.5">
          <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(59,130,246,0.4)', borderTop: '1px dashed rgba(59,130,246,0.4)' }} />
          Relationship
        </span>
        <span className="flex items-center gap-1.5">
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }} />
          Entity
        </span>
        <span style={{ color: 'rgba(255,255,255,0.18)' }}>
          Phase 3: interactive diagram with real schema data
        </span>
      </div>
    </div>
  );
};

// ─── Schema Tab — Structured entity tables ───────────────────────────────────

const SchemaTab = ({ entities }) => (
  <div className="space-y-6 ws-enter-up">
    {entities.map(entity => (
      <div
        key={entity.id}
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        {/* Entity header */}
        <div
          className="px-4 py-3 flex items-start justify-between gap-3"
          style={{ background: 'rgba(59,130,246,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
              {entity.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {entity.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {entity.relations.map((r, i) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(34,211,238,0.07)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.12)', fontSize: '0.65rem' }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Fields table */}
        <table className="ws-entity-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Constraint</th>
            </tr>
          </thead>
          <tbody>
            {entity.fields.map((field) => (
              <tr key={field.name}>
                <td>
                  <span className="bp-mono text-xs" style={{ color: field.constraint?.includes('PK') ? '#22D3EE' : field.constraint?.includes('FK') ? '#C084FC' : 'rgba(255,255,255,0.8)' }}>
                    {field.name}
                  </span>
                </td>
                <td>
                  <span className="bp-mono text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{field.type}</span>
                </td>
                <td>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{field.constraint}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ))}

    {/* Field constraint legend */}
    <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'rgba(255,255,255,0.3)' }}>
      <span><span style={{ color: '#22D3EE' }}>Cyan</span> = Primary Key</span>
      <span><span style={{ color: '#C084FC' }}>Purple</span> = Foreign Key</span>
    </div>
  </div>
);

// ─── Code Tab ─────────────────────────────────────────────────────────────────

const CodeTab = ({ sqlCode }) => (
  <div className="ws-enter-up">
    <div className="flex items-center justify-between mb-3">
      <p
        className="bp-mono uppercase"
        style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.3)' }}
      >
        SQL DDL (MySQL / PostgreSQL compatible)
      </p>
    </div>
    <div className="ws-code-block overflow-x-auto">{sqlCode}</div>
    <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
      Phase 3: generated from actual schema data. Mongoose model code also available.
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'diagram', label: 'Diagram' },
  { id: 'schema',  label: 'Schema' },
  { id: 'code',    label: 'Code' },
];

const DatabaseView = ({ document }) => {
  const [activeTab, setActiveTab] = useState('diagram');

  if (!document?.entities) return null;

  return (
    <div className="px-6 py-5">
      {/* Tab bar */}
      <div className="flex items-center gap-1.5 mb-5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {TABS.map(tab => (
          <Tab
            key={tab.id}
            id={`ws-db-tab-${tab.id}`}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'diagram' && <DiagramTab entities={document.entities} />}
      {activeTab === 'schema'  && <SchemaTab  entities={document.entities} />}
      {activeTab === 'code'    && <CodeTab    sqlCode={document.sqlCode} />}
    </div>
  );
};

export default DatabaseView;
