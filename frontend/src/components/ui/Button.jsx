import { Link } from 'react-router-dom';

const variants = {
  primary:   'dash-btn text-white',
  secondary: 'bg-white/[0.04] text-slate-200 border border-white/[0.1] hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white transition-all',
  danger:    'bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300 transition-all',
  ghost:     'text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors',
};

const sizes = {
  sm:   'px-3.5 py-1.5 text-xs',
  md:   'px-5 py-2.5 text-sm',
  lg:   'px-7 py-3.5 text-sm sm:text-base',
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
  to,
  ...props
}) => {
  const baseClasses = `
    inline-flex items-center justify-center gap-2 font-medium rounded-lg
    transition-all duration-150 focus:outline-none focus:ring-2
    focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#080B0F]
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}
  `;

  if (to && !disabled && !isLoading) {
    return (
      <Link
        to={to}
        id={id}
        className={baseClasses}
        onClick={onClick}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={baseClasses}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
          <span>Loading…</span>
        </>
      ) : children}
    </button>
  );
};

export default Button;
