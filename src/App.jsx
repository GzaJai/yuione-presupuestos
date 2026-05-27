import { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from './hooks/useUserProfile';
import { useBudgets } from './hooks/useBudgets';
import LandingPage from './views/LandingPage';
import Onboarding from './views/Onboarding';
import Dashboard from './views/Dashboard';
import BudgetGenerator from './views/BudgetGenerator';
import ProfileForm from './components/features/ProfileForm';
import db from './db/db';

/**
 * View = 'landing' | 'onboarding' | 'dashboard' | 'generator'
 */
const VIEWS = {
  LANDING: 'landing',
  ONBOARDING: 'onboarding',
  DASHBOARD: 'dashboard',
  GENERATOR: 'generator',
};

export default function App() {
  const { profile, loading: profileLoading, saveProfile, updateProfile } = useUserProfile();
  const { budgets, loading: budgetsLoading, createBudget, deleteBudget, exportData, importData } = useBudgets();

  const [view, setView] = useState(VIEWS.LANDING);
  const [importError, setImportError] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // ── Solicitar almacenamiento persistente al navegador ──
  useEffect(() => {
    if (navigator.storage?.persist) {
      navigator.storage.persist().then((granted) => {
        if (!granted) {
          console.warn('Almacenamiento persistente NO concedido');
        }
      });
    }
  }, []);

  // ── Determinar vista inicial cuando terminan de cargar los datos ──
  useEffect(() => {
    if (!profileLoading && !budgetsLoading) {
      if (profile) {
        setView(VIEWS.DASHBOARD);
      }
      // Si no hay perfil, se queda en LANDING (primer visita)
    }
  }, [profileLoading, budgetsLoading, profile]);

  // ── Handlers ──
  const handleStart = () => {
    if (profile) {
      setView(VIEWS.DASHBOARD);
    } else {
      setView(VIEWS.ONBOARDING);
    }
  };

  const handleOnboardingComplete = () => {
    setView(VIEWS.DASHBOARD);
  };

  const handleNewBudget = () => {
    setView(VIEWS.GENERATOR);
  };

  const handleBackToDashboard = () => {
    setView(VIEWS.DASHBOARD);
  };

  const handleSaveBudget = useCallback(
    async (data) => {
      await createBudget(data);
    },
    [createBudget],
  );

  const handleExport = useCallback(async () => {
    try {
      await exportData();
    } catch (err) {
      console.error('Export error:', err);
    }
  }, [exportData]);

  const handleImport = useCallback(
    async (file) => {
      setImportError('');
      try {
        await importData(file);
      } catch (err) {
        setImportError(err.message);
      }
    },
    [importData],
  );

  // ── Loading ──
  if (profileLoading || budgetsLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-500">Cargando…</p>
        </div>
      </div>
    );
  }

  // ── Routing ──
  switch (view) {
    case VIEWS.LANDING:
      return <LandingPage onStart={handleStart} />;

    case VIEWS.ONBOARDING:
      return <Onboarding onComplete={handleOnboardingComplete} saveProfile={saveProfile} />;

    case VIEWS.DASHBOARD:
      return (
        <>
          {importError && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600/90 text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-fade-in">
              {importError}
              <button
                onClick={() => setImportError('')}
                className="ml-3 text-white/70 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
          <Dashboard
            profile={profile}
            budgets={budgets}
            onNewBudget={handleNewBudget}
            onDeleteBudget={deleteBudget}
            onExport={handleExport}
            onImport={handleImport}
            onEditProfile={() => setProfileModalOpen(true)}
                onReset={() => {
              if (window.confirm('¿Reiniciar todos los datos? Esta acción no se puede deshacer.')) {
                Promise.all([
                  db.userProfile.clear(),
                  db.budgets.clear(),
                ]).then(() => window.location.reload());
              }
            }}
          />
          {/* Modal de edición de perfil */}
          {profileModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
              onClick={() => setProfileModalOpen(false)}
            >
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              <div
                className="relative z-10 w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl animate-fade-in-up"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-semibold text-zinc-200 uppercase tracking-wide mb-4">
                  Editar Perfil
                </h3>
                {/* Profile form en modo edición */}
                {profile && (
                  <ProfileForm
                    initial={profile}
                    onSave={async (data) => {
                      await updateProfile(data);
                      setProfileModalOpen(false);
                    }}
                  />
                )}
              </div>
            </div>
          )}
        </>
      );

    case VIEWS.GENERATOR:
      return (
        <BudgetGenerator
          profile={profile}
          onBack={handleBackToDashboard}
          onSave={handleSaveBudget}
        />
      );

    default:
      return <LandingPage onStart={handleStart} />;
  }
}
