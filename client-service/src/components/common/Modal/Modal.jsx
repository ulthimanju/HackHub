import React, { memo, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../Button/Button';

const Modal = memo(({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2 -mr-2 rounded-xl"><X className="w-5 h-5" /></Button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>
        {footer && <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50">{footer}</div>}
      </div>
    </div>
  );
});
Modal.displayName = 'Modal';
export default Modal;
