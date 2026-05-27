import QRCode from 'qrcode';
import { formatCurrency, formatDateShort } from './formatters';

/**
 * Suma días a una fecha ISO y devuelve string formateado.
 */
function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return formatDateShort(date.toISOString());
}

/**
 * Abre una ventana con el presupuesto formateado para impresión,
 * con el bloque de cierre (link + QR + firma opcional) fijado
 * al borde inferior de la última página.
 *
 * @param {object}  budget              — Datos del presupuesto
 * @param {object}  profile             — Datos del perfil (emisor)
 * @param {boolean} [showSignatureSpace=true] — Si se renderiza la línea de firma
 */
export async function openPrintPreview(budget, profile, showSignatureSpace = true) {
  // ── Generar QR real ──
  const qrDataUrl = await QRCode.toDataURL('https://presupuetos.yuione.com.ar/', {
    width: 300,
    margin: 1,
    color: { dark: '#171717', light: '#FFFFFF' },
  });

  const emitterName = profile.businessName || profile.name || 'Mi Empresa';

  const generatedBy = profile.name || 'Tu Nombre';
  const title = budget.title || 'Detalle de cotización';
  const emissionDate = formatDateShort(budget.createdAt);

  // ── Filas de la tabla ──
  const tableRows = budget.items
    .map(
      (item, i) => `
        <tr>
          <td>${escHtml(item.description || `Ítem ${i + 1}`)}</td>
          <td class="col-center">${item.quantity}</td>
          <td class="col-right">${formatCurrency(item.unitPrice)}</td>
          <td class="col-right">${formatCurrency((item.quantity ?? 0) * (item.unitPrice ?? 0))}</td>
        </tr>`,
    )
    .join('');

  // ── Due date ──
  const dueDateHtml = budget.dueDays
    ? `<div class="info-line"><span class="label">Vencimiento:</span><span class="value">${addDays(budget.createdAt, budget.dueDays)} (${budget.dueDays} días)</span></div>`
    : '';

  // ── Cliente ──
  const clientHtml = budget.clientName
    ? `
      <div class="client-block">
        <p class="client-label">Para:</p>
        <p class="client-name">${escHtml(budget.clientName)}</p>
        ${budget.clientId ? `<p class="client-detail">CUIT/DNI: ${escHtml(budget.clientId)}</p>` : ''}
        ${budget.clientAddress ? `<p class="client-detail">${escHtml(budget.clientAddress)}</p>` : ''}
      </div>`
    : '';

  // ── Signature block (opcional) ──
  const signatureHtml = showSignatureSpace
    ? `
      <div class="signature-area">
        <div class="signature-line"></div>
        <p class="signature-text">Firma del Emisor</p>
      </div>`
    : '';

  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escHtml(title)}</title>
  <style>
    /* ═══════════════════════════════════════════
       RESET & BASE
       ═══════════════════════════════════════════ */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      padding: 30px;
      max-width: 210mm;
      margin: 0 auto;
    }

    /* ═══════════════════════════════════════════
       LAYOUT — flex para empujar footer al fondo
       ═══════════════════════════════════════════ */
    .print-page {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .print-body {
      flex: 1 1 auto;
    }

    .print-footer {
      flex: 0 0 auto;
      page-break-inside: avoid;
      margin-top: 48px;
    }

    /* ═══════════════════════════════════════════
       HEADER
       ═══════════════════════════════════════════ */
    .header { display: flex; justify-content: space-between; align-items: flex-start; }
    .emitter-name { font-size: 24px; font-weight: 700; color: #0f172a; }
    .emitter-info { font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.4; }
    .doc-title { font-size: 32px; font-weight: 800; color: #e2e8f0; text-align: right; text-transform: uppercase; letter-spacing: 0.05em; }
    .doc-subtitle { font-size: 14px; font-weight: 700; color: #64748b; text-align: right; margin-top: 2px; }

    .separator { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px; }

    /* ═══════════════════════════════════════════
       INFO (fechas + cliente)
       ═══════════════════════════════════════════ */
    .info-section { display: flex; justify-content: space-between; font-size: 11px; }
    .info-line { margin-bottom: 6px; }
    .info-line .label { font-weight: 700; color: #334155; display: inline-block; width: 120px; }
    .info-line .value { color: #64748b; }

    .client-block { text-align: right; }
    .client-label { font-weight: 700; color: #334155; margin-bottom: 4px; }
    .client-name { font-size: 14px; font-weight: 700; color: #0f172a; }
    .client-detail { color: #64748b; margin-top: 2px; line-height: 1.4; }

    /* ═══════════════════════════════════════════
       TABLE
       ═══════════════════════════════════════════ */
    table { width: 100%; border-collapse: collapse; margin-top: 28px; font-size: 11px; }
    th {
      text-align: left; padding: 8px 12px;
      font-weight: 700; color: #334155;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    td { padding: 10px 12px; color: #475569; border-bottom: 1px solid #f1f5f9; }

    th:last-child, td:last-child { text-align: right; }
    .col-center { text-align: center; }
    .col-right { text-align: right; }

    th:nth-child(2) { text-align: center; width: 60px; }
    th:nth-child(3) { text-align: right; width: 120px; }
    th:nth-child(4) { text-align: right; width: 120px; }

    tfoot td {
      background: #f8fafc;
      font-weight: 700;
      color: #0f172a;
      font-size: 13px;
      border-top: 2px solid #1e293b;
      padding: 10px 12px;
    }
    tfoot td:last-child { text-align: right; }

    /* ═══════════════════════════════════════════
       FOOTER — SIGNOFF (firma, link, QR)
       ═══════════════════════════════════════════ */
    .signoff { display: flex; justify-content: space-between; align-items: flex-end; }

    .signature-area { width: 180px; }
    .signature-line { border-top: 1px solid #94a3b8; margin-bottom: 8px; }
    .signature-text { font-size: 11px; color: #64748b; text-align: center; }

    .contact-area { display: flex; gap: 16px; align-items: center; }
    .contact-text { text-align: right; font-size: 11px; line-height: 1.6; }
    .contact-text .generated-by { font-weight: 700; color: #334155; }
    .contact-text .link-label { color: #64748b; }
    .contact-text .link-url { font-weight: 700; color: #3b82f6; }

    .qr-img { width: 64px; height: 64px; border-radius: 4px; }

    /* ═══════════════════════════════════════════
       NO-PRINT (botón, checkbox, etc.)
       ═══════════════════════════════════════════ */
    .no-print { margin-bottom: 16px; }

    .no-print button {
      padding: 8px 24px; font-size: 14px; cursor: pointer;
      background: #B30000; color: #fff; border: none; border-radius: 8px;
      font-family: inherit;
    }
    .no-print button:hover { background: #8B0000; }
    .no-print .hint { font-size: 12px; color: #64748b; margin-top: 8px; }

    /* ═══════════════════════════════════════════
       @MEDIA PRINT
       ═══════════════════════════════════════════ */
    @media print {
      @page {
        margin: 15mm;
        size: A4;
      }

      body {
        padding: 0;
        max-width: none;
        background: #fff;
      }

      .no-print {
        display: none !important;
      }

      .print-page {
        min-height: auto;
        display: block;
      }

      .print-footer {
        margin-top: 48px;
        page-break-inside: avoid;
        page-break-before: auto;
      }

      table {
        page-break-inside: auto;
      }

      table tr {
        page-break-inside: avoid;
      }

      thead {
        display: table-header-group;
      }

      tfoot {
        display: table-footer-group;
      }

      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-page">
    <div class="print-body">
      <!-- ── Toolbar (hidden in print) ── -->
      <div class="no-print" style="text-align: center;">
        <button onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
        <p class="hint">o usá Ctrl+P</p>
      </div>

      <!-- ════════════════ HEADER ════════════════ -->
      <div class="header">
        <div>
          <h1 class="emitter-name">${escHtml(emitterName)}</h1>
          <div class="emitter-info">
            ${profile.cuit ? `<p>CUIT: ${escHtml(profile.cuit)}</p>` : ''}
            ${profile.address ? `<p>${escHtml(profile.address)}</p>` : ''}
          </div>
        </div>
        <div>
          <h2 class="doc-title">Presupuesto</h2>
          <p class="doc-subtitle">${escHtml(title)}</p>
        </div>
      </div>

      <hr class="separator">

      <!-- ════════════════ INFO ════════════════ -->
      <div class="info-section">
        <div>
          <div class="info-line"><span class="label">Fecha de Emisión:</span><span class="value">${emissionDate}</span></div>
          ${dueDateHtml}
        </div>
        ${clientHtml}
      </div>

      <!-- ════════════════ TABLE ════════════════ -->
      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Cant.</th>
            <th>Precio Unit.</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2"></td>
            <td>TOTAL</td>
            <td>${formatCurrency(budget.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- ════════════════ FOOTER (signoff) ════════════════ -->
    <div class="print-footer">
      <div class="signoff">
        ${signatureHtml}

        <div class="contact-area">
          <div class="contact-text">
            <p class="generated-by">Generado por ${escHtml(generatedBy)}</p>
            <p class="link-label">Conocé más y creá tu presupuesto en:</p>
            <p class="link-url">yuione.com.ar</p>
          </div>
          <img class="qr-img" src="${qrDataUrl}" alt="QR" />
        </div>
      </div>
    </div>
  </div>

  <script>
    // Auto-imprimir al cargar
    window.onload = function () {
      setTimeout(function () {
        window.focus();
        window.print();
      }, 400);
    };
  </script>
</body>
</html>`;

  // ── Abrir en nueva ventana ──
  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    // Pop-up bloqueado
    console.warn('La ventana emergente fue bloqueada. Permití pop-ups para este sitio.');
    return;
  }

  printWindow.document.write(fullHtml);
  printWindow.document.close();
}

/**
 * Escape básico de HTML para evitar inyección.
 */
function escHtml(str) {
  if (typeof str !== 'string') return String(str ?? '');
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
