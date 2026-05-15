import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, subtitle, children, size = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative shadow-2xl w-full ${size} max-h-[90vh] overflow-y-auto`}
        style={{
          backgroundColor: '#F5F0E8',
          border: '2px solid #A8C4E0',
          borderRadius: '16px',
        }}
      >
        <div
          className="sticky top-0 px-8 pt-6 pb-2 flex items-start justify-between z-10"
          style={{ backgroundColor: '#F5F0E8', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}
        >
          <div>
            <h3 className="text-xl font-bold text-text-primary">{title}</h3>
            {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors -mr-1 -mt-1"
          >
            <X size={20} className="text-text-secondary" />
          </button>
        </div>
        <div className="px-8 pb-8 pt-2">{children}</div>
      </div>
    </div>
  );
}
