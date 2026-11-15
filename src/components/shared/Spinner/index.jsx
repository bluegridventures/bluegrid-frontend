export default function Spinner({ label = 'Loading' }) {
  return (
    <span role="status" aria-label={label} className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}
