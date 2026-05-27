import { useRef } from 'react';
import { Plus, Download, Upload, UserRound, LogOut } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import BudgetHistory from '../components/features/BudgetHistory';

/**
 * Pantalla principal después del onboarding.
 *
 * @param {{
 *   profile: object,
 *   budgets: Array,
 *   onNewBudget: () => void,
 *   onDeleteBudget: (id: number) => void,
 *   onExport: () => void,
 *   onImport: (file: File) => void,
 *   onEditProfile: () => void,
 *   onReset: () => void,
 * }} props
 */
export default function Dashboard({
  profile,
  budgets,
  onNewBudget,
  onDeleteBudget,
  onExport,
  onImport,
  onEditProfile,
  onReset,
}) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div>
            <h1 className="text-sm font-bold text-zinc-100">
              {profile?.businessName || profile?.name || 'Usuario'}
            </h1>
            <p className="text-[10px] text-zinc-500">
              {budgets.length} presupuesto{budgets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onEditProfile}
              className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              aria-label="Editar perfil"
              title="Editar perfil"
            >
              <UserRound size={16} />
            </button>
            <button
              onClick={onReset}
              className="p-2 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
              aria-label="Reiniciar"
              title="Reiniciar datos"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
        {/* ── Acciones rápidas ── */}
        <section className="grid grid-cols-3 gap-2 sm:gap-3">
          <Button onClick={onNewBudget} className="flex-col py-4 sm:py-5 h-auto gap-2 text-xs">
            <Plus size={20} />
            <span className="text-[11px] font-medium">Nuevo</span>
          </Button>
          <Button variant="secondary" onClick={onExport} className="flex-col py-4 sm:py-5 h-auto gap-2 text-xs">
            <Download size={20} />
            <span className="text-[11px] font-medium">Exportar</span>
          </Button>
          <Button variant="secondary" onClick={handleImportClick} className="flex-col py-4 sm:py-5 h-auto gap-2 text-xs">
            <Upload size={20} />
            <span className="text-[11px] font-medium">Importar</span>
          </Button>
        </section>

        {/* Input oculto para importar */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* ── Historial ── */}
        <Card title="Historial de presupuestos">
          <BudgetHistory
            budgets={budgets}
            profile={profile}
            onDelete={onDeleteBudget}
          />
        </Card>
      </main>
    </div>
  );
}
