import React, { useEffect, useState } from 'react';
import { Bell, ClipboardList, Scale, Settings, Sprout } from 'lucide-react';
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
            Lihat semua ({overview.jumlah_peringatan_aktif})
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

  useEffect(() => {
    if (!openId) return setDetail(null);
    apiRequest(`/stock/${openId}`).then(({ data }) => setDetail(data)).catch(() => {});
  }, [openId, overview?.as_of, overview?.pool_pokok?.hari_bertahan]);

  const kelompokLabel: Record<string, string> = { pokok: 'Pokok', protein: 'Protein', pelengkap: 'Pelengkap' };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-extrabold flex items-center gap-2"><ClipboardList className="w-5 h-5 text-brand-700" />Stok Pangan Desa</h2>
        <button type="button" onClick={() => onOpenSheet()} className="min-h-[48px] px-5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white font-bold text-sm">
          + Catat Stok
        </button>
      </div>
      {(overview?.komoditas || []).map((c: any) => (
        <div key={c.id} className="rounded-2xl bg-white border border-stone-200 shadow-sm">
          <button type="button" onClick={() => setOpenId(openId === c.id ? null : c.id)} className="w-full text-left p-4 flex flex-wrap items-center justify-between gap-2" aria-expanded={openId === c.id}>
            <div>
              <p className="font-extrabold text-stone-900">{c.nama} <span className="text-[11px] font-semibold text-stone-500">· {kelompokLabel[c.kelompok]}</span></p>
              <p className="text-xs text-stone-600">
                Stok {formatAngka(c.stok_efektif, 0)} {c.satuan} · butuh {formatAngka(c.kebutuhan_harian, 1)} {c.satuan}/hari
              </p>
              {c.segera_kedaluwarsa && <p className="text-[11px] font-bold text-amber-800">{formatAngka(c.stok_segera_kedaluwarsa_7d, 0)} {c.satuan} segera kedaluwarsa</p>}
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold">{c.lebih_dari_180_hari ? '>180' : formatAngka(c.hari_bertahan, 1)} <span className="text-xs">hari</span></p>
              <StatusBadge status={c.status} bawah72Jam={c.bawah_72_jam} size="sm" />
            </div>
          </button>
          {openId === c.id && (
            <div className="border-t border-stone-200 p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.entries(c.rincian_sumber || {}).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg bg-stone-50 border border-stone-200">
                    <p className="text-stone-500">{k}</p>
                    <p className="font-bold">{formatAngka(Number(v), 0)} {c.satuan}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => onOpenSheet(c.id)} className="min-h-[44px] px-3 rounded-xl bg-brand-700 text-white font-bold">Catat {c.nama}</button>
                <button type="button" onClick={() => onOpname(c)} className="min-h-[44px] px-3 rounded-xl border border-stone-300 bg-white font-bold flex items-center gap-1.5"><Scale className="w-4 h-4" />Periksa Fisik</button>
              </div>
              {detail && (
                <>
                  <div>
                    <p className="font-bold mb-1">Batch (urut paling cepat kedaluwarsa / FEFO)</p>
                    {(detail.batches || []).map((b: any) => (
                      <p key={b.id} className="py-1 border-b border-stone-100">
                        {b.warehouse_nama}: {formatAngka(b.jumlah_sisa, 0)} {c.satuan} · kedaluwarsa {formatTanggalIndo(b.expiry_date)} ({b.sisa_hari_simpan} hari)
                        {b.status_batch === 'segera_kedaluwarsa' && <strong className="text-amber-800"> · segera</strong>}
                      </p>
                    ))}
                  </div>
                  <div>
                    <p className="font-bold mb-1">Riwayat Transaksi</p>
                    {(detail.transaksi || []).slice(0, 8).map((t: any) => (
                      <p key={t.id} className="py-1 border-b border-stone-100">
                        {formatTanggalIndo(t.tanggal)} · {t.jenis.replace('_', ' ')} · {formatAngka(t.jumlah, 1)} {t.satuan}
                        {t.catatan ? ` · ${t.catatan}` : ''}
                      </p>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const PublicReportView: React.FC<{ token: string }> = ({ token }) => {
  const [snap, setSnap] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    fetch(`/api/v1/public/reports/${token}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.pesan || 'Tautan tidak valid.');
        setSnap(j.snapshot);
      })
      .catch((e) => setErr(e.message));
  }, [token]);

  if (err) return <div className="p-8 text-center font-semibold text-red-800">{err}</div>;
  if (!snap) return <div className="p-8 text-center">Memuat laporan...</div>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-3">
      <div className="rounded-2xl bg-white border border-stone-300 p-5 space-y-3">
        <span className="inline-block px-2 py-1 rounded bg-amber-100 border border-amber-300 text-xs font-bold">Data simulasi prototipe · baca saja</span>
        <h1 className="text-xl font-extrabold">{snap.desa?.nama}</h1>
        <p className="text-xs text-stone-600">Per {formatTanggalIndo(snap.tanggal_cetak)} · periode {snap.periode_hari} hari</p>
        <div className="flex items-center gap-2"><AIBadge /></div>
        <p className="text-sm leading-relaxed">{snap.ringkasan_naratif}</p>
        <table className="w-full text-xs border-collapse">
          <thead><tr className="border-b border-stone-300 text-left"><th className="py-1">Komoditas</th><th>Hari Bertahan</th><th>Status</th></tr></thead>
          <tbody>
            {(snap.komoditas || []).map((c: any) => (
              <tr key={c.id} className="border-b border-stone-100"><td className="py-1 font-bold">{c.nama}</td><td>{formatAngka(c.hari_bertahan, 1)} hari</td><td>{c.status}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const EmptyIcon = Sprout;
