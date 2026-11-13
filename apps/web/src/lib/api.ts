import {
  enqueueOfflineTransaction,
  generateClientUUID,
  getPendingTransactions,
  loadCacheSnapshot,
  markTransactionsSynced,
  saveCacheSnapshot,
  type OfflineStockTx,
} from '../db/offlineQueue';
import { handleClientMockRoute } from './mockEngine';

const envBase = import.meta.env.VITE_API_BASE;
export const DEFAULT_API_BASE = '/api/v1';

export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('siapansa_api_base');
    if (custom) return custom.replace(/\/+$/, '');
    if (envBase) return envBase.replace(/\/+$/, '');
    return '/api/v1';
  }
  return envBase || '/api/v1';
}

export function setCustomApiBase(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url) {
      localStorage.removeItem('siapansa_api_base');
    } else {
      localStorage.setItem('siapansa_api_base', url.trim());
    }
  }
}

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

const FALLBACK_OVERVIEW: any = {
  as_of: '2026-11-12',
  jam_virtual: '2026-11-12T08:00:00',
  label_data: 'Data simulasi untuk prototipe',
  target_hari: 30,
  kalimat_ringkasan: 'Jika pasokan dari luar berhenti, pangan pokok desa bertahan 32,8 hari. Titik terlemah: Kedelai (14,5 hari).',
  pool_pokok: { hari_bertahan: 32.8, status: 'Aman', level: 'aman', bawah_72_jam: false, progress_target_pct: 100.0 },
  pool_protein: { hari_bertahan: 15.3, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 51.0 },
  pool_pelengkap: { hari_bertahan: 20.4, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 68.0 },
  titik_terlemah: { commodity_id: 'c-kedelai', kode: 'kedelai', nama: 'Kedelai', hari_bertahan: 14.5, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 48.3 },
  skor_ketahanan: { skor_total: 77.8, ketersediaan: 66.4, akses: 94.3, pemanfaatan: 76.3, indeks_harga: 8.1, skor_eksposur_global: 3.4 },
  komoditas: [
    { id: 'c-beras', kode: 'beras', nama: 'Beras', satuan: 'kg', kelompok: 'pokok', kebutuhan_harian: 450.0, stok_efektif: 17100.0, hari_bertahan: 38.0, status: 'Aman', level: 'aman', bawah_72_jam: false, progress_target_pct: 100.0, harga_sekarang: 14500, perubahan_harga_7d_pct: 0.8 },
    { id: 'c-jagung', kode: 'jagung', nama: 'Jagung pipil kering', satuan: 'kg', kelompok: 'pokok', kebutuhan_harian: 90.0, stok_efektif: 2520.0, hari_bertahan: 28.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 93.3, harga_sekarang: 8200, perubahan_harga_7d_pct: 0.0 },
    { id: 'c-singkong', kode: 'singkong', nama: 'Singkong kering/gaplek', satuan: 'kg', kelompok: 'pokok', kebutuhan_harian: 90.0, stok_efektif: 1800.0, hari_bertahan: 20.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 66.7, harga_sekarang: 6000, perubahan_harga_7d_pct: 0.0 },
    { id: 'c-terigu', kode: 'terigu', nama: 'Terigu', satuan: 'kg', kelompok: 'pokok', kebutuhan_harian: 54.0, stok_efektif: 810.0, hari_bertahan: 15.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 50.0, harga_sekarang: 13000, perubahan_harga_7d_pct: 0.0 },
    { id: 'c-kedelai', kode: 'kedelai', nama: 'Kedelai', satuan: 'kg', kelompok: 'protein', kebutuhan_harian: 90.0, stok_efektif: 1305.0, hari_bertahan: 14.5, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 48.3, harga_sekarang: 12500, perubahan_harga_7d_pct: 0.0 },
    { id: 'c-telur', kode: 'telur', nama: 'Telur ayam ras', satuan: 'kg', kelompok: 'protein', kebutuhan_harian: 45.0, stok_efektif: 720.0, hari_bertahan: 16.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 53.3, harga_sekarang: 28000, perubahan_harga_7d_pct: 0.0 },
    { id: 'c-minyak', kode: 'minyak', nama: 'Minyak goreng curah', satuan: 'liter', kelompok: 'pelengkap', kebutuhan_harian: 36.0, stok_efektif: 1080.0, hari_bertahan: 30.0, status: 'Aman', level: 'aman', bawah_72_jam: false, progress_target_pct: 100.0, harga_sekarang: 16000, perubahan_harga_7d_pct: 0.0 },
    { id: 'c-gula', kode: 'gula', nama: 'Gula pasir', satuan: 'kg', kelompok: 'pelengkap', kebutuhan_harian: 36.0, stok_efektif: 900.0, hari_bertahan: 25.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 83.3, harga_sekarang: 17500, perubahan_harga_7d_pct: 0.0 },
    { id: 'c-bawang', kode: 'bawang_merah', nama: 'Bawang merah', satuan: 'kg', kelompok: 'pelengkap', kebutuhan_harian: 18.0, stok_efektif: 252.0, hari_bertahan: 14.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 46.7, harga_sekarang: 35000, perubahan_harga_7d_pct: 0.0 },
    { id: 'c-cabai', kode: 'cabai_rawit', nama: 'Cabai rawit merah', satuan: 'kg', kelompok: 'pelengkap', kebutuhan_harian: 9.0, stok_efektif: 144.0, hari_bertahan: 16.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 53.3, harga_sekarang: 45000, perubahan_harga_7d_pct: 0.0 },
  ],
  peringatan_teratas: [
    { id: 'alt-R1-c-kedelai', rule_code: 'R1', tingkat: 'Waspada', commodity_nama: 'Kedelai', judul: 'Cadangan Kedelai masuk status Waspada (14.5 hari)', penjelasan: 'Stok efektif Kedelai saat ini cukup untuk 14.5 hari (di bawah batas Aman 21 hari).', status: 'Baru' },
    { id: 'alt-R1-c-terigu', rule_code: 'R1', tingkat: 'Waspada', commodity_nama: 'Terigu', judul: 'Cadangan Terigu masuk status Waspada (15.0 hari)', penjelasan: 'Stok efektif Terigu saat ini cukup untuk 15.0 hari.', status: 'Baru' },
  ],
};

