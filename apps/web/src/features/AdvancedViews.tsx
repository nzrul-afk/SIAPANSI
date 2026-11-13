import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  Clock,
  FileText,
  Globe,
  Printer,
  RefreshCw,
  Send,
  Share2,
  Sliders,
  Sprout,
  Truck,
  Utensils,
  Zap,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatAngka, formatRupiah, formatTanggalIndo } from '../lib/format';
import {
  AccessibleLineChart,
  AIBadge,
  StatusBadge,
  VillageClusterMap,
} from '../components/common/Primitives';

/**
 * F7 & F8: Prediksi Panen (ML) & Harga dan Sinyal Global (ML)
 */
export const PredictAndGlobalView: React.FC<{
  commodities: Array<any>;
  onRefreshOverview: () => void;
  onNavigate: (tab: string) => void;
}> = ({ commodities, onRefreshOverview, onNavigate }) => {
  const [subTab, setSubTab] = useState<'panen' | 'harga'>('panen');
  const [harvestData, setHarvestData] = useState<any>(null);
  const [komoditasTanam, setKomoditasTanam] = useState('padi');
  const [luasHa, setLuasHa] = useState('2.5');
  const [varietas, setVarietas] = useState('Inpari 32');
  const [kondisiPupuk, setKondisiPupuk] = useState('cukup');
  const [sumberAir, setSumberAir] = useState('irigasi_teknis');
  const [customPred, setCustomPred] = useState<any>(null);

  const [selectedCommId, setSelectedCommId] = useState('c-terigu');
  const [priceData, setPriceData] = useState<any>(null);
  const [signalsData, setSignalsData] = useState<any>(null);
  const [eventsData, setEventsData] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);

  const loadHarvestPlans = async () => {
    try {
      const { data } = await apiRequest('/harvest-plans');
      setHarvestData(data);
    } catch {
      // handled by cache
    }
  };

  const loadPriceAndSignals = async (cid: string) => {
    try {
      const [pRes, sRes, eRes] = await Promise.all([
        apiRequest(`/prices/${cid}`),
        apiRequest('/global/signals'),
        apiRequest('/global/events'),
      ]);
      setPriceData(pRes.data);
      setSignalsData(sRes.data);
      setEventsData(eRes.data.peristiwa || []);
    } catch {
      // handled
    }
  };

  useEffect(() => {
    void loadHarvestPlans();
    void loadPriceAndSignals(selectedCommId);
  }, [selectedCommId]);

  const handleRunHarvestForecast = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const { data } = await apiRequest('/forecast/harvest', {
        method: 'POST',
        body: JSON.stringify({
          komoditas: komoditasTanam,
          luas_ha: parseFloat(luasHa) || 1.0,
          varietas,
          kondisi_pupuk: kondisiPupuk,
          sumber_air: sumberAir,
        }),
      });
      setCustomPred(data);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHarvestToProjection = async () => {
    setLoading(true);
    try {
      await apiRequest('/harvest-plans', {
        method: 'POST',
        body: JSON.stringify({
          komoditas: komoditasTanam,
          luas_ha: parseFloat(luasHa) || 1.0,
          varietas,
          kondisi_pupuk: kondisiPupuk,
          sumber_air: sumberAir,
          aktif_di_proyeksi: true,
        }),
      });
      await loadHarvestPlans();
      onRefreshOverview();
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlanActive = async (planId: string, curr: boolean) => {
    await apiRequest(`/harvest-plans/${planId}`, {
      method: 'PATCH',
      body: JSON.stringify({ aktif_di_proyeksi: !curr }),
    });
    await loadHarvestPlans();
    onRefreshOverview();
  };

  const handleTriggerEvent = async (eventId: string, aktif: boolean) => {
    await apiRequest('/demo/event', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, aktif }),
    });
    await loadPriceAndSignals(selectedCommId);
    onRefreshOverview();
  };

  return (
    <div className="space-y-5">
      {/* Sub-navigation tabs */}
      <div className="flex rounded-xl bg-stone-200/80 p-1">
        <button
          type="button"
          onClick={() => setSubTab('panen')}
          className={`flex-1 min-h-[44px] rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${
            subTab === 'panen' ? 'bg-white text-brand-800 shadow-sm' : 'text-stone-700'
          }`}
        >
          <Sprout className="w-4 h-4" />
          Prediksi Panen (ML)
        </button>
        <button
          type="button"
          onClick={() => setSubTab('harga')}
          className={`flex-1 min-h-[44px] rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition ${
            subTab === 'harga' ? 'bg-white text-brand-800 shadow-sm' : 'text-stone-700'
          }`}
        >
          <Globe className="w-4 h-4" />
          Harga & Sinyal Global
        </button>
      </div>

      {subTab === 'panen' ? (
        <div className="space-y-4">
          {/* Model metadata banner */}
          <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-950">
            <div className="flex items-center gap-2 flex-wrap">
              <AIBadge />
              <span className="font-bold">
                {harvestData?.metadata_model?.label_ui || 'Model dilatih dari data simulasi'}
              </span>
            </div>
            {harvestData?.metadata_model && (
              <span className="font-semibold bg-white px-2.5 py-1 rounded border border-indigo-200">
                MAE: {formatAngka(harvestData.metadata_model.mae_kg_ha, 1)} kg/ha · MAPE:{' '}
                {formatAngka(harvestData.metadata_model.mape_pct, 2)}%
              </span>
            )}
          </div>

          {/* Interactive ML Harvest Predictor Form */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <h3 className="font-bold text-base text-stone-900 mb-1">
              Hitung Perkiraan Panen Rencana Tanam Baru
            </h3>
            <p className="text-xs text-stone-600 mb-3">
              Menggunakan Gradient Boosting Quantile Regression (P10, Median, P90)
            </p>
            <form onSubmit={handleRunHarvestForecast} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Komoditas Tanam</label>
                <select
                  value={komoditasTanam}
                  onChange={(e) => setKomoditasTanam(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-xl border border-stone-300 bg-white text-sm font-medium"
                >
                  <option value="padi">Padi (Gabah ke Beras)</option>
                  <option value="jagung">Jagung Pipil</option>
                  <option value="singkong">Singkong (Gaplek)</option>
                  <option value="kedelai">Kedelai Lokal</option>
                  <option value="cabai_rawit">Cabai Rawit</option>
                  <option value="bawang_merah">Bawang Merah</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Luas Lahan (hektare)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={luasHa}
                  onChange={(e) => setLuasHa(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-xl border border-stone-300 text-sm font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Varietas</label>
                <input
                  type="text"
                  value={varietas}
                  onChange={(e) => setVarietas(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-xl border border-stone-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Kondisi Pupuk</label>
                <select
                  value={kondisiPupuk}
                  onChange={(e) => setKondisiPupuk(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-xl border border-stone-300 bg-white text-sm font-medium"
                >
                  <option value="cukup">Cukup (Sesuai Dosis)</option>
                  <option value="kurang">Kurang (Terbatas)</option>
                  <option value="sangat_kurang">Sangat Kurang (Langka)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Sumber Pengairan</label>
                <select
                  value={sumberAir}
                  onChange={(e) => setSumberAir(e.target.value)}
                  className="w-full min-h-[46px] px-3 rounded-xl border border-stone-300 bg-white text-sm font-medium"
                >
                  <option value="irigasi_teknis">Irigasi Teknis</option>
                  <option value="tadah_hujan">Tadah Hujan</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full min-h-[46px] rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm"
                >
                  {loading ? 'Menghitung...' : 'Hitung Prediksi Panen'}
                </button>
              </div>
            </form>

            {customPred && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase text-emerald-900">
                      Hasil Prediksi ({customPred.komoditas.toUpperCase()} · {customPred.luas_ha} ha)
                    </span>
                    <p className="text-2xl font-extrabold text-stone-900">
                      Median: {formatAngka(customPred.volume_median_kg, 0)} kg
                    </p>
                    <p className="text-xs text-stone-700">
                      Rentang Ketidakpastian (P10–P90):{' '}
                      <strong>{formatAngka(customPred.volume_p10_kg, 0)} kg</strong> s/d{' '}
                      <strong>{formatAngka(customPred.volume_p90_kg, 0)} kg</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-white border border-emerald-300 text-emerald-900">
                      Keyakinan: {String(customPred.tingkat_keyakinan).toUpperCase()}
                    </span>
                    <p className="text-xs text-stone-600 mt-1">
                      Perkiraan Panen: {formatTanggalIndo(customPred.tanggal_panen_awal)} –{' '}
                      {formatTanggalIndo(customPred.tanggal_panen_akhir)}
                    </p>
                  </div>
                </div>

                {/* Visual P10 - Median - P90 bar */}
                <div className="bg-white p-3 rounded-lg border border-stone-200">
                  <div className="flex justify-between text-[11px] font-semibold text-stone-600 mb-1">
                    <span>Pesimis P10: {formatAngka(customPred.volume_p10_kg, 0)} kg</span>
                    <span className="text-brand-800 font-bold">
                      Median P50: {formatAngka(customPred.volume_median_kg, 0)} kg
                    </span>
                    <span>Optimis P90: {formatAngka(customPred.volume_p90_kg, 0)} kg</span>
                  </div>
                  <div className="h-3 rounded-full bg-stone-200 relative overflow-hidden">
                    <div className="absolute inset-y-0 left-[15%] right-[15%] bg-emerald-400/70 rounded-full" />
                    <div className="absolute inset-y-0 left-[48%] w-1.5 bg-brand-900" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(customPred.faktor_pengaruh || []).map((f: any, idx: number) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-white border border-stone-200 text-xs">
                      <p className="font-bold text-stone-800">{f.faktor}: {f.nilai}</p>
                      <p className="text-stone-600 mt-0.5">{f.dampak}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddHarvestToProjection}
                  className="min-h-[44px] px-4 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800"
                >
                  + Masukkan ke Proyeksi Stok Desa
                </button>
              </div>
            )}
          </div>

          {/* Existing Scheduled Harvest Plans (16.3) */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-base text-stone-900">
                Daftar Rencana Tanam & Jadwal Panen Desa
              </h3>
              <span className="text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                {harvestData?.catatan_impor}
              </span>
            </div>

            <div className="space-y-3">
              {(harvestData?.rencana_tanam || []).map((hp: any) => {
                const pr = hp.prediksi || {};
                return (
                  <div
                    key={hp.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-stone-900">
                          {hp.commodity_nama} ({hp.luas_ha} ha · {hp.varietas})
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded bg-stone-200 text-stone-800 font-medium">
                          Pupuk: {hp.kondisi_pupuk.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-0.5 text-xs rounded bg-stone-200 text-stone-800 font-medium">
                          Air: {hp.sumber_air.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">
                        Tanam: {formatTanggalIndo(hp.tanggal_tanam)} · Estimasi Panen:{' '}
                        <strong>
                          {formatTanggalIndo(pr.tanggal_panen_awal)} s/d {formatTanggalIndo(pr.tanggal_panen_akhir)}
                        </strong>
                      </p>
                      <p className="text-xs text-stone-800">
                        Prediksi Hasil Median: <strong>{formatAngka(pr.volume_median_kg, 0)} kg</strong> (Rentang P10–P90:{' '}
                        {formatAngka(pr.volume_p10_kg, 0)} – {formatAngka(pr.volume_p90_kg, 0)} kg · Keyakinan:{' '}
                        {pr.tingkat_keyakinan})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTogglePlanActive(hp.id, hp.aktif_di_proyeksi)}
                      className={`min-h-[44px] px-3.5 rounded-xl text-xs font-bold border transition shrink-0 ${
                        hp.aktif_di_proyeksi
                          ? 'bg-emerald-700 text-white border-emerald-800'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                      }`}
                    >
                      {hp.aktif_di_proyeksi ? '✓ Aktif di Proyeksi Stok' : 'Masukkan ke Proyeksi Stok'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* F8: Harga Lokal & Sinyal Global */
        <div className="space-y-4">
          {/* Global Exposure Score & Signals */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  5 Indikator Sinyal Global & Skor Eksposur Desa
                </h3>
                <p className="text-xs text-stone-600">
                  Memantau dampak kurs, harga pupuk dunia, energi, dan logistik terhadap pangan desa
                </p>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-right">
                <span className="text-[11px] font-bold text-amber-900 block">Skor Eksposur Global Desa</span>
                <span className="text-xl font-extrabold text-amber-950">
                  {formatAngka(signalsData?.skor_eksposur_global || 14.2, 1)} / 100
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(signalsData?.sinyal || []).map((sig: any) => (
                <div key={sig.kode} className="p-3 rounded-xl border border-stone-200 bg-stone-50/70">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">{sig.nama}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        sig.perubahan_14d_pct >= 5
                          ? 'bg-red-100 text-red-800'
                          : 'bg-stone-200 text-stone-800'
                      }`}
                    >
                      {sig.perubahan_14d_pct >= 0 ? '+' : ''}
                      {formatAngka(sig.perubahan_14d_pct, 1)}% (14 hr)
                    </span>
                  </div>
                  <p className="text-lg font-extrabold text-stone-900 mt-1">
                    {formatAngka(sig.nilai, 0)} <span className="text-xs font-normal">{sig.satuan}</span>
                  </p>
                  <p className="text-[11px] text-stone-600 mt-1">
                    Terpapar: {(sig.komoditas_terpapar || []).join(', ')}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3 Kartu Cerita Peristiwa Global */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-base text-stone-900">
              Peristiwa Geopolitik & Guncangan Global (Simulasi)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {eventsData.map((ev: any) => (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
                    ev.aktif ? 'border-red-500 bg-red-50/60' : 'border-stone-200 bg-stone-50/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-stone-900">{ev.nama}</span>
                      {ev.aktif && (
                        <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-red-600 text-white">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-600">{ev.deskripsi}</p>
                    <p className="text-[11px] font-semibold text-stone-700 mt-2">
                      Terdampak: {(ev.komoditas_terdampak || []).join(', ')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerEvent(ev.id, !ev.aktif)}
                    className={`w-full min-h-[44px] rounded-xl font-bold text-xs transition ${
                      ev.aktif
                        ? 'bg-stone-800 text-white hover:bg-stone-900'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    {ev.aktif ? 'Hentikan Peristiwa Ini' : 'Picu Peristiwa Ini'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Price History 104 Weeks + 4 Weeks Forecast */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Riwayat Harga Lokal 2 Tahun (104 Minggu) & Prediksi 4 Minggu
                </h3>
                <p className="text-xs text-stone-600">
                  Metode: {priceData?.metode_model || 'Holt-Winters ExponentialSmoothing'} dengan rentang keyakinan 80%
                </p>
              </div>
              <select
                value={selectedCommId}
                onChange={(e) => setSelectedCommId(e.target.value)}
                className="min-h-[44px] px-3 rounded-xl border border-stone-300 bg-white text-sm font-bold"
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama} ({formatRupiah(c.harga_sekarang)}/{c.satuan})
                  </option>
                ))}
              </select>
            </div>

            {priceData && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 block">Harga Sekarang</span>
                    <span className="text-base font-extrabold text-stone-900">
                      {formatRupiah(priceData.harga_sekarang)}/{priceData.satuan}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 block">Perubahan 7 Hari</span>
                    <span
                      className={`text-base font-extrabold ${
                        priceData.perubahan_7d_pct >= 10 ? 'text-red-700' : 'text-stone-900'
                      }`}
                    >
                      {priceData.perubahan_7d_pct >= 0 ? '+' : ''}
                      {formatAngka(priceData.perubahan_7d_pct, 1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 block">Prediksi 4 Minggu</span>
                    <span className="text-base font-extrabold text-amber-800">
                      {priceData.prediksi_4w_pct >= 0 ? '+' : ''}
                      {formatAngka(priceData.prediksi_4w_pct, 1)}%
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-500 block">Indikator Volatilitas</span>
                    <span className="text-base font-extrabold text-stone-900">
                      {priceData.volatilitas} (CV {formatAngka(priceData.koefisien_variasi_pct, 1)}%)
                    </span>
                  </div>
                </div>

                <AccessibleLineChart
                  title={`Grafik Harga ${priceData.nama} (24 Minggu Terakhir + 4 Minggu Prediksi)`}
                  altDescription={`Grafik perkembangan harga ${priceData.nama} dalam rupiah per ${priceData.satuan} beserta rentang prediksi 80 persen.`}
                  data={[
                    ...(priceData.riwayat_104_minggu || []).slice(-24).map((r: any) => ({
                      periode: formatTanggalIndo(r.tanggal),
                      harga_aktual: r.harga,
                      batas_atas: r.harga,
                      batas_bawah: r.harga,
                    })),
                    ...(priceData.prediksi_4_minggu || []).map((f: any) => ({
                      periode: `Pred M+${f.minggu_ke_depan}`,
                      harga_aktual: f.harga_prediksi,
                      batas_atas: f.batas_atas_80,
                      batas_bawah: f.batas_bawah_80,
                    })),
                  ]}
                  xKey="periode"
                  unit="Rp"
                  lines={[
                    { key: 'harga_aktual', label: 'Harga / Prediksi Median', color: '#15803d' },
                    { key: 'batas_atas', label: 'Batas Atas Rentang 80%', color: '#d97706', dashed: true },
                    { key: 'batas_bawah', label: 'Batas Bawah Rentang 80%', color: '#64748b', dashed: true },
                  ]}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * F6: Simulator Guncangan
 */
export const SimulatorView: React.FC<{
  onNavigate: (tab: string) => void;
}> = ({ onNavigate }) => {
  const [presets, setPresets] = useState<Array<any>>([]);
  const [activePreset, setActivePreset] = useState<string>('preset-konflik-gandum');
  const [namaSkenario, setNamaSkenario] = useState<string>('Konflik jalur gandum dan pupuk');
  const [deltaS, setDeltaS] = useState<number>(60);
  const [deltaP, setDeltaP] = useState<number>(40);
  const [deltaH, setDeltaH] = useState<number>(20);
  const [deltaK, setDeltaK] = useState<number>(10);
  const [durasi, setDurasi] = useState<number>(60);
  const [result, setResult] = useState<any>(null);
  const [savedMsg, setSavedMsg] = useState<string>('');

  useEffect(() => {
    apiRequest('/scenarios/presets')
      .then(({ data }) => setPresets(data.presets || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      apiRequest('/scenarios/run', {
        method: 'POST',
        body: JSON.stringify({
          nama: namaSkenario,
          delta_s: deltaS / 100,
          delta_p: deltaP / 100,
          delta_h: deltaH / 100,
          delta_k: deltaK / 100,
          durasi,
        }),
      })
        .then(({ data }) => setResult(data))
        .catch(() => {});
    }, 220);
    return () => clearTimeout(timer);
  }, [deltaS, deltaP, deltaH, deltaK, durasi, namaSkenario]);

  const applyPreset = (p: any) => {
    setActivePreset(p.id);
    setNamaSkenario(p.nama);
    setDeltaS(Math.round(p.delta_s * 100));
    setDeltaP(Math.round(p.delta_p * 100));
    setDeltaH(Math.round(p.delta_h * 100));
    setDeltaK(Math.round(p.delta_k * 100));
    setDurasi(p.durasi);
  };

  const resetToZero = () => {
    setActivePreset('nol');
    setNamaSkenario('Tanpa Guncangan (Baseline)');
    setDeltaS(0);
    setDeltaP(0);
    setDeltaH(0);
    setDeltaK(0);
    setDurasi(60);
  };

  const handleSaveScenario = async () => {
    const { data } = await apiRequest('/scenarios', {
      method: 'POST',
      body: JSON.stringify({
        nama: namaSkenario,
        delta_s: deltaS / 100,
        delta_p: deltaP / 100,
        delta_h: deltaH / 100,
        delta_k: deltaK / 100,
        durasi,
      }),
    });
    setSavedMsg(`Skenario "${data.nama}" berhasil disimpan dan siap dimasukkan ke Laporan.`);
    setTimeout(() => setSavedMsg(''), 4000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-brand-700" />
              Simulator Guncangan Pangan Desa
            </h2>
            <p className="text-xs text-stone-600">
              Uji dampak gangguan impor, lonjakan harga, pelemahan rupiah, dan gagal panen terhadap ketahanan desa
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveScenario}
            className="min-h-[44px] px-4 rounded-xl bg-brand-700 text-white text-xs font-bold hover:bg-brand-800"
          >
            Simpan Skenario ke Laporan
          </button>
        </div>

        {savedMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-semibold text-emerald-900">
            {savedMsg}
          </div>
        )}

        {/* Preset chips */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => applyPreset(p)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                activePreset === p.id
                  ? 'bg-brand-700 text-white border-brand-800'
                  : 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
              }`}
            >
              {p.nama}
            </button>
          ))}
          <button
            type="button"
            onClick={resetToZero}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
              activePreset === 'nol'
                ? 'bg-stone-800 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
            }`}
          >
            Tanpa Guncangan (0%)
          </button>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-stone-100">
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Gangguan Pasokan Impor (ΔS)</span>
              <span className="text-brand-800">{deltaS}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={deltaS}
              onChange={(e) => {
                setActivePreset('kustom');
                setDeltaS(Number(e.target.value));
              }}
              className="w-full accent-brand-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Kenaikan Harga Impor (ΔP)</span>
              <span className="text-brand-800">{deltaP}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={deltaP}
              onChange={(e) => {
                setActivePreset('kustom');
                setDeltaP(Number(e.target.value));
              }}
              className="w-full accent-brand-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Penurunan Panen Lokal (ΔH)</span>
              <span className="text-brand-800">{deltaH}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={deltaH}
              onChange={(e) => {
                setActivePreset('kustom');
                setDeltaH(Number(e.target.value));
              }}
              className="w-full accent-brand-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Pelemahan Rupiah (ΔK)</span>
              <span className="text-brand-800">{deltaK}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={deltaK}
              onChange={(e) => {
                setActivePreset('kustom');
                setDeltaK(Number(e.target.value));
              }}
              className="w-full accent-brand-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="sm:col-span-2">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span>Durasi Guncangan (T)</span>
              <span className="text-brand-800">{durasi} hari</span>
            </div>
            <input
              type="range"
              min="7"
              max="180"
              step="1"
              value={durasi}
              onChange={(e) => setDurasi(Number(e.target.value))}
              className="w-full accent-brand-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {result && (
        <>
          {/* 3 Key Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-stone-500">Komoditas Penentu Baru</span>
              <p className="text-xl font-extrabold text-stone-900 mt-1">
                {result.komoditas_penentu_baru?.nama} ({formatAngka(result.komoditas_penentu_baru?.hari_bertahan, 1)} hari)
              </p>
              <p className="text-xs text-stone-600 mt-1">Dengan memperhitungkan pasokan rutin skenario</p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-stone-500">Perkiraan Tambahan Biaya Belanja</span>
              <p className="text-xl font-extrabold text-red-700 mt-1">
                {formatRupiah(result.tambahan_biaya_rp)}
              </p>
              <p className="text-xs text-stone-600 mt-1">Untuk menutup kekurangan stok selama {durasi} hari</p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
              <span className="text-xs font-semibold text-stone-500">Skor Ketahanan Desa</span>
              <p className="text-xl font-extrabold text-stone-900 mt-1">
                {formatAngka(result.skor_sebelum?.skor_total, 1)}{' '}
                <span className="text-stone-400">→</span>{' '}
                <span className="text-amber-700">{formatAngka(result.skor_sesudah?.skor_total, 1)}</span>
              </p>
              <p className="text-xs text-stone-600 mt-1">Skala komposit 0–100</p>
            </div>
          </div>

          {/* Dual-line chart Baseline vs Scenario */}
          <AccessibleLineChart
            title={`Proyeksi Stok ${result.komoditas_grafik || 'Terigu'}: Baseline vs Skenario (${durasi} Hari)`}
            altDescription="Grafik dua garis membandingkan proyeksi stok kondisi normal (baseline) dengan kondisi skenario guncangan."
            data={result.grafik_proyeksi || []}
            xKey="hari"
            unit="kg"
            lines={[
              { key: 'baseline', label: 'Baseline (Normal)', color: '#15803d' },
              { key: 'skenario', label: 'Skenario Guncangan', color: '#dc2626', dashed: true },
            ]}
          />

          {/* Recommendations */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-base text-stone-900">
                Rekomendasi Tindakan Terurut Prioritas
              </h3>
              <AIBadge sumber={result.sumber_narasi} />
            </div>
            <p className="text-sm text-stone-800 bg-stone-50 p-3 rounded-xl border border-stone-200">
              {result.narasi_ringkasan}
            </p>
            <div className="space-y-2">
              {(result.rekomendasi || []).map((rek: any) => (
                <div
                  key={rek.prioritas}
                  className="p-3 rounded-xl border border-stone-200 flex items-start gap-3 bg-white"
                >
                  <span className="w-6 h-6 rounded-full bg-brand-700 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {rek.prioritas}
                  </span>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-stone-900 text-sm">{rek.judul}</p>
                    <p className="text-stone-600 mt-0.5">{rek.tindakan}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('menu')}
                className="min-h-[44px] px-4 rounded-xl bg-brand-700 text-white text-xs font-bold"
              >
                Susun Menu Substitusi Lokal (PMT)
              </button>
              <button
                type="button"
                onClick={() => onNavigate('jaringan')}
                className="min-h-[44px] px-4 rounded-xl border border-brand-700 text-brand-800 text-xs font-bold bg-white"
              >
                Cari Bantuan Antar Desa
              </button>
            </div>
          </div>

          {/* Per-commodity comparison table */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm overflow-x-auto">
            <h3 className="font-bold text-base text-stone-900 mb-3">
              Perbandingan Baseline vs Skenario per Komoditas (dengan Pasokan Rutin)
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 text-stone-600">
                  <th className="py-2 pr-2">Komoditas</th>
                  <th className="py-2 px-2">Pasokan Rutin (ρ → ρ')</th>
                  <th className="py-2 px-2">Bertahan Baseline</th>
                  <th className="py-2 px-2">Bertahan Skenario</th>
                  <th className="py-2 px-2">Kekurangan ({durasi} hr)</th>
                  <th className="py-2 px-2">Harga Skenario</th>
                  <th className="py-2 pl-2">Status Skenario</th>
                </tr>
              </thead>
              <tbody>
                {(result.per_komoditas || []).map((c: any) => (
                  <tr key={c.commodity_id} className="border-b border-stone-100">
                    <td className="py-2.5 pr-2 font-bold text-stone-900">{c.nama}</td>
                    <td className="py-2.5 px-2">
                      {formatAngka(c.rho_baseline * 100, 0)}% →{' '}
                      <strong>{formatAngka(c.rho_skenario * 100, 1)}%</strong>
                    </td>
                    <td className="py-2.5 px-2">
                      {c.doc_baseline_lebih_180 ? 'Lebih dari 180 hari' : `${formatAngka(c.doc_baseline, 1)} hari`}
                    </td>
                    <td className="py-2.5 px-2 font-bold">
                      {c.doc_skenario_lebih_180 ? 'Lebih dari 180 hari' : `${formatAngka(c.doc_skenario, 1)} hari`}
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-red-700">
                      {formatAngka(c.kekurangan_skenario_kg, 0)} {c.satuan}
                    </td>
                    <td className="py-2.5 px-2">{formatRupiah(c.harga_skenario)}</td>
                    <td className="py-2.5 pl-2">
                      <StatusBadge status={c.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * F9: Menu Gizi dan PMT (Optimasi Linear Programming + LLM)
 */
export const NutritionMenuView: React.FC<{
  onRefreshOverview: () => void;
}> = ({ onRefreshOverview }) => {
  const [sasaran, setSasaran] = useState('balita');
  const [durasi, setDurasi] = useState(7);
  const [prioritas, setPrioritas] = useState('hindari_impor');
  const [batasStokPct, setBatasStokPct] = useState(20);
  const [menuPlan, setMenuPlan] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [commitMsg, setCommitMsg] = useState('');

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setCommitMsg('');
    try {
      const { data } = await apiRequest('/menus/generate', {
        method: 'POST',
        body: JSON.stringify({
          sasaran,
          durasi,
          prioritas,
          batas_stok_pct: batasStokPct / 100,
        }),
      });
      setMenuPlan(data);
      setSelectedDay(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void handleGenerate();
  }, []);

  const handleCommitUsage = async () => {
    if (!menuPlan?.id) return;
    setLoading(true);
    try {
      const { data } = await apiRequest(`/menus/${menuPlan.id}/commit`, {
        method: 'POST',
      });
      setMenuPlan({ ...menuPlan, status: 'tercatat' });
      setCommitMsg(
        `Pemakaian bahan PMT (${(data.transaksi_pmt || []).length} komoditas) berhasil dicatat sebagai transaksi Keluar (PMT).`
      );
      onRefreshOverview();
    } finally {
      setLoading(false);
    }
  };

  const handleShareWA = () => {
    if (!menuPlan) return;
    const text = encodeURIComponent(
      `*RENCANA MENU PMT SIAPANSA*\nSasaran: ${menuPlan.sasaran_label}\nDurasi: ${menuPlan.durasi} hari\nBiaya rata-rata: ${formatRupiah(menuPlan.biaya_rata_per_porsi_rp)}/porsi\nTotal anggaran: ${formatRupiah(menuPlan.biaya_total_rp)}\n(Data simulasi prototipe)`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const activeDayPlan =
    menuPlan?.rencana_harian?.find((d: any) => d.hari === selectedDay) ||
    menuPlan?.rencana_harian?.[0];

  return (
    <div className="space-y-4">
      {/* 3-Step Wizard Controls */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-brand-700" />
              Penyusun Menu Gizi & PMT Posyandu
            </h2>
            <p className="text-xs text-stone-600">
              Optimasi Linear Programming memenuhi minimal 95% target energi & protein dari bahan yang tersedia
            </p>
          </div>
          <AIBadge />
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">1. Kelompok Sasaran</label>
            <select
              value={sasaran}
              onChange={(e) => setSasaran(e.target.value)}
              className="w-full min-h-[46px] px-3 rounded-xl border border-stone-300 bg-white text-sm font-medium"
            >
              <option value="balita">Balita PMT Posyandu (140 anak)</option>
              <option value="ibu_hamil">Ibu Hamil & Menyusui (45 orang)</option>
              <option value="umum">Dapur Umum Warga (1.800 jiwa)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">2. Durasi Rencana</label>
            <select
              value={durasi}
              onChange={(e) => setDurasi(Number(e.target.value))}
              className="w-full min-h-[46px] px-3 rounded-xl border border-stone-300 bg-white text-sm font-medium"
            >
              <option value={3}>3 Hari</option>
              <option value={7}>7 Hari (1 Minggu)</option>
              <option value={14}>14 Hari (2 Minggu)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">3. Prioritas Optimasi</label>
            <select
              value={prioritas}
              onChange={(e) => setPrioritas(e.target.value)}
              className="w-full min-h-[46px] px-3 rounded-xl border border-stone-300 bg-white text-sm font-medium"
            >
              <option value="hindari_impor">Hindari Bahan Impor (Tanpa Terigu/Kedelai)</option>
              <option value="bahan_lokal">Utamakan Bahan Lokal Desa</option>
              <option value="hemat">Biaya Paling Hemat</option>
              <option value="gizi_maksimal">Gizi & Protein Maksimal</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[46px] rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm"
            >
              {loading ? 'Menyusun Menu...' : 'Susun Rencana Menu'}
            </button>
          </div>
        </form>
      </div>

      {menuPlan && (
        <>
          {/* Mandatory Disclaimer */}
          <div className="rounded-xl bg-amber-50 border border-amber-300 p-3 text-xs text-amber-950 font-medium">
            <strong>Catatan Penting:</strong> {menuPlan.disclaimer}
          </div>

          {menuPlan.substitusi_impor?.length > 0 && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-950 space-y-1">
              <p className="font-bold">Substitusi Pangan Lokal Aktif:</p>
              {menuPlan.substitusi_impor.map((s: string, i: number) => (
                <p key={i}>• {s}</p>
              ))}
            </div>
          )}

          {/* Day Selector Carousel Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(menuPlan.rencana_harian || []).map((d: any) => (
              <button
                key={d.hari}
                type="button"
                onClick={() => setSelectedDay(d.hari)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs shrink-0 border transition ${
                  selectedDay === d.hari
                    ? 'bg-brand-700 text-white border-brand-800 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
              >
                Hari {d.hari} · {formatRupiah(d.biaya_per_porsi_rp)}/porsi
              </button>
            ))}
          </div>

          {/* Active Day Card */}
          {activeDayPlan && (
            <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div>
                  <span className="text-xs font-bold text-brand-700">
                    HARI KE-{activeDayPlan.hari} · {menuPlan.jumlah_penerima} PENERIMA
                  </span>
                  <h3 className="text-lg font-extrabold text-stone-900">{activeDayPlan.nama_menu}</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold">
                    Energi: {formatAngka(activeDayPlan.energi_per_porsi_kkal, 0)} kkal ({formatAngka(activeDayPlan.persen_energi, 0)}%)
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 font-bold">
                    Protein: {formatAngka(activeDayPlan.protein_per_porsi_g, 1)} g ({formatAngka(activeDayPlan.persen_protein, 0)}%)
                  </span>
                </div>
              </div>

              {/* Ingredients Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-600">
                      <th className="py-2 pr-2">Bahan Pangan</th>
                      <th className="py-2 px-2">Sumber</th>
                      <th className="py-2 px-2">Gram / Porsi</th>
                      <th className="py-2 px-2">Total Kebutuhan</th>
                      <th className="py-2 px-2">Energi & Protein</th>
                      <th className="py-2 pl-2">Biaya / Porsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(activeDayPlan.bahan || []).map((b: any) => (
                      <tr key={b.food_id} className="border-b border-stone-100">
                        <td className="py-2 pr-2 font-bold text-stone-900">{b.nama}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-0.5 rounded font-semibold ${
                              b.status_stok === 'stok_desa'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {b.status_stok === 'stok_desa' ? 'Stok Lumbung Desa' : 'Perlu Dibeli'}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-semibold">{formatAngka(b.gram_per_porsi, 1)} g</td>
                        <td className="py-2 px-2">{formatAngka(b.total_kebutuhan_kg, 2)} kg</td>
                        <td className="py-2 px-2">
                          {formatAngka(b.energi_kkal, 0)} kkal · {formatAngka(b.protein_g, 1)} g
                        </td>
                        <td className="py-2 pl-2 font-semibold">{formatRupiah(b.biaya_per_porsi_rp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cooking Steps & Tips */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                  <p className="font-bold text-stone-800">Langkah Memasak Singkat:</p>
                  <ol className="list-decimal list-inside space-y-1 text-stone-700">
                    {(activeDayPlan.langkah_masak || []).map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                  <p className="font-bold text-stone-800">Tips Penyajian & Ringkasan Biaya:</p>
                  <p className="text-stone-700">{activeDayPlan.tips_penyajian}</p>
                  <p className="font-bold text-stone-900 pt-1">
                    Biaya per Porsi: {formatRupiah(activeDayPlan.biaya_per_porsi_rp)} · Total Hari Ini:{' '}
                    {formatRupiah(activeDayPlan.biaya_harian_total_rp)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Impact on Village Stock & Action Bar */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-stone-900">
              Dampak Total Rencana ({menuPlan.durasi} Hari) ke Hari Bertahan Komoditas Desa
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              {(menuPlan.dampak_stok || []).map((d: any) => (
                <div key={d.commodity_id} className="p-3 rounded-xl border border-stone-200 bg-stone-50">
                  <p className="font-bold text-stone-900">{d.nama}</p>
                  <p className="text-stone-600 mt-0.5">
                    Terpakai: <strong>{formatAngka(d.terpakai_kg, 1)} kg</strong> (Batas PMT:{' '}
                    {formatAngka(d.alokasi_maks_kg, 0)} kg)
                  </p>
                  <p className="text-stone-800 mt-0.5">
                    Hari Bertahan: {formatAngka(d.doc_sebelum, 1)} hr →{' '}
                    <strong>{formatAngka(d.doc_sesudah, 1)} hr</strong>
                  </p>
                </div>
              ))}
            </div>

            {commitMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-900">
                {commitMsg}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
              <div className="text-xs">
                <span className="text-stone-500">Total Biaya {menuPlan.durasi} Hari: </span>
                <strong className="text-base text-stone-900">{formatRupiah(menuPlan.biaya_total_rp)}</strong>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCommitUsage}
                  disabled={loading || menuPlan.status === 'tercatat'}
                  className="min-h-[44px] px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold disabled:opacity-50"
                >
                  {menuPlan.status === 'tercatat' ? '✓ Pemakaian Sudah Tercatat' : 'Catat Pemakaian Stok (PMT)'}
                </button>
                <button
                  type="button"
                  onClick={handleShareWA}
                  className="min-h-[44px] px-3.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <Share2 className="w-4 h-4" />
                  Bagikan ke WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="min-h-[44px] px-3.5 rounded-xl border border-stone-300 bg-white text-stone-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  Cetak Rencana
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * F10: Jaringan Desa & Distribusi Antar Desa (Optimasi Transportasi + LLM)
 */
export const VillageNetworkView: React.FC<{
  offline: boolean;
  onRefreshOverview: () => void;
}> = ({ offline, onRefreshOverview }) => {
  const [subTab, setSubTab] = useState<'status' | 'usulan' | 'permintaan_saya' | 'masuk'>('status');
  const [networkData, setNetworkData] = useState<any>(null);
  const [optData, setOptData] = useState<any>(null);
  const [myTransfers, setMyTransfers] = useState<Array<any>>([]);
  const [incomingTransfers, setIncomingTransfers] = useState<Array<any>>([]);
  const [selectedVillage, setSelectedVillage] = useState<any>(null);
  const [actionMsg, setActionMsg] = useState<string>('');

  const loadAllNetwork = async () => {
    try {
      const [nRes, tRes, inRes] = await Promise.all([
        apiRequest('/network/villages'),
        apiRequest('/transfers'),
        apiRequest('/transfers/incoming'),
      ]);
      setNetworkData(nRes.data);
      setMyTransfers(tRes.data.transfers || []);
      setIncomingTransfers(inRes.data.permintaan_masuk || []);
      if (!selectedVillage && nRes.data.desa?.length) {
        setSelectedVillage(nRes.data.desa[0]);
      }
    } catch {
      // handled
    }
  };

  useEffect(() => {
    void loadAllNetwork();
  }, []);

  const handleFindHelp = async () => {
    const { data } = await apiRequest('/network/optimize', { method: 'POST', body: JSON.stringify({}) });
    setOptData(data);
    setSubTab('usulan');
  };

  const handleCreateTransferRequest = async (u: any) => {
    await apiRequest('/transfers', {
      method: 'POST',
      body: JSON.stringify({
        dari_village_id: u.dari_village_id,
        dari_village_nama: u.dari_village_nama,
        ke_village_id: u.ke_village_id,
        ke_village_nama: u.ke_village_nama,
        commodity_id: u.commodity_id,
        commodity_nama: u.commodity_nama,
        satuan: u.satuan,
        jumlah: u.jumlah_kg,
        jarak_km: u.jarak_km,
        biaya_angkut: u.biaya_angkut_rp,
        draf_pesan: u.draf_pesan,
      }),
    });
    await loadAllNetwork();
    setSubTab('permintaan_saya');
    setActionMsg(`Permintaan bantuan ${u.commodity_nama} ke ${u.dari_village_nama} berhasil diajukan.`);
  };

  const handleSimulateApproval = async (transferId: string) => {
    const { data } = await apiRequest('/demo/approve-transfer', {
      method: 'POST',
      body: JSON.stringify({ transfer_id: transferId }),
    });
    setActionMsg(data.pesan || 'Permintaan disetujui dan stok otomatis bertambah.');
    await loadAllNetwork();
    onRefreshOverview();
  };

  const handleRespondIncoming = async (transferId: string, status: 'Disetujui' | 'Ditolak') => {
    try {
      await apiRequest(`/transfers/${transferId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setActionMsg(`Permintaan masuk berhasil diubah menjadi: ${status}.`);
      await loadAllNetwork();
      onRefreshOverview();
    } catch (err: any) {
      setActionMsg(err?.message || 'Gagal memproses permintaan masuk.');
    }
  };

  const villages = networkData?.desa || [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-brand-700" />
            Jaringan Gugus Desa & Optimasi Distribusi
          </h2>
          <p className="text-xs text-stone-600">
            Target kecukupan penerima 30 hari · Batas aman desa donor minimal 21 hari
          </p>
        </div>
        <button
          type="button"
          onClick={handleFindHelp}
          className="min-h-[46px] px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-sm"
        >
          Cari Bantuan Optimal (LP Transportasi)
        </button>
      </div>

      {actionMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-950">
          {actionMsg}
        </div>
      )}

      {/* Map + Selected Village Summary */}
      <VillageClusterMap
        villages={villages}
        offline={offline}
        selectedId={selectedVillage?.id || null}
        onSelect={(v) => setSelectedVillage(v)}
      />

      {/* Selected Village Detail Panel */}
      {selectedVillage && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-stone-900">{selectedVillage.nama}</h3>
                {selectedVillage.is_own && (
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 text-brand-900 text-[10px] font-bold">
                    Desa Kita
                  </span>
                )}
                <StatusBadge status={selectedVillage.status} size="sm" />
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                {selectedVillage.catatan_peran} · Penduduk: {formatAngka(selectedVillage.penduduk, 0)} jiwa
              </p>
            </div>
            {!selectedVillage.is_own && (
              <button
                type="button"
                onClick={handleFindHelp}
                className="px-3.5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs shadow-sm transition"
              >
                Cari Jalur Distribusi Optimal
              </button>
            )}
          </div>

          <div>
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wide block mb-2">
              Hari Bertahan Cadangan (DoC) 10 Komoditas di {selectedVillage.nama}:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {['beras', 'jagung', 'singkong', 'terigu', 'kedelai', 'telur', 'minyak', 'gula', 'bawang_merah', 'cabai_rawit'].map((k) => {
                const doc = selectedVillage.doc_by_kode?.[k] ?? 0;
                const isSafe = doc >= 21;
                const isWarning = doc >= 14 && doc < 21;
                return (
                  <div key={k} className="p-2 rounded-xl bg-stone-50 border border-stone-200/80">
                    <span className="block text-[11px] text-stone-500 capitalize">
                      {k.replace('_', ' ')}
                    </span>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <strong className={`text-sm ${isSafe ? 'text-emerald-700' : isWarning ? 'text-amber-700' : 'text-red-700'}`}>
                        {formatAngka(doc, 1)} hr
                      </strong>
                      <span className="text-[10px] text-stone-600">
                        {isSafe ? 'Aman' : isWarning ? 'Waspada' : 'Siaga'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap rounded-xl bg-stone-200/80 p-1 gap-1">
        {[
          { id: 'status', label: 'Status 6 Desa & Surplus/Defisit' },
          { id: 'usulan', label: `Usulan Bantuan (${optData?.usulan_transfer?.length || 0})` },
          { id: 'permintaan_saya', label: `Permintaan Saya (${myTransfers.length})` },
          { id: 'masuk', label: `Permintaan Masuk (${incomingTransfers.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSubTab(t.id as any)}
            className={`flex-1 min-h-[42px] px-3 rounded-lg font-bold text-xs transition ${
              subTab === t.id ? 'bg-white text-brand-800 shadow-sm' : 'text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {subTab === 'status' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {villages.map((v: any) => (
            <div
              key={v.id}
              onClick={() => setSelectedVillage(v)}
              className={`rounded-2xl border p-4 bg-white shadow-sm cursor-pointer transition hover:shadow-md ${
                selectedVillage?.id === v.id
                  ? 'border-brand-600 ring-2 ring-brand-600/30'
                  : v.is_own
                  ? 'border-brand-500/60'
                  : 'border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">
                    {v.nama} {v.is_own ? '(Desa Kita)' : ''}
                  </h4>
                  <p className="text-xs text-stone-500">
                    Penduduk: {formatAngka(v.penduduk, 0)} jiwa · {v.catatan_peran}
                  </p>
                </div>
                <StatusBadge status={v.status} size="sm" />
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-[11px] pt-2 border-t border-stone-100">
                {['beras', 'jagung', 'terigu', 'kedelai', 'telur'].map((k) => {
                  const doc = v.doc_by_kode?.[k] ?? 0;
                  return (
                    <div key={k} className="p-1.5 rounded bg-stone-50 text-center">
                      <span className="block text-stone-500 capitalize">{k}</span>
                      <strong className={doc >= 28 ? 'text-emerald-700' : doc < 16 ? 'text-amber-700' : 'text-stone-900'}>
                        {formatAngka(doc, 1)}h
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'usulan' && (
        <div className="space-y-3">
          {!optData && (
            <div className="p-6 rounded-2xl border border-stone-200 bg-white text-center space-y-2">
              <p className="text-sm font-semibold text-stone-700">
                Ketuk tombol "Cari Bantuan Optimal" untuk menghitung alokasi transfer terigu dan kedelai dari desa tetangga.
              </p>
              <button
                type="button"
                onClick={handleFindHelp}
                className="min-h-[44px] px-4 rounded-xl bg-brand-700 text-white text-xs font-bold"
              >
                Jalankan Optimasi Distribusi Sekarang
              </button>
            </div>
          )}

          {(optData?.usulan_transfer || []).map((u: any, idx: number) => (
            <div key={idx} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase text-brand-700">
                    Usulan Distribusi #{idx + 1} · {u.commodity_nama}
                  </span>
                  <h4 className="text-base font-extrabold text-stone-900">
                    {u.dari_village_nama} → {u.ke_village_nama}: {formatAngka(u.jumlah_kg, 0)} {u.satuan}
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-bold">
                  Jarak: {formatAngka(u.jarak_km, 1)} km · Ongkos: {formatRupiah(u.biaya_angkut_rp)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-stone-600 block">Dampak Hari Bertahan {u.dari_village_nama} (Donor):</span>
                  <strong>
                    {formatAngka(u.doc_donor_sebelum, 1)} hari → {formatAngka(u.doc_donor_sesudah, 1)} hari (Aman ≥ 21 hari)
                  </strong>
                </div>
                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-stone-600 block">Dampak Hari Bertahan {u.ke_village_nama} (Penerima):</span>
                  <strong>
                    {formatAngka(u.doc_penerima_sebelum, 1)} hari → {formatAngka(u.doc_penerima_sesudah, 1)} hari
                  </strong>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-700">Draf Pesan Permohonan (Bahasa Indonesia Sopan):</span>
                  <AIBadge />
                </div>
                <p className="text-stone-800 italic">"{u.draf_pesan}"</p>
              </div>

              <button
                type="button"
                onClick={() => handleCreateTransferRequest(u)}
                className="min-h-[44px] px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold"
              >
                Buat & Ajukan Permintaan Ini
              </button>
            </div>
          ))}
        </div>
      )}

      {subTab === 'permintaan_saya' && (
        <div className="space-y-3">
          {myTransfers.length === 0 ? (
            <div className="p-6 rounded-2xl border border-stone-200 bg-white text-center text-sm text-stone-600">
              Belum ada permintaan bantuan yang diajukan. Buka tab "Usulan Bantuan" untuk mengajukan.
            </div>
          ) : (
            myTransfers.map((tr: any) => (
              <div key={tr.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">
                      Permintaan {tr.commodity_nama} ({formatAngka(tr.jumlah, 0)} {tr.satuan}) dari {tr.dari_village_nama}
                    </h4>
                    <p className="text-xs text-stone-500">
                      Jarak {formatAngka(tr.jarak_km, 1)} km · Biaya Angkut {formatRupiah(tr.biaya_angkut)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      tr.status === 'Diterima'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    Status: {tr.status}
                  </span>
                </div>
                <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200">
                  {tr.draf_pesan}
                </p>
                {tr.status !== 'Diterima' && (
                  <button
                    type="button"
                    onClick={() => handleSimulateApproval(tr.id)}
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                  >
                    Simulasikan Persetujuan & Penerimaan Barang (Mode Demo)
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {subTab === 'masuk' && (
        <div className="space-y-3">
          {incomingTransfers.map((tr: any) => (
            <div key={tr.id} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-amber-800">PERMINTAAN MASUK DARI DESA TETANGGA</span>
                  <h4 className="text-base font-extrabold text-stone-900">
                    {tr.ke_village_nama} memohon {formatAngka(tr.jumlah, 0)} {tr.satuan} {tr.commodity_nama}
                  </h4>
                </div>
                <span className="px-3 py-1 rounded-full bg-stone-100 text-xs font-bold">
                  Status: {tr.status}
                </span>
              </div>
              <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200">
                "{tr.draf_pesan}"
              </p>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex flex-wrap justify-between gap-2">
                <span>
                  Pemeriksaan Batas Aman Donor (≥ 21 hari): Cadangan {tr.commodity_nama} Desa Sidomulyo{' '}
                  <strong>{formatAngka(tr.doc_desa_kita_sebelum, 1)} hari</strong> → setelah kirim{' '}
                  <strong>{formatAngka(tr.doc_desa_kita_sesudah, 1)} hari</strong>.
                </span>
                <span className="font-bold text-emerald-900">
                  {tr.aman_untuk_disetujui ? '✓ Aman Disetujui' : '⚠ Melanggar Batas 21 Hari'}
                </span>
              </div>
              {tr.status === 'Diajukan' && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!tr.aman_untuk_disetujui}
                    onClick={() => handleRespondIncoming(tr.id, 'Disetujui')}
                    className="min-h-[44px] px-4 rounded-xl bg-brand-700 text-white text-xs font-bold disabled:opacity-50"
                  >
                    Setujui & Kirim Bantuan
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRespondIncoming(tr.id, 'Ditolak')}
                    className="min-h-[44px] px-4 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-bold"
                  >
                    Tolak
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * F11: Asisten SIAPANSA (Chat berbahasa Indonesia dengan Tool-Calling & Chip "Dasar jawaban")
 */
export const AssistantView: React.FC<{ offline: boolean }> = ({ offline }) => {
  const [messages, setMessages] = useState<Array<any>>([
    {
      role: 'assistant',
      jawaban:
        'Halo Pak Joko! Saya Asisten SIAPANSA Desa Sidomulyo. Silakan pilih pertanyaan cepat di bawah atau ketik pertanyaan Anda tentang stok, simulasi krisis, menu PMT, atau bantuan antar desa.',
      dasar_jawaban: [{ tool: 'get_status', label: 'Data Engine Deterministik SIAPANSA' }],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedTool, setExpandedTool] = useState<any>(null);

  const QUICK_QUESTIONS = [
    'Berapa hari terigu kita bertahan kalau impor terganggu 60%?',
    'Desa mana yang bisa bantu kedelai?',
    'Buatkan menu PMT 7 hari tanpa terigu',
    'Bagaimana status ketahanan pangan desa hari ini?',
  ];

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const nextMsgs = [...messages.slice(-19), { role: 'user', jawaban: text }];
    setMessages(nextMsgs);
    setInput('');
    setLoading(true);
    try {
      const { data } = await apiRequest('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ pesan: text, stream: false }),
      });
      setMessages([...nextMsgs.slice(-19), { role: 'assistant', ...data }]);
    } catch (err: any) {
      setMessages([
        ...nextMsgs.slice(-19),
        {
          role: 'assistant',
          jawaban: err?.message || 'Maaf, asisten memerlukan koneksi ke server untuk mengambil data engine.',
          dasar_jawaban: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm flex flex-col h-[74vh] max-h-[680px]">
      <div className="p-4 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-brand-700" />
          <div>
            <h2 className="font-extrabold text-sm text-stone-900">Asisten Tanya-Jawab SIAPANSA</h2>
            <p className="text-[11px] text-stone-500">
              Seluruh angka berasal 100% dari tool engine deterministik (maks. 20 pesan per sesi)
            </p>
          </div>
        </div>
        <AIBadge />
      </div>

      {/* Quick Chips */}
      <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 flex gap-2 overflow-x-auto">
        {QUICK_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={offline || loading}
            onClick={() => void sendMessage(q)}
            className="px-3 py-1.5 rounded-full bg-white border border-stone-300 text-xs font-semibold text-stone-800 hover:bg-brand-50 hover:border-brand-400 shrink-0 disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                m.role === 'user'
                  ? 'bg-brand-700 text-white'
                  : 'bg-stone-100 text-stone-900 border border-stone-200'
              }`}
            >
              <p className="leading-relaxed">{m.jawaban}</p>
              {m.dasar_jawaban?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-stone-200/80 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-stone-500 font-medium">Dasar jawaban:</span>
                  {m.dasar_jawaban.map((dj: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setExpandedTool(dj)}
                      className="px-2 py-0.5 rounded-md bg-white border border-brand-300 text-brand-800 text-[11px] font-bold hover:bg-brand-50"
                    >
                      {dj.label || dj.tool}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-stone-500 italic px-2">
            Asisten sedang memeriksa data engine...
          </div>
        )}
      </div>

      {expandedTool && (
        <div className="px-4 py-2.5 bg-indigo-50 border-t border-indigo-200 text-xs flex items-center justify-between gap-2">
          <div className="overflow-x-auto">
            <strong className="text-indigo-950">Fakta Tool ({expandedTool.tool}): </strong>
            <code className="text-[11px] text-indigo-900">
              {JSON.stringify(expandedTool.ringkasan_data || expandedTool)}
            </code>
          </div>
          <button
            type="button"
            onClick={() => setExpandedTool(null)}
            className="text-indigo-800 font-bold shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendMessage(input);
        }}
        className="p-3 border-t border-stone-200 flex gap-2"
      >
        <input
          type="text"
          value={input}
          disabled={offline}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            offline
              ? 'Asisten membutuhkan koneksi internet...'
              : 'Tanyakan stok, simulasi, menu PMT, atau bantuan desa...'
          }
          className="flex-1 min-h-[48px] px-4 rounded-xl border border-stone-300 text-sm"
        />
        <button
          type="submit"
          disabled={offline || loading}
          className="min-w-[52px] min-h-[48px] rounded-xl bg-brand-700 hover:bg-brand-800 text-white flex items-center justify-center disabled:opacity-50"
          aria-label="Kirim Pertanyaan"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

/**
 * F12: Laporan Satu Halaman A4 (Musyawarah Desa, Cetak PDF, Tautan Baca-Saja 7 Hari, Kirim WA)
 */
export const ReportView: React.FC = () => {
  const [periode, setPeriode] = useState(30);
  const [report, setReport] = useState<any>(null);
  const [shareInfo, setShareInfo] = useState<any>(null);

  const loadPreview = async (p: number) => {
    const { data } = await apiRequest('/reports/preview', {
      method: 'POST',
      body: JSON.stringify({ periode: p }),
    });
    setReport(data);
  };

  useEffect(() => {
    void loadPreview(periode);
  }, [periode]);

  const handleCreateShareLink = async () => {
    const { data } = await apiRequest('/reports/share', {
      method: 'POST',
      body: JSON.stringify({ periode }),
    });
    setShareInfo(data);
  };

  const handleSendWA = () => {
    if (!report) return;
    const text = encodeURIComponent(report.teks_whatsapp);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  if (!report) return null;

  return (
    <div className="space-y-4">
      <div className="no-print rounded-2xl border border-stone-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-700" />
          <div>
            <h2 className="font-extrabold text-base text-stone-900">Laporan Musyawarah Desa (1 Halaman A4)</h2>
            <p className="text-xs text-stone-600">Siap cetak PDF atau dibagikan ke Kepala Desa, BPD, & Dinas</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {[7, 30, 90].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriode(p)}
              className={`min-h-[42px] px-3 rounded-xl text-xs font-bold border ${
                periode === p
                  ? 'bg-brand-700 text-white border-brand-800'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {p} Hari
            </button>
          ))}
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[42px] px-3.5 rounded-xl bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            Cetak / Simpan PDF (A4)
          </button>
          <button
            type="button"
            onClick={handleCreateShareLink}
            className="min-h-[42px] px-3.5 rounded-xl border border-brand-700 text-brand-800 bg-white text-xs font-bold flex items-center gap-1.5"
          >
            <Share2 className="w-4 h-4" />
            Buat Tautan Publik (7 Hari)
          </button>
          <button
            type="button"
            onClick={handleSendWA}
            className="min-h-[42px] px-3.5 rounded-xl bg-emerald-700 text-white text-xs font-bold"
          >
            Kirim ke WhatsApp
          </button>
        </div>
      </div>

      {shareInfo && (
        <div className="no-print p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-bold text-emerald-950">Tautan Baca-Saja Publik (Tanpa Login, Berlaku 7 Hari):</p>
            <a
              href={shareInfo.url_publik}
              target="_blank"
              rel="noreferrer"
              className="text-brand-800 underline font-mono font-bold"
            >
              {window.location.origin}
              {shareInfo.url_publik}
            </a>
          </div>
          <span className="text-emerald-800 font-semibold">
            Kedaluwarsa: {formatTanggalIndo(shareInfo.expires_at)}
          </span>
        </div>
      )}

      {/* Printable A4 Sheet */}
      <div className="print-only-a4 rounded-2xl border border-stone-300 bg-white p-6 shadow-sm space-y-4 max-w-4xl mx-auto">
        <div className="border-b-2 border-stone-800 pb-3 flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800">
              LAPORAN KETAHANAN PANGAN DESA — SIAPANSA
            </span>
            <h1 className="text-xl font-extrabold text-stone-900">
              {report.desa?.nama}, Kec. {report.desa?.kecamatan}, {report.desa?.kabupaten}
            </h1>
            <p className="text-xs text-stone-600">
              Periode Laporan: {report.periode_hari} Hari Terakhir · Tanggal Acuan:{' '}
              {formatTanggalIndo(report.tanggal_cetak)} · Penduduk: {formatAngka(report.desa?.jumlah_penduduk, 0)} Jiwa
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="inline-block px-2.5 py-1 rounded bg-amber-100 border border-amber-300 font-bold text-amber-950">
              Data Simulasi Prototipe
            </span>
          </div>
        </div>

        {/* Narrative summary */}
        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs leading-relaxed text-stone-800">
          <div className="flex items-center justify-between mb-1">
            <strong className="text-stone-900">Ringkasan Eksekutif Musyawarah Desa:</strong>
            <AIBadge />
          </div>
          {report.ringkasan_naratif}
        </div>

        {/* 4 Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Hari Bertahan Pokok</span>
            <strong className="text-lg text-stone-900">
              {formatAngka(report.pool_pokok?.hari_bertahan, 1)} hari ({report.pool_pokok?.status})
            </strong>
          </div>
          <div className="p-3 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Hari Bertahan Protein</span>
            <strong className="text-lg text-stone-900">
              {formatAngka(report.pool_protein?.hari_bertahan, 1)} hari ({report.pool_protein?.status})
            </strong>
          </div>
          <div className="p-3 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Titik Terlemah</span>
            <strong className="text-lg text-amber-800">
              {report.titik_terlemah?.nama} ({formatAngka(report.titik_terlemah?.hari_bertahan, 1)} hr)
            </strong>
          </div>
          <div className="p-3 rounded-xl border border-stone-200">
            <span className="text-stone-500 block">Skor Ketahanan Desa</span>
            <strong className="text-lg text-brand-800">
              {formatAngka(report.skor_ketahanan?.skor_total, 1)} / 100
            </strong>
          </div>
        </div>

        {/* Commodity Table */}
        <div>
          <h3 className="font-bold text-xs uppercase text-stone-700 mb-1.5">
            Status Cadangan 10 Komoditas Pangan Desa
          </h3>
          <table className="w-full text-xs text-left border-collapse border border-stone-200">
            <thead>
              <tr className="bg-stone-100 border-b border-stone-200">
                <th className="py-1.5 px-2">Komoditas</th>
                <th className="py-1.5 px-2">Kelompok</th>
                <th className="py-1.5 px-2">Stok Efektif</th>
                <th className="py-1.5 px-2">Kebutuhan/Hari</th>
                <th className="py-1.5 px-2">Hari Bertahan</th>
                <th className="py-1.5 px-2">Harga Lokal</th>
                <th className="py-1.5 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {(report.komoditas || []).map((c: any) => (
                <tr key={c.id} className="border-b border-stone-200">
                  <td className="py-1.5 px-2 font-bold">{c.nama}</td>
                  <td className="py-1.5 px-2 capitalize">{c.kelompok}</td>
                  <td className="py-1.5 px-2">
                    {formatAngka(c.stok_efektif, 0)} {c.satuan}
                  </td>
                  <td className="py-1.5 px-2">
                    {formatAngka(c.kebutuhan_harian, 1)} {c.satuan}
                  </td>
                  <td className="py-1.5 px-2 font-bold">{formatAngka(c.hari_bertahan, 1)} hari</td>
                  <td className="py-1.5 px-2">{formatRupiah(c.harga_sekarang)}</td>
                  <td className="py-1.5 px-2">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top 3 Risks & Saved Scenarios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-stone-200 space-y-1">
            <p className="font-bold text-stone-900">Tiga Risiko & Peringatan Utama:</p>
            {(report.tiga_risiko_utama || []).map((a: any) => (
              <p key={a.id} className="text-stone-700">
                • <strong>[{a.tingkat}]</strong> {a.judul}
              </p>
            ))}
          </div>
          <div className="p-3 rounded-xl border border-stone-200 space-y-1">
            <p className="font-bold text-stone-900">Tindakan & Catatan Metodologi:</p>
            <p className="text-stone-700">
              • Perhitungan menggunakan standar konservatif FEFO tanpa data pribadi warga.
            </p>
            <p className="text-stone-700">
              • Nilai gizi dan AKG wajib diverifikasi bersama petugas gizi Puskesmas setempat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
