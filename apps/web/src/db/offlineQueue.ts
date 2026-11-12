import Dexie, { type Table } from 'dexie';

export interface OfflineStockTx {
  id: string;
  commodity_id: string;
  commodity_nama: string;
  satuan: string;
  warehouse_id: string;
  jenis: string;
  jumlah: number;
  tanggal: string;
  catatan: string;
  client_created_at: string;
  synced: number; // 0 = waiting, 1 = synced
}

export interface CachedEndpoint {
  key: string;
  data: any;
  updated_at: string;
}

class SiapansaOfflineDB extends Dexie {
  txQueue!: Table<OfflineStockTx, string>;
  apiCache!: Table<CachedEndpoint, string>;

  constructor() {
    super('SiapansaOfflineDB');
    this.version(1).stores({
      txQueue: 'id, synced, client_created_at',
      apiCache: 'key, updated_at',
    });
  }
}

export const offlineDB = new SiapansaOfflineDB();

export function generateClientUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function enqueueOfflineTransaction(tx: Omit<OfflineStockTx, 'synced'>): Promise<OfflineStockTx> {
  const item: OfflineStockTx = { ...tx, synced: 0 };
  await offlineDB.txQueue.put(item);
  return item;
}

export async function getPendingTransactions(): Promise<OfflineStockTx[]> {
  return offlineDB.txQueue.where('synced').equals(0).sortBy('client_created_at');
}

export async function markTransactionsSynced(ids: string[]): Promise<void> {
  await offlineDB.txQueue.bulkDelete(ids);
}

export async function saveCacheSnapshot(key: string, data: any): Promise<void> {
  await offlineDB.apiCache.put({
    key,
    data,
    updated_at: new Date().toISOString(),
  });
}

export async function loadCacheSnapshot(key: string): Promise<CachedEndpoint | undefined> {
  return offlineDB.apiCache.get(key);
}
