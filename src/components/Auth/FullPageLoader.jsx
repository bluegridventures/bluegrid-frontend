export default function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-page" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="h-8 w-8 animate-spin rounded-full border-[3px] border-line border-t-brand" />
        {label}
      </div>
    </div>
  );
}
