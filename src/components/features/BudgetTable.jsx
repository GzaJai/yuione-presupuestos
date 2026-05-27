import { Plus, Trash2 } from 'lucide-react';
import { calcTotal } from '../../utils/formatters';
import { formatCurrency } from '../../utils/formatters';

const EMPTY_ITEM = { description: '', quantity: 1, unitPrice: 0 };

/**
 * Tabla dinámica de ítems del presupuesto.
 * Cada fila: descripción, cantidad, precio unitario, subtotal + botón eliminar.
 *
 * @param {{ items: Array, onChange: (items: Array) => void }} props
 */
export default function BudgetTable({ items = [], onChange }) {
  const total = calcTotal(items);

  const addRow = () => {
    onChange([...items, { ...EMPTY_ITEM }]);
  };

  const removeRow = (index) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const updateRow = (index, field) => (e) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const value = field === 'description' ? e.target.value : Number(e.target.value) || 0;
      return { ...item, [field]: value };
    });
    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Tabla (visible en pantallas > sm, en mobile mostramos cards) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border text-left text-xs text-text-secondary uppercase tracking-wide">
              <th className="pb-2 pr-2 w-1/2">Descripción</th>
              <th className="pb-2 pr-2 w-16 text-center">Cant.</th>
              <th className="pb-2 pr-2 w-24 text-right">P. Unit.</th>
              <th className="pb-2 pr-2 w-24 text-right">Subtotal</th>
              <th className="pb-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-card-border/50">
                <td className="py-1.5 pr-2">
                  <input
                    type="text"
                    placeholder="Ej: Mano de obra"
                    value={item.description}
                    onChange={updateRow(i, 'description')}
                    className="w-full bg-transparent outline-none text-text-primary placeholder:text-text-secondary/50 py-1"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={updateRow(i, 'quantity')}
                    onFocus={(e) => e.target.select()}
                    className="w-14 bg-input-bg rounded px-2 py-1 text-center text-text-primary outline-none transition-all duration-150 focus:ring-1 focus:ring-primary/30"
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={updateRow(i, 'unitPrice')}
                    onFocus={(e) => e.target.select()}
                    className="w-full bg-input-bg rounded px-2 py-1 text-right text-text-primary outline-none transition-all duration-150 focus:ring-1 focus:ring-primary/30"
                  />
                </td>
                <td className="py-1.5 pr-2 text-right text-text-secondary font-mono text-xs">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
                <td className="py-1.5 text-center">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-text-secondary hover:text-primary transition-colors cursor-pointer"
                      aria-label="Eliminar ítem"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista mobile: cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-card-border bg-card p-3 relative">
            <div className="flex items-start justify-between mb-2">
              <input
                type="text"
                placeholder="Descripción"
                value={item.description}
                onChange={updateRow(i, 'description')}
                className="flex-1 bg-transparent outline-none text-sm text-text-primary placeholder:text-text-secondary/50"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-text-secondary hover:text-primary transition-colors ml-2 cursor-pointer"
                  aria-label="Eliminar ítem"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-text-secondary uppercase">Cant.</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={item.quantity}
                  onChange={updateRow(i, 'quantity')}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-input-bg rounded px-2 py-1.5 text-sm text-text-primary outline-none text-center"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-text-secondary uppercase">P. Unit.</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={updateRow(i, 'unitPrice')}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-input-bg rounded px-2 py-1.5 text-sm text-text-primary outline-none text-right"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-text-secondary uppercase">Subtotal</label>
                <div className="w-full bg-input-bg rounded px-2 py-1.5 text-sm font-mono text-text-primary text-right">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botón agregar fila */}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors py-2 cursor-pointer"
      >
        <Plus size={14} />
        Agregar ítem
      </button>

      {/* Total */}
      <div className="flex justify-end items-center gap-4 border-t border-card-border pt-3 mt-1">
        <span className="text-sm font-semibold text-text-secondary uppercase">Total</span>
        <span className="text-lg font-bold font-mono text-text-primary">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
