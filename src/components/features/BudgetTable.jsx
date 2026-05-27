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
            <tr className="border-b border-zinc-700 text-left text-xs text-zinc-400 uppercase tracking-wide">
              <th className="pb-2 pr-2 w-1/2">Descripción</th>
              <th className="pb-2 pr-2 w-16 text-center">Cant.</th>
              <th className="pb-2 pr-2 w-24 text-right">P. Unit.</th>
              <th className="pb-2 pr-2 w-24 text-right">Subtotal</th>
              <th className="pb-2 w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-zinc-800/50">
                <td className="py-1.5 pr-2">
                  <input
                    type="text"
                    placeholder="Ej: Mano de obra"
                    value={item.description}
                    onChange={updateRow(i, 'description')}
                    className="w-full bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 py-1"
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
                    className="w-14 bg-zinc-800 rounded px-2 py-1 text-center text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500/30"
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
                    className="w-full bg-zinc-800 rounded px-2 py-1 text-right text-zinc-100 outline-none focus:ring-1 focus:ring-emerald-500/30"
                  />
                </td>
                <td className="py-1.5 pr-2 text-right text-zinc-300 font-mono text-xs">
                  {formatCurrency(item.quantity * item.unitPrice)}
                </td>
                <td className="py-1.5 text-center">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
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
          <div key={i} className="rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 relative">
            <div className="flex items-start justify-between mb-2">
              <input
                type="text"
                placeholder="Descripción"
                value={item.description}
                onChange={updateRow(i, 'description')}
                className="flex-1 bg-transparent outline-none text-sm text-zinc-100 placeholder:text-zinc-600"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="text-zinc-500 hover:text-red-400 transition-colors ml-2 cursor-pointer"
                  aria-label="Eliminar ítem"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 uppercase">Cant.</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={item.quantity}
                  onChange={updateRow(i, 'quantity')}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-zinc-800 rounded px-2 py-1.5 text-sm text-zinc-100 outline-none text-center"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 uppercase">P. Unit.</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={updateRow(i, 'unitPrice')}
                  onFocus={(e) => e.target.select()}
                  className="w-full bg-zinc-800 rounded px-2 py-1.5 text-sm text-zinc-100 outline-none text-right"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-zinc-500 uppercase">Subtotal</label>
                <div className="w-full bg-zinc-800 rounded px-2 py-1.5 text-sm text-emerald-400 font-mono text-right">
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
        className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors py-2 cursor-pointer"
      >
        <Plus size={14} />
        Agregar ítem
      </button>

      {/* Total */}
      <div className="flex justify-end items-center gap-4 border-t border-zinc-700 pt-3 mt-1">
        <span className="text-sm font-semibold text-zinc-300 uppercase">Total</span>
        <span className="text-lg font-bold font-mono text-emerald-400">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
