const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null;
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 ${className}`}
    >
      <span className="text-base leading-tight">⚠</span>
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
