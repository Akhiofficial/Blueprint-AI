/**
 * DatabaseView.jsx
 *
 * Database Schema document viewer with three synchronized views:
 *   [Diagram] — Interactive React Flow ER diagram derived directly from structured entities
 *   [Schema]  — Structured entity + field tables with full manual editing
 *   [Code]    — Live SQL DDL derived from structured entities
 *
 * All three tabs share a single source of truth: the structured schema entities.
 */

import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Background,
  ReactFlowProvider,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import EntityNode from './EntityNode';

// ─── SQL DDL Generator ────────────────────────────────────────────────────────
export const generateSqlFromEntities = (entities) => {
  if (!entities || entities.length === 0) return '-- No database entities defined.';
  return entities.map(entity => {
    const tableName = (entity.name || 'unnamed_table').toLowerCase().replace(/\s+/g, '_');
    const fieldDefs = (entity.fields || []).map(f => {
      const colName = (f.name || 'column').toLowerCase().replace(/\s+/g, '_');
      let colType = (f.type || 'VARCHAR(255)').toUpperCase();
      if (colType === 'STRING') colType = 'VARCHAR(255)';
      if (colType === 'OBJECTID') colType = 'VARCHAR(36)';
      if (colType === 'NUMBER') colType = 'INT';
      if (colType === 'BOOLEAN') colType = 'BOOLEAN';
      if (colType === 'DATE') colType = 'TIMESTAMP';

      const constraints = [];
      const c = (f.constraint || '').toUpperCase();
      if (c.includes('PK') || c.includes('PRIMARY')) constraints.push('PRIMARY KEY');
      if (c.includes('REQUIRED') || c.includes('NOT NULL')) constraints.push('NOT NULL');
      if (c.includes('UNIQUE')) constraints.push('UNIQUE');

      return `  ${colName.padEnd(16)} ${colType}${constraints.length ? ' ' + constraints.join(' ') : ''}`;
    });

    const body = fieldDefs.length > 0 ? fieldDefs.join(',\n') : '  id               VARCHAR(36) PRIMARY KEY';
    return `-- ${entity.description || entity.name}\nCREATE TABLE ${tableName} (\n${body}\n);`;
  }).join('\n\n');
};

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

const nodeTypes = {
  entityNode: EntityNode,
};

// Relation layout positions
const getInitialPositions = (entities) => {
  const positions = {};
  (entities || []).forEach((e, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    positions[e.id] = { x: 40 + col * 250, y: 40 + row * 220 };
  });
  return positions;
};

