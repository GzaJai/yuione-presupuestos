import { forwardRef } from 'react';

const variantStyles = {
  primary:
    'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20',
  secondary:
    'bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700',
  danger:
    'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20',
  ghost:
    'bg-transparent hover:bg-zinc-800 text-zinc-300',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/**
 * Botón reutilizable con variantes y tamaños.
 *
 * @param {{ variant?: 'primary'|'secondary'|'danger'|'ghost', size?: 'sm'|'md'|'lg', className?: string, children, disabled?: boolean, onClick?: () => void }} props
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-150 ease-out cursor-pointer
        disabled:opacity-40 disabled:pointer-events-none
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...rest}
    >
      {children}
    </button>
  );
});

export default Button;
