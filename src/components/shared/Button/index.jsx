import { cn } from '../../../utils/utils';

const variants = {
  primary: 'rounded-md border border-brand bg-brand px-3 py-1.5 text-white hover:bg-brand-dark',
  secondary: 'rounded-md border border-[#c7d3d7] bg-white px-3 py-1.5 text-navy hover:bg-hover',
  ghost: 'rounded-md border-0 bg-transparent px-3 py-1.5 text-[#b8efd6] hover:bg-white/10',
  link: 'border-0 bg-transparent p-0.5 text-left text-brand hover:underline',
};

export default function Button({ variant = 'secondary', type = 'button', className, children, ...props }) {
  return (
    <button
      type={type}
      className={cn('font-semibold disabled:cursor-not-allowed disabled:opacity-50', variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
