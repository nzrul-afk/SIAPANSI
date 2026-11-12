import React, { useState } from 'react';
import { Minus, Plus, RotateCcw, Scale, X, AlertTriangle } from 'lucide-react';
import { formatAngka } from '../lib/format';
import { apiRequest, submitStockTransactionSmart } from '../lib/api';

const JENIS_MASUK = [
  { value: 'masuk_panen', label: 'Panen Lokal Desa' },
  { value: 'masuk_beli', label: 'Pembelian Lumbung / Pedagang' },
  { value: 'masuk_bantuan', label: 'Bantuan Pemerintah / Pihak Luar' },
  { value: 'masuk_transfer', label: 'Transfer Antar Desa' },
];

const JENIS_KELUAR = [
  { value: 'keluar_salur', label: 'Penyaluran / Konsumsi Warga' },
  { value: 'keluar_pmt', label: 'Pemberian Makanan Tambahan (PMT)' },
  { value: 'keluar_susut', label: 'Susut / Rusak' },
  { value: 'keluar_transfer', label: 'Transfer Bantuan ke Desa Lain' },
];

export const StockTransactionSheet: React.FC<{
  open: boolean;
  onClose: () => void;
  commodities: Array<any>;
  warehouses: Array<any>;
  defaultCommodityId?: string;
  asOfDate: string;
  onSuccess: (undoInfo: { txId: string; commodityId: string; jumlah: number; arah: 'masuk' | 'keluar'; nama: string } | null) => void;
}> = ({ open, onClose, commodities, warehouses, defaultCommodityId, asOfDate, onSuccess }) => {
  const [arah, setArah] = useState<'masuk' | 'keluar'>('masuk');
  const [jenis, setJenis] = useState<string>('masuk_panen');
  const [commodityId, setCommodityId] = useState<string>(defaultCommodityId || commodities[0]?.id || 'c-beras');
  const [warehouseId, setWarehouseId] = useState<string>(warehouses[0]?.id || 'wh-lumbung');
  const [jumlah, setJumlah] = useState<string>('100');
  const [tanggal, setTanggal] = useState<string>(asOfDate || '2026-11-12');
  const [catatan, setCatatan] = useState<string>('');
  const [confirmLarge, setConfirmLarge] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!open) return null;

  const selectedComm = commodities.find((c) => c.id === commodityId) || commodities[0];
  const avgTx = Math.max(20, Number(selectedComm?.kebutuhan_harian || 50) * 1.5);
  const numVal = parseFloat(jumlah) || 0;
  const isOver5x = numVal > avgTx * 5;

  const handleArahChange = (newArah: 'masuk' | 'keluar') => {
    setArah(newArah);
    setJenis(newArah === 'masuk' ? 'masuk_panen' : 'keluar_salur');
    setError('');
  };

  const adjustStep = (delta: number) => {
    const next = Math.max(1, (parseFloat(jumlah) || 0) + delta);
    setJumlah(String(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (numVal <= 0) {
      setError('Jumlah harus lebih dari 0.');
      return;
    }

    if (arah === 'keluar' && selectedComm && numVal > Number(selectedComm.stok_efektif)) {
      setError(
        `Stok ${selectedComm.nama} tidak mencukupi (tersedia ${formatAngka(selectedComm.stok_efektif, 1)} ${selectedComm.satuan}). Stok tidak boleh negatif.`
      );
      return;
    }

    if (isOver5x && !confirmLarge) {
      setConfirmLarge(true);
      return;
    }

    setLoading(true);
    try {
      const res = await submitStockTransactionSmart({
        commodity_id: selectedComm.id,
        commodity_nama: selectedComm.nama,
        satuan: selectedComm.satuan,
        warehouse_id: warehouseId,
        jenis,
        jumlah: numVal,
        tanggal,
        catatan,
      });

      onSuccess({
        txId: res.txId,
        commodityId: selectedComm.id,
        jumlah: numVal,
        arah,
        nama: selectedComm.nama,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Gagal mencatat transaksi stok.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Catat Transaksi Stok Pangan"
    >
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl border border-stone-200 max-h-[92vh] overflow-y-auto p-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Catat Stok Pangan</h3>
            <p className="text-xs text-stone-600">Tersimpan langsung ke buku stok & antrean sinkron offline</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 min-w-[48px] min-h-[48px] flex items-center justify-center"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* 1. Pilih Masuk / Keluar */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleArahChange('masuk')}
              className={`min-h-[48px] rounded-xl font-bold text-sm border transition ${
                arah === 'masuk'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              + Stok Masuk
            </button>
            <button
              type="button"
              onClick={() => handleArahChange('keluar')}
              className={`min-h-[48px] rounded-xl font-bold text-sm border transition ${
                arah === 'keluar'
                  ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              − Stok Keluar
            </button>
          </div>

          {/* 2. Pilih Jenis Transaksi */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Jenis Catatan</label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-xl border border-stone-300 bg-white text-base font-medium"
            >
              {(arah === 'masuk' ? JENIS_MASUK : JENIS_KELUAR).map((j) => (
                <option key={j.value} value={j.value}>
                  {j.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Pilih Komoditas */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Komoditas Pangan</label>
            <select
              value={commodityId}
              onChange={(e) => {
                setCommodityId(e.target.value);
                setConfirmLarge(false);
              }}
              className="w-full min-h-[48px] px-3 rounded-xl border border-stone-300 bg-white text-base font-medium"
            >
              {commodities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama} (Stok: {formatAngka(c.stok_efektif, 0)} {c.satuan} · {formatAngka(c.hari_bertahan, 1)} hari)
                </option>
              ))}
            </select>
          </div>

          {/* 4. Jumlah dengan Stepper Besar */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Jumlah ({selectedComm?.satuan || 'kg'})
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => adjustStep(-10)}
                className="min-w-[52px] min-h-[48px] rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold"
                aria-label="Kurangi 10"
              >
                <Minus className="w-5 h-5" />
              </button>
              <input
                type="number"
                step="any"
                min="0.1"
                value={jumlah}
                onChange={(e) => {
                  setJumlah(e.target.value);
                  setConfirmLarge(false);
                }}
                className="flex-1 min-h-[48px] px-4 rounded-xl border border-stone-300 text-center text-xl font-bold"
                required
              />
              <button
                type="button"
                onClick={() => adjustStep(10)}
                className="min-w-[52px] min-h-[48px] rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold"
                aria-label="Tambah 10"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="flex gap-2 mt-2">
              {[20, 50, 100, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setJumlah(String(preset))}
                  className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 bg-stone-50 hover:bg-stone-100"
                >
                  {preset} {selectedComm?.satuan}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Sumber / Lokasi Gudang & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Sumber / Lokasi Simpan</label>
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full min-h-[48px] px-3 rounded-xl border border-stone-300 bg-white text-sm font-medium"
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tanggal Catat</label>
              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full min-h-[48px] px-3 rounded-xl border border-stone-300 bg-white text-sm font-medium"
              />
            </div>
          </div>

          {/* 6. Catatan Opsional */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Catatan (Opsional)</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Panen kelompok tani RW 03"
              className="w-full min-h-[48px] px-3 rounded-xl border border-stone-300 text-sm"
            />
          </div>

          {confirmLarge && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Konfirmasi Jumlah Besar</p>
                <p>
                  Jumlah {formatAngka(numVal, 1)} {selectedComm?.satuan} melebihi 5 kali rata-rata transaksi harian. Ketuk tombol Simpan sekali lagi bila angka sudah benar.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-xs font-semibold text-red-900">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[52px] rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-base shadow-md transition disabled:opacity-50"
          >
            {loading
              ? 'Menyimpan...'
              : confirmLarge
              ? 'Ya, Konfirmasi & Simpan Transaksi'
              : 'Simpan Catatan Stok'}
          </button>
        </form>
      </div>
    </div>
  );
};

/**
 * 8.F3 Stock Opname Modal (membuat transaksi Penyesuaian otomatis)
 */
export const StockOpnameModal: React.FC<{
  open: boolean;
  onClose: () => void;
  commodity: any;
  onSuccess: () => void;
}> = ({ open, onClose, commodity, onSuccess }) => {
  const [fisik, setFisik] = useState<string>(String(commodity?.stok_efektif || 0));
  const [catatan, setCatatan] = useState<string>('Pemeriksaan fisik rutin lumbung desa');
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string>('');

  if (!open || !commodity) return null;

  const selisih = (parseFloat(fisik) || 0) - Number(commodity.stok_efektif || 0);

  const handleOpname = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      await apiRequest(`/stock/${commodity.id}/opname`, {
        method: 'POST',
        body: JSON.stringify({
          jumlah_fisik: parseFloat(fisik) || 0,
          warehouse_id: 'wh-lumbung',
          catatan,
        }),
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      setErr(error?.message || 'Gagal menyimpan hasil periksa fisik.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-brand-700" />
            Stock Opname (Periksa Fisik): {commodity.nama}
          </h3>
          <button type="button" onClick={onClose} className="p-2 text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleOpname} className="space-y-4 mt-4">
          <div className="p-3 rounded-xl bg-stone-100 text-xs flex justify-between">
            <span>Stok Tercatat di Sistem:</span>
            <span className="font-bold">
              {formatAngka(commodity.stok_efektif, 1)} {commodity.satuan}
            </span>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Jumlah Fisik Aktual di Gudang ({commodity.satuan})
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={fisik}
              onChange={(e) => setFisik(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-xl border border-stone-300 text-lg font-bold"
              required
            />
          </div>
          <div className="p-3 rounded-xl border border-stone-200 text-xs flex justify-between">
            <span>Selisih Penyesuaian Otomatis:</span>
            <span className={`font-bold ${selisih >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {selisih >= 0 ? '+' : ''}
              {formatAngka(selisih, 1)} {commodity.satuan}
            </span>
          </div>
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Catatan Pemeriksaan</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full min-h-[44px] px-3 rounded-xl border border-stone-300 text-sm"
            />
          </div>
          {err && <p className="text-xs text-red-700 font-semibold">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] rounded-xl bg-brand-700 text-white font-bold text-sm"
          >
            {loading ? 'Menyimpan...' : 'Simpan Transaksi Penyesuaian'}
          </button>
        </form>
      </div>
    </div>
  );
};
