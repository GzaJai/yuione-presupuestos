import { useState } from 'react';
import { FileDown } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { generatePDFFromTemplate } from '../../utils/htmlPdfGenerator';

/**
 * Suma días a una fecha ISO y devuelve string formateado.
 */
function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return formatDateShort(date.toISOString());
}

/**
 * Modal con detalle del presupuesto: datos, items, total,
 * checkbox de firma opcional, vista previa y descarga de PDF.
 *
 * @param {{
 *   budget: object,
 *   profile: object,
 *   open: boolean,
 *   onClose: () => void,
 * }} props
 */
export default function BudgetDetailModal({ budget, profile, open, onClose }) {
  const [showSignatureSpace, setShowSignatureSpace] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (generatingPdf) return;
    setGeneratingPdf(true);
    try {
      await generatePDFFromTemplate(budget, profile, showSignatureSpace);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={budget?.title || 'Detalle del presupuesto'}
      contentClassName="max-w-xl"
    >
      {budget && (
        <div className="space-y-4">
          {/* ── Datos del Cliente ── */}
          {budget.clientName && (
            <div className="text-sm">
              <p className="font-semibold text-text-primary">{budget.clientName}</p>
              <div className="text-xs text-text-secondary mt-0.5 space-y-0.5">
                {budget.clientId && <p>CUIT/DNI: {budget.clientId}</p>}
                {budget.clientAddress && <p>{budget.clientAddress}</p>}
              </div>
            </div>
          )}

          {/* ── Fechas ── */}
          <div className="flex gap-6 text-xs text-text-secondary">
            <span>
              <span className="font-semibold text-text-primary">Emisión:</span>{' '}
              {formatDateShort(budget.createdAt)}
            </span>
            {budget.dueDays && (
              <span>
                <span className="font-semibold text-text-primary">Vencimiento:</span>{' '}
                {addDays(budget.createdAt, budget.dueDays)} ({budget.dueDays} días)
              </span>
            )}
          </div>

          {/* ── Tabla de Ítems ── */}
          {budget.items?.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-card-border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-card">
                  <tr className="border-b border-card-border">
                    <th className="text-left py-2 px-3 font-semibold text-text-primary">Descripción</th>
                    <th className="text-center py-2 px-3 font-semibold text-text-primary w-12">Cant.</th>
                    <th className="text-right py-2 px-3 font-semibold text-text-primary w-24">P. Unit.</th>
                    <th className="text-right py-2 px-3 font-semibold text-text-primary w-24">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.items.map((item, i) => (
                    <tr key={i} className="border-b border-card-border last:border-b-0">
                      <td className="py-2 px-3 text-text-primary">{item.description || `Ítem ${i + 1}`}</td>
                      <td className="text-center py-2 px-3 text-text-secondary">{item.quantity}</td>
                      <td className="text-right py-2 px-3 text-text-secondary">{formatCurrency(item.unitPrice)}</td>
                      <td className="text-right py-2 px-3 text-text-secondary font-mono">
                        {formatCurrency((item.quantity ?? 0) * (item.unitPrice ?? 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Total ── */}
          <div className="flex justify-end border-t border-card-border pt-3">
            <span className="text-lg font-bold text-text-primary font-mono">
              {formatCurrency(budget.total)}
            </span>
          </div>

          {/* ── Checkbox firma opcional ── */}
          <div className="print:hidden">
            <label className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showSignatureSpace}
                onChange={(e) => setShowSignatureSpace(e.target.checked)}
                className="w-4 h-4 rounded border-input-border bg-input-bg accent-primary cursor-pointer"
              />
              Incluir espacio de firma
            </label>
          </div>

          {/* ── Acciones ── */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="secondary"
              onClick={handleDownloadPDF}
              disabled={generatingPdf}
              className="flex-1"
            >
              <FileDown size={16} />
              {generatingPdf ? 'Generando PDF…' : 'Descargar PDF'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
