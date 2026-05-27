/**
 * Contenedor tipo tarjeta con fondo, borde y padding consistente.
 *
 * @param {{ title?: string, className?: string, children }} props
 */
export default function Card({ title, className = '', children }) {
  return (
    <section
      className={`
        rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-6
        ${className}
      `}
    >
      {title && (
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}
