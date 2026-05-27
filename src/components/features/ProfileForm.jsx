import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

/**
 * Formulario de perfil del emisor.
 * Usado tanto en onboarding como en edición.
 *
 * @param {{ initial?: object, onSave: (data: object) => Promise<void>, saving?: boolean }} props
 */
export default function ProfileForm({ initial = {}, onSave, saving }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    businessName: initial.businessName || '',
    cuit: initial.cuit || '',
    address: initial.address || '',
  });
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
    await onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Nombre o Razón Social"
        required
        placeholder="Ej: Juan Pérez"
        value={form.name}
        onChange={handleChange('name')}
        error={errors.name}
      />

      <Input
        label="Nombre del Negocio (opcional)"
        placeholder="Ej: Servicios Técnicos JP"
        value={form.businessName}
        onChange={handleChange('businessName')}
      />

      <Input
        label="CUIT (opcional)"
        placeholder="20-12345678-9"
        value={form.cuit}
        onChange={handleChange('cuit')}
      />

      <Input
        label="Dirección (opcional)"
        placeholder="Ej: Av. Siempre Viva 123"
        value={form.address}
        onChange={handleChange('address')}
      />

      <Button type="submit" size="lg" disabled={saving} className="mt-2">
        {saving ? 'Guardando…' : 'Guardar'}
      </Button>
    </form>
  );
}
