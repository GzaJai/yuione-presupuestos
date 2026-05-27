import { useState, useEffect } from 'react';
import { ArrowLeft, FileDown, Save } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import BudgetTable from '../components/features/BudgetTable';
import ClientSelect from '../components/features/ClientSelect';
import ClientFormModal from '../components/features/ClientFormModal';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useClients } from '../hooks/useClients';
import { calcTotal } from '../utils/formatters';
import { generatePDFFromTemplate } from '../utils/htmlPdfGenerator';

const DUE_DAYS_OPTIONS = [
  { value: '', label: '— Seleccionar —' },
  { value: 1, label: '1 día' },
  { value: 5, label: '5 días' },
  { value: 10, label: '10 días' },
  { value: 15, label: '15 días' },
  { value: 20, label: '20 días' },
];

/**
 * Pantalla de creación de presupuesto.
 * Incluye buscador de clientes + formulario + tabla dinámica + PDF.
 *
 * @param {{
 *   profile: object,
 *   onBack: () => void,
 *   onSave: (data: object) => Promise<void>,
 * }} props
 */
export default function BudgetGenerator({ profile, onBack, onSave }) {
  const { clients, createClient } = useClients();

  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [dueDays, setDueDays] = useState('');
  const [items, setItems] = useState([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);

  const total = calcTotal(items);

  // ── Cliente seleccionado completo (para el ClientSelect) ──
  const selectedClient = clientName
    ? { name: clientName, cuitDni: clientId, address: clientAddress, dueDays }
    : null;

  // ── Cuando se selecciona un cliente del listado ──
  const handleClientSelect = (client) => {
    setClientName(client.name || '');
    setClientId(client.cuitDni || '');
    setClientAddress(client.address || '');
    setDueDays(client.dueDays ? String(client.dueDays) : '');
  };

  // ── Cuando se crea un cliente nuevo desde el modal ──
  const handleNewClientSave = async (data) => {
    const created = await createClient(data);
    handleClientSelect(created);
  };

  const getClient = () => ({
    clientName: clientName.trim(),
    clientId: clientId.trim(),
    clientAddress: clientAddress.trim(),
    dueDays: dueDays ? Number(dueDays) : null,
  });

  const resetForm = () => {
    setTitle('');
    setClientName('');
    setClientId('');
    setClientAddress('');
    setDueDays('');
    setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        ...getClient(),
        items,
        total,
      };
      await onSave(data);
      setSaved(true);
      setTimeout(() => {
        resetForm();
        setSaved(false);
      }, 1500);
    } catch (err) {
      console.error('Error saving budget:', err);
    } finally {
      setSaving(false);
    }
  };

  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    if (generatingPdf) return;
    setGeneratingPdf(true);
    try {
      const data = {
        title: title.trim() || 'Presupuesto',
        ...getClient(),
        items,
        total,
        createdAt: new Date().toISOString(),
      };
      await generatePDFFromTemplate(data, profile);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-card-border bg-background/90 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
              Volver
            </button>
            <span className="font-brand text-sm font-bold text-primary tracking-wide leading-none">
              YUI ONE
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
        {/* ── Título ── */}
        <Input
          label="Título del presupuesto"
          placeholder="Ej: Reparación de cocina"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        {/* ── Datos del Cliente ── */}
        <Card title="Datos del Cliente">
          <div className="flex flex-col gap-3">
            {/* Select con buscador + botón nuevo cliente */}
            <ClientSelect
              clients={clients}
              selectedClient={selectedClient}
              onSelect={handleClientSelect}
              onNewClient={() => setNewClientModalOpen(true)}
            />

            {/* Campos del cliente (auto-completados al seleccionar) */}
            <Input
              label="Nombre"
              placeholder="Ej: Cliente S.A."
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="CUIT o DNI"
                placeholder="20-12345678-9 / 12345678"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
              />
              <Select
                label="Vencimiento"
                value={dueDays}
                onChange={(e) => setDueDays(e.target.value)}
              >
                {DUE_DAYS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </div>
            <Input
              label="Dirección"
              placeholder="Ej: Av. Siempre Viva 123"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </div>
        </Card>

        {/* ── Ítems ── */}
        <Card title="Ítems">
          <BudgetTable items={items} onChange={setItems} />
        </Card>

        {/* ── Acciones ── */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={handleDownloadPDF}
            disabled={generatingPdf}
            className="flex-1"
          >
            <FileDown size={16} />
            {generatingPdf ? 'Generando PDF…' : 'Descargar PDF'}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1"
          >
            <Save size={16} />
            {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar Presupuesto'}
          </Button>
        </div>
      </main>

      {/* ── Modal nuevo cliente ── */}
      <ClientFormModal
        open={newClientModalOpen}
        onClose={() => setNewClientModalOpen(false)}
        onSave={handleNewClientSave}
      />
    </div>
  );
}
