import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDateShort } from './formatters';

/**
 * Suma días a una fecha ISO y devuelve un string formateado.
 */
function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return formatDateShort(date.toISOString());
}

/**
 * Genera y descarga un PDF del presupuesto.
 */
export function generateBudgetPDF(budget, profile) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const rightMargin = pageWidth - margin;
  const contentWidth = pageWidth - margin * 2;

  // ── Helper: footer con número de página ──
  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  };

  // ── Helper: check salto de página ──
  const checkPageBreak = (neededHeight) => {
    const currentY = doc.lastAutoTable?.finalY ?? doc.getY();
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      return 20; // Retorna el Y inicial de la nueva página
    }
    return currentY;
  };

  // ==========================================
  // 1. CABECERA (Emisor a la izq, Título a la der)
  // ==========================================
  let cursorY = 22;

  // Emisor (Izquierda)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30);
  doc.text(profile.businessName || profile.name || 'Mi Empresa', margin, cursorY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  
  let emisorY = cursorY + 6;
  if (profile.cuit) {
    doc.text(`CUIT: ${profile.cuit}`, margin, emisorY);
    emisorY += 5;
  }
  if (profile.address) {
    doc.text(profile.address, margin, emisorY);
  }

  // Título del documento (Derecha)
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(220); // Gris muy clarito para que quede elegante
  doc.text('PRESUPUESTO', rightMargin, cursorY, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text(budget.title || 'Detalle de cotización', rightMargin, cursorY + 8, { align: 'right' });

  // ==========================================
  // 2. DATOS DEL CLIENTE Y FECHAS
  // ==========================================
  let sectionY = Math.max(emisorY, cursorY + 8) + 12;

  // Línea separadora sutil
  doc.setDrawColor(230);
  doc.setLineWidth(0.5);
  doc.line(margin, sectionY, rightMargin, sectionY);
  
  sectionY += 8;

  // Fechas (Izquierda)
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(80);
  doc.text('Fecha de Emisión:', margin, sectionY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50);
  doc.text(formatDateShort(budget.createdAt), margin + 32, sectionY);

  if (budget.dueDays) {
    const dueDate = addDays(budget.createdAt, budget.dueDays);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80);
    doc.text('Vencimiento:', margin, sectionY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50);
    doc.text(`${dueDate} (${budget.dueDays} días)`, margin + 32, sectionY + 6);
  }

  // Cliente (Derecha)
  if (budget.clientName) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(80);
    doc.text('Para:', rightMargin, sectionY, { align: 'right' });

    let clientY = sectionY + 5;
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text(budget.clientName, rightMargin, clientY, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    clientY += 5;

    if (budget.clientId) {
      doc.text(`CUIT/DNI: ${budget.clientId}`, rightMargin, clientY, { align: 'right' });
      clientY += 5;
    }
    if (budget.clientAddress) {
      doc.text(budget.clientAddress, rightMargin, clientY, { align: 'right' });
    }
  }

  // ==========================================
  // 3. TABLA DE ÍTEMS
  // ==========================================
  const tableStartY = sectionY + 22;

  const tableBody = budget.items.map((item) => [
    item.description || 'Ítem sin descripción',
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
    foot: [
      ['', '', 'TOTAL', formatCurrency(budget.total)],
    ],
    theme: 'plain', // Cambiamos a plain y estilizamos a mano para un look más moderno
    headStyles: {
      fillColor: [245, 245, 245],
      textColor: [50, 50, 50],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [70, 70, 70],
      cellPadding: 4,
    },
    footStyles: {
      fillColor: [250, 250, 250],
      textColor: [30, 30, 30],
      fontStyle: 'bold',
      fontSize: 11,
      cellPadding: 5,
    },
    didDrawCell: (data) => {
      // Agrega una línea sutil debajo de cada fila del body
      if (data.section === 'body' && data.row.index !== tableBody.length - 1) {
        doc.setDrawColor(240);
        doc.setLineWidth(0.2);
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height);
      }
      // Línea fuerte arriba del total
      if (data.section === 'foot') {
        doc.setDrawColor(30);
        doc.setLineWidth(0.5);
        doc.line(data.cell.x, data.cell.y, data.cell.x + data.cell.width, data.cell.y);
      }
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 16, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' },
    },
  });

  // ==========================================
  // 4. FIRMA, CONTACTO Y QR (Al final)
  // ==========================================
  // Calculamos si hay espacio para todo el bloque final (Firma + QR)
  let finalY = checkPageBreak(50);
  finalY = (doc.lastAutoTable?.finalY ?? finalY) + 15;

  // Firma
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(150);
  doc.setDrawColor(150);
  doc.setLineWidth(0.3);
  doc.line(margin, finalY + 10, margin + 50, finalY + 10);
  doc.text('Firma del Emisor', margin + 12, finalY + 15);

  // --- Bloque del QR y Datos de Contacto (A la derecha) ---
  const qrSize = 22;
  const qrX = rightMargin - qrSize;
  const qrY = finalY;

  // Placeholder del QR (Un recuadro punteado o gris)
  doc.setDrawColor(200);
  doc.setLineDashPattern([1, 1], 0); // Línea punteada
  doc.rect(qrX, qrY, qrSize, qrSize);
  doc.setLineDashPattern([], 0); // Resetear a línea solida
  doc.setFontSize(8);
  doc.setTextColor(180);
  doc.text('QR', qrX + (qrSize/2), qrY + (qrSize/2) + 2, { align: 'center' });

  // Textos del creador y la web (Alineados a la derecha, al lado del QR)
  const textEnd = qrX - 5;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50);
  doc.text(`Generado por ${profile.name || 'Tu Nombre'}`, textEnd, qrY + 6, { align: 'right' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('Conocé más y creá tu presupuesto en:', textEnd, qrY + 12, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(59, 130, 246); // Un azul estilo Tailwind (blue-500) para simular un link
  doc.text('www.tu-sitio-web.com.ar', textEnd, qrY + 17, { align: 'right' });

  // ── Footer en todas las páginas ──
  addFooter();

  doc.save(`Presupuesto-${budget.title || 'comunidad'}.pdf`);
}