import { forwardRef } from 'react';

const variantStyles = {
  primary:
    'bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20',
  secondary:
    'bg-card hover:bg-history-row text-text-primary border border-card-border',
  danger:
    'bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20',
  ghost:
    'bg-transparent hover:bg-card text-text-secondary hover:text-text-primary',
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
