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
          className="text-xs font-medium text-zinc-400 tracking-wide uppercase"
        >
          {label}
          {rest.required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
          w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-zinc-100
          placeholder:text-zinc-500 outline-none transition-all duration-150
          focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30
          ${error ? 'border-red-500 ring-1 ring-red-500/30' : 'border-zinc-700'}
          ${className}
        `}
        {...rest}
      />
      {error && (
        <span className="text-xs text-red-400 mt-0.5">{error}</span>
      )}
    </div>
  );
});

export default Input;
