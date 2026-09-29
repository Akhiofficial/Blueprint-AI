/**
 * EntityGridSection.jsx
 *
 * Reusable grid card component for Identified Actors and Domain Entities.
 * Provides responsive column wrapping and card typography.
 */

const CARD_STYLE = {
  background: '#11161D',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
  boxShadow: '0 0 0 1px rgba(255,255,255,0.03), 0 8px 40px rgba(0,0,0,0.4)',
};

const SECTION_LABEL_STYLE = {
  fontSize: '0.65rem',
  letterSpacing: '0.14em',
  color: 'rgba(255,255,255,0.28)',
  textTransform: 'uppercase',
  fontFamily: 'inherit',
  fontWeight: 600,
  marginBottom: '1rem',
};

const EntityGridSection = ({ title, items, nameKey = 'name', descKey = 'description' }) => {
  return (
    <div style={CARD_STYLE} className="p-4 sm:p-6 w-full overflow-hidden">
      <h2 style={SECTION_LABEL_STYLE}>{title}</h2>

      {!items || items.length === 0 ? (
        <p className="text-sm text-slate-500 italic">None identified.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 rounded-xl min-w-0 overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <p className="font-medium text-slate-200 text-sm mb-1 truncate">{item[nameKey]}</p>
              {item[descKey] && (
                <p className="text-xs text-slate-400 leading-relaxed break-words">{item[descKey]}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntityGridSection;
