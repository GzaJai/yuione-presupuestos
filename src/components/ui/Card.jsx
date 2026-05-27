/**
 * Contenedor tipo tarjeta con fondo, borde y padding consistente.
 *
 * @param {{ title?: string, className?: string, children }} props
 */
export default function Card({ title, className = '', children }) {
  return (
    <section
      className={`
        rounded-xl border border-card-border bg-card p-4 sm:p-6
        transition-colors duration-200
        ${className}
      `}
    >
      {title && (
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-4">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
