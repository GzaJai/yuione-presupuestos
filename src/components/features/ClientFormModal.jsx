import { useState } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';

const DUE_DAYS_OPTIONS = [
  { value: '', label: '— Sin vencimiento —' },
  { value: 1, label: '1 día' },
  { value: 5, label: '5 días' },
  { value: 10, label: '10 días' },
  { value: 15, label: '15 días' },
  { value: 20, label: '20 días' },
];

/**
 * Modal para crear un nuevo cliente.
 * Al guardar exitosamente ejecuta onSave y cierra.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   onSave: (data: object) => Promise<object>,
 * }} props
 */
export default function ClientFormModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: '',
    cuitDni: '',
    address: '',
    dueDays: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'El nombre es obligatorio';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSave({
        name: form.name.trim(),
        cuitDni: form.cuitDni.trim(),
        address: form.address.trim(),
        dueDays: form.dueDays || null,
      });
      setForm({ name: '', cuitDni: '', address: '', dueDays: '' });
      onClose();
    } catch (err) {
      console.error('Error creating client:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setForm({ name: '', cuitDni: '', address: '', dueDays: '' });
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Nuevo Cliente">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Nombre"
          required
          placeholder="Ej: Cliente S.A."
          value={form.name}
          onChange={handleChange('name')}
          error={errors.name}
        />

        <Input
          label="CUIT o DNI"
          placeholder="20-12345678-9 / 12345678"
          value={form.cuitDni}
          onChange={handleChange('cuitDni')}
        />

        <Input
          label="Dirección"
          placeholder="Ej: Av. Siempre Viva 123"
          value={form.address}
          onChange={handleChange('address')}
        />

        <Select
          label="Vencimiento"
          value={form.dueDays}
          onChange={handleChange('dueDays')}
        >
          {DUE_DAYS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>

        <div className="flex gap-2 justify-end mt-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
