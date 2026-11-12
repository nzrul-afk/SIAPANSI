import React, { useCallback, useEffect, useState } from 'react';
import {
  Bell, Bot, FileText, Home, Layers, LogOut, Package, Settings, Sliders, Sprout, Truck, Utensils,
} from 'lucide-react';
import {
  apiRequest, isOfflineNow, setSimulatedOffline, subscribeNetworkChange, syncOfflineQueueNow,
} from './lib/api';
import { getPendingTransactions } from './db/offlineQueue';
import { OfflineBanner } from './components/common/Primitives';
import { StockOpnameModal, StockTransactionSheet } from './features/StockSheet';
import { DashboardView, LoginView, PublicReportView, StockView } from './features/CoreViews';
import {
  AssistantView, NutritionMenuView, PredictAndGlobalView, ReportView, SimulatorView, VillageNetworkView,
} from './features/AdvancedViews';
import { AlertsListView, SettingsAndDemoView } from './features/AlertsAndSettingsView';

type Tab =
  | 'beranda' | 'stok' | 'peringatan' | 'simulasi' | 'prediksi'
  | 'menu' | 'jaringan' | 'asisten' | 'laporan' | 'pengaturan';

const NAV: Array<{ id: Tab; label: string; icon: any }> = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'stok', label: 'Stok', icon: Package },
  { id: 'peringatan', label: 'Peringatan', icon: Bell },
  { id: 'simulasi', label: 'Simulasi', icon: Sliders },
  { id: 'prediksi', label: 'Prediksi', icon: Sprout },
  { id: 'menu', label: 'Menu Gizi', icon: Utensils },
  { id: 'jaringan', label: 'Desa', icon: Truck },
  { id: 'asisten', label: 'Asisten', icon: Bot },
  { id: 'laporan', label: 'Laporan', icon: FileText },
  { id: 'pengaturan', label: 'Lainnya', icon: Settings },
];

const App: React.FC = () => {
  const publicMatch = window.location.pathname.match(/^\/laporan-publik\/(.+)$/);
  if (publicMatch) return <PublicReportView token={publicMatch[1]} />;

  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('siapansa_token'));
  const [tab, setTab] = useState<Tab>('beranda');
  const [overview, setOverview] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<Array<any>>([]);
  const [offline, setOffline] = useState(isOfflineNow());
  const [pending, setPending] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetComm, setSheetComm] = useState<string | undefined>();
  const [opnameComm, setOpnameComm] = useState<any>(null);
  const [toast, setToast] = useState<{ text: string; undo?: () => void } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [ov, st] = await Promise.all([apiRequest('/status/overview'), apiRequest('/stock')]);
      setOverview(ov.data);
      setWarehouses(st.data.warehouses || []);
      setLastUpdated(ov.updatedAt);
    } catch {
      /* offline tanpa cache */
    }
    setPending((await getPendingTransactions()).length);
  }, []);

  useEffect(() => {
    if (!loggedIn) return;
    void refresh();
    return subscribeNetworkChange(() => {
      setOffline(isOfflineNow());
      void refresh();
    });
  }, [loggedIn, refresh]);

  if (!loggedIn) return <LoginView onLogin={() => setLoggedIn(true)} />;

  const openSheet = (cid?: string) => { setSheetComm(cid); setSheetOpen(true); };

  const handleTxSuccess = (info: any) => {
    if (!info) return;
    setToast({
      text: `Catatan ${info.arah} ${info.nama} tersimpan${isOfflineNow() ? ' (antrean offline)' : ''}.`,
      undo: async () => {
        // pembalik: transaksi lawan arah, ledger tetap append-only
        try {
          await apiRequest('/stock/transactions', {
            method: 'POST',
            body: JSON.stringify({
              commodity_id: info.commodityId,
              jenis: 'pembalik',
              reverses_id: info.txId,
              jumlah: info.jumlah,
              catatan: 'Pembatalan catatan (pembalik)',
            }),
          });
          setToast({ text: 'Catatan dibatalkan lewat transaksi pembalik.' });
          void refresh();
        } catch (e: any) {
          setToast({ text: e?.message || 'Pembatalan gagal (mungkin masih antrean offline).' });
        }
      },
    });
    setTimeout(() => setToast(null), 8000);
    void refresh();
  };

  const logout = () => { localStorage.removeItem('siapansa_token'); setLoggedIn(false); };
  const go = (t: string) => setTab(t as Tab);
  const comms = overview?.komoditas || [];

  return (
    <div className="min-h-screen pb-24">
      <OfflineBanner
        offline={offline}
        pendingCount={pending}
        lastUpdated={lastUpdated}
        onSyncNow={async () => { await syncOfflineQueueNow(); void refresh(); }}
        onToggleOffline={() => { setSimulatedOffline(!isOfflineNow()); setOffline(isOfflineNow()); }}
      />
      <header className="no-print bg-brand-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icon-192.svg" alt="" className="w-8 h-8 rounded-lg" />
          <div>
            <p className="font-extrabold leading-none">SIAPANSA</p>
            <p className="text-[11px] opacity-80">Desa Sidomulyo</p>
          </div>
        </div>
        <button type="button" onClick={logout} className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-lg hover:bg-brand-700" aria-label="Keluar">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {tab === 'beranda' && <DashboardView overview={overview} onNavigate={go} />}
        {tab === 'stok' && (
          <StockView overview={overview} warehouses={warehouses} onOpenSheet={openSheet} onOpname={setOpnameComm} />
        )}
        {tab === 'peringatan' && <AlertsListView onNavigate={go} onRefreshOverview={refresh} />}
        {tab === 'simulasi' && <SimulatorView onNavigate={go} />}
        {tab === 'prediksi' && <PredictAndGlobalView commodities={comms} onRefreshOverview={refresh} onNavigate={go} />}
        {tab === 'menu' && <NutritionMenuView onRefreshOverview={refresh} />}
        {tab === 'jaringan' && <VillageNetworkView offline={offline} onRefreshOverview={refresh} />}
        {tab === 'asisten' && <AssistantView offline={offline} />}
        {tab === 'laporan' && <ReportView />}
        {tab === 'pengaturan' && <SettingsAndDemoView commodities={comms} onRefreshOverview={refresh} onNavigate={go} />}
      </main>

      {toast && (
        <div className="no-print fixed bottom-24 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white text-xs font-semibold rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
          <span>{toast.text}</span>
          {toast.undo && (
            <button type="button" onClick={toast.undo} className="underline font-bold">Batalkan</button>
          )}
        </div>
      )}

      <nav className="no-print fixed bottom-0 inset-x-0 z-30 bg-white border-t border-stone-200 overflow-x-auto" aria-label="Navigasi utama">
        <ul className="flex min-w-max sm:justify-center">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => setTab(n.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`min-w-[68px] min-h-[56px] px-2 flex flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${active ? 'text-brand-700 border-t-2 border-brand-700' : 'text-stone-600'}`}
                >
                  <Icon className="w-5 h-5" />
                  {n.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <StockTransactionSheet
        key={`${sheetOpen}-${sheetComm}`}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        commodities={comms}
        warehouses={warehouses}
        defaultCommodityId={sheetComm}
        asOfDate={overview?.as_of || ''}
        onSuccess={handleTxSuccess}
      />
      <StockOpnameModal
        key={opnameComm?.id || 'none'}
        open={!!opnameComm}
        onClose={() => setOpnameComm(null)}
        commodity={opnameComm}
        onSuccess={() => void refresh()}
      />
    </div>
  );
};

export default App;
