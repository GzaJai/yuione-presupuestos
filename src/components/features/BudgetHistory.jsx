import { useState } from 'react';
import { FileText, Trash2, Download } from 'lucide-react';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import { generatePDFFromTemplate } from '../../utils/htmlPdfGenerator';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

/**
 * Listado de presupuestos guardados con acciones: descargar PDF y eliminar.
 *
 * @param {{ budgets: Array, profile: object, onDelete: (id: number) => void, onSelect?: (budget: object) => void }} props
 */
export default function BudgetHistory({ budgets = [], profile, onDelete, onSelect }) {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleDownload = async (budget) => {
    if (downloadingId === budget.id) return;
    setDownloadingId(budget.id);
    try {
      await generatePDFFromTemplate(budget, profile);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const confirmDelete = () => {
    if (deleteTarget) {
      onDelete(deleteTarget);
      setDeleteTarget(null);
    }
  };

  if (budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
        <FileText size={40} className="mb-3 opacity-40" />
        <p className="text-sm">Todavía no hay presupuestos</p>
        <p className="text-xs text-text-secondary/60 mt-1">
          Creá tu primer presupuesto desde el botón de arriba.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="flex items-center gap-3 rounded-lg border border-card-border bg-history-row p-3 hover:border-text-secondary/30 transition-all duration-200"
          >
            {/* Ícono de acento (historial) */}
            <div className="shrink-0 w-9 h-9 rounded-full bg-accent-bg flex items-center justify-center">
              <FileText size={16} className="text-accent-icon" />
            </div>

            {/* Info */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => onSelect?.(budget)}
            >
              <p className="text-sm font-medium text-text-primary truncate">
                {budget.title || 'Sin título'}
              </p>
              <p className="text-xs text-text-secondary mt-0.5 truncate">
                <span className="text-text-secondary/60">#{budget.code}</span>
                {' · '}
                {budget.clientName ? (
                  <><span className="text-text-secondary/60">Cliente:</span> {budget.clientName} · </>
                ) : null}
                {formatDateShort(budget.createdAt)}
              </p>
            </div>

            {/* Monto */}
            <span className="text-sm font-mono font-bold text-text-primary whitespace-nowrap">
              {formatCurrency(budget.total)}
            </span>

            {/* Acciones */}
            <div className="flex gap-1">
              <button
                onClick={() => handleDownload(budget)}
                disabled={downloadingId === budget.id}
                className="p-1.5 text-text-secondary hover:text-primary disabled:text-text-secondary/30 disabled:pointer-events-none transition-colors cursor-pointer"
                aria-label="Descargar PDF"
                title={downloadingId === budget.id ? 'Generando…' : 'Descargar PDF'}
              >
                <Download size={16} className={downloadingId === budget.id ? 'animate-pulse' : ''} />
              </button>
              <button
                onClick={() => setDeleteTarget(budget.id)}
                className="p-1.5 text-text-secondary hover:text-primary transition-colors cursor-pointer"
                aria-label="Eliminar presupuesto"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmación de borrado */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar eliminación"
      >
        <p className="text-sm text-text-primary mb-6">
          ¿Estás seguro de que querés eliminar este presupuesto? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  );
}
