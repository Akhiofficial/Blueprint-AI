const colorMap = {
  indigo:  'bg-brand-500/15 text-brand-300 border border-brand-500/30',
  green:   'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  yellow:  'bg-yellow-500/15 text-yellow-300 border border-yellow-500/30',
  red:     'bg-red-500/15 text-red-300 border border-red-500/30',
  slate:   'bg-slate-500/15 text-slate-300 border border-slate-500/30',
};

const Badge = ({ children, color = 'indigo', className = '' }) => (
  <span
    className={`
      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
      ${colorMap[color] || colorMap.indigo} ${className}
    `}
  >
    {children}
  </span>
);

export default Badge;
