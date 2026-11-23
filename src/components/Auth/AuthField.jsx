import { useId, useState } from 'react';
import { cn } from '../../utils/utils';

/** Controlled input with an inline error. type="password" gets a Show / Hide toggle. */
export default function AuthField({ label, type = 'text', value, onChange, error, hint, autoComplete, ...rest }) {
  const [shown, setShown] = useState(false);
  const id = useId();
  const isPassword = type === 'password';
  return (
    <div className="my-2.5">
      <label htmlFor={id} className="mb-1 text-header block font-semibold">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && shown ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn('w-full rounded-md border text-zinc-700 bg-white px-2.5 py-2', error ? 'border-danger' : 'border-field', isPassword && 'pr-16')}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            className="absolute inset-y-0 right-2.5 border-0 bg-transparent text-xs font-semibold text-brand"
          >
            {shown ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error ? <p id={`${id}-error`} className="mt-1 text-xs text-danger">{error}</p> : hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
