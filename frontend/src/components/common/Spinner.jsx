const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div
      className={`animate-spin rounded-full border-2 border-surface-border border-t-brand-500 ${sizes[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
);

export default Spinner;
