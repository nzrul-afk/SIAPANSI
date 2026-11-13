import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Bell,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  Filter,
  Package,
  Printer,
  Scale,
  Search,
  Settings,
  Sprout,
  Warehouse,
} from 'lucide-react';
import { apiRequest, getApiBase, setCustomApiBase } from '../lib/api';
import { formatAngka, formatRupiah, formatTanggalIndo } from '../lib/format';
import { AccessibleLineChart, AIBadge, StatusBadge } from '../components/common/Primitives';

export const LoginView: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('petugas@siapansa.demo');
  const [password, setPassword] = useState('demo1234');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showServerSetting, setShowServerSetting] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBase());

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      if (serverUrl.trim()) {
        setCustomApiBase(serverUrl.trim());
      }
      const { data } = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('siapansa_token', data.token);
      onLogin();
    } catch (error: any) {
      const msg = error?.message || 'Gagal masuk.';
      setErr(msg.includes('Failed to fetch') ? 'Gagal terhubung ke backend server API. Periksa URL server di bawah.' : msg);
      setShowServerSetting(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-brand-50 to-stone-100">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow-lg border border-stone-200 p-6 space-y-4">
        <div className="text-center space-y-1">
          <img src="/icon-192.svg" alt="" className="w-16 h-16 mx-auto rounded-2xl" />
          <h1 className="text-2xl font-extrabold text-brand-800">SIAPANSA</h1>
          <p className="text-xs text-stone-600">Tahu seberapa lama pangan desa bertahan, sebelum krisis datang.</p>
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full min-h-[48px] px-3 rounded-xl border border-stone-300 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1" htmlFor="pw">Kata Sandi</label>
          <input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full min-h-[48px] px-3 rounded-xl border border-stone-300 text-sm" />
        </div>
        {err && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
            <p className="font-semibold">{err}</p>
            <p className="text-[11px] text-red-600">URL backend: {getApiBase()}</p>
          </div>
        )}
        <button type="submit" disabled={loading} className="w-full min-h-[52px] rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold">
          {loading ? 'Masuk...' : 'Masuk'}
        </button>

        <button
          type="button"
          onClick={() => {
            localStorage.setItem('siapansa_token', 'demo-token-client');
            onLogin();
          }}
          className="w-full min-h-[46px] rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-colors"
        >
          Masuk Mode Demo Langsung (Offline / Data Lokal)
        </button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={() => setShowServerSetting(!showServerSetting)}
            className="text-[11px] text-stone-500 hover:text-brand-700 flex items-center justify-center gap-1 mx-auto"
          >
            <Settings className="w-3.5 h-3.5" />
            {showServerSetting ? 'Tutup Pengaturan Server' : 'Ubah URL Backend API'}
          </button>
        </div>

        {showServerSetting && (
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
            <label className="block font-semibold text-stone-700">URL Backend API</label>
            <input
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              placeholder="https://...trycloudflare.com/api/v1"
              className="w-full px-2 py-1.5 border border-stone-300 rounded text-xs font-mono"
            />
            <p className="text-[10px] text-stone-500">Tersimpan di browser lokal Anda.</p>
          </div>
        )}

        <p className="text-[11px] text-center text-stone-500">Akun demo sudah terisi. Prototipe memakai data simulasi.</p>
      </form>
    </div>
  );
};

