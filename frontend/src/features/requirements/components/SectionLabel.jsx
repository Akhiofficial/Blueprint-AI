/**
 * SectionLabel.jsx
 * Reusable section label header with monospace styling.
 */

const SectionLabel = ({ children }) => (
  <p
    className="bp-mono uppercase mb-3"
    style={{ fontSize: '0.58rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.28)' }}
  >
    {children}
  </p>
);

export default SectionLabel;
