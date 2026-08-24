import { Link } from 'react-router-dom';

/**
 * Reusable Empty State component for displaying when no data is available.
 */
const EmptyState = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionTo,
  secondaryActionText,
  onSecondaryAction,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[400px] border border-surface-border border-dashed rounded-2xl bg-surface-card/30 ${className}`}>
      <div className="w-16 h-16 bg-brand-500/10 text-brand-400 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-brand-500/20">
        {icon || (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="9" y1="21" x2="9" y2="9"></line>
          </svg>
        )}
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-surface-text">{title}</h3>
      
      <p className="text-surface-textMuted max-w-md mb-8">
        {description}
      </p>
      
      <div className="flex gap-4">
        {actionTo ? (
          <Link
            to={actionTo}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg bg-brand-500 hover:bg-brand-600 text-white"
          >
            {actionText}
          </Link>
        ) : actionText && onAction ? (
          <button
            onClick={onAction}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg bg-brand-500 hover:bg-brand-600 text-white"
          >
            {actionText}
          </button>
        ) : null}

        {secondaryActionText && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors bg-surface-card border border-surface-border hover:bg-surface-border text-surface-text"
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
