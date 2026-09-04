/**
 * StringListCard.jsx
 *
 * Reusable list component for text collections such as Business Goals,
 * Constraints, Risks, Ambiguities, and Technology Hints.
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

const StringListCard = ({ title, items, badgeColor = 'rgba(59,130,246,0.1)' }) => {
  if (!items || items.length === 0) return null;

  return (
    <div style={CARD_STYLE} className="p-4 sm:p-6 w-full max-w-full overflow-hidden">
      <h2 style={SECTION_LABEL_STYLE}>{title}</h2>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
            <span
              className="inline-block shrink-0 rounded-full mt-1.5"
              style={{ width: 6, height: 6, background: badgeColor }}
            />
            <span className="leading-relaxed break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StringListCard;
