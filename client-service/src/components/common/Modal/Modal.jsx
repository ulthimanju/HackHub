import React, { memo, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../Button/Button';

const Modal = memo(({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative w-full ${widths[size] ?? widths.md} bg-white rounded-xl shadow-modal overflow-hidden animate-in zoom-in-95 fade-in duration-200 flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border shrink-0">
          <h3 className="font-display font-semibold text-base text-ink-primary">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="!p-1.5 -mr-1 text-ink-muted hover:text-ink-secondary"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-surface-border bg-surface-page shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';
export default Modal;
