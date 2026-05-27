import Dexie from 'dexie';

/**
 * Base de datos local — IndexedDB vía Dexie.
 *
 * Tablas:
 *   userProfile → { id, name, businessName, cuit, address, createdAt }
 *   budgets     → { id, title, items[], total, clientName, clientId,
 *                   clientAddress, dueDays, createdAt, updatedAt }
 *   clients     → { id, name, cuitDni, address, dueDays, createdAt }
 *
 * items[] = { description: string, quantity: number, unitPrice: number }
 */
const db = new Dexie('PresupuestosDB');

db.version(1).stores({
  userProfile: '++id',
  budgets: '++id, createdAt',
});

db.version(2).stores({
  userProfile: '++id',
  budgets: '++id, createdAt',
  clients: '++id, name',
});

export default db;
