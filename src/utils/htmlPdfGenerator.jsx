import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';
import QRCode from 'qrcode';
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
 * Genera un PDF del presupuesto usando jsPDF y lo abre en una nueva pestaña
 * como vista previa (Blob URL).
 *
 * @param {object}  budget              — Datos del presupuesto
 * @param {object}  profile             — Datos del perfil (emisor)
 * @param {boolean} [showSignatureSpace=true] — Si se renderiza la línea de firma
 * @returns {Promise<void>}
 */
export async function generatePDFFromTemplate(budget, profile, showSignatureSpace = true) {
  if (pendingPromise) {
    await pendingPromise;
  }

  pendingPromise = generateInternal(budget, profile, showSignatureSpace);
  try {
    await pendingPromise;
  } finally {
    pendingPromise = null;
  }
}

async function generateInternal(budget, profile, showSignatureSpace) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  // ── Helper: verificar espacio antes de un bloque ──
  const ensureSpace = (neededHeight, fallbackY) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const currentY = doc.lastAutoTable?.finalY ?? fallbackY ?? cursorY;
    if (currentY + neededHeight > pageHeight - 25) {
      doc.addPage();
      return 25;
    }
    return currentY;
  };

  const emitterName = profile.businessName || profile.name || 'Mi Empresa';
  let cursorY = 25;

  // ══════════════════════════════════════════════
  // 1. CABECERA: Emisor (izq) + "PRESUPUESTO" (der)
  // ══════════════════════════════════════════════

  // -- Emisor (izquierda) --
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(emitterName, margin, cursorY);

  cursorY += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  if (profile.cuit) {
    doc.text(`CUIT: ${profile.cuit}`, margin, cursorY);
    cursorY += 3.5;
  }
  if (profile.address) {
    doc.text(profile.address, margin, cursorY);
    cursorY += 3.5;
  }

  // -- "PRESUPUESTO" (derecha) --
  const rightX = pageWidth - margin;
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(226, 232, 240); // slate-200 — muy claro
  doc.text('PRESUPUESTO', rightX, 25, { align: 'right' });

  // Subtítulo debajo de "PRESUPUESTO"
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(budget.title || 'Detalle de cotización', rightX, 25 + 8, { align: 'right' });

  // ══════════════════════════════════════════════
  // 2. FECHAS Y DATOS DEL CLIENTE
  // ══════════════════════════════════════════════

  // Separador delgado
  const sepY = Math.max(cursorY + 4, 25 + 12);
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(margin, sepY, pageWidth - margin, sepY);

  let sectionY = sepY + 8;

  // -- Fechas (izquierda) --
  const labelX = margin;
  const valueX = margin + 30;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text('Fecha de Emisión:', labelX, sectionY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(formatDateShort(budget.createdAt), valueX, sectionY);

  sectionY += 4.5;

  if (budget.dueDays) {
    const dueDate = addDays(budget.createdAt, budget.dueDays);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Vencimiento:', labelX, sectionY);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`${dueDate} (${budget.dueDays} días)`, valueX, sectionY);
    sectionY += 4.5;
  }

  // -- Cliente (derecha) --
  const clientX = pageWidth / 2 + 5;
  let clientY = sepY + 8;

  if (budget.clientName) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 65, 85);
    doc.text('Para:', clientX, clientY);
    clientY += 4.5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(budget.clientName, clientX, clientY);
    clientY += 4.5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    if (budget.clientId) {
      doc.text(`CUIT/DNI: ${budget.clientId}`, clientX, clientY);
      clientY += 3.5;
    }
    if (budget.clientAddress) {
      doc.text(budget.clientAddress, clientX, clientY);
      clientY += 3.5;
    }
  }

  // ══════════════════════════════════════════════
  // 3. TABLA DE ÍTEMS
  // ══════════════════════════════════════════════

  const tableStartY = Math.max(sectionY, clientY) + 6;

  const tableBody = budget.items.map((item, i) => [
    item.description || `Ítem ${i + 1}`,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency((item.quantity ?? 0) * (item.unitPrice ?? 0)),
  ]);

  doc.autoTable({
    startY: tableStartY,
    margin: { horizontal: margin },
    tableWidth: contentWidth,
    head: [['Descripción', 'Cant.', 'Precio Unit.', 'Subtotal']],
    body: tableBody,
    foot: [['', '', 'TOTAL', formatCurrency(budget.total)]],
    theme: 'plain',
    headStyles: {
      fillColor: [248, 250, 252], // slate-50
      textColor: [51, 65, 85],    // slate-700
      fontStyle: 'bold',
      fontSize: 8,
      lineColor: [226, 232, 240],
      lineWidth: 0.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [71, 85, 105],   // slate-600
      lineColor: [241, 245, 249], // slate-100
      lineWidth: 0.3,
    },
    footStyles: {
      fillColor: [248, 250, 252], // slate-50
      textColor: [15, 23, 42],    // slate-900
      fontStyle: 'bold',
      fontSize: 9,
      lineColor: [30, 41, 59],    // slate-800
      lineWidth: 0.8,
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 32, halign: 'right' },
    },
    pageBreak: 'auto',
  });

  // ══════════════════════════════════════════════
  // 4. FIRMA, CONTACTO Y QR
  // ══════════════════════════════════════════════

  const tableEndY = ensureSpace(40);
  const finalY = tableEndY + 15;

  // -- Firma (izquierda) — OPCIONAL --
  if (showSignatureSpace) {
    const signatureW = 48; // ~ w-48 (48mm)
    doc.setDrawColor(148, 163, 184); // slate-400
    doc.setLineWidth(0.5);
    doc.line(margin, finalY, margin + signatureW, finalY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Firma del Emisor', margin + signatureW / 2, finalY + 5, { align: 'center' });
  }

  // -- QR real (derecha) --
  const qrSize = 16; // 16mm
  const qrX = pageWidth - margin - qrSize;
  const qrY = finalY - 5;

  const qrDataUrl = await QRCode.toDataURL('https://presupuetos.yuione.com.ar/', {
    width: 300,
    margin: 1,
    color: { dark: '#171717', light: '#FFFFFF' },
  });
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

  // -- Texto de contacto (a la izquierda del QR) --
  const gap = 4;
  const textRight = qrX - gap;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(`Generado por ${profile.name || 'Tu Nombre'}`, textRight, finalY, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Conocé más y creá tu presupuesto en:', textRight, finalY + 5, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246); // blue-500
  doc.text('yuione.com.ar', textRight, finalY + 10, { align: 'right' });

  // Link clickeable sobre el texto
  const linkText = 'yuione.com.ar';
  const linkW = doc.getTextWidth(linkText);
  const linkH = 3; // ~ alto del texto en mm
  const linkX = textRight - linkW;
  const linkY = finalY + 10 - 2; // ajuste fino
  doc.link(linkX, linkY, linkW, linkH, { url: 'https://presupuetos.yuione.com.ar/' });

  // ── Setear metadata del PDF con nombre formateado: fecha-nombre-cliente ──
  const dateStr = budget.createdAt
    ? budget.createdAt.slice(0, 10)
    : new Date().toISOString().slice(0, 10);

  const nameSlug = slugify(profile.businessName || profile.name || 'presupuesto');
  const clientSlug = slugify(budget.clientName || 'sin-cliente');
  const pdfTitle = `${dateStr}-${nameSlug}-${clientSlug}`;

  doc.setProperties({ title: pdfTitle });

  // ── Abrir en nueva pestaña como vista previa ──
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
}

/**
 * Convierte un texto en un slug seguro para nombres de archivo.
 * Ej: "Mi Empresa S.A." → "mi-empresa-sa"
 */
function slugify(text) {
  if (typeof text !== 'string') return 'unknown';
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')                  // separa acentos de letras
    .replace(/[\u0300-\u036f]/g, '')   // elimina diacríticos
    .replace(/[^a-z0-9\s-]/g, '')      // solo letras, números, espacios, guiones
    .replace(/\s+/g, '-')              // espacios → guiones
    .replace(/-+/g, '-')               // guiones múltiples → uno solo
    .replace(/^-|-$/g, '');            // saca guiones al inicio/final
}
