import React, { useEffect, useState } from 'react';
import {
  Bell,
  BookOpen,
  Clock,
  FastForward,
  Info,
  RotateCcw,
  Save,
  Settings,
  Users,
  Zap,
} from 'lucide-react';
import { apiRequest } from '../lib/api';
import { formatAngka, formatTanggalIndo } from '../lib/format';
import { AIBadge, StatusBadge } from '../components/common/Primitives';

/**
 * F5: Peringatan Dini
 */
export const AlertsListView: React.FC<{
  onNavigate: (tab: string) => void;
  onRefreshOverview: () => void;
}> = ({ onNavigate, onRefreshOverview }) => {
  const [alerts, setAlerts] = useState<Array<any>>([]);
  const [filterTingkat, setFilterTingkat] = useState<string>('semua');
  const [loading, setLoading] = useState<boolean>(false);

  const loadAlerts = async (tingkat = filterTingkat) => {
    setLoading(true);
    try {
      const q = tingkat !== 'semua' ? `?tingkat=${encodeURIComponent(tingkat)}` : '';
      const { data } = await apiRequest(`/alerts${q}`);
      setAlerts(data.peringatan || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAlerts(filterTingkat);
  }, [filterTingkat]);

  const handleUpdateAlertStatus = async (alertId: string, status: string, tunda24Jam = false) => {
    await apiRequest(`/alerts/${alertId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, tunda_24_jam: tunda24Jam }),
    });
    await loadAlerts(filterTingkat);
    onRefreshOverview();
  };

  const handleActionClick = (tindakan: string) => {
    if (tindakan === 'jalankan_simulasi') onNavigate('simulasi');
    else if (tindakan === 'lihat_bantuan') onNavigate('jaringan');
    else if (tindakan === 'buat_menu_substitusi') onNavigate('menu');
    else onNavigate('stok');
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-stone-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-700" />
            Peringatan Dini Ketahanan Pangan (R1–R8)
          </h2>
          <p className="text-xs text-stone-600">
            Mengubah sinyal stok, lonjakan harga, dan risiko global menjadi tindakan cepat sebelum terlambat
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['semua', 'Kritis', 'Siaga', 'Waspada', 'Info'].map((lv) => (
            <button
              key={lv}
              type="button"
              onClick={() => setFilterTingkat(lv)}
              className={`min-h-[40px] px-3 rounded-xl text-xs font-bold border transition ${
                filterTingkat === lv
                  ? 'bg-brand-700 text-white border-brand-800'
                  : 'bg-stone-100 text-stone-700 border-stone-200'
              }`}
            >
              {lv === 'semua' ? 'Semua Tingkat' : lv}
            </button>
          ))}
        </div>
      </div>

      {alerts.length === 0 && !loading ? (
        <div className="p-6 rounded-2xl border border-stone-200 bg-white text-center text-sm text-stone-600">
          Tidak ada peringatan aktif pada tingkat filter ini.
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a: any) => (
            <div
              key={a.id}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge status={a.tingkat} size="sm" />
                    <span className="text-xs font-bold text-stone-500">
                      Aturan {a.rule_code} · {a.commodity_nama || 'Desa'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px] font-semibold">
                      Status: {a.status}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-stone-900">{a.judul}</h3>
                </div>
                <AIBadge sumber={a.sumber_penjelasan} />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                <p className="text-stone-900 font-medium">{a.penjelasan}</p>
                <p className="text-stone-600">
                  <strong>Kenapa ini penting untuk desa kita?</strong> {a.kenapa_penting}
                </p>
                <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-stone-500">
                  <span>Data Pemicu Engine:</span>
                  {Object.entries(a.data_pemicu || {}).map(([k, v]) => (
                    <span key={k} className="px-2 py-0.5 rounded bg-white border border-stone-200 font-mono">
                      {k}: {String(v)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleActionClick(a.tindakan)}
                    className="min-h-[42px] px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold"
                  >
                    {a.tindakan === 'jalankan_simulasi'
                      ? 'Jalankan Simulasi Guncangan'
                      : a.tindakan === 'lihat_bantuan'
                      ? 'Lihat Opsi Bantuan Desa'
                      : 'Buat Menu Substitusi Lokal'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 text-xs">
                  {['Dilihat', 'Sedang ditangani', 'Selesai'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateAlertStatus(a.id, st, false)}
                      className={`min-h-[38px] px-2.5 rounded-lg border font-semibold ${
                        a.status === st
                          ? 'bg-stone-800 text-white border-stone-900'
                          : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                  {a.tingkat !== 'Kritis' && (
                    <button
                      type="button"
                      onClick={() => handleUpdateAlertStatus(a.id, a.status, true)}
                      className="min-h-[38px] px-2.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-600 font-semibold hover:bg-stone-100"
                    >
                      Tunda 24 Jam
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * F4 & F14: Mode Demo, Penduduk & Norma Konsumsi, Pengaturan, dan Tentang Esai
 */
export const SettingsAndDemoView: React.FC<{
  commodities: Array<any>;
  onRefreshOverview: () => void;
  onNavigate: (tab: string) => void;
}> = ({ commodities, onRefreshOverview, onNavigate }) => {
  const [subTab, setSubTab] = useState<'demo' | 'penduduk' | 'pengaturan' | 'tentang'>('demo');
  const [pop, setPop] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);
  const [events, setEvents] = useState<Array<any>>([]);
  const [normaEdits, setNormaEdits] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const loadData = async () => {
    const [pRes, sRes, eRes] = await Promise.all([
      apiRequest('/population'),
      apiRequest('/settings'),
      apiRequest('/global/events'),
    ]);
    setPop(pRes.data);
    setSettings(sRes.data);
    setEvents(eRes.data.peristiwa || []);
    const map: Record<string, string> = {};
    commodities.forEach((c) => {
      map[c.id] = String(c.norma_per_kapita_hari);
    });
    setNormaEdits(map);
  };

  useEffect(() => {
    void loadData();
  }, [commodities.length]);

  const showToast = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(''), 4000);
  };

  const handleAdvanceTime = async (days: number) => {
    setLoading(true);
    try {
      const { data } = await apiRequest('/demo/advance', {
        method: 'POST',
        body: JSON.stringify({ days }),
      });
      showToast(data.pesan);
      await loadData();
      onRefreshOverview();
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerDemoEvent = async (eventId: string, aktif: boolean) => {
    setLoading(true);
    try {
      await apiRequest('/demo/event', {
        method: 'POST',
        body: JSON.stringify({ event_id: eventId, aktif }),
      });
      showToast(aktif ? 'Peristiwa global diaktifkan!' : 'Peristiwa global dihentikan.');
      await loadData();
      onRefreshOverview();
    } finally {
      setLoading(false);
    }
  };

  const handleResetSeed = async () => {
    setLoading(true);
    try {
      const { data } = await apiRequest('/demo/reset', { method: 'POST' });
      showToast(data.pesan);
      await loadData();
      onRefreshOverview();
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTransferDemo = async () => {
    try {
      const { data } = await apiRequest('/demo/approve-transfer', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      showToast(data.pesan);
      onRefreshOverview();
    } catch (err: any) {
      showToast(err?.message || 'Belum ada pengajuan transfer keluar yang menunggu persetujuan.');
    }
  };

  const handleSavePopulation = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiRequest('/population', {
      method: 'PUT',
      body: JSON.stringify(pop),
    });
    showToast('Data jumlah penduduk berhasil diperbarui dan Hari Bertahan dihitung ulang.');
    onRefreshOverview();
  };

  const handleSaveNorma = async (commId: string) => {
    const val = parseFloat(normaEdits[commId]);
    if (!val || val <= 0) return;
    await apiRequest(`/commodities/${commId}/norma`, {
      method: 'PUT',
      body: JSON.stringify({ norma_per_kapita_hari: val }),
    });
    showToast('Norma konsumsi diperbarui dan Hari Bertahan di Beranda telah disesuaikan.');
    onRefreshOverview();
  };

  const handleSaveSettings = async (patch: any) => {
    const { data } = await apiRequest('/settings', {
      method: 'PUT',
      body: JSON.stringify(patch),
    });
    setSettings(data);
    showToast('Pengaturan berhasil disimpan.');
    onRefreshOverview();
  };

  return (
    <div className="space-y-4">
      {/* Sub-navigation */}
      <div className="flex flex-wrap rounded-xl bg-stone-200/80 p-1 gap-1">
        {[
          { id: 'demo', label: 'Panel Demo (F14)', icon: Zap },
          { id: 'penduduk', label: 'Penduduk & Norma (F4)', icon: Users },
          { id: 'pengaturan', label: 'Ambang & AI', icon: Settings },
          { id: 'tentang', label: 'Tentang & Rujukan Esai', icon: BookOpen },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id as any)}
              className={`flex-1 min-h-[44px] px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                subTab === t.id ? 'bg-white text-brand-800 shadow-sm' : 'text-stone-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-950">
          {msg}
        </div>
      )}

      {subTab === 'demo' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  Panel Kendali Mode Demo (Bagian 14 & 17 PRD)
                </h3>
                <p className="text-xs text-stone-600">
                  Jam Virtual Server Saat Ini:{' '}
                  <strong>{formatTanggalIndo(settings?.jam_virtual)}</strong>
                </p>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={handleResetSeed}
                className="min-h-[46px] px-4 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Data ke Kondisi Awal (Seed &lt; 5 Detik)
              </button>
            </div>

            {/* 1. Virtual Clock Controls */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <p className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <FastForward className="w-4 h-4 text-brand-700" />
                1. Majukan Waktu Virtual (Simulasi Konsumsi Harian, Kedaluwarsa Batch, & Jadwal Panen):
              </p>
              <div className="flex flex-wrap gap-2">
                {[1, 7, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    disabled={loading}
                    onClick={() => handleAdvanceTime(d)}
                    className="min-h-[44px] px-4 rounded-xl bg-white border border-stone-300 hover:bg-brand-50 hover:border-brand-500 text-xs font-bold text-stone-900"
                  >
                    + Maju {d} Hari
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Trigger Global Events */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
              <p className="text-xs font-bold text-stone-800">
                2. Picu atau Hentikan Peristiwa Guncangan Global (Mengubah Sinyal, Harga Lokal +19%, & Peringatan R2/R3):
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {events.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    disabled={loading}
                    onClick={() => handleTriggerDemoEvent(ev.id, !ev.aktif)}
                    className={`p-3 rounded-xl border text-left text-xs transition ${
                      ev.aktif
                        ? 'bg-red-700 text-white border-red-800 font-bold'
                        : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <span className="block font-bold">{ev.nama}</span>
                    <span className="text-[11px] opacity-90">
                      {ev.aktif ? '✓ Sedang Aktif (Ketuk untuk Hentikan)' : 'Ketuk untuk Memicu Krisis'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Inter-village approval simulation */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs">
                <p className="font-bold text-stone-800">3. Simulasikan Persetujuan Permintaan Antar Desa</p>
                <p className="text-stone-600">
                  Mengubah status permintaan bantuan terakhir menjadi Diterima dan menambah stok lumbung otomatis.
                </p>
              </div>
              <button
                type="button"
                onClick={handleApproveTransferDemo}
                className="min-h-[44px] px-4 rounded-xl bg-emerald-700 text-white text-xs font-bold"
              >
                Simulasikan Persetujuan Desa Donor
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'penduduk' && pop && (
        <div className="space-y-4">
          <form
            onSubmit={handleSavePopulation}
            className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-4"
          >
            <h3 className="text-base font-extrabold text-stone-900">
              Data Agregat Penduduk Desa Sidomulyo (Tanpa Identitas Pribadi / NIK)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { key: 'total', label: 'Total Penduduk (Jiwa)' },
                { key: 'kk', label: 'Jumlah KK' },
                { key: 'balita', label: 'Balita (0–5 Thn)' },
                { key: 'ibu_hamil_menyusui', label: 'Ibu Hamil/Menyusui' },
                { key: 'lansia', label: 'Lansia' },
              ].map((fld) => (
                <div key={fld.key}>
                  <label className="block text-xs font-bold text-stone-700 mb-1">{fld.label}</label>
                  <input
                    type="number"
                    min="0"
                    value={pop[fld.key] ?? 0}
                    onChange={(e) => setPop({ ...pop, [fld.key]: Number(e.target.value) })}
                    className="w-full min-h-[46px] px-3 rounded-xl border border-stone-300 text-sm font-bold"
                  />
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950">
              {pop.catatan_akg}
            </div>
            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-xl bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Simpan Perubahan Penduduk
            </button>
          </form>

          {/* Editable Consumption Norms */}
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3">
            <h3 className="text-base font-extrabold text-stone-900">
              Tabel Norma Konsumsi per Orang per Hari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {commodities.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-stone-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-bold text-stone-900">{c.nama}</p>
                    <p className="text-stone-500">
                      Kebutuhan desa: {formatAngka(c.kebutuhan_harian, 1)} {c.satuan}/hari
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={normaEdits[c.id] ?? c.norma_per_kapita_hari}
                      onChange={(e) => setNormaEdits({ ...normaEdits, [c.id]: e.target.value })}
                      className="w-24 min-h-[38px] px-2 rounded-lg border border-stone-300 font-bold text-right"
                    />
                    <span className="text-stone-600">{c.satuan}</span>
                    <button
                      type="button"
                      onClick={() => handleSaveNorma(c.id)}
                      className="min-h-[38px] px-2.5 rounded-lg bg-brand-700 text-white font-bold"
                    >
                      Simpan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'pengaturan' && settings && (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-stone-900">
            Pengaturan Ambang Status, Target Cadangan, & Saklar AI (LLM)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-stone-200">
              <label className="font-bold text-stone-700 block mb-1">Target Hari Cadangan Desa</label>
              <input
                type="number"
                value={settings.target_hari ?? 30}
                onChange={(e) => handleSaveSettings({ target_hari: Number(e.target.value) })}
                className="w-full min-h-[42px] px-3 rounded-lg border border-stone-300 font-bold text-sm"
              />
            </div>
            <div className="p-3 rounded-xl border border-stone-200">
              <label className="font-bold text-stone-700 block mb-1">Batas Aman Desa Donor (Hari)</label>
              <input
                type="number"
                value={settings.batas_donor ?? 21}
                onChange={(e) => handleSaveSettings({ batas_donor: Number(e.target.value) })}
                className="w-full min-h-[42px] px-3 rounded-lg border border-stone-300 font-bold text-sm"
              />
            </div>
            <div className="p-3 rounded-xl border border-stone-200 flex flex-col justify-between">
              <span className="font-bold text-stone-700">Saklar Gunakan AI (LLM)</span>
              <button
                type="button"
                onClick={() => handleSaveSettings({ ai_enabled: !settings.ai_enabled })}
                className={`mt-2 min-h-[42px] px-3 rounded-xl font-bold text-xs ${
                  settings.ai_enabled
                    ? 'bg-emerald-700 text-white'
                    : 'bg-stone-200 text-stone-800'
                }`}
              >
                {settings.ai_enabled ? '✓ AI Aktif (Dengan Fallback Template)' : 'Mode Template Deterministik Saja'}
              </button>
            </div>
          </div>
        </div>
      )}

      {subTab === 'tentang' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm space-y-3 text-xs leading-relaxed text-stone-700">
          <h3 className="text-base font-extrabold text-stone-900">
            Tentang SIAPANSA & Rujukan Esai Ilmiah
          </h3>
          <p>
            <strong>SIAPANSA</strong> (<em>"Tahu seberapa lama pangan desa bertahan, sebelum krisis datang"</em>) dikembangkan oleh <strong>Kelompok 11, Politeknik Negeri Malang</strong> untuk tema Ketahanan Pangan dan Gizi Masyarakat.
          </p>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <p className="font-bold text-stone-900">Latar Belakang & Rujukan Esai (Bukan Data Real-Time):</p>
            <p>• Laporan SOFI 2026 (FAO, IFAD, UNICEF, WFP, WHO): Sekitar 645 juta orang kelaparan pada 2025 dan 2,69 miliar belum mampu membeli makanan sehat.</p>
            <p>• Ketergantungan Impor (Bisnis.com, 2026): Kebutuhan gandum nasional (11,76 juta ton) 100% berasal dari impor dan sekitar 90% kedelai diimpor dengan dolar AS.</p>
            <p>• Gizi & Stunting (Kemenkes RI SSGI 2024): Prevalensi stunting nasional berada pada 19,8% (sekitar 4,4 juta balita).</p>
            <p>• Kesiapsiagaan Krisis (CNN / Komisi Eropa, 2025): Imbauan menyiapkan persediaan pangan mandiri minimal 72 jam.</p>
          </div>
        </div>
      )}
    </div>
  );
};
