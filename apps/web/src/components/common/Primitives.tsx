import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  WifiOff,
  XCircle,
  Table2,
  MapPin,
} from 'lucide-react';
import { formatAngka, formatWaktuSingkat } from '../../lib/format';

/**
 * 14.2 StatusBadge: Warna + Ikon berbeda bentuk + Teks (WCAG AA compliant, tidak pernah hanya warna)
 */
export const StatusBadge: React.FC<{
  status: string;
  bawah72Jam?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ status, bawah72Jam, size = 'md' }) => {
  const norm = (status || 'Aman').toLowerCase();

  let bg = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  let Icon = CheckCircle2;
  let label = status || 'Aman';

  if (norm === 'waspada') {
    bg = 'bg-amber-100 text-amber-900 border-amber-300';
    Icon = AlertCircle;
  } else if (norm === 'siaga') {
    bg = 'bg-orange-100 text-orange-900 border-orange-300';
    Icon = AlertTriangle;
  } else if (norm === 'kritis') {
    bg = 'bg-red-100 text-red-900 border-red-300';
    Icon = XCircle;
  } else if (norm === 'info') {
    bg = 'bg-sky-100 text-sky-900 border-sky-300';
    Icon = AlertCircle;
  }

  const sizeCls =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold gap-1.5'
      : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center rounded-full border font-semibold ${bg} ${sizeCls}`}
        role="status"
        aria-label={`Status: ${label}`}
      >
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5 shrink-0' : 'w-4 h-4 shrink-0'} />
        <span>{label}</span>
      </span>
      {bawah72Jam && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full bg-red-700 text-white">
          <XCircle className="w-3.5 h-3.5" />
          Di bawah 72 jam
        </span>
      )}
    </span>
  );
};

/**
 * 10.1 & 14.2 AIBadge: Label wajib pada setiap keluaran AI
 */
export const AIBadge: React.FC<{ sumber?: string }> = ({ sumber }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-medium">
    <Sparkles className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
    <span>Dibuat AI, periksa kembali sebelum bertindak</span>
    {sumber === 'template' || sumber === 'template_fallback' ? (
      <span className="text-[11px] text-indigo-700">(Mode Template)</span>
    ) : null}
  </span>
);

/**
 * 14.2 OfflineBanner: Tampil jelas saat offline + jumlah antrean transaksi
 */
export const OfflineBanner: React.FC<{
  offline: boolean;
  pendingCount: number;
  lastUpdated?: string;
  onSyncNow: () => void;
  onToggleOffline: () => void;
}> = ({ offline, pendingCount, lastUpdated, onSyncNow, onToggleOffline }) => {
  return (
    <div className="no-print border-b border-stone-200 bg-stone-100 px-3 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-amber-200/80 text-amber-950 border border-amber-300">
          Prototipe: Data simulasi
        </span>
        {offline ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-red-800 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded">
            <WifiOff className="w-3.5 h-3.5" />
            Kamu sedang offline. Catatan disimpan dan dikirim otomatis saat sinyal kembali.
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-emerald-800 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            Online · Data terakhir diperbarui: {formatWaktuSingkat(lastUpdated)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {pendingCount > 0 && (
          <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-300 font-semibold">
            {pendingCount} transaksi menunggu sinkron
          </span>
        )}
        {pendingCount > 0 && !offline && (
          <button
            type="button"
            onClick={onSyncNow}
            className="px-2.5 py-1 rounded bg-brand-700 text-white font-semibold hover:bg-brand-800"
          >
            Sinkronkan
          </button>
        )}
        <button
          type="button"
          onClick={onToggleOffline}
          className={`px-2.5 py-1 rounded border font-medium transition ${
            offline
              ? 'bg-emerald-700 text-white border-emerald-800'
              : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
          }`}
          title="Simulasikan Mode Pesawat untuk uji offline"
        >
          {offline ? 'Matikan Mode Pesawat' : 'Uji Mode Pesawat (Offline)'}
        </button>
      </div>
    </div>
  );
};

/**
 * 14.2 & 15 Accessible SVG Line Chart with collapsible data table & ARIA description
 */
export const AccessibleLineChart: React.FC<{
  title: string;
  altDescription: string;
  data: Array<Record<string, any>>;
  xKey: string;
  lines: Array<{ key: string; label: string; color: string; dashed?: boolean }>;
  unit?: string;
  height?: number;
}> = ({ title, altDescription, data, xKey, lines, unit = '', height = 210 }) => {
  const [showTable, setShowTable] = useState(false);

  if (!data || data.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-stone-200 bg-white text-sm text-stone-600">
        Belum ada data grafik untuk ditampilkan.
      </div>
    );
  }

  const allVals: number[] = [];
  data.forEach((row) => {
    lines.forEach((ln) => {
      const v = Number(row[ln.key]);
      if (!Number.isNaN(v)) allVals.push(v);
    });
  });

  const minVal = Math.min(0, ...allVals);
  const maxVal = Math.max(10, ...allVals) * 1.08;
  const w = 640;
  const h = height;
  const padL = 52;
  const padR = 18;
  const padT = 18;
  const padB = 30;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const getX = (idx: number) =>
    padL + (data.length <= 1 ? plotW / 2 : (idx / (data.length - 1)) * plotW);
  const getY = (val: number) =>
    padT + plotH - ((val - minVal) / Math.max(1, maxVal - minVal)) * plotH;

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <h4 className="font-bold text-stone-900 text-sm">{title}</h4>
        <button
          type="button"
          onClick={() => setShowTable((s) => !s)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:underline px-2 py-1 rounded border border-stone-200"
        >
          <Table2 className="w-3.5 h-3.5" />
          {showTable ? 'Sembunyikan Tabel Data' : 'Buka Tabel Data'}
        </button>
      </div>

      <p className="sr-only">{altDescription}</p>

      <div className="flex items-center gap-4 flex-wrap text-xs mb-2">
        {lines.map((ln) => (
          <span key={ln.key} className="inline-flex items-center gap-1.5 font-medium text-stone-700">
            <span
              className="w-3.5 h-1 rounded"
              style={{
                backgroundColor: ln.color,
                borderBottom: ln.dashed ? `2px dashed ${ln.color}` : undefined,
              }}
            />
            {ln.label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={altDescription}
      >
        {[0, 0.5, 1].map((frac) => {
          const v = minVal + frac * (maxVal - minVal);
          const y = getY(v);
          return (
            <g key={frac}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e7e5e4" strokeDasharray="3 3" />
              <text x={padL - 6} y={y + 4} textAnchor="end" className="fill-stone-500 text-[11px]">
                {formatAngka(v, 0)}
              </text>
            </g>
          );
        })}

        {lines.map((ln) => {
          const pts = data
            .map((row, idx) => `${getX(idx).toFixed(1)},${getY(Number(row[ln.key] || 0)).toFixed(1)}`)
            .join(' ');
          return (
            <polyline
              key={ln.key}
              fill="none"
              stroke={ln.color}
              strokeWidth={ln.dashed ? 2 : 3}
              strokeDasharray={ln.dashed ? '6 4' : undefined}
              points={pts}
            />
          );
        })}

        {[0, Math.floor(data.length / 2), data.length - 1]
          .filter((v, i, a) => a.indexOf(v) === i && data[v])
          .map((idx) => (
            <text
              key={idx}
              x={getX(idx)}
              y={h - 6}
              textAnchor="middle"
              className="fill-stone-600 text-[11px]"
            >
              {String(data[idx][xKey])}
            </text>
          ))}
      </svg>

      {showTable && (
        <div className="mt-3 max-h-56 overflow-auto border-t border-stone-200 pt-2">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-600">
                <th className="py-1.5 pr-2">{xKey}</th>
                {lines.map((ln) => (
                  <th key={ln.key} className="py-1.5 px-2">
                    {ln.label} {unit ? `(${unit})` : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 35).map((row, i) => (
                <tr key={i} className="border-b border-stone-100">
                  <td className="py-1 pr-2 font-medium">{String(row[xKey])}</td>
                  {lines.map((ln) => (
                    <td key={ln.key} className="py-1 px-2">
                      {formatAngka(Number(row[ln.key] || 0), 1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/**
 * 14.2 VillageMap: Peta Gugus Desa interaktif dengan penanda status terburuk & fallback offline
 */
export const VillageClusterMap: React.FC<{
  villages: Array<any>;
  offline: boolean;
  selectedId: string | null;
  onSelect: (v: any) => void;
}> = ({ villages, offline, selectedId, onSelect }) => {
  if (offline) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold mb-1">Peta tidak ditampilkan saat offline</p>
        <p className="text-xs">
          Ubin peta membutuhkan koneksi internet. Daftar status keenam desa dalam Gugus Sumbermulyo tetap tersedia di bawah ini.
        </p>
      </div>
    );
  }

  const lats = villages.map((v) => Number(v.lat));
  const lons = villages.map((v) => Number(v.lon));
  const minLat = Math.min(...lats) - 0.015;
  const maxLat = Math.max(...lats) + 0.015;
  const minLon = Math.min(...lons) - 0.018;
  const maxLon = Math.max(...lons) + 0.018;

  const project = (lat: number, lon: number) => {
    const x = ((lon - minLon) / Math.max(0.001, maxLon - minLon)) * 540 + 30;
    const y = ((maxLat - lat) / Math.max(0.001, maxLat - minLat)) * 240 + 25;
    return { x, y };
  };

  const own = villages.find((v) => v.is_own) || villages[0];
  const ownPt = own ? project(own.lat, own.lon) : { x: 300, y: 150 };

  const statusColor = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'kritis') return '#dc2626';
    if (s === 'siaga') return '#ea580c';
    if (s === 'waspada') return '#d97706';
    return '#15803d';
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-emerald-50/40 overflow-hidden">
      <div className="px-4 py-2.5 bg-white border-b border-stone-200 flex items-center justify-between text-xs">
        <span className="font-semibold text-stone-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-brand-700" />
          Peta Jaringan Gugus Desa Sumbermulyo (6 Desa)
        </span>
        <span className="text-stone-500">Ketuk penanda desa untuk melihat rincian stok</span>
      </div>

      <svg
        viewBox="0 0 600 290"
        className="w-full h-64 bg-[#eef6ee]"
        role="img"
        aria-label="Peta sebaran 6 desa di Gugus Sumbermulyo beserta jalur distribusi pangan"
      >
        <g stroke="#d6e6d6" strokeWidth="1">
          {[50, 100, 150, 200, 250].map((y) => (
            <line key={y} x1="0" y1={y} x2="600" y2={y} />
          ))}
          {[100, 200, 300, 400, 500].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="290" />
          ))}
        </g>

        {villages
          .filter((v) => !v.is_own)
          .map((v) => {
            const pt = project(v.lat, v.lon);
            return (
              <line
                key={`road-${v.id}`}
                x1={ownPt.x}
                y1={ownPt.y}
                x2={pt.x}
                y2={pt.y}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="5 4"
              />
            );
          })}

        {villages.map((v) => {
          const pt = project(v.lat, v.lon);
          const col = statusColor(v.status);
          const isSel = selectedId === v.id;
          return (
            <g
              key={v.id}
              transform={`translate(${pt.x}, ${pt.y})`}
              onClick={() => onSelect(v)}
              className="cursor-pointer"
            >
              {v.is_own && (
                <circle r="22" fill={col} opacity="0.18" />
              )}
              <circle
                r={isSel ? 15 : v.is_own ? 13 : 11}
                fill={col}
                stroke="#ffffff"
                strokeWidth="3"
              />
              <text
                y={-18}
                textAnchor="middle"
                className="text-[11px] font-bold fill-stone-900"
                style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '3px' }}
              >
                {v.nama} {v.is_own ? '(Desa Kita)' : ''}
              </text>
              <text
                y={26}
                textAnchor="middle"
                className="text-[10px] font-semibold fill-stone-700"
                style={{ paintOrder: 'stroke', stroke: '#ffffff', strokeWidth: '2px' }}
              >
                Terendah: {formatAngka(v.hari_bertahan_terburuk, 1)} hr ({v.status})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
