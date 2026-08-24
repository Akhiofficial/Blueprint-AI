import { useEffect } from 'react';

/**
 * Reusable Confirmation Dialog for destructive actions (e.g. Delete, Discard Changes)
 */
const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = true,
  isPending = false
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || isPending) return;
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPending, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-surface-card border border-surface-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="p-6">
          <h3 id="confirm-dialog-title" className="text-xl font-semibold mb-2 text-surface-text">
            {title}
          </h3>
          <p className="text-surface-textMuted text-sm">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 bg-surface-bg/50 border-t border-surface-border">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-surface-text bg-surface-card border border-surface-border hover:bg-surface-border transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-lg flex items-center justify-center min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed ${
              isDestructive 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/20'
            }`}
          >
            {isPending ? (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            ) : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
