import { useState, useEffect, useCallback } from 'react';
import db from '../db/db';

/**
 * Hook para el CRUD de presupuestos + importación/exportación.
 *
 * Expone: budgets, loading, createBudget, deleteBudget, exportData, importData
 */
export function useBudgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga todos los presupuestos ordenados por fecha descendente
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const all = await db.budgets
          .orderBy('createdAt')
          .reverse()
          .toArray();
        if (!cancelled) setBudgets(all);
      } catch (err) {
        console.error('Error loading budgets:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Crea un nuevo presupuesto.
   * @param {{ title: string, items: { description: string, quantity: number, unitPrice: number }[], total: number }} data
   * @returns {Promise<number>} id del nuevo registro
   */
  const createBudget = useCallback(async (data) => {
    const now = new Date().toISOString();
    const code = String(Date.now()).slice(-6);
    const entry = {
      ...data,
      code,
      createdAt: now,
      updatedAt: now,
    };
    const id = await db.budgets.add(entry);
    setBudgets((prev) => [{ ...entry, id }, ...prev]);
    return id;
  }, []);

  /**
   * Elimina un presupuesto por ID.
   * @param {number} id
   */
  const deleteBudget = useCallback(async (id) => {
    await db.budgets.delete(id);
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  /**
   * Exporta TODA la base de datos a un archivo JSON descargable.
   */
  const exportData = useCallback(async () => {
    const allProfiles = await db.userProfile.toArray();
    const allBudgets = await db.budgets.toArray();
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      userProfile: allProfiles,
      budgets: allBudgets,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `presupuestos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  /**
   * Importa datos desde un archivo JSON validado.
   * @param {File} file
   * @returns {Promise<{ success: boolean, count: number }>}
   */
  const importData = useCallback(async (file) => {
    const text = await file.text();
    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('El archivo no contiene JSON válido.');
    }

    // Validación de estructura
    if (!parsed.version || !Array.isArray(parsed.budgets)) {
      throw new Error(
        'Estructura inválida. El archivo debe ser un backup exportado desde esta app.',
      );
    }

    let importedCount = 0;

    // Importar perfiles (evita duplicados: reemplaza)
    if (Array.isArray(parsed.userProfile) && parsed.userProfile.length > 0) {
      for (const p of parsed.userProfile) {
        await db.userProfile.put(p);
      }
    }

    // Importar presupuestos (omite duplicados por ID)
    if (Array.isArray(parsed.budgets)) {
      for (const b of parsed.budgets) {
        const exists = b.id ? await db.budgets.get(b.id) : null;
        if (!exists) {
          await db.budgets.add(b);
          importedCount++;
        }
      }
    }

    // Recargar la lista local
    const all = await db.budgets.orderBy('createdAt').reverse().toArray();
    setBudgets(all);

    return { success: true, count: importedCount };
  }, []);

  return { budgets, loading, createBudget, deleteBudget, exportData, importData };
}
