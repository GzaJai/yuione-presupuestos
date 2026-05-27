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
          className="text-xs font-medium text-zinc-400 tracking-wide uppercase"
        >
          {label}
          {rest.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={`
          w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100
          outline-none transition-all duration-150 appearance-none
          focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30
          ${error ? 'border-red-500 ring-1 ring-red-500/30' : 'border-zinc-700'}
          ${className}
        `}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <span className="text-xs text-red-400 mt-0.5">{error}</span>
      )}
    </div>
  );
});

export default Select;
