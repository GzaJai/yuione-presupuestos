import { useState, useRef } from 'react';
import { Plus, Download, Upload, UserRound, LogOut } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ThemeToggle from '../components/ui/ThemeToggle';
import BudgetHistory from '../components/features/BudgetHistory';
import BudgetDetailModal from '../components/features/BudgetDetailModal';

/**
 * Pantalla principal después del onboarding.
 *
 * @param {{
 *   profile: object,
 *   budgets: Array,
 *   onNewBudget: () => void,
 *   onEditBudget: (budget: object) => void,
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
  onEditBudget,
  onDeleteBudget,
  onExport,
  onImport,
  onEditProfile,
  onReset,
}) {
  const fileInputRef = useRef(null);
  const [selectedBudget, setSelectedBudget] = useState(null);

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

  const handleSelectBudget = (budget) => {
    setSelectedBudget(budget);
  };

  const handleCloseDetail = () => {
    setSelectedBudget(null);
  };

  return (
    <div className="min-h-dvh flex flex-col bg-background transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-card-border bg-background/90 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <div>
            <h1 className="font-brand text-base font-bold text-primary tracking-wide leading-none">
              YUI ONE
            </h1>
            <p className="text-[11px] text-text-primary font-medium mt-0.5">
              {profile?.businessName || profile?.name || 'Usuario'}
            </p>
            <p className="text-[10px] text-text-secondary">
              {budgets.length} presupuesto{budgets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <button
              onClick={onEditProfile}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Editar perfil"
              title="Editar perfil"
            >
              <UserRound size={16} />
            </button>
            <button
              onClick={onReset}
              className="p-2 text-text-secondary hover:text-primary transition-colors cursor-pointer"
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
            onSelect={handleSelectBudget}
          />
        </Card>
      </main>

      {/* ── Modal de detalle del presupuesto ── */}
      <BudgetDetailModal
        budget={selectedBudget}
        profile={profile}
        open={!!selectedBudget}
        onClose={handleCloseDetail}
        onEdit={onEditBudget}
      />
    </div>
  );
}
