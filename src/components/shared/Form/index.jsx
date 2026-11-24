import { fieldClass } from '../FilterDropdown';
import { cn } from '../../../utils/utils';
import { useFieldError } from '../Modal/FormErrors';

const FieldError = ({ name }) => {
  const message = useFieldError(name);
  return message ? <span role="alert" className="text-xs font-normal text-danger">{message}</span> : null;
};

const labelClass = 'my-2.5 grid gap-1 font-semibold';
const norm = (o) => (typeof o === 'string' ? { value: o, label: o } : o);

export function Field({ label, name, type = 'text', defaultValue = '', required = true, className, ...rest }) {
  return (
    <label className={cn(labelClass, className)}>
      {label}
      <input name={name} type={type} defaultValue={defaultValue ?? ''} required={required} className={fieldClass} {...rest} />
      <FieldError name={name} />
    </label>
  );
}

export function SelectField({ label, name, options, defaultValue, required = true, placeholder, onChange, className }) {
  return (
    <label className={cn(labelClass, className)}>
      {label}
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? (placeholder ? '' : undefined)}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className={fieldClass}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => {
          const { value, label: text } = norm(o);
          return <option key={value} value={value}>{text}</option>;
        })}
      </select>
      <FieldError name={name} />
    </label>
  );
}

export function TextAreaField({ label, name = 'note', required = true, maxLength, defaultValue = '' }) {
  return (
    <label className={labelClass}>
      {label}
      <textarea name={name} required={required} maxLength={maxLength} defaultValue={defaultValue} className={cn(fieldClass, 'min-h-[70px]')} />
      <FieldError name={name} />
    </label>
  );
}

export function CheckboxGroup({ legend, name, options, checked = [] }) {
  return (
    <fieldset className="my-3 rounded-[7px] border border-line px-3 pb-2 pt-1">
      <legend className="px-1 font-semibold">{legend}</legend>
      {options.map((o) => {
        const { value, label } = norm(o);
        return (
          <label key={value} className="mr-3 inline-flex items-center gap-1.5 font-normal">
            <input type="checkbox" name={name} value={value} defaultChecked={checked.includes(value)} />
            {label}
          </label>
        );
      })}
    </fieldset>
  );
}

export function FormRow({ children }) {
  return <div className="grid gap-x-3.5 sm:grid-cols-2">{children}</div>;
}
