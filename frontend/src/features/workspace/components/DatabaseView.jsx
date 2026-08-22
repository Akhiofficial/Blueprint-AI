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

import { useCallback, useMemo, useState, useRef } from 'react';
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

// ─── Diagram Tab — Interactive React Flow Canvas ──────────────────────────────

const nodeTypes = {
  entityNode: EntityNode,
};

// Relation lines between entities (initial layout logic)
const getInitialPositions = (entities) => {
  const positions = {};
  entities.forEach((e, i) => {
    // A simple grid layout for initial render
    const col = i % 2;
    const row = Math.floor(i / 2);
    positions[e.id] = { x: 50 + col * 250, y: 50 + row * 200 };
  });
  // If we had manual positions saved in the entity, we would use those.
  return positions;
};

const InteractiveDiagram = ({ entities, onEntitiesChange }) => {
  // Convert document.entities to React Flow nodes
  const initialNodes = useMemo(() => {
    const pos = getInitialPositions(entities);
    return entities.map((entity) => ({
      id: entity.id,
      type: 'entityNode',
      position: pos[entity.id] || { x: 100, y: 100 },
      data: { entity },
    }));
  }, [entities]);

  // Convert relations into edges
  const initialEdges = useMemo(() => {
    const edges = [];
    entities.forEach(entity => {
      if (entity.relations) {
        entity.relations.forEach((rel, index) => {
          // Assuming relation string format like "1:N User" or similar, 
          // or we just look up by name. The mock relations are just strings.
          // In the original SVG, it just used hardcoded connections.
          // Let's create edges by finding targets if the relation mentions an entity name.
          entities.forEach(target => {
            if (entity.id !== target.id && rel.includes(target.name)) {
              edges.push({
                id: `e-${entity.id}-${target.id}-${index}`,
                source: entity.id,
                target: target.id,
                type: 'smoothstep',
                label: rel, // Set initial label
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
    
    // Fallback if no dynamic relations found (to match original SVG hardcoded look)
    if (edges.length === 0 && entities.length >= 4) {
      edges.push(
        { id: 'e-0-1', source: entities[0].id, target: entities[1].id, type: 'smoothstep', label: '1:N', animated: true, style: { stroke: 'rgba(59,130,246,0.6)', strokeWidth: 2 }, labelStyle: { fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 500 }, labelBgStyle: { fill: '#11161D', stroke: 'rgba(59,130,246,0.3)' }, labelBgPadding: [4, 2] },
        { id: 'e-0-2', source: entities[0].id, target: entities[2].id, type: 'smoothstep', label: '1:N', animated: true, style: { stroke: 'rgba(59,130,246,0.6)', strokeWidth: 2 }, labelStyle: { fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 500 }, labelBgStyle: { fill: '#11161D', stroke: 'rgba(59,130,246,0.3)' }, labelBgPadding: [4, 2] },
        { id: 'e-1-2', source: entities[1].id, target: entities[2].id, type: 'smoothstep', label: '1:N', animated: true, style: { stroke: 'rgba(59,130,246,0.6)', strokeWidth: 2 }, labelStyle: { fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 500 }, labelBgStyle: { fill: '#11161D', stroke: 'rgba(59,130,246,0.3)' }, labelBgPadding: [4, 2] },
        { id: 'e-0-3', source: entities[0].id, target: entities[3].id, type: 'smoothstep', label: '1:1', animated: true, style: { stroke: 'rgba(59,130,246,0.6)', strokeWidth: 2 }, labelStyle: { fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 500 }, labelBgStyle: { fill: '#11161D', stroke: 'rgba(59,130,246,0.3)' }, labelBgPadding: [4, 2] }
      );

    }
    return edges;
  }, [entities]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [menu, setMenu] = useState(null);
  const flowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep',
      label: 'Relation', // Default label
      animated: true, 
      style: { stroke: 'rgba(59,130,246,0.6)', strokeWidth: 2 },
      labelStyle: { fill: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 500 },
      labelBgStyle: { fill: '#11161D', stroke: 'rgba(59,130,246,0.3)', strokeWidth: 1, rx: 4, ry: 4 },
      labelBgPadding: [4, 2]
    }, eds)),
    [setEdges],
  );

  const onEdgeClick = useCallback((event, edge) => {
    // Left click just logs or selects now, editing is moved to context menu
  }, []);

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
      fields: [{ name: '_id', type: 'ObjectId', constraint: 'PK' }],
      relations: []
    };
    
    const position = (x !== undefined && y !== undefined) 
      ? screenToFlowPosition({ x, y })
      : { x: 100, y: 100 };
      
    const newNode = {
      id: newId,
      type: 'entityNode',
      position,
      data: { entity: newEntity }
    };
    
    setNodes(nds => [...nds, newNode]);
    if (onEntitiesChange) onEntitiesChange([...entities, newEntity]);
    closeMenu();
  };

  const handleDeleteNode = () => {
    setNodes(nds => nds.filter(n => n.id !== menu.id));
    setEdges(eds => eds.filter(e => e.source !== menu.id && e.target !== menu.id));
    closeMenu();
  };

  const handleEditEdgeLabel = () => {
    const newLabel = window.prompt("Edit connection label (e.g. 1:N):", menu.edge.label || '');
    if (newLabel !== null) {
      setEdges((eds) => eds.map((e) => (e.id === menu.id ? { ...e, label: newLabel } : e)));
    }
    closeMenu();
  };

  const handleDeleteEdge = () => {
    setEdges(eds => eds.filter(e => e.id !== menu.id));
    closeMenu();
  };

  return (
    <div className="ws-enter-up flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs text-blue-300 opacity-80 flex items-center gap-2">
          <span>Move collections around and connect them to design your database.</span>
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
          onEdgeClick={onEdgeClick}
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
              <button className="block w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-white/5" onClick={handleDeleteNode}>
                Delete Collection
              </button>
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
      {activeTab === 'diagram' && (
        <InteractiveDiagramProvider 
          entities={document.entities} 
          onEntitiesChange={(newEntities) => {
            // Very simple mock integration: Just mutate the document so other tabs see it.
            // In Phase 3, this would trigger an API call to save the document.
            document.entities = newEntities;
          }} 
        />
      )}
      {activeTab === 'schema'  && <SchemaTab  entities={document.entities} />}
      {activeTab === 'code'    && <CodeTab    sqlCode={document.sqlCode} />}
    </div>
  );
};

export default DatabaseView;
