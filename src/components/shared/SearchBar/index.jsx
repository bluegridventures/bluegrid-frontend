import { fieldClass } from '../FilterDropdown';
import { cn } from '../../../utils/utils';

export default function SearchBar({ value, onChange, placeholder = 'Search', label, className }) {
  return (
    <input
      type="search"
      aria-label={label || placeholder}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(fieldClass, 'w-[270px] min-w-[min(250px,100%)]', className)}
    />
  );
}