const FALLBACK_STOCK: any = {
  warehouses: [
    { id: 'w-lumbung-1', nama: 'Lumbung Pangan Desa', jenis: 'lumbung_desa', kapasitas_kg: 50000, terisi_kg: 24500 },
    { id: 'w-poktan-1', nama: 'Gudang Kelompok Tani', jenis: 'kelompok_tani', kapasitas_kg: 30000, terisi_kg: 12000 },
    { id: 'w-rt-est', nama: 'Cadangan Rumah Tangga', jenis: 'rumah_tangga', kapasitas_kg: 20000, terisi_kg: 8500 },
    { id: 'w-pedagang-1', nama: 'Kios & Pedagang Desa', jenis: 'pedagang', kapasitas_kg: 10000, terisi_kg: 3500 },
  ],
  commodities: FALLBACK_OVERVIEW.komoditas,
};

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {},
  cacheKey?: string
): Promise<{ data: T; fromCache: boolean; updatedAt?: string }> {
  const method = (options.method || 'GET').toUpperCase();
  const key = cacheKey || `${method}:${path}`;

  if (isOfflineNow()) {
    try {
      const mock = await handleClientMockRoute(path, options);
      return { data: mock as T, fromCache: true, updatedAt: new Date().toISOString() };
    } catch {
      // lanjut fallback
    }
  }

  try {
    const baseUrl = getApiBase();
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    const rawText = await res.text();
    const isHtml = rawText.trim().toLowerCase().startsWith('<!doctype') || rawText.trim().toLowerCase().startsWith('<html');

    // Jika server mengembalikan 404/500 atau HTML (efek rewrite SPA Vercel), alihkan otomatis ke mock engine
    if (!res.ok || isHtml) {
      console.warn(`[SIAPANSA] Backend (${res.status}, isHtml: ${isHtml}) untuk ${path}. Menjalankan simulasi lokal.`);
      const mock = await handleClientMockRoute(path, options);
      return { data: mock as T, fromCache: true, updatedAt: new Date().toISOString() };
    }

    let json: any = null;
    try {
      json = JSON.parse(rawText);
    } catch {
      const mock = await handleClientMockRoute(path, options);
      return { data: mock as T, fromCache: true, updatedAt: new Date().toISOString() };
    }

    if (method === 'GET') {
      await saveCacheSnapshot(key, json);
    }
    return { data: json as T, fromCache: false, updatedAt: new Date().toISOString() };
  } catch (err: any) {
    console.warn(`[SIAPANSA] Galat jaringan untuk ${path}. Menjalankan simulasi lokal.`);
    const mock = await handleClientMockRoute(path, options);
    return { data: mock as T, fromCache: true, updatedAt: new Date().toISOString() };
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
