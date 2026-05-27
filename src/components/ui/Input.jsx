import { forwardRef } from 'react';

/**
 * Input reutilizable con label flotante o fijo.
 *
 * @param {{
 *   label?: string,
 *   error?: string,
 *   className?: string,
 *   wrapperClassName?: string,
 * }} props
 */
const Input = forwardRef(function Input(
  { label, error, className = '', wrapperClassName = '', id, ...rest },
  ref,
) {
  const inputId = id || `input-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-text-secondary tracking-wide uppercase"
        >
          {label}
          {rest.required && <span className="text-primary ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full rounded-lg border bg-input-bg px-3 py-2 text-sm text-text-primary
          placeholder:text-text-secondary/50 outline-none transition-all duration-150
          ${error ? 'border-primary ring-1 ring-primary/30' : 'border-input-border'}
          focus:border-primary focus:ring-1 focus:ring-primary/30
          ${className}
        `}
        {...rest}
      />
      {error && (
        <span className="text-xs text-primary mt-0.5">{error}</span>
      )}
    </div>
  );
});

export default Input;
