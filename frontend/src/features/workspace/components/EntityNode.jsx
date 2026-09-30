import { Handle, Position } from '@xyflow/react';

const EntityNode = ({ data, selected }) => {
  const { entity } = data;
  
  if (!entity) return null;
  
  const fields = entity.fields || [];
  const displayFields = fields.slice(0, 6);
  const hiddenCount = fields.length - 6;

  return (
    <div 
      className="rounded-lg shadow-lg relative group transition-all"
      style={{
        width: 190,
        background: '#11161D',
        border: selected 
          ? '1px solid rgba(59,130,246,0.8)' 
          : '1px solid rgba(59,130,246,0.3)',
        boxShadow: selected 
          ? '0 0 0 1px rgba(59,130,246,0.5), 0 10px 15px -3px rgba(0, 0, 0, 0.5)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Target handle for incoming relationships (left side) */}
      <Handle 
        type="target" 
        position={Position.Left} 
        title="Drag from a source to connect"
        style={{ 
          background: '#3B82F6', 
          border: '2px solid #11161D',
          width: '12px',
          height: '12px',
          marginLeft: '-6px'
        }} 
      />

      {/* Header bar */}
      <div 
        className="px-3 py-2 flex items-center justify-between rounded-t-lg"
        style={{ 
          background: 'rgba(59,130,246,0.15)',
          borderBottom: '1px solid rgba(59,130,246,0.2)' 
        }}
      >
        <h3 className="text-xs font-semibold tracking-wide text-blue-100 truncate w-full font-sans" title={entity.name}>
          {entity.name}
        </h3>
      </div>

      {/* Fields */}
      <div className="p-2 flex flex-col gap-1">
        {displayFields.map((field, i) => (
          <div key={field.name || i} className="flex justify-between items-center px-1">
            <span 
              className="text-[0.6rem] truncate mr-2" 
              style={{
                color: (field.constraint || '').includes('PK') ? '#22D3EE' : (field.constraint || '').includes('FK') ? '#C084FC' : 'rgba(255,255,255,0.7)',
                fontFamily: "'JetBrains Mono', monospace"
              }}
              title={field.name}
            >
              {field.name}
            </span>
            <span 
              className="text-[0.55rem] shrink-0" 
              style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'JetBrains Mono', monospace" }}
            >
              {field.type}
            </span>
          </div>
        ))}
        
        {hiddenCount > 0 && (
          <div className="text-center mt-1">
            <span className="text-[0.55rem]" style={{ color: 'rgba(255,255,255,0.3)' }}>
              +{hiddenCount} more fields
            </span>
          </div>
        )}
      </div>

      {/* Source handle for outgoing relationships (right side) */}
      <Handle 
        type="source" 
        position={Position.Right} 
        title="Drag to another collection to connect"
        style={{ 
          background: '#3B82F6', 
          border: '2px solid #11161D',
          width: '12px',
          height: '12px',
          marginRight: '-6px'
        }} 
      />
    </div>
  );
};

export default EntityNode;
