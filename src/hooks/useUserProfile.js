import { useState, useEffect, useCallback } from 'react';
import db from '../db/db';

/**
 * Hook para manejar el perfil del usuario (emisor).
 *
 * Expone: profile, loading, saveProfile, updateProfile
 */
export function useUserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carga el perfil desde IndexedDB al montar
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stored = await db.userProfile.toArray();
        if (!cancelled) {
          setProfile(stored[0] ?? null);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Crea un nuevo perfil.
   * @param {{ name: string, businessName?: string, cuit?: string, address?: string }} data
   */
  const saveProfile = useCallback(async (data) => {
    const entry = {
      ...data,
      createdAt: new Date().toISOString(),
    };
    const id = await db.userProfile.add(entry);
    setProfile({ ...entry, id });
    return id;
  }, []);

  /**
   * Actualiza el perfil existente.
   * @param {{ name?: string, businessName?: string, cuit?: string, address?: string }} data
   */
  const updateProfile = useCallback(
    async (data) => {
      if (!profile?.id) return;
      const updated = { ...profile, ...data };
      await db.userProfile.put(updated);
      setProfile(updated);
    },
    [profile],
  );

  return { profile, loading, saveProfile, updateProfile };
}
