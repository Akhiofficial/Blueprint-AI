import { Link } from 'react-router-dom';

/**
 * Reusable Error State component for displaying failed data fetches and server errors.
 */
const ErrorState = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this content.',
  onRetry,
  retryText = 'Try Again',
  actionTo,
  actionText = 'Back to Dashboard',
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[400px] border border-red-500/20 rounded-2xl bg-red-500/5 ${className}`}>
      <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-red-500/20">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-surface-text">{title}</h3>
      
      <p className="text-red-400/80 max-w-md mb-8 text-sm">
        {message}
      </p>
      
      <div className="flex gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors bg-surface-card border border-surface-border hover:bg-surface-border text-surface-text shadow-sm"
          >
            {retryText}
          </button>
        )}

        {actionTo && (
          <Link
            to={actionTo}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors bg-surface-card border border-surface-border hover:bg-surface-border text-surface-text shadow-sm"
          >
            {actionText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
