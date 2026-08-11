const variants = {
  primary:   'bg-gradient-brand text-white shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:opacity-90',
  secondary: 'bg-surface-card text-slate-200 border border-surface-border hover:bg-surface-hover hover:border-brand-500/50',
  danger:    'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
  ghost:     'text-slate-400 hover:text-slate-100 hover:bg-surface-hover',
};

const sizes = {
  sm:   'px-3 py-1.5 text-sm',
  md:   'px-5 py-2.5 text-sm',
  lg:   'px-6 py-3 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  onClick,
  id,
}) => {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-xl
        transition-all duration-200 focus:outline-none focus:ring-2
        focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-surface
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;
