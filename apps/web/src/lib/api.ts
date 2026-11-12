import {
  enqueueOfflineTransaction,
  generateClientUUID,
  getPendingTransactions,
  loadCacheSnapshot,
  markTransactionsSynced,
  saveCacheSnapshot,
  type OfflineStockTx,
} from '../db/offlineQueue';

const API_BASE = import.meta.env.VITE_API_BASE || '/api/v1';

// Simulated offline toggle for Demo Mode / Airplane Mode testing
let simulatedOffline = false;
const listeners = new Set<() => void>();

export function isOfflineNow(): boolean {
  return simulatedOffline || (typeof navigator !== 'undefined' && !navigator.onLine);
}

export function setSimulatedOffline(val: boolean): void {
  simulatedOffline = val;
  listeners.forEach((fn) => fn());
  if (!val) {
    void syncOfflineQueueNow();
  }
}

export function subscribeNetworkChange(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    listeners.forEach((fn) => fn());
    void syncOfflineQueueNow();
  });
  window.addEventListener('offline', () => {
    listeners.forEach((fn) => fn());
  });
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {},
  cacheKey?: string
): Promise<{ data: T; fromCache: boolean; updatedAt?: string }> {
  const method = (options.method || 'GET').toUpperCase();
  const key = cacheKey || `${method}:${path}`;

  if (isOfflineNow()) {
    if (method === 'GET') {
      const snap = await loadCacheSnapshot(key);
      if (snap) {
        return { data: snap.data as T, fromCache: true, updatedAt: snap.updated_at };
      }
    }
    throw new Error('Kamu sedang offline. Periksa koneksi internet atau matikan Mode Pesawat.');
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json?.pesan || json?.detail || `Galat jaringan (${res.status})`);
    }
    if (method === 'GET') {
      await saveCacheSnapshot(key, json);
    }
    return { data: json as T, fromCache: false, updatedAt: new Date().toISOString() };
  } catch (err: any) {
    if (method === 'GET') {
      const snap = await loadCacheSnapshot(key);
      if (snap) {
        return { data: snap.data as T, fromCache: true, updatedAt: snap.updated_at };
      }
    }
    throw err;
  }
}

export async function submitStockTransactionSmart(txInput: {
  id?: string;
  commodity_id: string;
  commodity_nama: string;
  satuan: string;
  warehouse_id: string;
  jenis: string;
  jumlah: number;
  tanggal: string;
  catatan: string;
}): Promise<{ offlineQueued: boolean; txId: string; response?: any }> {
  const txId = txInput.id || generateClientUUID();
  const nowIso = new Date().toISOString();

  if (isOfflineNow()) {
    await enqueueOfflineTransaction({
      id: txId,
      commodity_id: txInput.commodity_id,
      commodity_nama: txInput.commodity_nama,
      satuan: txInput.satuan,
      warehouse_id: txInput.warehouse_id,
      jenis: txInput.jenis,
      jumlah: txInput.jumlah,
      tanggal: txInput.tanggal,
      catatan: txInput.catatan,
      client_created_at: nowIso,
    });
    return { offlineQueued: true, txId };
  }

  try {
    const { data } = await apiRequest('/stock/transactions', {
      method: 'POST',
      body: JSON.stringify({
        id: txId,
        commodity_id: txInput.commodity_id,
        warehouse_id: txInput.warehouse_id,
        jenis: txInput.jenis,
        jumlah: txInput.jumlah,
        tanggal: txInput.tanggal,
        catatan: txInput.catatan,
        client_created_at: nowIso,
      }),
    });
    return { offlineQueued: false, txId, response: data };
  } catch (err: any) {
    // Only queue if network failed (not if server rejected due to negative stock)
    if (String(err?.message || '').toLowerCase().includes('negatif') || String(err?.message || '').toLowerCase().includes('mencukupi')) {
      throw err;
    }
    await enqueueOfflineTransaction({
      id: txId,
      commodity_id: txInput.commodity_id,
      commodity_nama: txInput.commodity_nama,
      satuan: txInput.satuan,
      warehouse_id: txInput.warehouse_id,
      jenis: txInput.jenis,
      jumlah: txInput.jumlah,
      tanggal: txInput.tanggal,
      catatan: txInput.catatan,
      client_created_at: nowIso,
    });
    return { offlineQueued: true, txId };
  }
}

export async function syncOfflineQueueNow(): Promise<{ syncedCount: number; remaining: number }> {
  if (isOfflineNow()) {
    const pending = await getPendingTransactions();
    return { syncedCount: 0, remaining: pending.length };
  }
  const pending: OfflineStockTx[] = await getPendingTransactions();
  if (pending.length === 0) {
    return { syncedCount: 0, remaining: 0 };
  }

  try {
    await apiRequest('/stock/transactions', {
      method: 'POST',
      body: JSON.stringify({
        transactions: pending.map((p) => ({
          id: p.id,
          commodity_id: p.commodity_id,
          warehouse_id: p.warehouse_id,
          jenis: p.jenis,
          jumlah: p.jumlah,
          tanggal: p.tanggal,
          catatan: p.catatan,
          client_created_at: p.client_created_at,
        })),
      }),
    });
    await markTransactionsSynced(pending.map((p) => p.id));
    listeners.forEach((fn) => fn());
    return { syncedCount: pending.length, remaining: 0 };
  } catch {
    return { syncedCount: 0, remaining: pending.length };
  }
}
