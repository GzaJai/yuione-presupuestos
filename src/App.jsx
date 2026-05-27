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
  const { budgets, loading: budgetsLoading, createBudget, updateBudget, deleteBudget, exportData, importData } = useBudgets();

  const [view, setView] = useState(VIEWS.LANDING);
  const [editBudget, setEditBudget] = useState(null);
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

  const handleBackToLanding = () => {
    setView(VIEWS.LANDING);
  };

  const handleBackToDashboard = () => {
    setEditBudget(null);
    setView(VIEWS.DASHBOARD);
  };

  const handleEditBudget = (budget) => {
    setEditBudget(budget);
    setView(VIEWS.GENERATOR);
  };

  const handleSaveBudget = useCallback(
    async (data) => {
      await createBudget(data);
    },
    [createBudget],
  );

  const handleUpdateBudget = useCallback(
    async (id, data) => {
      await updateBudget(id, data);
      setEditBudget(null);
    },
    [updateBudget],
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
      <div className="min-h-dvh flex items-center justify-center bg-background transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <p className="font-brand text-lg font-bold text-primary tracking-wide">YUI ONE</p>
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-text-secondary">Cargando…</p>
        </div>
      </div>
    );
  }

  // ── Routing ──
  switch (view) {
    case VIEWS.LANDING:
      return <LandingPage onStart={handleStart} />;

    case VIEWS.ONBOARDING:
      return <Onboarding onBack={handleBackToLanding} onComplete={handleOnboardingComplete} saveProfile={saveProfile} />;

    case VIEWS.DASHBOARD:
      return (
        <>
          {importError && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-xs px-4 py-2 rounded-lg shadow-lg animate-fade-in transition-colors duration-200">
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
            onEditBudget={handleEditBudget}
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
              <div className="absolute inset-0 bg-overlay backdrop-blur-sm transition-colors duration-300" />
              <div
                className="relative z-10 w-full max-w-sm rounded-xl border border-card-border bg-card p-6 shadow-2xl animate-fade-in-up transition-colors duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                    Editar Perfil
                  </h3>
                  <button
                    onClick={() => setProfileModalOpen(false)}
                    className="text-xs text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
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
          editBudget={editBudget}
          onBack={handleBackToDashboard}
          onSave={handleSaveBudget}
          onUpdate={handleUpdateBudget}
        />
      );

    default:
      return <LandingPage onStart={handleStart} />;
  }
}
