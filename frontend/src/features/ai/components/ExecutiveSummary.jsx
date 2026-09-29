/**
 * ExecutiveSummary.jsx
 *
 * Displays the high-level executive summary card for requirement analysis.
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

const ExecutiveSummary = ({ summary }) => {
  if (!summary) return null;

  return (
    <div style={CARD_STYLE} className="p-4 sm:p-6 w-full max-w-full overflow-hidden">
      <h2 style={SECTION_LABEL_STYLE}>Executive Summary</h2>
      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed break-words">{summary}</p>
    </div>
  );
};

export default ExecutiveSummary;
