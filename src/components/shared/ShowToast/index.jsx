import { useToastStore } from '../../../store/features/ui/useToastStore';

/** Fire a toast from anywhere (components, handlers). */
export const showToast = (message, ms) => useToastStore.getState().show(message, ms);

/** Mount once in the layout. */
export default function ShowToast() {
  const message = useToastStore((s) => s.message);
  if (!message) return null;
  return (
    <div role="status" className="fixed bottom-3 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-header px-3.5 py-2 text-white shadow-lg">
      {message}
    </div>
  );
}
