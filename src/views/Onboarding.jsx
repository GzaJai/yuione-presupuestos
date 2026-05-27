import { useState } from 'react';
import { UserRound } from 'lucide-react';
import ProfileForm from '../components/features/ProfileForm';

/**
 * Pantalla de configuración inicial del perfil.
 * Se muestra solo si el userProfile no existe en DB.
 *
 * @param {{ onComplete: () => void, saveProfile: (data: object) => Promise<void> }} props
 */
export default function Onboarding({ onComplete, saveProfile }) {
  const [saving, setSaving] = useState(false);

  const handleSave = async (data) => {
    setSaving(true);
    try {
      await saveProfile(data);
      onComplete();
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12 bg-background transition-colors duration-300">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Marca */}
        <p className="font-brand text-sm font-bold text-primary tracking-wide text-center mb-6">
          YUI ONE
        </p>

        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-accent-bg p-4">
            <UserRound size={32} className="text-accent-icon" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center text-text-primary mb-1">
          Contanos quién sos
        </h1>
        <p className="text-sm text-text-secondary text-center mb-8">
          Estos datos aparecerán en tus presupuestos. Solo se guardan en tu dispositivo.
        </p>

        {/* Formulario */}
        <div className="rounded-xl border border-card-border bg-card p-5 transition-colors duration-200">
          <ProfileForm onSave={handleSave} saving={saving} />
        </div>
      </div>
    </div>
  );
}
