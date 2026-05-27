import { useState, useEffect, useCallback } from 'react';
import db from '../db/db';

/**
 * Hook para CRUD de clientes.
 *
 * Expone: clients, loading, createClient, updateClient, deleteClient
 */
export function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const all = await db.clients
          .orderBy('name')
          .toArray();
        if (!cancelled) setClients(all);
      } catch (err) {
        console.error('Error loading clients:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Crea un nuevo cliente.
   * @param {{ name: string, cuitDni?: string, address?: string, dueDays?: number|null }} data
   * @returns {Promise<object>} cliente creado (con id)
   */
  const createClient = useCallback(async (data) => {
    const entry = {
      ...data,
      name: data.name.trim(),
      dueDays: data.dueDays ? Number(data.dueDays) : null,
      createdAt: new Date().toISOString(),
    };
    const id = await db.clients.add(entry);
    const created = { ...entry, id };
    setClients((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  }, []);

  /**
   * Actualiza un cliente existente.
   * @param {number} id
   * @param {{ name?: string, cuitDni?: string, address?: string, dueDays?: number|null }} data
   */
  const updateClient = useCallback(async (id, data) => {
    const updated = { ...data, id };
    await db.clients.put(updated);
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c)),
    );
  }, []);

  /**
   * Elimina un cliente por ID.
   * @param {number} id
   */
  const deleteClient = useCallback(async (id) => {
    await db.clients.delete(id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { clients, loading, createClient, updateClient, deleteClient };
}
