/**
 * RequirementTable.jsx
 *
 * Reusable component for rendering requirements tables (Functional & Non-Functional).
 * Encapsulates responsive overflow-x scrolling, column layout, text wrapping, and tag badges.
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

const RequirementTable = ({ title, requirements, isFunctional }) => {
  return (
    <div style={CARD_STYLE} className="p-4 sm:p-6 w-full overflow-hidden">
      <h2 style={SECTION_LABEL_STYLE}>{title}</h2>

      {!requirements || requirements.length === 0 ? (
        <p className="text-sm text-slate-500 italic">None identified.</p>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-white/5">
          <table className="w-full min-w-[600px] text-left text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <th className="py-3 px-3 font-medium text-slate-400 text-xs" style={{ width: '15%' }}>
                  ID
                </th>
                <th className="py-3 px-3 font-medium text-slate-400 text-xs" style={{ width: '25%' }}>
                  Title
                </th>
                <th className="py-3 px-3 font-medium text-slate-400 text-xs" style={{ width: '42%' }}>
                  Description
                </th>
                <th className="py-3 px-3 font-medium text-slate-400 text-xs text-right" style={{ width: '18%' }}>
                  {isFunctional ? 'Actor' : 'Category'}
                </th>
              </tr>
            </thead>
            <tbody style={{ color: 'rgba(255,255,255,0.75)' }}>
              {requirements.map((req, idx) => (
                <tr key={req.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="py-3 px-3 align-top">
                    <span className="bp-mono text-xs text-slate-500 break-all">
                      {req.id || `${isFunctional ? 'FR' : 'NFR'}-${idx + 1}`}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top font-medium text-slate-200 break-words whitespace-normal">
                    {req.title}
                  </td>
                  <td className="py-3 px-3 align-top leading-relaxed text-slate-400 text-xs break-words whitespace-normal">
                    {req.description}
                  </td>
                  <td className="py-3 px-3 align-top text-right">
                    <span
                      className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium max-w-full truncate"
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        color: 'rgba(255,255,255,0.6)',
                      }}
                    >
                      {isFunctional ? req.actor : req.category}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RequirementTable;