export const DashboardView: React.FC<{
  overview: any;
  onNavigate: (tab: string) => void;
}> = ({ overview, onNavigate }) => {
  const [proj, setProj] = useState<any>(null);

  useEffect(() => {
    apiRequest('/status/projection?commodity=c-beras&days=30')
      .then(({ data }) => setProj(data))
      .catch(() => {});
  }, [overview?.as_of, overview?.pool_pokok?.hari_bertahan]);

  if (!overview) return <p className="text-sm text-stone-600">Memuat data desa...</p>;
  const { pool_pokok: pk, pool_protein: pr, titik_terlemah: tl, skor_ketahanan: sk } = overview;
  const alerts = overview.peringatan_teratas || [];
  const hargaNaik = [...(overview.komoditas || [])]
    .sort((a, b) => b.perubahan_harga_7d_pct - a.perubahan_harga_7d_pct)
    .slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-stone-200 p-5 shadow-sm">
        <p className="text-xs font-bold text-stone-500">Jika pasokan luar berhenti, pangan pokok desa bertahan</p>
        <div className="flex flex-wrap items-end gap-3 mt-1">
          <span className="text-5xl font-extrabold text-stone-900">{formatAngka(pk.hari_bertahan, 1)}</span>
          <span className="text-lg font-bold text-stone-700 pb-1.5">hari</span>
          <StatusBadge status={pk.status} bawah72Jam={pk.bawah_72_jam} size="lg" />
        </div>
        <div className="h-2 rounded-full bg-stone-200 mt-3 overflow-hidden">
          <div className="h-full bg-brand-600" style={{ width: `${pk.progress_target_pct}%` }} />
        </div>
        <p className="text-xs text-stone-600 mt-1">{formatAngka(pk.progress_target_pct, 0)}% dari target {overview.target_hari} hari</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-stone-500">Kelompok Protein</p>
          <p className="text-2xl font-extrabold">{formatAngka(pr.hari_bertahan, 1)} hari</p>
          <StatusBadge status={pr.status} size="sm" />
        </div>
        <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-stone-500">Titik Terlemah</p>
          <p className="text-2xl font-extrabold">{tl.nama}</p>
          <p className="text-xs text-stone-700 mb-1">{formatAngka(tl.hari_bertahan, 1)} hari</p>
          <StatusBadge status={tl.status} size="sm" />
        </div>
        <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-sm">
          <p className="text-xs font-bold text-stone-500">Skor Ketahanan</p>
          <p className="text-2xl font-extrabold text-brand-800">{formatAngka(sk.skor_total, 1)} <span className="text-sm text-stone-500">/ 100</span></p>
          <p className="text-[11px] text-stone-600">
            Ketersediaan {formatAngka(sk.ketersediaan, 0)} · Akses {formatAngka(sk.akses, 0)} · Pemanfaatan {formatAngka(sk.pemanfaatan, 0)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm flex items-center gap-1.5"><Bell className="w-4 h-4 text-brand-700" />Perlu Tindakan</h3>
          <button type="button" onClick={() => onNavigate('peringatan')} className="text-xs font-bold text-brand-700 underline">
            Lihat semua ({overview.jumlah_peringatan_aktif ?? overview.peringatan_teratas?.length ?? 2})
          </button>
        </div>
        {alerts.length === 0 && <p className="text-xs text-stone-600">Tidak ada peringatan aktif.</p>}
        {alerts.map((a: any) => (
          <button key={a.id} type="button" onClick={() => onNavigate('peringatan')} className="w-full text-left p-3 rounded-xl border border-stone-200 hover:bg-stone-50 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-stone-900">{a.judul}</span>
            <StatusBadge status={a.tingkat} size="sm" />
          </button>
        ))}
      </div>

      {proj && (
        <AccessibleLineChart
          title="Proyeksi Stok Beras 30 Hari (tanpa pasokan luar)"
          altDescription="Grafik proyeksi stok beras selama 30 hari ke depan dibanding ambang aman, waspada, dan siaga."
          data={proj.proyeksi.filter((_: any, i: number) => i % 2 === 0)}
          xKey="hari_ke"
          unit="kg"
          lines={[
            { key: 'stok', label: 'Stok beras', color: '#15803d' },
            { key: 'ambang_aman', label: 'Batas Aman', color: '#0ea5e9', dashed: true },
            { key: 'ambang_siaga', label: 'Batas Siaga', color: '#ea580c', dashed: true },
          ]}
        />
      )}

      <div className="rounded-2xl bg-white border border-stone-200 p-4 shadow-sm">
        <h3 className="font-bold text-sm mb-2">Ringkasan Harga (kenaikan 7 hari tertinggi)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {hargaNaik.map((c: any) => (
            <div key={c.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200">
              <p className="font-bold">{c.nama}</p>
              <p>{formatRupiah(c.harga_sekarang)}/{c.satuan}</p>
              <p className={c.perubahan_harga_7d_pct >= 10 ? 'font-bold text-red-700' : 'text-stone-600'}>
                {c.perubahan_harga_7d_pct >= 0 ? '+' : ''}{formatAngka(c.perubahan_harga_7d_pct, 1)}% (7 hari)
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StockView: React.FC<{
  overview: any;
  warehouses: Array<any>;
  onOpenSheet: (commodityId?: string) => void;
  onOpname: (commodity: any) => void;
}> = ({ overview, warehouses, onOpenSheet, onOpname }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [search, setSearch] = useState<string>('');
  const [selectedKelompok, setSelectedKelompok] = useState<string>('semua');
  const [hanyaWaspada, setHanyaWaspada] = useState<boolean>(false);

  useEffect(() => {
    if (!openId) return setDetail(null);
    apiRequest(`/stock/${openId}`).then(({ data }) => setDetail(data)).catch(() => {});
  }, [openId, overview?.as_of, overview?.pool_pokok?.hari_bertahan]);

  const kelompokLabel: Record<string, string> = { pokok: 'Pokok', protein: 'Protein', pelengkap: 'Pelengkap' };

  const allComms: Array<any> = overview?.komoditas || [];

  // Filter logic
  const filteredComms = allComms.filter((c: any) => {
    const matchSearch = c.nama.toLowerCase().includes(search.toLowerCase()) || c.kode.toLowerCase().includes(search.toLowerCase());
    const matchKelompok = selectedKelompok === 'semua' || c.kelompok === selectedKelompok;
    const matchWaspada = !hanyaWaspada || (c.status === 'Waspada' || c.status === 'Siaga' || c.status === 'Kritis');
    return matchSearch && matchKelompok && matchWaspada;
  });

  // Calculate summary metrics
  const totalBahan = allComms.length;
  const countWaspada = allComms.filter((c: any) => c.status === 'Waspada' || c.status === 'Siaga' || c.status === 'Kritis').length;
  const countSegeraExp = allComms.filter((c: any) => c.segera_kedaluwarsa).length;

  return (
    <div className="space-y-4">
      {/* 1. Top Header & Primary Action */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold flex items-center gap-2 text-stone-900">
            <ClipboardList className="w-5 h-5 text-brand-700" />
            Buku Stok & Inventaris Lumbung Desa
          </h2>
          <p className="text-xs text-stone-600">
            Pencatatan mutasi, pelacakan lot kedaluwarsa FEFO, dan audit fisik opname lumbung
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onOpenSheet()}
            className="min-h-[44px] px-4 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Package className="w-4 h-4" />
            + Catat Mutasi Stok
          </button>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <p className="text-stone-500 font-semibold flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-brand-700" /> Total Bahan
          </p>
          <p className="text-lg font-extrabold text-stone-900">{totalBahan} Komoditas</p>
          <p className="text-[11px] text-stone-500">10 komoditas strategis desa</p>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <p className="text-stone-500 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Status Perhatian
          </p>
          <p className="text-lg font-extrabold text-amber-700">{countWaspada} Waspada</p>
          <p className="text-[11px] text-stone-500">Cadangan di bawah 21 hari</p>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <p className="text-stone-500 font-semibold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-orange-600" /> Peringatan FEFO
          </p>
          <p className="text-lg font-extrabold text-stone-900">{countSegeraExp} Komoditas</p>
          <p className="text-[11px] text-orange-700 font-medium">&lt; 30 hari masa simpan</p>
        </div>

        <div className="p-3 rounded-2xl bg-white border border-stone-200 shadow-sm space-y-1">
          <p className="text-stone-500 font-semibold flex items-center gap-1">
            <Warehouse className="w-3.5 h-3.5 text-emerald-600" /> Simpul Utama
          </p>
          <p className="text-lg font-extrabold text-emerald-800">Lumbung Desa</p>
          <p className="text-[11px] text-stone-500">Kapasitas aman terkontrol</p>
        </div>
      </div>

      {/* 3. Search and Category Filter Toolbar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-3 shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama komoditas (misal: Beras, Kedelai, Minyak)..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:border-brand-600"
            />
          </div>
          <button
            type="button"
            onClick={() => setHanyaWaspada(!hanyaWaspada)}
            className={`min-h-[38px] px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition ${
              hanyaWaspada
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {hanyaWaspada ? 'Hanya Waspada/Kritis: Aktif' : 'Semua Status'}
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {['semua', 'pokok', 'protein', 'pelengkap'].map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setSelectedKelompok(k)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                selectedKelompok === k
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {k === 'semua' ? 'Semua Komoditas' : kelompokLabel[k]}
            </button>
          ))}
        </div>
      </div>

      {/* 4. List of Commodities */}
      {filteredComms.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white border border-stone-200 text-center text-sm text-stone-500">
          Tidak ada komoditas yang cocok dengan kata kunci atau filter pencarian.
        </div>
      ) : (
        filteredComms.map((c: any) => {
          const isOpen = openId === c.id;
          const targetHari = 30;
          const pct = Math.min(100, Math.round((c.hari_bertahan / targetHari) * 100));
          const isWarning = c.status === 'Waspada' || c.status === 'Siaga' || c.status === 'Kritis';

          return (
            <div
              key={c.id}
              className={`rounded-2xl bg-white border transition shadow-sm overflow-hidden ${
                isOpen ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : c.id)}
                className="w-full text-left p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                aria-expanded={isOpen}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-extrabold text-base text-stone-900">{c.nama}</p>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-bold">
                      {kelompokLabel[c.kelompok]}
                    </span>
                    <span className="text-[11px] font-medium text-stone-500">
                      Rp {formatAngka(c.harga_sekarang, 0)}/{c.satuan}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Stok efektif: <strong>{formatAngka(c.stok_efektif, 0)} {c.satuan}</strong> · Kebutuhan: {formatAngka(c.kebutuhan_harian, 1)} {c.satuan}/hari
                  </p>
                  {c.segera_kedaluwarsa && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
                      <Clock className="w-3 h-3 text-amber-700" />
                      {formatAngka(c.stok_segera_kedaluwarsa_7d, 0)} {c.satuan} mendekati masa simpan FEFO
                    </div>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xl font-extrabold text-stone-900">
                      {c.lebih_dari_180_hari ? '>180' : formatAngka(c.hari_bertahan, 1)} <span className="text-xs font-normal text-stone-500">hari</span>
                    </p>
                    <StatusBadge status={c.status} bawah72Jam={c.bawah_72_jam} size="sm" />
                    {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                  </div>

                  {/* Progress bar */}
                  <div className="w-28 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        c.status === 'Aman' ? 'bg-emerald-600' : isWarning ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-stone-400">Target: 30 hari</span>
                </div>
              </button>

              {/* Accordion Detail: Rincian Simpul, Aksi, Batch FEFO, dan Transaksi */}
              {isOpen && (
                <div className="border-t border-stone-200 bg-stone-50/70 p-4 space-y-4 text-xs">
                  {/* Sebaran Stok per Simpul */}
                  <div>
                    <p className="font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                      <Warehouse className="w-4 h-4 text-brand-700" />
                      Sebaran Stok di Simpul Desa:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(c.rincian_sumber || {}).map(([k, v]) => (
                        <div key={k} className="p-2.5 rounded-xl bg-white border border-stone-200 shadow-2xs">
                          <p className="text-stone-500 text-[11px]">{k}</p>
                          <p className="font-extrabold text-stone-900 text-sm">
                            {formatAngka(Number(v), 0)} <span className="text-[10px] font-normal">{c.satuan}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tombol Aksi Langsung */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onOpenSheet(c.id)}
                      className="min-h-[40px] px-3.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Package className="w-3.5 h-3.5" />
                      Catat Mutasi {c.nama}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpname(c)}
                      className="min-h-[40px] px-3.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 font-bold flex items-center gap-1.5 transition"
                    >
                      <Scale className="w-3.5 h-3.5 text-stone-600" />
                      Periksa Fisik (Opname)
                    </button>
                  </div>

                  {/* Detail Batch FEFO & Riwayat Transaksi */}
                  {detail ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {/* Daftar Batch FEFO */}
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                        <p className="font-bold text-stone-900 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-brand-700" />
                          Lot Simpan (Urut Kedaluwarsa / FEFO)
                        </p>
                        <div className="space-y-1.5">
                          {(detail.batches || []).map((b: any) => (
                            <div
                              key={b.id}
                              className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between gap-2"
                            >
                              <div>
                                <p className="font-extrabold text-stone-800 text-xs">
                                  {b.warehouse_nama}
                                </p>
                                <p className="text-[11px] text-stone-500">
                                  Kedaluwarsa: {formatTanggalIndo(b.expiry_date)} ({b.sisa_hari_simpan} hari lagi)
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-extrabold text-stone-900">
                                  {formatAngka(b.jumlah_sisa, 0)} {c.satuan}
                                </span>
                                {b.status_batch === 'segera_kedaluwarsa' ? (
                                  <span className="block text-[10px] font-bold text-amber-700">
                                    Prioritas Salur
                                  </span>
                                ) : (
                                  <span className="block text-[10px] text-emerald-700 font-semibold">
                                    Kondisi Baik
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Riwayat Mutasi Buku Stok */}
                      <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                        <p className="font-bold text-stone-900 flex items-center gap-1.5">
                          <ClipboardList className="w-4 h-4 text-brand-700" />
                          Riwayat Catatan Mutasi Terakhir
                        </p>
                        <div className="space-y-1.5">
                          {(detail.transaksi || []).slice(0, 5).map((t: any) => {
                            const isMasuk = t.jenis.startsWith('masuk');
                            return (
                              <div
                                key={t.id}
                                className="p-2 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between gap-2"
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        isMasuk
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {isMasuk ? '+ Masuk' : '- Keluar'}
                                    </span>
                                    <span className="text-stone-700 font-semibold text-xs capitalize">
                                      {t.jenis.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-500">
                                    {formatTanggalIndo(t.tanggal)}{t.catatan ? ` · ${t.catatan}` : ''}
                                  </p>
                                </div>
                                <div className="text-right font-extrabold text-stone-900">
                                  {isMasuk ? '+' : '-'}{formatAngka(t.jumlah, 1)} {t.satuan}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-stone-400 italic py-2 text-center">
                      Memuat detail lot FEFO & riwayat transaksi...
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export const PublicReportView: React.FC<{ token: string }> = ({ token }) => {
  const [snap, setSnap] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    apiRequest(`/public/reports/${token}`)
      .then(({ data }) => {
        setSnap(data.snapshot);
      })
      .catch((e) => setErr(e?.message || 'Gagal memuat laporan publik.'));
  }, [token]);

  if (err) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
        <div className="bg-white p-6 rounded-2xl border border-red-200 text-center max-w-md space-y-3 shadow-sm">
          <p className="font-extrabold text-red-800 text-base">Tautan Tidak Ditemukan atau Sudah Kedaluwarsa</p>
          <p className="text-xs text-stone-600">{err}</p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-brand-700 text-white text-xs font-bold"
          >
            Buka Beranda SIAPANSA
          </a>
        </div>
      </div>
    );
  }

  if (!snap) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
        <p className="text-sm font-semibold text-stone-600">Memuat laporan resmi desa...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-6 space-y-4">
      {/* Top Bar Navigation */}
      <div className="no-print max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 bg-white border border-stone-200 p-3 rounded-2xl shadow-sm">
        <a
          href="/"
          className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Masuk ke Aplikasi SIAPANSA
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-3.5 py-2 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          Cetak / Simpan PDF (A4)
        </button>
      </div>

      {/* A4 Sheet Container */}
      <div className="print-only-a4 max-w-4xl mx-auto bg-white border border-stone-300 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="border-b-2 border-stone-800 pb-3 flex items-start justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-800">
              LAPORAN RESMI KETAHANAN PANGAN DESA — SIAPANSA
            </span>
            <h1 className="text-xl font-extrabold text-stone-900">{snap.desa?.nama}</h1>
            <p className="text-xs text-stone-600">
              Periode: {snap.periode_hari} Hari Terakhir · Tanggal: {formatTanggalIndo(snap.tanggal_cetak)} · Penduduk:{' '}
              {formatAngka(snap.desa?.jumlah_penduduk, 0)} Jiwa
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="inline-block px-2.5 py-1 rounded bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold">
              Tautan Publik Resmi
            </span>
          </div>
        </div>

        {/* Narrative Summary */}
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs leading-relaxed text-stone-800">
          <div className="flex items-center justify-between mb-1">
            <strong className="text-stone-900 font-bold">Ringkasan Eksekutif Ketahanan Pangan:</strong>
            <AIBadge />
          </div>
          <p>{snap.ringkasan_naratif}</p>
        </div>

        {/* 4 Key Metrics */}
        {snap.pool_pokok && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Cadangan Pokok</span>
              <strong className="text-base text-stone-900">
                {formatAngka(snap.pool_pokok.hari_bertahan, 1)} hari ({snap.pool_pokok.status})
              </strong>
            </div>
            <div className="p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Cadangan Protein</span>
              <strong className="text-base text-stone-900">
                {formatAngka(snap.pool_protein?.hari_bertahan, 1)} hari ({snap.pool_protein?.status})
              </strong>
            </div>
            <div className="p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Titik Terlemah</span>
              <strong className="text-base text-amber-800">
                {snap.titik_terlemah?.nama} ({formatAngka(snap.titik_terlemah?.hari_bertahan, 1)} hr)
              </strong>
            </div>
            <div className="p-3 rounded-xl border border-stone-200">
              <span className="text-stone-500 block">Skor Ketahanan</span>
              <strong className="text-base text-brand-800">
                {formatAngka(snap.skor_ketahanan?.skor_total, 1)} / 100
              </strong>
            </div>
          </div>
        )}

        {/* Commodity Table */}
        <div>
          <h3 className="font-bold text-xs uppercase text-stone-700 mb-2">
            Status Cadangan 10 Komoditas Pangan Lumbung Desa
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-stone-200">
              <thead>
                <tr className="bg-stone-100 border-b border-stone-200">
                  <th className="py-2 px-2.5">Komoditas</th>
                  <th className="py-2 px-2.5">Kelompok</th>
                  <th className="py-2 px-2.5">Stok Efektif</th>
                  <th className="py-2 px-2.5">Kebutuhan/Hari</th>
                  <th className="py-2 px-2.5">Hari Bertahan</th>
                  <th className="py-2 px-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {(snap.komoditas || []).map((c: any) => {
                  const isSafe = c.status === 'Aman';
                  const isWarning = c.status === 'Waspada';
                  return (
                    <tr key={c.id} className="border-b border-stone-200">
                      <td className="py-2 px-2.5 font-bold text-stone-900">{c.nama}</td>
                      <td className="py-2 px-2.5 capitalize text-stone-600">{c.kelompok}</td>
                      <td className="py-2 px-2.5">
                        {formatAngka(c.stok_efektif, 0)} {c.satuan}
                      </td>
                      <td className="py-2 px-2.5">
                        {formatAngka(c.kebutuhan_harian, 1)} {c.satuan}
                      </td>
                      <td className="py-2 px-2.5 font-bold text-stone-900">
                        {formatAngka(c.hari_bertahan, 1)} hari
                      </td>
                      <td className="py-2 px-2.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSafe
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isWarning
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Disclaimer */}
        <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-500 space-y-1">
          <p>• Diterbitkan secara resmi oleh SIAPANSA untuk transparansi Musyawarah Desa.</p>
          <p>• Data dihitung menggunakan prinsip konservatif FEFO tanpa memuat identitas pribadi warga desa.</p>
          <p className="italic">Dibuat AI, periksa kembali sebelum bertindak.</p>
        </div>
      </div>
    </div>
  );
};

export const EmptyIcon = Sprout;
