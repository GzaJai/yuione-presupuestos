import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * Modal con overlay, cierre por ESC y click fuera.
 *
 * @param {{ open: boolean, onClose: () => void, title?: string, children }} props
 */
export default function Modal({ open, onClose, title, children }) {
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content */}
      <div
        className="relative z-10 w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
