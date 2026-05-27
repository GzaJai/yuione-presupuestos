import { forwardRef } from 'react';

/**
 * Select reutilizable con label, estilo consistente con Input.
 *
 * @param {{
 *   label?: string,
 *   error?: string,
 *   className?: string,
 *   wrapperClassName?: string,
 *   children: React.ReactNode,
 * }} props
 */
const Select = forwardRef(function Select(
  { label, error, className = '', wrapperClassName = '', id, children, ...rest },
  ref,
) {
  const selectId = id || `select-${label?.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className={`flex flex-col gap-1 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-text-secondary tracking-wide uppercase"
        >
          {label}
          {rest.required && <span className="text-primary ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
          w-full rounded-lg border bg-input-bg px-3 py-2 text-sm text-text-primary
          outline-none transition-all duration-150 appearance-none
          ${error ? 'border-primary ring-1 ring-primary/30' : 'border-input-border'}
          focus:border-primary focus:ring-1 focus:ring-primary/30
          ${className}
        `}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span className="text-xs text-primary mt-0.5">{error}</span>
      )}
    </div>
  );
});

export default Select;
