/**
 * 14.1 Format angka dan tanggal standar Indonesia (1.234,5 dan "12 Nov 2026")
 */
const BULAN_PENDEK = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

export function formatAngka(val: number | undefined | null, desimal = 1): string {
  if (val === undefined || val === null || Number.isNaN(Number(val))) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: desimal,
    maximumFractionDigits: desimal,
  }).format(Number(val));
}

export function formatRupiah(val: number | undefined | null): string {
  if (val === undefined || val === null || Number.isNaN(Number(val))) return 'Rp 0';
  return 'Rp ' + new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(Number(val)));
}

export function formatTanggalIndo(isoStr: string | undefined | null): string {
  if (!isoStr) return '-';
  const clean = String(isoStr).slice(0, 10);
  const parts = clean.split('-');
  if (parts.length !== 3) return String(isoStr);
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const namaBulan = BULAN_PENDEK[monthIdx] || parts[1];
  return `${day} ${namaBulan} ${year}`;
}

export function formatWaktuSingkat(isoStr: string | undefined | null): string {
  if (!isoStr) return 'Baru saja';
  try {
    const d = new Date(isoStr);
    if (Number.isNaN(d.getTime())) return formatTanggalIndo(isoStr);
    const jam = String(d.getHours()).padStart(2, '0');
    const mnt = String(d.getMinutes()).padStart(2, '0');
    return `${formatTanggalIndo(isoStr)} ${jam}.${mnt} WIB`;
  } catch {
    return formatTanggalIndo(isoStr);
  }
}
