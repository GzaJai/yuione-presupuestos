/**
 * Funciones puras de formateo.
 * Sin efectos secundarios — fáciles de testear.
 */

/**
 * Formatea un número como moneda ARS ($).
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(amount ?? 0);
}

/**
 * Formatea una fecha ISO o Date a un string legible (ARG locale).
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
  }).format(d);
}

/**
 * Formato corto (dd/mm/aaaa).
 * @param {string|Date} date
 * @returns {string}
 */
export function formatDateShort(date) {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

/**
 * Calcula el subtotal de un ítem.
 * @param {{ quantity: number, unitPrice: number }} item
 * @returns {number}
 */
export function calcSubtotal(item) {
  return (item.quantity ?? 0) * (item.unitPrice ?? 0);
}

/**
 * Calcula el total de un array de ítems.
 * @param {{ quantity: number, unitPrice: number }[]} items
 * @returns {number}
 */
export function calcTotal(items) {
  return items.reduce((sum, item) => sum + calcSubtotal(item), 0);
}
