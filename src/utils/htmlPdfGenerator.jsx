import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import { formatCurrency, formatDateShort } from './formatters';

// ── Registro manual del plugin ──
// jspdf-autotable 5.x busca window.jsPDF para auto-registrarse, pero en ESM/Vite
// jsPDF no está en window. Importamos applyPlugin y lo llamamos explícitamente.
applyPlugin(jsPDF);

/**
 * Suma días a una fecha ISO y devuelve string formateado.
 */
function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return formatDateShort(date.toISOString());
}

let pendingPromise = null;

/**
 * Genera y descarga un PDF del presupuesto usando jsPDF directamente.
 * Sin html2canvas, sin oklch, sin vueltas.
 *
 * @param {object} budget  — Datos del presupuesto
 * @param {object} profile — Datos del perfil (emisor)
 * @returns {Promise<void>}
 */
export async function generatePDFFromTemplate(budget, profile) {
  if (pendingPromise) {
    await pendingPromise;
  }

  pendingPromise = generateInternal(budget, profile);
  try {
    await pendingPromise;
  } finally {
    pendingPromise = null;
  }
}

async function generateInternal(budget, profile) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // ── Helper: footer con número de página ──
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(130);
      doc.text(
        `Página ${i} de ${pageCount} — Generado el ${formatDateShort(new Date().toISOString())}`,
        margin,
        doc.internal.pageSize.getHeight() - 10,
      );
    }
  };

  // ── Helper: verificar si hay espacio para lo que sigue ──
  const checkPageBreak = (neededHeight) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const currentY = doc.lastAutoTable?.finalY ?? doc.getY();
    if (currentY + neededHeight > pageHeight - 25) {
      doc.addPage();
      return doc.getY();
    }
    return currentY;
  };

  // ── Cabecera: emisor (izquierda) y cliente (derecha) ──
  let cursorY = 20;

  // Emisor
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.businessName || profile.name || 'Presupuesto', margin, cursorY);

  cursorY += 7;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  if (profile.cuit) {
    doc.text(`CUIT: ${profile.cuit}`, margin, cursorY);
    cursorY += 4.5;
  }
  if (profile.address) {
    doc.text(profile.address, margin, cursorY);
    cursorY += 4.5;
  }

  // Cliente (derecha)
  const rightColX = pageWidth / 2 + 6;
  let clientY = 20;

  if (budget.clientName) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    doc.text('Cliente', rightColX, clientY);
    clientY += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    doc.text(budget.clientName, rightColX, clientY);
    clientY += 4.5;

    if (budget.clientId) {
      doc.text(`CUIT/DNI: ${budget.clientId}`, rightColX, clientY);
      clientY += 4.5;
    }
    if (budget.clientAddress) {
      doc.text(budget.clientAddress, rightColX, clientY);
      clientY += 4.5;
    }
  }

  // Línea separadora
  const separatorY = Math.max(cursorY, clientY) + 4;
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  doc.line(margin, separatorY, pageWidth - margin, separatorY);

  // Título y fechas
  let afterSep = separatorY + 8;

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(budget.title || 'Presupuesto', margin, afterSep);

  afterSep += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Emisión: ${formatDateShort(budget.createdAt)}`, margin, afterSep);

  if (budget.dueDays) {
    const dueDate = addDays(budget.createdAt, budget.dueDays);
    doc.text(`Vencimiento: ${dueDate} (${budget.dueDays} días)`, margin + 50, afterSep);
  }

  // Tabla de ítems
  const tableBody = budget.items.map((item, i) => [
    item.description || `Ítem ${i + 1}`,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency((item.quantity ?? 0) * (item.unitPrice ?? 0)),
  ]);

  doc.autoTable({
    startY: afterSep + 6,
    margin: { horizontal: margin },
    tableWidth: contentWidth,
    head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableBody,
    foot: [['', '', 'TOTAL', formatCurrency(budget.total)]],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 30, 30],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    footStyles: {
      fillColor: [240, 240, 240],
      textColor: [30, 30, 30],
      fontStyle: 'bold',
      fontSize: 10,
    },
    alternateRowStyles: {
      fillColor: [248, 248, 248],
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 32, halign: 'right' },
    },
    pageBreak: 'auto',
  });

  // Firma
  const signatureY = checkPageBreak(30);
  const finalY = Math.max(
    signatureY,
    (doc.lastAutoTable?.finalY ?? signatureY) + 10,
  );

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120);
  doc.text('_____________________________', margin, finalY + 6);
  doc.text('Firma del Emisor', margin + 2, finalY + 12);

  // Footer en todas las páginas
  addFooter();

  // Nombre del archivo con fecha
  const dateStr = budget.createdAt
    ? budget.createdAt.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  doc.save(`${budget.title || 'Presupuesto'}-${dateStr}.pdf`);
}
