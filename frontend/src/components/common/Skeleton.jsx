/**
 * Base generic Skeleton component for building loading states.
 */
export const Skeleton = ({ className = '', variant = 'rectangular', ...props }) => {
  const baseClass = "animate-pulse bg-surface-border";
  
  const variants = {
    rectangular: "rounded-lg",
    circular: "rounded-full",
    text: "rounded-md h-4"
  };

  return (
    <div 
      className={`${baseClass} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

/**
 * Pre-built PageSkeleton for generic full-page loading states.
 */
export const PageSkeleton = () => {
  return (
    <div className="w-full h-full p-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8">
        <div>
          <Skeleton className="w-64 h-8 mb-2" />
          <Skeleton className="w-96 h-4" />
        </div>
        <Skeleton className="w-32 h-10" />
      </div>
      
      <div className="grid gap-6">
        <Skeleton className="w-full h-48 rounded-2xl" />
        <Skeleton className="w-full h-32 rounded-2xl" />
        <Skeleton className="w-full h-32 rounded-2xl" />
      </div>
    </div>
  );
};

export default Skeleton;
