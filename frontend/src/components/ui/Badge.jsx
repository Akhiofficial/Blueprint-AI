const colorMap = {
  indigo:  'bg-blue-500/10 text-blue-300 border border-blue-500/25',
  green:   'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25',
  yellow:  'bg-amber-500/10 text-amber-300 border border-amber-500/25',
  red:     'bg-rose-500/10 text-rose-300 border border-rose-500/25',
  slate:   'bg-slate-500/10 text-slate-400 border border-slate-500/20',
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