// ─── Diagram Tab — Interactive React Flow Canvas ──────────────────────────────
const InteractiveDiagram = ({ entities = [], isEditing, onEntitiesChange }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [menu, setMenu] = useState(null);
  const flowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  // Sync React Flow nodes and edges whenever entities prop updates (preserving positions)
  useEffect(() => {
    setNodes((prevNodes) => {
      const posMap = {};
      prevNodes.forEach(n => {
        posMap[n.id] = n.position;
      });
      const defaultPositions = getInitialPositions(entities);

      return entities.map((entity, i) => {
        const existingPos = posMap[entity.id];
        return {
          id: entity.id,
          type: 'entityNode',
          position: existingPos || defaultPositions[entity.id] || { x: 40 + (i % 3) * 250, y: 40 + Math.floor(i / 3) * 220 },
          data: { entity },
        };
      });
    });

    // Derive edges from dynamic entity relations
    const dynamicEdges = [];
    entities.forEach((entity) => {
      if (entity.relations && Array.isArray(entity.relations)) {
        entity.relations.forEach((rel, index) => {
          entities.forEach(target => {
            if (entity.id !== target.id && rel.toLowerCase().includes(target.name.toLowerCase())) {
              dynamicEdges.push({
                id: `e-${entity.id}-${target.id}-${index}`,
                source: entity.id,
                target: target.id,
                type: 'smoothstep',
                label: rel,
                animated: true,
                style: { stroke: 'rgba(59,130,246,0.6)', strokeWidth: 2, strokeDasharray: '5,5' },
                labelStyle: { fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 500 },
                labelBgStyle: { fill: '#11161D', stroke: 'rgba(59,130,246,0.3)', strokeWidth: 1, rx: 4, ry: 4 },
                labelBgPadding: [4, 2],
              });
            }
          });
        });
      }
    });

    setEdges(dynamicEdges);
  }, [entities, setNodes, setEdges]);

  const onConnect = useCallback(
    (params) => {
      const sourceEntity = entities.find(e => e.id === params.source);
      const targetEntity = entities.find(e => e.id === params.target);
      if (sourceEntity && targetEntity) {
        const newRel = `1:N → ${targetEntity.name}`;
        const updatedEntities = entities.map(e => {
          if (e.id === sourceEntity.id) {
            const relations = [...(e.relations || [])];
            if (!relations.includes(newRel)) relations.push(newRel);
            return { ...e, relations };
          }
          return e;
        });
        onEntitiesChange?.(updatedEntities);
      }
    },
    [entities, onEntitiesChange],
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      setMenu({ id: node.id, type: 'node', top: event.clientY, left: event.clientX });
    },
    [setMenu]
  );

  const onEdgeContextMenu = useCallback(
    (event, edge) => {
      event.preventDefault();
      setMenu({ id: edge.id, type: 'edge', top: event.clientY, left: event.clientX, edge });
    },
    [setMenu]
  );

  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      setMenu({ type: 'pane', top: event.clientY, left: event.clientX });
    },
    [setMenu]
  );

  const closeMenu = useCallback(() => setMenu(null), []);

  const handleAddCollection = (x, y) => {
    const newId = `ent-${Date.now()}`;
    const newEntity = {
      id: newId,
      name: 'NewCollection',
      description: 'Manually added collection',
      fields: [
        { name: '_id', type: 'ObjectId', constraint: 'PK' },
        { name: 'name', type: 'String', constraint: 'Required' }
      ],
      relations: []
    };

    onEntitiesChange?.([...entities, newEntity]);
    closeMenu();
  };

  const handleRenameNode = () => {
    const entity = entities.find(e => e.id === menu.id);
    if (!entity) return;
    const newName = window.prompt("Rename collection:", entity.name);
    if (newName && newName.trim()) {
      const updatedEntities = entities.map(e =>
        e.id === menu.id ? { ...e, name: newName.trim() } : e
      );
      onEntitiesChange?.(updatedEntities);
    }
    closeMenu();
  };

  const handleDeleteNode = () => {
    onEntitiesChange?.(entities.filter(n => n.id !== menu.id));
    closeMenu();
  };

  const handleEditEdgeLabel = () => {
    const newLabel = window.prompt("Edit connection label (e.g. 1:N → Target):", menu.edge.label || '');
    if (newLabel !== null && menu.edge) {
      const sourceEntity = entities.find(e => e.id === menu.edge.source);
      if (sourceEntity) {
        const updatedEntities = entities.map(e => {
          if (e.id === sourceEntity.id) {
            const relations = (e.relations || []).map(r => r === menu.edge.label ? newLabel : r);
            return { ...e, relations };
          }
          return e;
        });
        onEntitiesChange?.(updatedEntities);
      }
    }
    closeMenu();
  };

  const handleDeleteEdge = () => {
    if (menu.edge) {
      const sourceEntity = entities.find(e => e.id === menu.edge.source);
      if (sourceEntity) {
        const updatedEntities = entities.map(e => {
          if (e.id === sourceEntity.id) {
            const relations = (e.relations || []).filter(r => r !== menu.edge.label);
            return { ...e, relations };
          }
          return e;
        });
        onEntitiesChange?.(updatedEntities);
      }
    }
    closeMenu();
  };

  return (
    <div className="ws-enter-up flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-blue-300 opacity-80 flex items-center gap-2">
          <span>Move collections around, connect handles to establish relationships, or right-click to edit.</span>
        </div>
        <button 
          onClick={() => handleAddCollection()}
          className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Collection
        </button>
      </div>
      
      <div
        ref={flowWrapper}
        className="flex-1 rounded-xl overflow-hidden shadow-inner relative"
        style={{ border: '1px solid rgba(255,255,255,0.07)', background: '#080B0F' }}
        onClick={closeMenu}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          fitView
          className="bg-black/20"
        >
          <Background color="rgba(255,255,255,0.05)" gap={20} size={1} />
        </ReactFlow>

        {menu && (
          <div
            className="absolute z-50 bg-[#11161D] rounded-lg shadow-xl py-1"
            style={{ 
              top: menu.top - (flowWrapper.current?.getBoundingClientRect().top || 0), 
              left: menu.left - (flowWrapper.current?.getBoundingClientRect().left || 0),
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {menu.type === 'node' && (
              <>
                <button className="block w-full text-left px-4 py-2 text-xs text-blue-300 hover:bg-white/5" onClick={handleRenameNode}>
                  Rename Collection
                </button>
                <button className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5" onClick={handleDeleteNode}>
                  Delete Collection
                </button>
              </>
            )}
            {menu.type === 'edge' && (
              <>
                <button className="block w-full text-left px-4 py-2 text-xs text-blue-300 hover:bg-white/5" onClick={handleEditEdgeLabel}>
                  Edit Label
                </button>
                <button className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5" onClick={handleDeleteEdge}>
                  Delete Connection
                </button>
              </>
            )}
            {menu.type === 'pane' && (
              <button className="block w-full text-left px-4 py-2 text-xs text-blue-300 hover:bg-white/5" onClick={() => handleAddCollection(menu.left, menu.top)}>
                Add Collection Here
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InteractiveDiagramProvider = (props) => (
  <ReactFlowProvider>
    <InteractiveDiagram {...props} />
  </ReactFlowProvider>
);

// ─── Schema Tab — Structured entity tables ───────────────────────────────────
const SchemaTab = ({ entities = [], isEditing, onEntitiesChange }) => {
  const handleEntityChange = (entityIdx, field, value) => {
    const next = [...entities];
    next[entityIdx] = { ...next[entityIdx], [field]: value };
    onEntitiesChange?.(next);
  };

  const handleFieldChange = (entityIdx, fieldIdx, fieldKey, value) => {
    const next = [...entities];
    const fields = [...(next[entityIdx].fields || [])];
    fields[fieldIdx] = { ...fields[fieldIdx], [fieldKey]: value };
    next[entityIdx] = { ...next[entityIdx], fields };
    onEntitiesChange?.(next);
  };

  const handleAddField = (entityIdx) => {
    const next = [...entities];
    const fields = [...(next[entityIdx].fields || [])];
    fields.push({ name: `field_${fields.length + 1}`, type: 'String', constraint: '' });
    next[entityIdx] = { ...next[entityIdx], fields };
    onEntitiesChange?.(next);
  };

  const handleDeleteField = (entityIdx, fieldIdx) => {
    const next = [...entities];
    const fields = (next[entityIdx].fields || []).filter((_, idx) => idx !== fieldIdx);
    next[entityIdx] = { ...next[entityIdx], fields };
    onEntitiesChange?.(next);
  };

  const handleAddEntity = () => {
    const newId = `ent-${Date.now()}`;
    const newEntity = {
      id: newId,
      name: 'NewCollection',
      description: 'Custom entity definition',
      fields: [
        { name: '_id', type: 'ObjectId', constraint: 'PK' },
        { name: 'name', type: 'String', constraint: 'Required' },
      ],
      relations: [],
    };
    onEntitiesChange?.([...entities, newEntity]);
  };

  const handleDeleteEntity = (entityIdx) => {
    const next = entities.filter((_, idx) => idx !== entityIdx);
    onEntitiesChange?.(next);
  };

  const handleRelationsChange = (entityIdx, rawText) => {
    const relations = rawText.split('\n').filter(r => r.trim().length > 0);
    handleEntityChange(entityIdx, 'relations', relations);
  };

  return (
    <div className="space-y-6 ws-enter-up">
      {isEditing && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-blue-400 font-medium">
            Editing Schema & Entities
          </span>
          <button
            onClick={handleAddEntity}
            className="text-xs px-3 py-1.5 rounded-lg font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-900/20"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Collection
          </button>
        </div>
      )}

      {entities.map((entity, entityIdx) => (
        <div
          key={entity.id || entityIdx}
          className="rounded-xl overflow-hidden"
          style={{
            border: isEditing ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.07)',
            background: '#11161D',
          }}
        >
          {/* Entity header */}
          <div
            className="px-4 py-3 flex flex-wrap items-start justify-between gap-3"
            style={{ background: 'rgba(59,130,246,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            {isEditing ? (
              <div className="flex-1 space-y-2 min-w-[240px]">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    className="rounded px-2.5 py-1 text-sm font-semibold bg-white/5 border border-white/10 text-white focus:border-blue-500 outline-none"
                    value={entity.name || ''}
                    onChange={(e) => handleEntityChange(entityIdx, 'name', e.target.value)}
                    placeholder="Entity Name"
                  />
                  <button
                    onClick={() => handleDeleteEntity(entityIdx)}
                    className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    Delete Entity
                  </button>
                </div>
                <input
                  type="text"
                  className="w-full rounded px-2.5 py-1 text-xs bg-white/5 border border-white/10 text-white/70 focus:border-blue-500 outline-none"
                  value={entity.description || ''}
                  onChange={(e) => handleEntityChange(entityIdx, 'description', e.target.value)}
                  placeholder="Entity description"
                />
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  {entity.name}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {entity.description}
                </p>
              </div>
            )}

            {!isEditing && (
              <div className="flex flex-wrap gap-1.5 shrink-0">
                {(entity.relations || []).map((r, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{ background: 'rgba(34,211,238,0.07)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.12)', fontSize: '0.65rem' }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Fields table */}
          <div className="overflow-x-auto p-2">
            <table className="ws-entity-table min-w-full">
              <thead>
                <tr>
                  <th>Field Name</th>
                  <th>Data Type</th>
                  <th>Constraint</th>
                  {isEditing && <th className="w-12 text-center">Action</th>}
                </tr>
              </thead>
              <tbody>
                {(entity.fields || []).map((field, fieldIdx) => (
                  <tr key={fieldIdx}>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full rounded px-2 py-0.5 text-xs bp-mono bg-white/5 border border-white/10 text-cyan-300 focus:border-blue-500 outline-none"
                          value={field.name || ''}
                          onChange={(e) => handleFieldChange(entityIdx, fieldIdx, 'name', e.target.value)}
                        />
                      ) : (
                        <span className="bp-mono text-xs" style={{ color: field.constraint?.includes('PK') ? '#22D3EE' : field.constraint?.includes('FK') ? '#C084FC' : 'rgba(255,255,255,0.8)' }}>
                          {field.name}
                        </span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full rounded px-2 py-0.5 text-xs bp-mono bg-white/5 border border-white/10 text-white/70 focus:border-blue-500 outline-none"
                          value={field.type || ''}
                          onChange={(e) => handleFieldChange(entityIdx, fieldIdx, 'type', e.target.value)}
                        />
                      ) : (
                        <span className="bp-mono text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{field.type}</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="text"
                          className="w-full rounded px-2 py-0.5 text-xs bg-white/5 border border-white/10 text-white/60 focus:border-blue-500 outline-none"
                          value={field.constraint || ''}
                          onChange={(e) => handleFieldChange(entityIdx, fieldIdx, 'constraint', e.target.value)}
                          placeholder="e.g. PK, Required, Unique, Default: value"
                        />
                      ) : (
                        <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{field.constraint || '—'}</span>
                      )}
                    </td>
                    {isEditing && (
                      <td className="text-center">
                        <button
                          onClick={() => handleDeleteField(entityIdx, fieldIdx)}
                          className="text-xs text-red-400 hover:text-red-300 px-1"
                          title="Remove field"
                        >
                          ✕
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {isEditing && (
              <div className="mt-2 flex items-center justify-between px-2">
                <button
                  onClick={() => handleAddField(entityIdx)}
                  className="text-xs px-2.5 py-1 rounded text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-1 font-medium"
                >
                  + Add Field
                </button>
              </div>
            )}
          </div>

          {/* Relations in edit mode */}
          {isEditing && (
            <div className="px-4 py-3 border-t border-white/5 bg-black/10">
              <label className="block bp-mono uppercase mb-1 text-[0.6rem] tracking-wider text-white/40">
                Relationships (One per line, e.g. 1:N → Order (orderId))
              </label>
              <textarea
                className="w-full rounded-lg px-3 py-1.5 text-xs bp-mono bg-white/5 border border-white/10 text-cyan-200 focus:border-blue-500 outline-none min-h-[50px]"
                value={(entity.relations || []).join('\n')}
                onChange={(e) => handleRelationsChange(entityIdx, e.target.value)}
                placeholder="1:N → Order (userId)&#10;1:1 → Profile"
              />
            </div>
          )}
        </div>
      ))}

      {/* Field constraint legend */}
      <div className="flex items-center gap-4 text-xs flex-wrap" style={{ color: 'rgba(255,255,255,0.3)' }}>
        <span><span style={{ color: '#22D3EE' }}>Cyan</span> = Primary Key</span>
        <span><span style={{ color: '#C084FC' }}>Purple</span> = Foreign Key</span>
      </div>
    </div>
  );
};

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
    <div className="ws-code-block overflow-x-auto whitespace-pre font-mono text-xs">{sqlCode}</div>
    <p className="mt-2 text-xs" style={{ color: 'rgba(255,255,255,0.22)' }}>
      Schema DDL dynamically generated from current structured entity definitions.
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'diagram', label: 'Diagram' },
  { id: 'schema',  label: 'Schema' },
  { id: 'code',    label: 'Code' },
];

const DatabaseView = ({ document, isEditing, onEntitiesChange }) => {
  const [activeTab, setActiveTab] = useState('diagram');
  const [draftEntities, setDraftEntities] = useState(() => document?.entities || []);

  // Synchronize draft entities whenever document or edit mode changes
  useEffect(() => {
    if (document?.entities) {
      setDraftEntities(document.entities);
    }
  }, [document?.entities, isEditing]);

  const handleEntitiesChange = useCallback((nextEntities) => {
    setDraftEntities(nextEntities);
    onEntitiesChange?.(nextEntities);
  }, [onEntitiesChange]);

  if (!document?.entities && draftEntities.length === 0) return null;

  const currentEntities = isEditing ? draftEntities : (document?.entities || []);
  const currentSql = generateSqlFromEntities(currentEntities) || document?.sqlCode || '';

  return (
    <div className="px-6 py-5">
      {/* Tab bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-1.5 p-1 rounded-xl w-fit" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
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
        {isEditing && (
          <span className="text-xs text-blue-400 font-medium">
            Editing Database Schema
          </span>
        )}
      </div>

      {/* Tab content — All 3 tabs derive from the exact same currentEntities */}
      {activeTab === 'diagram' && (
        <InteractiveDiagramProvider 
          entities={currentEntities} 
          isEditing={isEditing}
          onEntitiesChange={handleEntitiesChange} 
        />
      )}
      {activeTab === 'schema' && (
        <SchemaTab 
          entities={currentEntities} 
          isEditing={isEditing} 
          onEntitiesChange={handleEntitiesChange} 
        />
      )}
      {activeTab === 'code' && (
        <CodeTab sqlCode={currentSql} />
      )}
    </div>
  );
};

export default DatabaseView;
