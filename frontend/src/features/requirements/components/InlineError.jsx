/**
 * InlineError.jsx
 * Displays an alert message with icon for error feedback.
 */

const InlineError = ({ message }) =>
  message ? (
    <p
      role="alert"
      className="flex items-center gap-1.5 text-xs mt-2"
      style={{ color: '#F87171' }}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
        <circle cx="6" cy="6" r="5" stroke="#F87171" strokeWidth="1.2" />
        <path d="M6 4v3M6 8.5v.5" stroke="#F87171" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      {message}
    </p>
  ) : null;

export default InlineError;
