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
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Icono */}
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-emerald-500/10 p-4">
            <UserRound size={32} className="text-emerald-400" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center text-zinc-100 mb-1">
          Contanos quién sos
        </h1>
        <p className="text-sm text-zinc-500 text-center mb-8">
          Estos datos aparecerán en tus presupuestos. Solo se guardan en tu dispositivo.
        </p>

        {/* Formulario */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
          <ProfileForm onSave={handleSave} saving={saving} />
        </div>
      </div>
    </div>
  );
}
