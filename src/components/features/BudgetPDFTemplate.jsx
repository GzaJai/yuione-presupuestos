import { formatCurrency, formatDateShort } from '../../utils/formatters';

/**
 * Suma días a una fecha ISO y devuelve string formateado.
 */
function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return formatDateShort(date.toISOString());
}

/**
 * Componente plantilla del PDF.
 * Renderizado OFF-SCREEN con estilos fijos para impresión.
 */
export default function BudgetPDFTemplate({ budget, profile }) {
  const emitterName = profile.businessName || profile.name || 'Mi Empresa';

  return (
    <div
      className="bg-white w-[210mm] p-[15mm] text-slate-800 box-border"
      style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
    >
      {/* ── 1. Cabecera: Emisor y Título ── */}
      <div className="flex justify-between items-start">
        {/* Emisor (Izquierda) */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">{emitterName}</h1>
          <div className="text-xs text-slate-500 mt-1 leading-tight">
            {profile.cuit && <p className="m-0">CUIT: {profile.cuit}</p>}
            {profile.address && <p className="m-0">{profile.address}</p>}
          </div>
        </div>

        {/* Título (Derecha) */}
        <div className="text-right">
          <h1 className="text-3xl font-extrabold text-slate-200 m-0 uppercase tracking-widest">
            Presupuesto
          </h1>
          <p className="text-sm font-bold text-slate-500 mt-1 m-0">
            {budget.title || 'Detalle de cotización'}
          </p>
        </div>
      </div>

      {/* ── 2. Fechas y Datos del Cliente ── */}
      <div className="mt-8 border-t border-slate-200 pt-6 flex justify-between">
        {/* Fechas (Izquierda) */}
        <div className="text-xs">
          <div className="flex gap-2 mb-1">
            <span className="font-bold text-slate-700 w-24">Fecha de Emisión:</span>
            <span className="text-slate-500">{formatDateShort(budget.createdAt)}</span>
          </div>
          {budget.dueDays && (
            <div className="flex gap-2">
              <span className="font-bold text-slate-700 w-24">Vencimiento:</span>
              <span className="text-slate-500">
                {addDays(budget.createdAt, budget.dueDays)} ({budget.dueDays} días)
              </span>
            </div>
          )}
        </div>

        {/* Cliente (Derecha) */}
        {budget.clientName && (
          <div className="text-right text-xs">
            <p className="font-bold text-slate-700 m-0 mb-1">Para:</p>
            <p className="text-sm font-bold text-slate-900 m-0">{budget.clientName}</p>
            <div className="text-slate-500 mt-1 leading-tight">
              {budget.clientId && <p className="m-0">CUIT/DNI: {budget.clientId}</p>}
              {budget.clientAddress && <p className="m-0">{budget.clientAddress}</p>}
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Tabla de Ítems ── */}
      <table className="w-full border-collapse mt-10 text-xs">
        <thead>
          <tr className="bg-slate-50">
            <th className="text-left py-2 px-3 font-bold text-slate-700">Descripción</th>
            <th className="text-center py-2 px-3 font-bold text-slate-700 w-16">Cant.</th>
            <th className="text-right py-2 px-3 font-bold text-slate-700 w-28">Precio Unit.</th>
            <th className="text-right py-2 px-3 font-bold text-slate-700 w-28">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {budget.items.map((item, i) => (
            <tr key={i} className="border-b border-slate-100" style={{ pageBreakInside: 'avoid' }}>
              <td className="text-left py-3 px-3 text-slate-600">{item.description || `Ítem ${i + 1}`}</td>
              <td className="text-center py-3 px-3 text-slate-600">{item.quantity}</td>
              <td className="text-right py-3 px-3 text-slate-600">{formatCurrency(item.unitPrice)}</td>
              <td className="text-right py-3 px-3 text-slate-600">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-slate-50 border-t-2 border-slate-800">
            <td colSpan={2} className="py-3 px-3"></td>
            <td className="text-right py-3 px-3 font-bold text-slate-900 text-sm">TOTAL</td>
            <td className="text-right py-3 px-3 font-bold text-slate-900 text-sm">
              {formatCurrency(budget.total)}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── 4. Firma, Contacto y QR ── */}
      {/* pageBreakInside: avoid asegura que este bloque no se corte a la mitad si cae justo en el borde de la página */}
      <div className="mt-16 flex justify-between items-end" style={{ pageBreakInside: 'avoid' }}>
        {/* Firma */}
        <div className="w-48">
          <div className="border-t border-slate-400 mb-2"></div>
          <p className="text-xs text-slate-500 text-center m-0">Firma del Emisor</p>
        </div>

        {/* QR y Textos */}
        <div className="flex gap-4 items-center">
          <div className="text-right text-xs">
            <p className="font-bold text-slate-700 m-0">
              Generado por {profile.name || 'Tu Nombre'}
            </p>
            <p className="text-slate-500 m-0 mt-1">Conocé más y creá tu presupuesto en:</p>
            <p className="font-bold text-blue-500 m-0 mt-0.5">www.tu-sitio-web.com.ar</p>
          </div>
          {/* Cuadro punteado para el QR */}
          <div className="w-16 h-16 border-2 border-dashed border-slate-300 flex items-center justify-center rounded">
            <span className="text-xs font-bold text-slate-300">QR</span>
          </div>
        </div>
      </div>
    </div>
  );
}