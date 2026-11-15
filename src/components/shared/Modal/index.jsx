import { useEffect } from 'react';
import Button from '../Button';

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-[#0d2739a6] p-3"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[89vh] w-[min(780px,95vw)] overflow-auto rounded-xl border border-line bg-white">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-white px-[22px] py-4">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <Button onClick={onClose}>Close</Button>
        </div>
        <div className="px-[22px] py-[18px]">{children}</div>
      </div>
    </div>
  );
}
