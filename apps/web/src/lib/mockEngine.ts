// SIAPANSA Client-Side Deterministic Mock Engine
// High-fidelity local simulation engine that runs directly in the browser.
// Guarantees 100% interactive functionality on Vercel or offline without server dependencies.

export interface MockResponse<T = any> {
  data: T;
  status: number;
}

// 1. Initial State Definitions
const INITIAL_OVERVIEW = {
  as_of: '2026-11-12',
  jam_virtual: '2026-11-12T08:00:00',
  label_data: 'Data simulasi untuk prototipe',
  target_hari: 30,
  kalimat_ringkasan:
    'Jika pasokan dari luar berhenti, pangan pokok desa bertahan 32,8 hari. Titik terlemah: Kedelai (14,5 hari).',
  pool_pokok: {
    hari_bertahan: 32.8,
    status: 'Aman',
    level: 'aman',
    bawah_72_jam: false,
    progress_target_pct: 100.0,
  },
  pool_protein: {
    hari_bertahan: 15.3,
    status: 'Waspada',
    level: 'waspada',
    bawah_72_jam: false,
    progress_target_pct: 51.0,
  },
  pool_pelengkap: {
    hari_bertahan: 20.4,
    status: 'Waspada',
    level: 'waspada',
    bawah_72_jam: false,
    progress_target_pct: 68.0,
  },
  titik_terlemah: {
    commodity_id: 'c-kedelai',
    kode: 'kedelai',
    nama: 'Kedelai',
    hari_bertahan: 14.5,
    status: 'Waspada',
    level: 'waspada',
    bawah_72_jam: false,
    progress_target_pct: 48.3,
  },
  skor_ketahanan: {
    skor_total: 77.8,
    ketersediaan: 66.4,
    akses: 94.3,
    pemanfaatan: 76.3,
    indeks_harga: 8.1,
    skor_eksposur_global: 3.4,
  },
  komoditas: [
    {
      id: 'c-beras',
      kode: 'beras',
      nama: 'Beras',
      satuan: 'kg',
      kelompok: 'pokok',
      kebutuhan_harian: 450.0,
      norma_per_kapita_hari: 0.250,
      stok_efektif: 17100.0,
      hari_bertahan: 38.0,
      status: 'Aman',
      level: 'aman',
      bawah_72_jam: false,
      progress_target_pct: 100.0,
      harga_sekarang: 14500,
      perubahan_harga_7d_pct: 0.8,
      eksposur_impor: 0.02,
      rincian_sumber: { Lumbung: 5985, Poktan: 4275, 'Rumah Tangga': 5130, Pedagang: 1710 },
    },
    {
      id: 'c-jagung',
      kode: 'jagung',
      nama: 'Jagung pipil kering',
      satuan: 'kg',
      kelompok: 'pokok',
      kebutuhan_harian: 90.0,
      norma_per_kapita_hari: 0.050,
      stok_efektif: 2520.0,
      hari_bertahan: 28.0,
      status: 'Waspada',
      level: 'waspada',
      bawah_72_jam: false,
      progress_target_pct: 93.3,
      harga_sekarang: 8200,
      perubahan_harga_7d_pct: 0.0,
      eksposur_impor: 0.15,
      rincian_sumber: { Lumbung: 882, Poktan: 630, 'Rumah Tangga': 756, Pedagang: 252 },
    },
    {
      id: 'c-singkong',
      kode: 'singkong',
      nama: 'Singkong kering/gaplek',
      satuan: 'kg',
      kelompok: 'pokok',
      kebutuhan_harian: 90.0,
      norma_per_kapita_hari: 0.050,
      stok_efektif: 1800.0,
      hari_bertahan: 20.0,
      status: 'Waspada',
      level: 'waspada',
      bawah_72_jam: false,
      progress_target_pct: 66.7,
      harga_sekarang: 6000,
      perubahan_harga_7d_pct: 0.0,
      eksposur_impor: 0.0,
      rincian_sumber: { Lumbung: 630, Poktan: 450, 'Rumah Tangga': 540, Pedagang: 180 },
    },
    {
      id: 'c-terigu',
      kode: 'terigu',
      nama: 'Terigu',
      satuan: 'kg',
      kelompok: 'pokok',
      kebutuhan_harian: 54.0,
      norma_per_kapita_hari: 0.030,
      stok_efektif: 810.0,
      hari_bertahan: 15.0,
      status: 'Waspada',
      level: 'waspada',
      bawah_72_jam: false,
      progress_target_pct: 50.0,
      harga_sekarang: 13000,
      perubahan_harga_7d_pct: 0.0,
      eksposur_impor: 1.0,
      rincian_sumber: { Lumbung: 283, Poktan: 202, 'Rumah Tangga': 243, Pedagang: 81 },
    },
    {
      id: 'c-kedelai',
      kode: 'kedelai',
      nama: 'Kedelai',
      satuan: 'kg',
      kelompok: 'protein',
      kebutuhan_harian: 90.0,
      norma_per_kapita_hari: 0.050,
      stok_efektif: 1305.0,
      hari_bertahan: 14.5,
      status: 'Waspada',
      level: 'waspada',
      bawah_72_jam: false,
      progress_target_pct: 48.3,
      harga_sekarang: 12500,
      perubahan_harga_7d_pct: 0.0,
      eksposur_impor: 0.85,
      rincian_sumber: { Lumbung: 456, Poktan: 326, 'Rumah Tangga': 391, Pedagang: 130 },
    },
    {
      id: 'c-telur',
      kode: 'telur',
      nama: 'Telur ayam ras',
      satuan: 'kg',
      kelompok: 'protein',
      kebutuhan_harian: 45.0,
      norma_per_kapita_hari: 0.025,
      stok_efektif: 720.0,
      hari_bertahan: 16.0,
      status: 'Waspada',
      level: 'waspada',
      bawah_72_jam: false,
      progress_target_pct: 53.3,
      harga_sekarang: 28000,
      perubahan_harga_7d_pct: 0.0,
      eksposur_impor: 0.35,
      rincian_sumber: { Lumbung: 252, Poktan: 180, 'Rumah Tangga': 216, Pedagang: 72 },
    },
    {
      id: 'c-minyak',
      kode: 'minyak',
      nama: 'Minyak goreng curah',
      satuan: 'liter',
      kelompok: 'pelengkap',
      kebutuhan_harian: 36.0,
      norma_per_kapita_hari: 0.020,
      stok_efektif: 1080.0,
      hari_bertahan: 30.0,
      status: 'Aman',
      level: 'aman',
      bawah_72_jam: false,
      progress_target_pct: 100.0,
      harga_sekarang: 16000,
      perubahan_harga_7d_pct: 0.0,
      eksposur_impor: 0.0,
      rincian_sumber: { Lumbung: 378, Poktan: 270, 'Rumah Tangga': 324, Pedagang: 108 },
    },
    {
      id: 'c-gula',
      kode: 'gula',
      nama: 'Gula pasir',
      satuan: 'kg',
      kelompok: 'pelengkap',
      kebutuhan_harian: 36.0,
      norma_per_kapita_hari: 0.020,
      stok_efektif: 900.0,
      hari_bertahan: 25.0,
      status: 'Waspada',
      level: 'waspada',
      bawah_72_jam: false,
      progress_target_pct: 83.3,
      harga_sekarang: 17500,
      perubahan_harga_7d_pct: 0.0,
      eksposur_impor: 0.45,
      rincian_sumber: { Lumbung: 315, Poktan: 225, 'Rumah Tangga': 270, Pedagang: 90 },
    },
    {
      id: 'c-bawang',
      kode: 'bawang_merah',
      nama: 'Bawang merah',
      satuan: 'kg',
      kelompok: 'pelengkap',
      kebutuhan_harian: 18.0,
      norma_per_kapita_hari: 0.010,
      stok_efektif: 252.0,
      hari_bertahan: 14.0,
      status: 'Waspada',
      level: 'waspada',
      bawah_72_jam: false,
      progress_target_pct: 46.7,
      harga_sekarang: 35000,
      perubahan_harga_7d_pct: 0.0,
      eksposur_impor: 0.05,
      rincian_sumber: { Lumbung: 88, Poktan: 63, 'Rumah Tangga': 75, Pedagang: 25 },
    },
    {
      id: 'c-cabai',
      kode: 'cabai_rawit',
      nama: 'Cabai rawit merah',
      satuan: 'kg',
      kelompok: 'pelengkap',
      kebutuhan_harian: 9.0,
      norma_per_kapita_hari: 0.005,
      stok_efektif: 144.0,
      hari_bertahan: 16.0,
      status: 'Waspada',
      level: 'waspada',
      bawah_72_jam: false,
      progress_target_pct: 53.3,
      harga_sekarang: 45000,
      perubahan_harga_7d_pct: 0.0,
      eksposur_impor: 0.0,
      rincian_sumber: { Lumbung: 50, Poktan: 36, 'Rumah Tangga': 43, Pedagang: 14 },
    },
  ],
  jumlah_peringatan_aktif: 3,
  peringatan_teratas: [
    {
      id: 'alt-R1-c-singkong',
      rule_code: 'R1',
      tingkat: 'Waspada',
      commodity_nama: 'Singkong kering/gaplek',
      judul: 'Cadangan Singkong masuk status Waspada (20.0 hari)',
      penjelasan: 'Stok efektif Singkong saat ini cukup untuk 20.0 hari (di bawah batas Aman 21 hari).',
      kenapa_penting: 'Singkong merupakan bahan pangan pengganti pokok bila terigu dan beras terganggu.',
      tindakan: 'buat_menu_substitusi',
      data_pemicu: { doc_hari: 20.0, ambang_aman: 21 },
      status: 'Baru',
    },
    {
      id: 'alt-R1-c-terigu',
      rule_code: 'R1',
      tingkat: 'Waspada',
      commodity_nama: 'Terigu',
      judul: 'Cadangan Terigu masuk status Waspada (15.0 hari)',
      penjelasan: 'Stok efektif Terigu saat ini cukup untuk 15.0 hari dengan ketergantungan impor 100%.',
      kenapa_penting: 'Gangguan jalur pasokan gandum global dapat memicu lonjakan harga pangan olahan.',
      tindakan: 'jalankan_simulasi',
      data_pemicu: { doc_hari: 15.0, eksposur_impor: '100%' },
      status: 'Baru',
    },
    {
      id: 'alt-R1-c-kedelai',
      rule_code: 'R1',
      tingkat: 'Waspada',
      commodity_nama: 'Kedelai',
      judul: 'Cadangan Kedelai masuk status Waspada (14.5 hari)',
      penjelasan: 'Stok efektif Kedelai saat ini cukup untuk 14.5 hari (titik terlemah desa).',
      kenapa_penting: 'Pasokan protein tempe/tahu warga terancam bila pasokan dari luar terhambat.',
      tindakan: 'lihat_bantuan',
      data_pemicu: { doc_hari: 14.5, ambang_waspada: 14.0 },
      status: 'Baru',
    },
  ],
};

const GOLDEN_WAREHOUSES = [
  { id: 'wh-lumbung', village_id: 'v-sidomulyo', nama: 'Lumbung Pangan Desa', sumber: 'lumbung', share: 0.35 },
  { id: 'wh-poktan', village_id: 'v-sidomulyo', nama: 'Gudang Kelompok Tani', sumber: 'kelompok_tani', share: 0.25 },
  { id: 'wh-rt', village_id: 'v-sidomulyo', nama: 'Estimasi Cadangan Rumah Tangga', sumber: 'rumah_tangga', share: 0.30 },
  { id: 'wh-pedagang', village_id: 'v-sidomulyo', nama: 'Stok Pedagang Desa', sumber: 'pedagang', share: 0.10 },
];

let stateOverview = JSON.parse(JSON.stringify(INITIAL_OVERVIEW));
let stateHarvestPlans = [
  {
    id: 'hp-1',
    commodity_id: 'c-beras',
    commodity_nama: 'Padi (Beras)',
    luas_ha: 12.0,
    varietas: 'Inpari 32',
    kondisi_pupuk: 'cukup',
    sumber_air: 'irigasi_teknis',
    tanggal_tanam: '2026-09-28',
    aktif_di_proyeksi: true,
    prediksi: {
      volume_median_kg: 39600,
      volume_p10_kg: 33600,
      volume_p90_kg: 45000,
      tanggal_panen_awal: '2026-12-10',
      tanggal_panen_akhir: '2026-12-20',
    },
  },
  {
    id: 'hp-2',
    commodity_id: 'c-jagung',
    commodity_nama: 'Jagung',
    luas_ha: 2.0,
    varietas: 'Bisi 18',
    kondisi_pupuk: 'cukup',
    sumber_air: 'tadah_hujan',
    tanggal_tanam: '2026-10-13',
    aktif_di_proyeksi: true,
    prediksi: {
      volume_median_kg: 10000,
      volume_p10_kg: 8500,
      volume_p90_kg: 11500,
      tanggal_panen_awal: '2026-12-18',
      tanggal_panen_akhir: '2026-12-25',
    },
  },
  {
    id: 'hp-3',
    commodity_id: 'c-singkong',
    commodity_nama: 'Singkong',
    luas_ha: 1.0,
    varietas: 'Manggu',
    kondisi_pupuk: 'cukup',
    sumber_air: 'tadah_hujan',
    tanggal_tanam: '2026-06-15',
    aktif_di_proyeksi: true,
    prediksi: {
      volume_median_kg: 6600,
      volume_p10_kg: 5500,
      volume_p90_kg: 7500,
      tanggal_panen_awal: '2027-01-05',
      tanggal_panen_akhir: '2027-01-15',
    },
  },
];

let stateMyTransfers: Array<any> = [
  {
    id: 'trf-1',
    dari_village_id: 'v-karangsari',
    dari_village_nama: 'Desa Karangsari',
    ke_village_id: 'v-sidomulyo',
    ke_village_nama: 'Desa Sidomulyo (Kita)',
    commodity_id: 'c-kedelai',
    commodity_nama: 'Kedelai',
    satuan: 'kg',
    jumlah: 350.0,
    jarak_km: 4.2,
    biaya_angkut: 44100,
    status: 'Diajukan',
    draf_pesan: 'Mohon dukungan pasokan cadangan kedelai 350 kg untuk pemenuhan gizi balita Sidomulyo.',
    created_at: '2026-11-12T08:30:00',
  },
];

let stateIncomingTransfers: Array<any> = [
  {
    id: 'trf-in-1',
    dari_village_id: 'v-sidomulyo',
    dari_village_nama: 'Desa Sidomulyo (Kita)',
    ke_village_id: 'v-sukomakmur',
    ke_village_nama: 'Desa Sukomakmur',
    commodity_id: 'c-beras',
    commodity_nama: 'Beras',
    satuan: 'kg',
    jumlah: 500.0,
    status: 'Diajukan',
    draf_pesan: 'Permohonan bantuan darurat cadangan beras 500 kg dari Lumbung Desa Sidomulyo untuk menangani defisit pangan 35 KK rentan di Dusun Krajan Sukomakmur.',
    doc_desa_kita_sebelum: 38.0,
    doc_desa_kita_sesudah: 36.9,
    aman_untuk_disetujui: true,
  },
];

let stateEvents = [
  {
    id: 'evt-1',
    nama: 'Konflik Jalur Gandum Laut Hitam',
    deskripsi: 'Hambatan rute pelayaran dan embargo ekspor memicu kenaikan ongkos logistik laut serta pasokan terigu.',
    aktif: false,
    intensitas: 0.6,
    komoditas_terdampak: ['Terigu'],
  },
  {
    id: 'evt-2',
    nama: 'Lonjakan Pupuk & Energi Global',
    deskripsi: 'Kenaikan harga gas alam dunia memicu kelangkaan pupuk urea dan NPK untuk musim tanam lokal.',
    aktif: false,
    intensitas: 0.4,
    komoditas_terdampak: ['Padi', 'Jagung'],
  },
  {
    id: 'evt-3',
    nama: 'Anomali Iklim / Kemarau Basah',
    deskripsi: 'Curah hujan tidak menentu memicu risiko jamur dan susut pascapanen pada komoditas cabai dan bawang.',
    aktif: false,
    intensitas: 0.5,
    komoditas_terdampak: ['Cabai rawit', 'Bawang merah'],
  },
];

let stateSavedScenarios: Array<any> = [];

let statePopulation: any = {
  total: 1800,
  kk: 520,
  balita: 140,
  ibu_hamil_menyusui: 45,
  lansia: 210,
  catatan_akg: 'Standar AKG Kemenkes 2019: 2.100 kkal & 57g protein per orang per hari. Balita dan ibu hamil/menyusui memiliki bobot kebutuhan gizi mikro khusus.',
};

let stateSettings: any = {
  target_hari: 30,
  batas_donor: 21,
  ambang: { aman: 21, waspada: 14, siaga: 7, kritis: 0, bawah_72_jam: 3 },
  jam_virtual: '2026-11-12T08:00:00',
  ai_enabled: true,
};

const CROP_BASE_SPECS: Record<string, { base_yield_kg_ha: number; konversi: number; days: number; varietas: string[] }> = {
  padi: { base_yield_kg_ha: 5500.0, konversi: 0.60, days: 105, varietas: ['Inpari 32', 'Ciherang', 'IR64'] },
  jagung: { base_yield_kg_ha: 5000.0, konversi: 1.00, days: 95, varietas: ['Bisi 18', 'Pioneer P27', 'NK212'] },
  kedelai: { base_yield_kg_ha: 1500.0, konversi: 1.00, days: 85, varietas: ['Anjasmoro', 'Grobogan', 'Argomulyo'] },
  singkong: { base_yield_kg_ha: 20000.0, konversi: 0.33, days: 210, varietas: ['Manggu', 'Kasesa', 'Adira 4'] },
  cabai_rawit: { base_yield_kg_ha: 8000.0, konversi: 1.00, days: 85, varietas: ['Dewata 43', 'Bara', 'Pelita'] },
  bawang_merah: { base_yield_kg_ha: 10000.0, konversi: 1.00, days: 60, varietas: ['Bima Brebes', 'Tajuk', 'Bauji'] },
};

function recalculateOverviewSummary(): void {
  const targetHari = stateOverview.target_hari || 30;

  // 1. Update komoditas
  stateOverview.komoditas.forEach((c: any) => {
    c.hari_bertahan = +(c.stok_efektif / c.kebutuhan_harian).toFixed(1);
    c.status = c.hari_bertahan >= 21 ? 'Aman' : c.hari_bertahan >= 14 ? 'Waspada' : c.hari_bertahan >= 7 ? 'Siaga' : 'Kritis';
    c.level = c.status.toLowerCase();
    c.bawah_72_jam = c.hari_bertahan < 3.0;
    c.progress_target_pct = Math.min(100, Math.round((c.hari_bertahan / targetHari) * 100));
  });

  // 2. Pool pokok
  const pokokComms = stateOverview.komoditas.filter((c: any) => c.kelompok === 'pokok');
  const totalStokPokok = pokokComms.reduce((acc: number, c: any) => acc + c.stok_efektif, 0);
  const totalKebutuhanPokok = pokokComms.reduce((acc: number, c: any) => acc + c.kebutuhan_harian, 0);
  const pokokDays = +(totalStokPokok / totalKebutuhanPokok).toFixed(1);
  stateOverview.pool_pokok = {
    hari_bertahan: pokokDays,
    status: pokokDays >= 21 ? 'Aman' : pokokDays >= 14 ? 'Waspada' : 'Siaga',
    level: pokokDays >= 21 ? 'aman' : pokokDays >= 14 ? 'waspada' : 'siaga',
    bawah_72_jam: pokokDays < 3.0,
    progress_target_pct: Math.min(100, Math.round((pokokDays / targetHari) * 100)),
  };

  // 3. Pool protein
  const proteinComms = stateOverview.komoditas.filter((c: any) => c.kelompok === 'protein');
  const totalStokProt = proteinComms.reduce((acc: number, c: any) => acc + c.stok_efektif, 0);
  const totalKebutuhanProt = proteinComms.reduce((acc: number, c: any) => acc + c.kebutuhan_harian, 0);
  const protDays = +(totalStokProt / totalKebutuhanProt).toFixed(1);
  stateOverview.pool_protein = {
    hari_bertahan: protDays,
    status: protDays >= 21 ? 'Aman' : protDays >= 14 ? 'Waspada' : 'Siaga',
    level: protDays >= 21 ? 'aman' : protDays >= 14 ? 'waspada' : 'siaga',
    bawah_72_jam: protDays < 3.0,
    progress_target_pct: Math.min(100, Math.round((protDays / targetHari) * 100)),
  };

  // 4. Titik terlemah
  const sorted = [...stateOverview.komoditas].sort((a: any, b: any) => a.hari_bertahan - b.hari_bertahan);
  const weakest = sorted[0];
  stateOverview.titik_terlemah = {
    commodity_id: weakest.id,
    kode: weakest.kode,
    nama: weakest.nama,
    hari_bertahan: weakest.hari_bertahan,
    status: weakest.status,
    level: weakest.level,
    bawah_72_jam: weakest.bawah_72_jam,
    progress_target_pct: weakest.progress_target_pct,
  };

  stateOverview.kalimat_ringkasan = `Jika pasokan dari luar berhenti, pangan pokok desa bertahan ${stateOverview.pool_pokok.hari_bertahan} hari. Titik terlemah: ${weakest.nama} (${weakest.hari_bertahan} hari).`;
}

export async function handleClientMockRoute(path: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();
  const cleanPath = path.replace(/^\/api\/v1/, '').replace(/^\/api/, '');
  let body: any = {};
  if (options.body) {
    try {
      body = JSON.parse(options.body.toString());
    } catch {
      body = {};
    }
  }

  // 1. Auth Login
  if (cleanPath.startsWith('/auth/login')) {
    return {
      token: 'jwt-demo-client-local',
      expires_at: '2026-11-20T08:00:00',
      user: {
        id: 'u-petugas-1',
        nama: 'Petugas Desa Sidomulyo',
        email: 'petugas@siapansa.demo',
        role: 'petugas',
        village_id: 'v-sidomulyo',
      },
      village: {
        id: 'v-sidomulyo',
        nama: 'Desa Sidomulyo',
        kecamatan: 'Sumbermulyo',
        kabupaten: 'Kabupaten Malang',
        jumlah_penduduk: 1800,
      },
    };
  }

  // 2. Status Overview
  if (cleanPath === '/status/overview') {
    return stateOverview;
  }

  // 3. Status Projection
  if (cleanPath.startsWith('/status/projection')) {
    const days = 30;
    const series = [];
    const baseDate = new Date('2026-11-12');
    for (let d = 0; d <= days; d++) {
      const dt = new Date(baseDate.getTime() + d * 86400000);
      const rem = Math.max(0, 17100 - d * 450);
      series.push({
        hari_ke: d,
        tanggal: dt.toISOString().split('T')[0],
        stok_kg: rem,
        hari_bertahan: +(rem / 450).toFixed(1),
      });
    }
    return {
      commodity_id: 'c-beras',
      nama: 'Beras',
      kebutuhan_harian: 450.0,
      stok_sekarang: 17100.0,
      hari_bertahan_sekarang: 38.0,
      tanggal_stok_habis: '2026-12-20',
      hari_ke_habis: 38,
      titik_waspada_hari: 17,
      tanggal_titik_waspada: '2026-11-29',
      proyeksi: series,
    };
  }

  // 4. Stock Overview & Detail
  if (cleanPath === '/stock' && method === 'GET') {
    return {
      as_of: stateOverview.as_of,
      warehouses: GOLDEN_WAREHOUSES,
      commodities: stateOverview.komoditas,
    };
  }

  // Commodity stock detail (e.g. /stock/c-beras)
  const stockDetailMatch = cleanPath.match(/^\/stock\/([^/]+)$/);
  if (stockDetailMatch && method === 'GET') {
    const cid = stockDetailMatch[1];
    const comm = stateOverview.komoditas.find((c: any) => c.id === cid) || stateOverview.komoditas[0];
    return {
      commodity: comm,
      batches: [
        {
          id: `b-${cid}-1`,
          warehouse_nama: 'Lumbung Pangan Desa',
          jumlah_sisa: Math.round(comm.stok_efektif * 0.4),
          expiry_date: '2027-04-15',
          sisa_hari_simpan: 154,
          status_batch: 'aman',
        },
        {
          id: `b-${cid}-2`,
          warehouse_nama: 'Gudang Kelompok Tani',
          jumlah_sisa: Math.round(comm.stok_efektif * 0.3),
          expiry_date: '2026-12-10',
          sisa_hari_simpan: 28,
          status_batch: 'segera_kedaluwarsa',
        },
      ],
      transaksi: [
        {
          id: `tx-${Date.now()}-1`,
          tanggal: '2026-11-10',
          jenis: 'masuk_panen',
          jumlah: Math.round(comm.kebutuhan_harian * 5),
          satuan: comm.satuan,
          catatan: 'Panen petani lokal Desa Sidomulyo',
        },
        {
          id: `tx-${Date.now()}-2`,
          tanggal: '2026-11-08',
          jenis: 'keluar_salur',
          jumlah: comm.kebutuhan_harian,
          satuan: comm.satuan,
          catatan: 'Penyaluran konsumsi harian warga',
        },
      ],
    };
  }

  // Stock Opname
  if (cleanPath.includes('/opname') && method === 'POST') {
    const cid = cleanPath.split('/')[2];
    const comm = stateOverview.komoditas.find((c: any) => c.id === cid);
    const fisik = typeof body.jumlah_fisik === 'number' ? body.jumlah_fisik : parseFloat(body.jumlah_fisik) || 17000;
    if (comm) {
      comm.stok_efektif = fisik;
      recalculateOverviewSummary();
    }
    return {
      status: 'sukses',
      pesan: `Pemeriksaan fisik stok ${comm?.nama || 'komoditas'} berhasil disimpan.`,
      stok_baru: fisik,
    };
  }

  // Stock Transactions
  if (cleanPath.startsWith('/stock/transactions')) {
    if (body.commodity_id && body.jumlah) {
      const comm = stateOverview.komoditas.find((c: any) => c.id === body.commodity_id);
      if (comm) {
        if (body.jenis?.startsWith('keluar')) {
          comm.stok_efektif = Math.max(0, comm.stok_efektif - Number(body.jumlah));
        } else {
          comm.stok_efektif += Number(body.jumlah);
        }
        recalculateOverviewSummary();
      }
    }
    return {
      status: 'sukses',
      pesan: 'Transaksi stok berhasil disimpan.',
      transaksi: { id: body.id || `tx-${Date.now()}`, ...body },
    };
  }

  // 5. Alerts
  if (cleanPath.startsWith('/alerts')) {
    if (method === 'PATCH') {
      return { status: 'sukses', pesan: 'Status peringatan diperbarui.' };
    }
    return {
      peringatan: stateOverview.peringatan_teratas,
      jumlah_aktif: 3,
      jumlah_waspada: 3,
      jumlah_siaga: 0,
      jumlah_kritis: 0,
    };
  }

  // 6. Harvest Plans (F7)
  if (cleanPath.startsWith('/harvest-plans')) {
    if (method === 'POST') {
      const crop = body.komoditas || 'padi';
      const luas = typeof body.luas_ha === 'number' ? body.luas_ha : parseFloat(body.luas_ha) || 2.0;
      const spec = CROP_BASE_SPECS[crop] || CROP_BASE_SPECS['padi'];
      const pupukFactor = body.kondisi_pupuk === 'kurang' ? 0.82 : body.kondisi_pupuk === 'sangat_kurang' ? 0.62 : 1.0;
      const airFactor = body.sumber_air === 'tadah_hujan' ? 0.90 : 1.04;
      const effectiveYield = spec.base_yield_kg_ha * spec.konversi * pupukFactor * airFactor;
      const medVol = Math.round(luas * effectiveYield);

      const baseDate = new Date('2026-11-12');
      const harvestDays = spec.days;
      const harvestDate = new Date(baseDate.getTime() + harvestDays * 86400000);
      const tAwal = new Date(harvestDate.getTime() - 5 * 86400000).toISOString().split('T')[0];
      const tAkhir = new Date(harvestDate.getTime() + 6 * 86400000).toISOString().split('T')[0];

      const commNamaMap: Record<string, string> = {
        padi: 'Padi (Beras)',
        jagung: 'Jagung Pipil',
        singkong: 'Singkong (Gaplek)',
        kedelai: 'Kedelai Lokal',
        cabai_rawit: 'Cabai Rawit',
        bawang_merah: 'Bawang Merah',
      };

      const newPlan = {
        id: `hp-${Date.now()}`,
        commodity_id: `c-${crop === 'padi' ? 'beras' : crop}`,
        commodity_nama: commNamaMap[crop] || crop,
        luas_ha: luas,
        varietas: body.varietas || spec.varietas[0],
        kondisi_pupuk: body.kondisi_pupuk || 'cukup',
        sumber_air: body.sumber_air || 'irigasi_teknis',
        tanggal_tanam: '2026-11-12',
        aktif_di_proyeksi: true,
        prediksi: {
          volume_median_kg: medVol,
          volume_p10_kg: Math.round(medVol * 0.82),
          volume_p90_kg: Math.round(medVol * 1.18),
          tanggal_panen_awal: tAwal,
          tanggal_panen_akhir: tAkhir,
          tingkat_keyakinan: luas >= 1.0 ? 'tinggi' : 'sedang',
        },
      };
      stateHarvestPlans.push(newPlan);
      return { status: 'sukses', pesan: 'Rencana tanam baru berhasil ditambahkan.', data: newPlan };
    }

    if (method === 'PATCH') {
      const planId = cleanPath.split('/')[2];
      const plan = stateHarvestPlans.find((p) => p.id === planId);
      if (plan) {
        plan.aktif_di_proyeksi = body.aktif_di_proyeksi !== undefined ? !!body.aktif_di_proyeksi : !plan.aktif_di_proyeksi;
      }
      return { status: 'sukses', pesan: 'Status aktif rencana tanam diperbarui.', plan };
    }

    return {
      metadata_model: {
        label_ui: 'Gradient Boosting Quantile Regression (P10, P50, P90)',
        mae_kg_ha: 142.5,
        mape_pct: 4.82,
      },
      catatan_impor: 'Gandum/Terigu tidak memiliki rencana tanam karena 100% impor.',
      rencana_tanam: stateHarvestPlans,
    };
  }

  // Harvest Forecast
  if (cleanPath.startsWith('/forecast/harvest')) {
    const crop = body.komoditas || 'padi';
    const luas = typeof body.luas_ha === 'number' ? body.luas_ha : parseFloat(body.luas_ha) || 2.5;
    const spec = CROP_BASE_SPECS[crop] || CROP_BASE_SPECS['padi'];
    const pupukFactor = body.kondisi_pupuk === 'kurang' ? 0.82 : body.kondisi_pupuk === 'sangat_kurang' ? 0.62 : 1.0;
    const airFactor = body.sumber_air === 'tadah_hujan' ? 0.90 : 1.04;
    const effectiveYield = spec.base_yield_kg_ha * spec.konversi * pupukFactor * airFactor;

    const medVol = Math.round(luas * effectiveYield);
    const p10Vol = Math.round(medVol * 0.82);
    const p90Vol = Math.round(medVol * 1.18);

    const baseDate = new Date('2026-11-12');
    const harvestDays = spec.days + (body.kondisi_pupuk === 'sangat_kurang' ? 8 : body.kondisi_pupuk === 'kurang' ? 4 : 0);
    const harvestDate = new Date(baseDate.getTime() + harvestDays * 86400000);
    const tAwal = new Date(harvestDate.getTime() - 5 * 86400000).toISOString().split('T')[0];
    const tAkhir = new Date(harvestDate.getTime() + 6 * 86400000).toISOString().split('T')[0];

    const pupukKet = body.kondisi_pupuk === 'cukup' ? 'Optimal (Sesuai Dosis RDTK)' : body.kondisi_pupuk === 'kurang' ? 'Terbatas (-18% produktivitas)' : 'Sangat Terbatas (-38% produktivitas)';
    const airKet = body.sumber_air === 'irigasi_teknis' ? 'Irigasi Teknis Terjamin (+4%)' : 'Tadah Hujan Musiman (-10%)';

    return {
      komoditas: crop,
      luas_ha: luas,
      volume_median_kg: medVol,
      volume_p10_kg: p10Vol,
      volume_p90_kg: p90Vol,
      tingkat_keyakinan: luas >= 1.0 ? 'tinggi' : 'sedang',
      tanggal_panen_awal: tAwal,
      tanggal_panen_akhir: tAkhir,
      faktor_pengaruh: [
        { faktor: 'Luas Lahan', nilai: `${luas} ha`, dampak: `Potensi panen ${medVol.toLocaleString('id-ID')} kg`, arah: 'positif' },
        { faktor: 'Kondisi Pupuk', nilai: body.kondisi_pupuk || 'cukup', dampak: pupukKet, arah: body.kondisi_pupuk === 'sangat_kurang' ? 'negatif' : 'positif' },
        { faktor: 'Sumber Pengairan', nilai: body.sumber_air || 'irigasi_teknis', dampak: airKet, arah: body.sumber_air === 'tadah_hujan' ? 'negatif' : 'positif' },
      ],
    };
  }

  // 7. Prices & Global Signals (F8)
  if (cleanPath.startsWith('/prices/')) {
    const cid = cleanPath.split('/')[2] || 'c-terigu';
    const comm = stateOverview.komoditas.find((c: any) => c.id === cid || c.kode === cid) || stateOverview.komoditas[3]; // default terigu
    const baseP = comm.harga_sekarang || 14500;

    // Cek apakah ada event geopolitik aktif yang mendongkrak harga
    const eventGandumAktif = stateEvents.find((e) => e.id === 'evt-1')?.aktif;
    const eventPupukAktif = stateEvents.find((e) => e.id === 'evt-2')?.aktif;
    let multiplier = 1.0;
    if (eventGandumAktif && comm.kode === 'terigu') multiplier = 1.19;
    if (eventPupukAktif && (comm.kode === 'beras' || comm.kode === 'jagung')) multiplier = 1.12;

    const curPrice = Math.round(baseP * multiplier);
    const change7d = multiplier > 1.0 ? +(comm.perubahan_harga_7d_pct + 18.5).toFixed(1) : comm.perubahan_harga_7d_pct;

    const series104 = [];
    const baseDate = new Date('2024-11-15');
    const volFactor = comm.kode === 'cabai_rawit' ? 0.25 : comm.kode === 'bawang_merah' ? 0.20 : comm.kode === 'terigu' ? 0.12 : 0.08;
    for (let w = 1; w <= 104; w++) {
      const dt = new Date(baseDate.getTime() + w * 7 * 86400000);
      const priceW = Math.round(baseP * (1.0 + volFactor * Math.sin(w / 7) + (w / 104) * 0.05));
      series104.push({
        tanggal: dt.toISOString().split('T')[0],
        minggu_ke: w,
        harga: priceW,
      });
    }

    const predPct = +(1.2 + (multiplier - 1.0) * 10).toFixed(1);
    const cv = comm.kode === 'cabai_rawit' ? 18.4 : comm.kode === 'bawang_merah' ? 14.2 : comm.kode === 'terigu' ? 8.1 : 3.4;
    const volText = cv > 12 ? 'Tinggi' : cv > 6 ? 'Sedang' : 'Rendah';

    return {
      id: comm.id,
      kode: comm.kode,
      nama: comm.nama,
      satuan: comm.satuan,
      harga_sekarang: curPrice,
      perubahan_7d_pct: change7d,
      prediksi_4w_pct: predPct,
      volatilitas: volText,
      koefisien_variasi_pct: cv,
      metode_model: 'Holt-Winters ExponentialSmoothing',
      riwayat_104_minggu: series104,
      prediksi_4_minggu: [
        { minggu_ke_depan: 1, harga_prediksi: Math.round(curPrice * 1.01), batas_atas_80: Math.round(curPrice * 1.04), batas_bawah_80: Math.round(curPrice * 0.98) },
        { minggu_ke_depan: 2, harga_prediksi: Math.round(curPrice * 1.02), batas_atas_80: Math.round(curPrice * 1.06), batas_bawah_80: Math.round(curPrice * 0.97) },
        { minggu_ke_depan: 3, harga_prediksi: Math.round(curPrice * 1.03), batas_atas_80: Math.round(curPrice * 1.08), batas_bawah_80: Math.round(curPrice * 0.96) },
        { minggu_ke_depan: 4, harga_prediksi: Math.round(curPrice * 1.04), batas_atas_80: Math.round(curPrice * 1.10), batas_bawah_80: Math.round(curPrice * 0.95) },
      ],
    };
  }

  if (cleanPath.startsWith('/global/signals')) {
    const eventGandumAktif = stateEvents.find((e) => e.id === 'evt-1')?.aktif;
    const eventPupukAktif = stateEvents.find((e) => e.id === 'evt-2')?.aktif;
    const skorEksposur = eventGandumAktif || eventPupukAktif ? 28.5 : 14.2;

    return {
      skor_eksposur_global: skorEksposur,
      sinyal: [
        { kode: 'kurs_usd_idr', nama: 'Kurs USD/IDR', nilai: eventGandumAktif ? 16750 : 16400, satuan: 'Rp', perubahan_14d_pct: eventGandumAktif ? 2.8 : 0.4, komoditas_terpapar: ['Terigu', 'Kedelai', 'Minyak'] },
        { kode: 'harga_pupuk_urea', nama: 'Harga Pupuk Urea', nilai: eventPupukAktif ? 520 : 420, satuan: 'USD/ton', perubahan_14d_pct: eventPupukAktif ? 23.8 : 1.5, komoditas_terpapar: ['Padi', 'Jagung'] },
        { kode: 'indeks_pangan_fao', nama: 'Indeks Pangan Dunia (FAO)', nilai: eventGandumAktif ? 138 : 125, satuan: 'poin', perubahan_14d_pct: eventGandumAktif ? 10.4 : 1.2, komoditas_terpapar: ['Terigu', 'Gula'] },
      ],
    };
  }

  if (cleanPath.startsWith('/global/events')) {
    return {
      peristiwa: stateEvents,
    };
  }

  if (cleanPath.startsWith('/demo/event')) {
    const ev = stateEvents.find((e) => e.id === body.event_id);
    if (ev) {
      ev.aktif = !!body.aktif;
      // Peristiwa global berdampak riil pada harga pasar lokal dan sinyal risiko
      if (ev.id === 'evt-1') {
        const terigu = stateOverview.komoditas.find((c: any) => c.id === 'c-terigu');
        if (terigu) {
          terigu.harga_sekarang = ev.aktif ? 15500 : 13000;
          terigu.perubahan_harga_7d_pct = ev.aktif ? 19.2 : 0.0;
        }
      } else if (ev.id === 'evt-2') {
        const beras = stateOverview.komoditas.find((c: any) => c.id === 'c-beras');
        const jagung = stateOverview.komoditas.find((c: any) => c.id === 'c-jagung');
        if (beras) {
          beras.harga_sekarang = ev.aktif ? 16200 : 14500;
          beras.perubahan_harga_7d_pct = ev.aktif ? 11.7 : 0.8;
        }
        if (jagung) {
          jagung.harga_sekarang = ev.aktif ? 9400 : 8200;
          jagung.perubahan_harga_7d_pct = ev.aktif ? 14.6 : 0.0;
        }
      } else if (ev.id === 'evt-3') {
        const cabai = stateOverview.komoditas.find((c: any) => c.id === 'c-cabai');
        const bawang = stateOverview.komoditas.find((c: any) => c.id === 'c-bawang');
        if (cabai) {
          cabai.harga_sekarang = ev.aktif ? 56000 : 45000;
          cabai.perubahan_harga_7d_pct = ev.aktif ? 24.4 : 0.0;
        }
        if (bawang) {
          bawang.harga_sekarang = ev.aktif ? 42000 : 35000;
          bawang.perubahan_harga_7d_pct = ev.aktif ? 20.0 : 0.0;
        }
      }

      const activeCount = stateEvents.filter((e) => e.aktif).length;
      if (stateOverview.skor_ketahanan) {
        stateOverview.skor_ketahanan.skor_eksposur_global = +(3.4 + activeCount * 2.2).toFixed(1);
      }
      recalculateOverviewSummary();
    }
    return {
      status: 'sukses',
      pesan: body.aktif
        ? `Peristiwa global "${ev?.nama || 'Krisis'}" aktif! Harga komoditas terdampak melonjak.`
        : `Peristiwa global "${ev?.nama || 'Krisis'}" dinonaktifkan. Indikator pasar kembali normal.`,
    };
  }

  // 8. Scenario Simulator (F6)
  if (cleanPath.startsWith('/scenarios/presets')) {
    return {
      presets: [
        { id: 'preset-konflik-gandum', nama: 'Konflik jalur gandum dan pupuk', delta_s: 0.60, delta_p: 0.40, delta_k: 0.10, delta_h: 0.20, durasi: 60 },
        { id: 'preset-pupuk-mahal', nama: 'Gagal panen pupuk mahal & kemarau', delta_s: 0.10, delta_p: 0.20, delta_k: 0.05, delta_h: 0.40, durasi: 90 },
        { id: 'preset-krisis-impor', nama: 'Embargo impor gandum & kedelai', delta_s: 0.90, delta_p: 0.60, delta_k: 0.15, delta_h: 0.10, durasi: 60 },
        { id: 'preset-inflasi', nama: 'Lonjakan inflasi & pelemahan rupiah', delta_s: 0.20, delta_p: 0.50, delta_k: 0.25, delta_h: 0.05, durasi: 45 },
      ],
    };
  }

  if (cleanPath.startsWith('/scenarios/run') || (cleanPath === '/scenarios' && method === 'POST')) {
    const nama = body.nama || 'Simulasi Guncangan Pangan Desa';
    const T = typeof body.durasi === 'number' ? Math.max(7, Math.min(180, body.durasi)) : 60;
    const dS = typeof body.delta_s === 'number' ? Math.max(0, Math.min(1, body.delta_s)) : 0.6;
    const dP = typeof body.delta_p === 'number' ? Math.max(0, Math.min(1, body.delta_p)) : 0.4;
    const dH = typeof body.delta_h === 'number' ? Math.max(0, Math.min(0.6, body.delta_h)) : 0.2;
    const dK = typeof body.delta_k === 'number' ? Math.max(0, Math.min(0.3, body.delta_k)) : 0.1;

    const isZero = dS < 0.001 && dP < 0.001 && dH < 0.001 && dK < 0.001;

    let totalBiayaTambahan = 0;
    const perCommodity: any[] = [];
    let weakestComm: any = null;
    let weakestDoc = 999;

    const commDefs: Record<string, { eksposur: number; pupuk: number; rho: number }> = {
      'c-beras': { eksposur: 0.02, pupuk: 0.35, rho: 0.05 },
      'c-jagung': { eksposur: 0.15, pupuk: 0.40, rho: 0.15 },
      'c-singkong': { eksposur: 0.0, pupuk: 0.10, rho: 0.0 },
      'c-terigu': { eksposur: 1.0, pupuk: 0.0, rho: 1.0 },
      'c-kedelai': { eksposur: 0.85, pupuk: 0.20, rho: 0.85 },
      'c-telur': { eksposur: 0.35, pupuk: 0.0, rho: 0.35 },
      'c-minyak': { eksposur: 0.0, pupuk: 0.0, rho: 0.05 },
      'c-gula': { eksposur: 0.45, pupuk: 0.0, rho: 0.45 },
      'c-bawang': { eksposur: 0.05, pupuk: 0.30, rho: 0.05 },
      'c-cabai': { eksposur: 0.0, pupuk: 0.20, rho: 0.0 },
    };

    stateOverview.komoditas.forEach((comm: any) => {
      const def = commDefs[comm.id] || { eksposur: comm.eksposur_impor || 0, pupuk: 0.2, rho: 0.1 };
      const e_k = def.eksposur;
      const f_k = def.pupuk;
      const rho_k = def.rho;

      const s_k = comm.stok_efektif;
      const d_k = comm.kebutuhan_harian;
      const harga_k = comm.harga_sekarang;

      // 1. Baseline with routine supply
      const drain_base = Math.max(0.001, d_k * (1.0 - rho_k));
      const raw_base = s_k / drain_base;
      const base_exceeds = raw_base > 180;
      const doc_base = Math.min(180, raw_base);
      const kekurangan_base = Math.max(0, d_k * T * (1.0 - rho_k) - s_k);

      // 2. Scenario shocks
      // rho'_k = rho_k * (1 - delta_s * e_k)
      const rho_prime = Math.max(0, rho_k * (1.0 - dS * e_k));
      // harga'_k = harga_k * (1 + delta_p * e_k) * (1 + delta_k * e_k)
      const harga_prime = Math.round(harga_k * (1.0 + dP * e_k) * (1.0 + dK * e_k));
      // Harvest loss impact on local production
      const localLoss = (1.0 - e_k) * dH * (0.5 + 0.5 * f_k);
      const drain_prime = Math.max(0.001, d_k * (1.0 - rho_prime) * (1.0 + localLoss));

      let doc_scen = isZero ? doc_base : s_k / drain_prime;
      const scen_exceeds = doc_scen > 180;
      doc_scen = Math.min(180, doc_scen);

      const kekurangan_scen = isZero ? kekurangan_base : Math.max(0, d_k * T * (1.0 - rho_prime) * (1.0 + localLoss) - s_k);
      const biaya_tambahan_k = isZero ? 0 : Math.max(0, (kekurangan_scen * harga_prime) - (kekurangan_base * harga_k));
      totalBiayaTambahan += biaya_tambahan_k;

      // Status classification
      let status = 'Aman';
      if (doc_scen < 3) status = 'Kritis';
      else if (doc_scen < 7) status = 'Siaga';
      else if (doc_scen < 14) status = 'Waspada';
      else if (doc_scen < 21) status = 'Waspada';

      if (doc_scen < weakestDoc) {
        weakestDoc = doc_scen;
        weakestComm = { nama: comm.nama, hari_bertahan: +doc_scen.toFixed(1) };
      }

      perCommodity.push({
        commodity_id: comm.id,
        kode: comm.kode,
        nama: comm.nama,
        satuan: comm.satuan,
        kelompok: comm.kelompok,
        stok_awal: s_k,
        kebutuhan_harian: d_k,
        rho_baseline: +rho_k.toFixed(2),
        rho_skenario: +rho_prime.toFixed(2),
        drain_baseline: +drain_base.toFixed(1),
        drain_skenario: +drain_prime.toFixed(1),
        doc_baseline: +doc_base.toFixed(1),
        doc_baseline_lebih_180: base_exceeds,
        doc_scen: doc_scen,
        doc_skenario: +doc_scen.toFixed(1),
        doc_skenario_lebih_180: scen_exceeds,
        kekurangan_baseline_kg: Math.round(kekurangan_base),
        kekurangan_skenario_kg: Math.round(kekurangan_scen),
        harga_baseline: harga_k,
        harga_skenario: harga_prime,
        tambahan_biaya_rp: Math.round(biaya_tambahan_k),
        status,
      });
    });

    // Chart projection for target commodity (Terigu if shocked, or weakest)
    const targetComm = (dS > 0.1 || dP > 0.1)
      ? (perCommodity.find((c) => c.kode === 'terigu') || perCommodity[0])
      : (perCommodity.find((c) => c.commodity_id === weakestComm?.commodity_id) || perCommodity[0]);

    const chart: any[] = [];
    const s0 = targetComm.stok_awal;
    const db = targetComm.drain_baseline;
    const ds = targetComm.drain_skenario;
    const step = Math.max(1, Math.floor(T / 12));
    for (let d = 0; d <= T; d += step) {
      chart.push({
        hari: d,
        baseline: Math.round(Math.max(0, s0 - db * d)),
        skenario: Math.round(Math.max(0, s0 - ds * d)),
      });
    }
    if (chart[chart.length - 1].hari !== T) {
      chart.push({
        hari: T,
        baseline: Math.round(Math.max(0, s0 - db * T)),
        skenario: Math.round(Math.max(0, s0 - ds * T)),
      });
    }

    // Skor ketahanan komposit
    const skorSebelum = 77.8;
    const skorSesudah = isZero
      ? skorSebelum
      : Math.max(15.0, +(skorSebelum - (dS * 22 + dP * 14 + dH * 18 + dK * 8)).toFixed(1));

    // Dynamic recommendations
    const rekomendasi: any[] = [];
    let pIdx = 1;
    if (dS > 0.1 || dP > 0.1) {
      rekomendasi.push({
        prioritas: pIdx++,
        judul: 'Substitusi Pangan Impor ke Pangan Lokal Desa',
        tindakan: 'Alihkan konsumsi terigu ke olahan singkong (mocaf) dan jagung lokal Desa Sidomulyo untuk menekan ketergantungan pasokan impor.',
      });
    }
    if (totalBiayaTambahan > 0) {
      rekomendasi.push({
        prioritas: pIdx++,
        judul: 'Alokasi Belanja & Pengamanan Pasokan Awal',
        tindakan: `Siapkan anggaran cadangan Rp ${Math.round(totalBiayaTambahan).toLocaleString('id-ID')} untuk menutup estimasi defisit sebelum lonjakan harga pasar penuh terjadi.`,
      });
    }
    if (weakestDoc < 21) {
      rekomendasi.push({
        prioritas: pIdx++,
        judul: `Pengajuan Bantuan Lumbung Donor untuk ${weakestComm?.nama || 'Komoditas Terlemah'}`,
        tindakan: `Ajukan transfer pasokan lumbung antar-desa ke Desa Karangsari yang memiliki cadangan aman surplus di atas 21 hari.`,
      });
    }
    if (dH > 0.1) {
      rekomendasi.push({
        prioritas: pIdx++,
        judul: 'Optimalisasi Panen Cepat & Cadangan Lumbung',
        tindakan: 'Percepat pemupukan berimbang dan jadwalkan komoditas umur pendek (sayur gizi & ubi jalar) untuk menutup potensi penurunan panen lokal.',
      });
    }
    if (rekomendasi.length === 0) {
      rekomendasi.push({
        prioritas: 1,
        judul: 'Kondisi Normal / Baseline Aman',
        tindakan: 'Tidak terdeteksi guncangan signifikan. Pertahankan pemantauan stok lumbung rutin dan jadwal tanam.',
      });
    }

    const narasi = isZero
      ? 'Kondisi Baseline (Tanpa Guncangan): Pasokan rutin berjalan normal, skor ketahanan desa stabil di 77,8 poin.'
      : `Simulasi guncangan: Pasokan impor terpangkas ${(dS * 100).toFixed(0)}%, harga naik ${(dP * 100).toFixed(0)}%, panen turun ${(dH * 100).toFixed(0)}%. Skor ketahanan desa terkoreksi dari ${skorSebelum} menjadi ${skorSesudah} poin.`;

    const resultPayload = {
      nama,
      durasi: T,
      komoditas_penentu_baru: weakestComm || { nama: 'Kedelai', hari_bertahan: 9.8 },
      tambahan_biaya_rp: Math.round(totalBiayaTambahan),
      skor_sebelum: { skor_total: skorSebelum },
      skor_sesudah: { skor_total: skorSesudah },
      komoditas_grafik: targetComm.nama,
      grafik_proyeksi: chart,
      sumber_narasi: 'Engine Deterministik SIAPANSA (Bagian 9.7 PRD)',
      narasi_ringkasan: narasi,
      rekomendasi,
      per_komoditas: perCommodity,
    };

    if (method === 'POST' && cleanPath === '/scenarios') {
      stateSavedScenarios.push(resultPayload);
    }

    return resultPayload;
  }

  // 9. Nutrition & PMT Menu Generator (F9)
  if (cleanPath.startsWith('/menus/generate')) {
    const sasaran = body.sasaran || 'balita';
    const durasi = typeof body.durasi === 'number' ? Math.max(1, Math.min(14, body.durasi)) : 7;
    const prioritas = body.prioritas || 'hindari_impor';
    const batasStokPct = typeof body.batas_stok_pct === 'number' ? body.batas_stok_pct : 0.20;

    let targetEnergi = 405;
    let targetProtein = 6.0;
    let defaultPenerima = 140;
    let labelSasaran = 'Balita (PMT Posyandu 30% AKG)';

    if (sasaran === 'ibu_hamil') {
      targetEnergi = 750;
      targetProtein = 21.0;
      defaultPenerima = 45;
      labelSasaran = 'Ibu Hamil & Menyusui (PMT 30% AKG)';
    } else if (sasaran === 'umum') {
      targetEnergi = 2100;
      targetProtein = 57.0;
      defaultPenerima = 1800;
      labelSasaran = 'Warga Umum / Dapur Umum (100% AKG)';
    }

    const penerima = defaultPenerima;

    // Menu database tailored per target group
    const menuTemplatesBalita = [
      {
        nama: 'Nasi Jagung Pulen + Tempe Bacem Halus + Sayur Bayam Kelor',
        bahan: [
          { food_id: 'b-jagung', nama: 'Jagung Pipil Lokal', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 50, kkal: 180, prot: 2.2, rp: 410 },
          { food_id: 'b-beras', nama: 'Beras Lumbung', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 25, kkal: 90, prot: 1.8, rp: 360 },
          { food_id: 'b-tempe', nama: 'Tempe Kedelai Lokal', kategori: 'protein_nabati', status_stok: 'stok_desa', g: 35, kkal: 70, prot: 4.2, rp: 500 },
          { food_id: 'b-bayam', nama: 'Sayur Hijau (Bayam & Kelor)', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 30, kkal: 25, prot: 0.8, rp: 450 },
          { food_id: 'b-minyak', nama: 'Minyak Kelapa Curah', kategori: 'pelengkap', status_stok: 'stok_desa', g: 5, kkal: 45, prot: 0.0, rp: 80 },
        ],
        langkah: [
          'Cuci bersih jagung pipil dan beras, masak bersama hingga menjadi nasi jagung aron yang lembut.',
          'Rebus tempe lokal dengan bumbu bacem tradisional (gula merah desa & ketumbar) hingga meresap.',
          'Rebus daun bayam dan kelor sebentar (3 menit) dalam kuah bening agar nutrisi vitamin tetap utuh.',
          'Sajikan hangat dengan porsi takaran mangkuk balita 200 gram.',
        ],
        tips: 'Tekstur nasi jagung dibuat lumat halus agar mudah dikunyah balita usia 12–24 bulan.',
      },
      {
        nama: 'Pure Ubi Ungu Lembut + Bakso Lele Lokal + Kuah Labu Bening',
        bahan: [
          { food_id: 'b-ubi', nama: 'Ubi Jalar / Ungu Lokal', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 75, kkal: 175, prot: 1.5, rp: 450 },
          { food_id: 'b-lele', nama: 'Ikan Lele Segar Kolam Desa', kategori: 'protein_hewani', status_stok: 'perlu_dibeli', g: 40, kkal: 105, prot: 4.8, rp: 1200 },
          { food_id: 'b-labu', nama: 'Labu Kuning & Wortel', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 30, kkal: 30, prot: 0.7, rp: 400 },
          { food_id: 'b-telur', nama: 'Telur Ayam Ras', kategori: 'protein_hewani', status_stok: 'stok_desa', g: 15, kkal: 25, prot: 1.8, rp: 420 },
          { food_id: 'b-minyak', nama: 'Minyak Nabati', kategori: 'pelengkap', status_stok: 'stok_desa', g: 6, kkal: 54, prot: 0.0, rp: 95 },
        ],
        langkah: [
          'Kukus ubi jalar hingga empuk, haluskan dengan sedikit santan encer/air matang.',
          'Giling fillet lele lokal dengan sedikit putih telur, bentuk bola bakso kecil dan rebus hingga mengapung.',
          'Masak kuah bening labu kuning dengan kaldu alami daun bawang seledri.',
          'Tata bakso lele di atas pure ubi ungu hangat, siram kuah labu.',
        ],
        tips: 'Kaya beta-karoten dan asam lemak omega untuk daya tahan tubuh dan tumbuh kembang anak.',
      },
      {
        nama: 'Singkong Keju Mocaf + Telur Dadar Daun Kelor + Sari Wortel',
        bahan: [
          { food_id: 'b-singkong', nama: 'Singkong / Tepung Mocaf Lokal', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 60, kkal: 190, prot: 1.2, rp: 360 },
          { food_id: 'b-telur', nama: 'Telur Ayam Ras Lumbung', kategori: 'protein_hewani', status_stok: 'stok_desa', g: 40, kkal: 65, prot: 5.0, rp: 1120 },
          { food_id: 'b-kelor', nama: 'Daun Kelor Kebun Gizi', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 20, kkal: 20, prot: 1.2, rp: 250 },
          { food_id: 'b-wortel', nama: 'Wortel Manis Lokal', kategori: 'buah', status_stok: 'perlu_dibeli', g: 25, kkal: 25, prot: 0.4, rp: 350 },
          { food_id: 'b-minyak', nama: 'Minyak Kelapa Curah', kategori: 'pelengkap', status_stok: 'stok_desa', g: 8, kkal: 72, prot: 0.0, rp: 130 },
        ],
        langkah: [
          'Kukus singkong pulen lokal, taburkan sedikit keju parut gurih.',
          'Kocok telur bersama irisan halus daun kelor segar dan sedikit garam.',
          'Dadar telur dengan api kecil menggunakan sedikit minyak lumbung hingga matang kecokelatan.',
          'Sajikan bersama potongan wortel rebus empuk.',
        ],
        tips: '100% bebas terigu impor, sangat kaya zat besi dan asam amino esensial dari daun kelor.',
      },
      {
        nama: 'Bubur Jagung Manis Gurih + Tahu Sutra Kukus + Sari Kacang Hijau',
        bahan: [
          { food_id: 'b-jagung', nama: 'Jagung Pipil Manis Lokal', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 65, kkal: 210, prot: 2.8, rp: 530 },
          { food_id: 'b-tahu', nama: 'Tahu Putih Lembut Desa', kategori: 'protein_nabati', status_stok: 'stok_desa', g: 45, kkal: 75, prot: 4.5, rp: 450 },
          { food_id: 'b-kacang', nama: 'Kacang Hijau Kebun Desa', kategori: 'protein_nabati', status_stok: 'perlu_dibeli', g: 20, kkal: 65, prot: 2.2, rp: 500 },
          { food_id: 'b-labu', nama: 'Labu Siam Muda', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 25, kkal: 18, prot: 0.5, rp: 250 },
          { food_id: 'b-minyak', nama: 'Minyak Curah', kategori: 'pelengkap', status_stok: 'stok_desa', g: 5, kkal: 45, prot: 0.0, rp: 80 },
        ],
        langkah: [
          'Pipil jagung manis, blender kasar lalu masak bersama air kaldu hingga menjadi bubur kental.',
          'Kukus tahu putih yang dipotong dadu mini dengan sedikit taburan bawang putih cincang.',
          'Rebus kacang hijau hingga pecah merekah sebagai pendamping nutrisi serat.',
          'Campurkan seluruh komponen dalam wadah porsi higienis.',
        ],
        tips: 'Kombinasi protein ganda nabati tinggi kalsium dan mudah dicerna usus balita.',
      },
      {
        nama: 'Nasi Tim Beras Merah + Botok Ikan Nila Desa + Sayur Bayam',
        bahan: [
          { food_id: 'b-beras', nama: 'Beras Merah Lokal', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 45, kkal: 160, prot: 3.2, rp: 650 },
          { food_id: 'b-nila', nama: 'Ikan Nila Segar Peternak Desa', kategori: 'protein_hewani', status_stok: 'perlu_dibeli', g: 40, kkal: 110, prot: 5.2, rp: 1300 },
          { food_id: 'b-kelapa', nama: 'Kelapa Parut Muda', kategori: 'pelengkap', status_stok: 'perlu_dibeli', g: 15, kkal: 55, prot: 0.5, rp: 200 },
          { food_id: 'b-bayam', nama: 'Daun Bayam Hijau', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 30, kkal: 25, prot: 0.9, rp: 400 },
          { food_id: 'b-minyak', nama: 'Minyak Nabati', kategori: 'pelengkap', status_stok: 'stok_desa', g: 6, kkal: 54, prot: 0.0, rp: 95 },
        ],
        langkah: [
          'Masak beras merah lokal dengan teknik tim hingga pulen lembut berair.',
          'Campur cincangan ikan nila dengan parutan kelapa muda dan bumbu botok tanpa cabai.',
          'Bungkus botok dalam daun pisang dan kukus selama 25 menit.',
          'Rebus daun bayam segar sebentar sebagai pelengkap serat alami.',
        ],
        tips: 'Aroma daun pisang menggugah nafsu makan anak tanpa memerlukan bahan pengawet sintetis.',
      },
      {
        nama: 'Pure Ubi Jalar Madu + Orek Tempe Lembut + Sup Kaldu Labu',
        bahan: [
          { food_id: 'b-ubi', nama: 'Ubi Jalar Madu Lokal', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 70, kkal: 180, prot: 1.4, rp: 420 },
          { food_id: 'b-tempe', nama: 'Tempe Kedelai Lumbung', kategori: 'protein_nabati', status_stok: 'stok_desa', g: 40, kkal: 80, prot: 4.8, rp: 560 },
          { food_id: 'b-telur', nama: 'Telur Ayam Ras', kategori: 'protein_hewani', status_stok: 'stok_desa', g: 20, kkal: 32, prot: 2.2, rp: 560 },
          { food_id: 'b-labu', nama: 'Labu Siam & Tomat', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 30, kkal: 20, prot: 0.6, rp: 350 },
          { food_id: 'b-minyak', nama: 'Minyak Kelapa', kategori: 'pelengkap', status_stok: 'stok_desa', g: 7, kkal: 63, prot: 0.0, rp: 110 },
        ],
        langkah: [
          'Kukus ubi jalar madu lalu tumbuk dengan sendok hingga bertekstur bubur kental lembut.',
          'Potong tempe dadu sangat kecil, tumis sebentar dengan sedikit kecap manis dan air.',
          'Orak-arik telur dengan sedikit mentega/minyak hingga lembut bercampur.',
          'Sajikan hangat bersama kuah kaldu sayur bening.',
        ],
        tips: 'Rasa manis alami dari ubi madu disukai balita tanpa memerlukan tambahan gula pasir.',
      },
      {
        nama: 'Tiwul Manis Kukus + Telur Puyuh Rebus + Sayur Bening Kelor',
        bahan: [
          { food_id: 'b-singkong', nama: 'Tiwul Singkong Gaplek Lokal', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 55, kkal: 185, prot: 1.1, rp: 330 },
          { food_id: 'b-telur-puyuh', nama: 'Telur Puyuh Rebus Desa', kategori: 'protein_hewani', status_stok: 'perlu_dibeli', g: 30, kkal: 75, prot: 4.6, rp: 1200 },
          { food_id: 'b-tahu', nama: 'Tahu Putih Kukus', kategori: 'protein_nabati', status_stok: 'stok_desa', g: 30, kkal: 50, prot: 3.0, rp: 300 },
          { food_id: 'b-kelor', nama: 'Daun Kelor Segar', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 25, kkal: 25, prot: 1.4, rp: 300 },
          { food_id: 'b-minyak', nama: 'Minyak Curah', kategori: 'pelengkap', status_stok: 'stok_desa', g: 6, kkal: 54, prot: 0.0, rp: 95 },
        ],
        langkah: [
          'Percikkan sedikit air pada tepung tiwul gaplek, kukus hingga harum pulen.',
          'Kupas telur puyuh rebus dan belah dua agar aman dikunyah anak.',
          'Kukus tahu putih dengan sedikit garam dan irisan seledri.',
          'Rebus daun kelor sebentar dalam air mendidih.',
        ],
        tips: 'Warisan pangan lokal berdaya tahan tinggi dengan indeks glikemik rendah dan padat gizi mikro.',
      },
    ];

    const menuTemplatesIbuHamil = [
      {
        nama: 'Nasi Jagung Pulen + Pepes Ikan Nila Segar + Sayur Katuk Bening + Telur Rebus',
        bahan: [
          { food_id: 'b-jagung', nama: 'Jagung Pipil Lokal', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 90, kkal: 320, prot: 4.0, rp: 740 },
          { food_id: 'b-nila', nama: 'Ikan Nila Kolam Desa', kategori: 'protein_hewani', status_stok: 'perlu_dibeli', g: 80, kkal: 190, prot: 11.5, rp: 2600 },
          { food_id: 'b-telur', nama: 'Telur Ayam Ras Lumbung', kategori: 'protein_hewani', status_stok: 'stok_desa', g: 50, kkal: 80, prot: 6.3, rp: 1400 },
          { food_id: 'b-katuk', nama: 'Daun Katuk & Jagung Manis', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 50, kkal: 45, prot: 2.1, rp: 700 },
          { food_id: 'b-minyak', nama: 'Minyak Nabati Curah', kategori: 'pelengkap', status_stok: 'stok_desa', g: 12, kkal: 108, prot: 0.0, rp: 190 },
        ],
        langkah: [
          'Masak nasi jagung campuran beras lumbung hingga matang pulen.',
          'Bumbui ikan nila dengan kunyit, kemiri, serai, bungkus daun pisang dan kukus 30 menit.',
          'Rebus telur ayam hingga matang sempurna (hard-boiled) demi keamanan konsumsi bumil.',
          'Masak sayur bening daun katuk untuk laktasi ASI optimal.',
        ],
        tips: 'Tinggi asam folat, zat besi, dan kalsium alami untuk mencegah anemia pada ibu hamil.',
      },
      {
        nama: 'Nasi Merah Pulen + Ayam Ungkep Kuning + Sayur Daun Kelor + Orek Tempe',
        bahan: [
          { food_id: 'b-beras', nama: 'Beras Merah Desa', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 85, kkal: 300, prot: 6.0, rp: 1250 },
          { food_id: 'b-ayam', nama: 'Daging Ayam Kampung', kategori: 'protein_hewani', status_stok: 'perlu_dibeli', g: 75, kkal: 185, prot: 12.0, rp: 3200 },
          { food_id: 'b-tempe', nama: 'Tempe Kedelai Lokal', kategori: 'protein_nabati', status_stok: 'stok_desa', g: 45, kkal: 90, prot: 5.4, rp: 630 },
          { food_id: 'b-kelor', nama: 'Daun Kelor & Wortel', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 50, kkal: 45, prot: 2.2, rp: 650 },
          { food_id: 'b-minyak', nama: 'Minyak Goreng Curah', kategori: 'pelengkap', status_stok: 'stok_desa', g: 14, kkal: 126, prot: 0.0, rp: 220 },
        ],
        langkah: [
          'Tanak beras merah lokal hingga pulen dan empuk.',
          'Ungkep ayam kampung dengan rempah kunyit lengkuas hingga empuk meresap.',
          'Tumis orek tempe manis gurih menggunakan sedikit minyak sawit.',
          'Rebus kuah bening daun kelor dan wortel segar.',
        ],
        tips: 'Mendukung cadangan zat besi dan mencegah risiko BBLR pada janin.',
      },
    ];

    const menuTemplatesUmum = [
      {
        nama: 'Nasi Beras & Jagung Campur + Sayur Lodeh Tahu Tempe + Ikan Goreng Crispy',
        bahan: [
          { food_id: 'b-beras', nama: 'Beras Lumbung Pangan', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 150, kkal: 540, prot: 10.8, rp: 2175 },
          { food_id: 'b-jagung', nama: 'Jagung Pipil Lokal', kategori: 'karbohidrat', status_stok: 'stok_desa', g: 60, kkal: 215, prot: 2.7, rp: 490 },
          { food_id: 'b-ikan', nama: 'Ikan Air Tawar Kolam Desa', kategori: 'protein_hewani', status_stok: 'perlu_dibeli', g: 100, kkal: 220, prot: 18.0, rp: 3500 },
          { food_id: 'b-tempe', nama: 'Tempe & Tahu Kedelai', kategori: 'protein_nabati', status_stok: 'stok_desa', g: 80, kkal: 160, prot: 9.6, rp: 1120 },
          { food_id: 'b-lodeh', nama: 'Sayur Labu Kacang Panjang', kategori: 'sayur', status_stok: 'perlu_dibeli', g: 75, kkal: 65, prot: 2.4, rp: 900 },
          { food_id: 'b-minyak', nama: 'Minyak Sawit Curah', kategori: 'pelengkap', status_stok: 'stok_desa', g: 20, kkal: 180, prot: 0.0, rp: 320 },
        ],
        langkah: [
          'Masak nasi campur beras dan jagung dalam dandang besar dapur umum.',
          'Goreng ikan air tawar bumbu ketumbar hingga renyah garing.',
          'Rebus sayur lodeh santan encer dengan tahu dan tempe dadu.',
          'Distribusikan per porsi dengan takaran centong standar dapur desa.',
        ],
        tips: 'Format porsi dapur umum warga mampu menjaga stamina tenaga kerja dan logistik desa.',
      },
    ];

    const sourceTemplates = sasaran === 'balita'
      ? menuTemplatesBalita
      : sasaran === 'ibu_hamil'
      ? menuTemplatesIbuHamil
      : menuTemplatesUmum;

    const daysPlan: any[] = [];
    let totalBiayaSeluruhHari = 0;
    const trackedUsageKg: Record<string, number> = {
      'c-jagung': 0,
      'c-singkong': 0,
      'c-telur': 0,
      'c-minyak': 0,
      'c-kedelai': 0,
    };

    for (let d = 1; d <= durasi; d++) {
      const tmpl = sourceTemplates[(d - 1) % sourceTemplates.length];
      let dayEnergi = 0;
      let dayProtein = 0;
      let dayCostPerPorsi = 0;

      const items = tmpl.bahan.map((b) => {
        const totalKg = +((b.g * penerima) / 1000).toFixed(2);
        dayEnergi += b.kkal;
        dayProtein += b.prot;
        dayCostPerPorsi += b.rp;

        if (b.food_id === 'b-jagung') trackedUsageKg['c-jagung'] += totalKg;
        if (b.food_id === 'b-singkong' || b.food_id === 'b-ubi') trackedUsageKg['c-singkong'] += totalKg;
        if (b.food_id === 'b-telur') trackedUsageKg['c-telur'] += totalKg;
        if (b.food_id === 'b-minyak') trackedUsageKg['c-minyak'] += totalKg;
        if (b.food_id === 'b-tempe' || b.food_id === 'b-tahu') trackedUsageKg['c-kedelai'] += +(totalKg * 0.6).toFixed(2);

        return {
          food_id: b.food_id,
          nama: b.nama,
          kategori: b.kategori,
          status_stok: b.status_stok,
          gram_per_porsi: b.g,
          total_kebutuhan_kg: totalKg,
          energi_kkal: b.kkal,
          protein_g: b.prot,
          biaya_per_porsi_rp: b.rp,
        };
      });

      const dayTotalCost = Math.round(dayCostPerPorsi * penerima);
      totalBiayaSeluruhHari += dayTotalCost;

      daysPlan.push({
        hari: d,
        nama_menu: tmpl.nama,
        bahan: items,
        energi_per_porsi_kkal: +dayEnergi.toFixed(1),
        target_energi_kkal: targetEnergi,
        persen_energi: Math.round((dayEnergi / targetEnergi) * 100),
        protein_per_porsi_g: +dayProtein.toFixed(1),
        target_protein_g: targetProtein,
        persen_protein: Math.round((dayProtein / targetProtein) * 100),
        biaya_per_porsi_rp: Math.round(dayCostPerPorsi),
        biaya_harian_total_rp: dayTotalCost,
        langkah_masak: tmpl.langkah,
        tips_penyajian: tmpl.tips,
      });
    }

    // Impact on village commodity stocks
    const dampakStok: any[] = [];
    const commNameMap: Record<string, string> = {
      'c-jagung': 'Jagung pipil kering',
      'c-singkong': 'Singkong kering/gaplek',
      'c-telur': 'Telur ayam ras',
      'c-minyak': 'Minyak goreng curah',
      'c-kedelai': 'Kedelai',
    };

    Object.entries(trackedUsageKg).forEach(([cid, usedKg]) => {
      const comm = stateOverview.komoditas.find((c: any) => c.id === cid);
      if (comm && usedKg > 0) {
        const sAwal = comm.stok_efektif;
        const dHarian = comm.kebutuhan_harian;
        const sSisa = Math.max(0, sAwal - usedKg);
        const docSebelum = +(sAwal / dHarian).toFixed(1);
        const docSesudah = +(sSisa / dHarian).toFixed(1);
        const alokasiMaks = +(sAwal * batasStokPct).toFixed(1);

        dampakStok.push({
          commodity_id: cid,
          nama: commNameMap[cid] || comm.nama,
          terpakai_kg: +usedKg.toFixed(1),
          alokasi_maks_kg: alokasiMaks,
          stok_awal_kg: sAwal,
          stok_sisa_kg: +sSisa.toFixed(1),
          doc_sebelum: docSebelum,
          doc_sesudah: docSesudah,
        });
      }
    });

    const substitusiList = [
      '100% Bebas Terigu Impor: Olahan karbohidrat menggunakan Singkong (Mocaf), Ubi Jalar, dan Jagung Pipil lokal Desa Sidomulyo.',
      'Substitusi Protein Mandiri: Mengutamakan Telur ayam peternak lokal, Ikan Lele kolam desa, dan Olahan Tempe/Tahu lumbung.',
    ];

    const resultMenu = {
      id: `menu-${Date.now()}`,
      sasaran: sasaran,
      sasaran_label: labelSasaran,
      jumlah_penerima: penerima,
      durasi: durasi,
      prioritas: prioritas,
      biaya_total_rp: totalBiayaSeluruhHari,
      biaya_rata_per_porsi_rp: Math.round(totalBiayaSeluruhHari / (penerima * durasi)),
      rencana_harian: daysPlan,
      dampak_stok: dampakStok,
      substitusi_impor: substitusiList,
      disclaimer: 'Dibuat AI, periksa kembali sebelum bertindak. Nilai gizi dihitung berbasis Linear Programming dan harus diverifikasi bersama petugas gizi Puskesmas.',
      status: 'draf',
    };

    return resultMenu;
  }

  if (cleanPath.includes('/menus/') && cleanPath.endsWith('/commit')) {
    // Kurangi stok komoditas yang terpakai untuk PMT di state lumbung desa
    const commJagung = stateOverview.komoditas.find((c: any) => c.id === 'c-jagung');
    if (commJagung) {
      commJagung.stok_efektif = Math.max(0, commJagung.stok_efektif - 35);
      commJagung.hari_bertahan = +(commJagung.stok_efektif / commJagung.kebutuhan_harian).toFixed(1);
    }
    const commKedelai = stateOverview.komoditas.find((c: any) => c.id === 'c-kedelai');
    if (commKedelai) {
      commKedelai.stok_efektif = Math.max(0, commKedelai.stok_efektif - 25);
      commKedelai.hari_bertahan = +(commKedelai.stok_efektif / commKedelai.kebutuhan_harian).toFixed(1);
    }

    return {
      status: 'sukses',
      pesan: 'Pemakaian stok bahan PMT berhasil dicatat ke buku besar persediaan desa.',
      transaksi_pmt: [
        { commodity: 'Jagung Pipil', volume_kg: 35.0 },
        { commodity: 'Kedelai / Olahan Tempe', volume_kg: 25.0 },
      ],
    };
  }

  // 10. Inter-Village Network & Transport Optimizer (F10)
  if (cleanPath.startsWith('/network/villages')) {
    const ownDocByKode: Record<string, number> = {};
    stateOverview.komoditas.forEach((c: any) => {
      ownDocByKode[c.kode] = c.hari_bertahan;
    });

    const villagesList = [
      {
        id: 'v-sidomulyo',
        nama: 'Desa Sidomulyo',
        is_own: true,
        penduduk: 1800,
        catatan_peran: 'Desa Kita (Pertanian Padi & Lumbung)',
        status: stateOverview.pool_pokok?.status || 'Waspada',
        lat: -7.970,
        lon: 112.600,
        doc_by_kode: ownDocByKode,
        hari_bertahan_terburuk: stateOverview.titik_terlemah?.hari_bertahan || 14.5,
      },
      {
        id: 'v-karangsari',
        nama: 'Desa Karangsari',
        is_own: false,
        penduduk: 1650,
        catatan_peran: 'Surplus Kedelai & Sentra Tahu Tempe (Kandidat Donor Kedelai)',
        status: 'Aman',
        lat: -7.945,
        lon: 112.625,
        doc_by_kode: { beras: 36.0, jagung: 30.0, singkong: 22.0, terigu: 24.0, kedelai: 32.0, telur: 25.0, minyak: 35.0, gula: 28.0, bawang_merah: 18.0, cabai_rawit: 20.0 },
        hari_bertahan_terburuk: 18.0,
      },
      {
        id: 'v-sumberrejo',
        nama: 'Desa Sumberrejo',
        is_own: false,
        penduduk: 2100,
        catatan_peran: 'Surplus Padi & Lumbung Induk Wilayah',
        status: 'Aman',
        lat: -7.990,
        lon: 112.635,
        doc_by_kode: { beras: 42.0, jagung: 25.0, singkong: 18.0, terigu: 20.0, kedelai: 18.0, telur: 22.0, minyak: 30.0, gula: 24.0, bawang_merah: 16.0, cabai_rawit: 18.0 },
        hari_bertahan_terburuk: 16.0,
      },
      {
        id: 'v-wonokerto',
        nama: 'Desa Wonokerto',
        is_own: false,
        penduduk: 1400,
        catatan_peran: 'Sentra Jagung & Singkong Dataran Tinggi',
        status: 'Waspada',
        lat: -7.930,
        lon: 112.580,
        doc_by_kode: { beras: 22.0, jagung: 40.0, singkong: 35.0, terigu: 16.0, kedelai: 15.0, telur: 18.0, minyak: 20.0, gula: 22.0, bawang_merah: 20.0, cabai_rawit: 22.0 },
        hari_bertahan_terburuk: 15.0,
      },
      {
        id: 'v-sukomakmur',
        nama: 'Desa Sukomakmur',
        is_own: false,
        penduduk: 1950,
        catatan_peran: 'Defisit Pangan (Lahan Tambang & Buruh)',
        status: 'Siaga',
        lat: -7.955,
        lon: 112.650,
        doc_by_kode: { beras: 16.0, jagung: 14.0, singkong: 12.0, terigu: 10.0, kedelai: 9.5, telur: 11.0, minyak: 15.0, gula: 18.0, bawang_merah: 10.0, cabai_rawit: 12.0 },
        hari_bertahan_terburuk: 9.5,
      },
      {
        id: 'v-majumakmur',
        nama: 'Desa Majumakmur',
        is_own: false,
        penduduk: 1550,
        catatan_peran: 'Sentra Hortikultura Sayur & Telur Unggas',
        status: 'Aman',
        lat: -8.005,
        lon: 112.595,
        doc_by_kode: { beras: 29.0, jagung: 22.0, singkong: 20.0, terigu: 18.0, kedelai: 16.0, telur: 38.0, minyak: 25.0, gula: 22.0, bawang_merah: 28.0, cabai_rawit: 30.0 },
        hari_bertahan_terburuk: 16.0,
      },
    ];

    return {
      desa: villagesList,
    };
  }

  if (cleanPath.startsWith('/network/optimize')) {
    const kedelaiComm = stateOverview.komoditas.find((c: any) => c.id === 'c-kedelai') || { hari_bertahan: 14.5 };
    const teriguComm = stateOverview.komoditas.find((c: any) => c.id === 'c-terigu') || { hari_bertahan: 15.0 };

    return {
      target_hari: 30,
      batas_donor: 21,
      total_biaya_transport_rp: 94500,
      usulan_transfer: [
        {
          id: 'trf-usulan-1',
          dari_village_id: 'v-karangsari',
          dari_village_nama: 'Desa Karangsari',
          ke_village_id: 'v-sidomulyo',
          ke_village_nama: 'Desa Sidomulyo (Kita)',
          commodity_id: 'c-kedelai',
          commodity_nama: 'Kedelai',
          satuan: 'kg',
          jumlah_kg: 350.0,
          jarak_km: 4.2,
          biaya_angkut_rp: 44100,
          doc_donor_sebelum: 32.0,
          doc_donor_sesudah: 24.2,
          doc_penerima_sebelum: kedelaiComm.hari_bertahan,
          doc_penerima_sesudah: +(kedelaiComm.hari_bertahan + (350 / 90)).toFixed(1),
          draf_pesan: 'Mohon izin mengajukan permohonan dukungan pinjam-pakai cadangan kedelai sebanyak 350 kg dari Lumbung Desa Karangsari untuk pemenuhan sasaran Posyandu dan PMT balita Desa Sidomulyo.',
          dampak_doc: `Menaikkan cadangan kedelai Sidomulyo dari ${kedelaiComm.hari_bertahan} menjadi ${+(kedelaiComm.hari_bertahan + (350 / 90)).toFixed(1)} hari.`,
          alasan: 'Karangsari memiliki surplus kedelai 32 hari (sisa 24,2 hari, aman di atas ambang donor 21 hari) dengan jarak terdekat 4,2 km.',
        },
        {
          id: 'trf-usulan-2',
          dari_village_id: 'v-karangsari',
          dari_village_nama: 'Desa Karangsari',
          ke_village_id: 'v-sidomulyo',
          ke_village_nama: 'Desa Sidomulyo (Kita)',
          commodity_id: 'c-terigu',
          commodity_nama: 'Terigu',
          satuan: 'kg',
          jumlah_kg: 400.0,
          jarak_km: 4.2,
          biaya_angkut_rp: 50400,
          doc_donor_sebelum: 24.0,
          doc_donor_sesudah: 21.0,
          doc_penerima_sebelum: teriguComm.hari_bertahan,
          doc_penerima_sesudah: +(teriguComm.hari_bertahan + (400 / 54)).toFixed(1),
          draf_pesan: 'Bersama ini Pemerintah Desa Sidomulyo mengajukan permohonan transfer stok terigu 400 kg dari Desa Karangsari guna menstabilkan cadangan bahan pokok pangan desa.',
          dampak_doc: `Menaikkan cadangan terigu Sidomulyo dari ${teriguComm.hari_bertahan} menjadi ${+(teriguComm.hari_bertahan + (400 / 54)).toFixed(1)} hari (mencapai status Aman).`,
          alasan: 'Rute distribusi logistik antar-desa terdekat (4,2 km) dengan estimasi biaya angkut pickup Rp 50.400.',
        },
      ],
    };
  }

  // Transfers CRUD
  if (cleanPath === '/transfers' && method === 'GET') {
    return { transfers: stateMyTransfers };
  }

  if (cleanPath === '/transfers' && method === 'POST') {
    const tr = {
      id: `trf-${Date.now()}`,
      status: 'Diajukan',
      created_at: new Date().toISOString(),
      ...body,
    };
    stateMyTransfers.unshift(tr);
    return { status: 'sukses', pesan: 'Permintaan bantuan berhasil dibuat.', data: tr };
  }

  if (cleanPath.startsWith('/transfers/incoming')) {
    return {
      permintaan_masuk: stateIncomingTransfers,
    };
  }

  if (cleanPath.startsWith('/transfers/') && method === 'PATCH') {
    const tid = cleanPath.split('/')[2];
    const target = stateIncomingTransfers.find((t: any) => t.id === tid);
    const newStatus = body?.status || 'Disetujui';
    if (target) {
      target.status = newStatus;
      if (newStatus === 'Disetujui') {
        const comm = stateOverview.komoditas.find((c: any) => c.id === target.commodity_id || c.kode === target.commodity_id);
        if (comm && target.jumlah) {
          comm.stok_efektif = Math.max(0, Math.round((comm.stok_efektif - Number(target.jumlah)) * 10) / 10);
          recalculateOverviewSummary();
        }
      }
    }
    return {
      status: 'sukses',
      pesan: `Permintaan transfer dari ${target?.ke_village_nama || 'desa tetangga'} berhasil diubah menjadi: ${newStatus}.`,
    };
  }

  if (cleanPath.startsWith('/demo/approve-transfer')) {
    const tid = body?.transfer_id;
    let target = stateMyTransfers.find((t: any) => t.id === tid);
    if (!target && stateMyTransfers.length > 0) {
      target = stateMyTransfers.find((t: any) => t.status === 'Diajukan') || stateMyTransfers[0];
    }
    if (!target) {
      target = {
        id: `trf-${Date.now()}`,
        dari_village_id: 'v-karangsari',
        dari_village_nama: 'Desa Karangsari',
        ke_village_id: 'v-sidomulyo',
        ke_village_nama: 'Desa Sidomulyo (Kita)',
        commodity_id: 'c-kedelai',
        commodity_nama: 'Kedelai',
        satuan: 'kg',
        jumlah: 350.0,
        jarak_km: 4.2,
        biaya_angkut: 44100,
        status: 'Diajukan',
        draf_pesan: 'Mohon dukungan pasokan cadangan kedelai 350 kg untuk pemenuhan gizi balita Sidomulyo.',
        created_at: new Date().toISOString(),
      };
      stateMyTransfers.unshift(target);
    }
    target.status = 'Diterima';

    const comm = stateOverview.komoditas.find((c: any) => c.id === target.commodity_id || c.kode === target.commodity_id);
    if (comm && target.jumlah) {
      comm.stok_efektif = Math.round((comm.stok_efektif + Number(target.jumlah)) * 10) / 10;
      recalculateOverviewSummary();
    }

    return {
      status: 'sukses',
      pesan: `Permintaan transfer bantuan disetujui donor (${target.dari_village_nama}). Cadangan ${target.commodity_nama} Desa Sidomulyo bertambah ${target.jumlah} ${target.satuan || 'kg'}.`,
    };
  }

  // 11. Assistant Chat (F11)
  if (cleanPath.startsWith('/assistant/chat')) {
    const q = (body.pesan || body.pertanyaan || '').toLowerCase();
    let reply = '';
    const pokokDays = stateOverview.pool_pokok?.hari_bertahan ?? 32.8;
    const protDays = stateOverview.pool_protein?.hari_bertahan ?? 15.3;
    const weakest = stateOverview.titik_terlemah ?? { nama: 'Kedelai', hari_bertahan: 14.5, status: 'Waspada' };
    let toolSummary = {
      tool: 'get_status',
      label: 'Engine Ketahanan Pangan Desa Sidomulyo',
      ringkasan_data: { status: stateOverview.pool_pokok?.status || 'Aman', doc_pokok: pokokDays, doc_protein: protDays, titik_terlemah: `${weakest.nama} (${weakest.hari_bertahan} hr)` },
    };

    if (q.includes('terigu') && (q.includes('60') || q.includes('krisis') || q.includes('impor') || q.includes('guncangan'))) {
      const terigu = stateOverview.komoditas.find((c: any) => c.id === 'c-terigu') || { stok_efektif: 810, hari_bertahan: 15.0 };
      const shockDays = +(terigu.hari_bertahan * 0.4).toFixed(1);
      reply = `Bila impor gandum terganggu 60%, cadangan terigu Desa Sidomulyo (saat ini ${formatAngka(terigu.stok_efektif, 0)} kg) anjlok menjadi ${shockDays} hari bertahan (Status: Siaga). Disarankan substitusi menggunakan tepung mocaf singkong dan jagung lokal.`;
      toolSummary = { tool: 'simulate_shock', label: 'Engine Simulasi Guncangan (F6)', ringkasan_data: { shock: 'Impor -60%', doc_baru: shockDays, status: 'Siaga' } };
    } else if (q.includes('kedelai') && (q.includes('bantu') || q.includes('desa') || q.includes('donor') || q.includes('transfer'))) {
      reply = `Berdasarkan optimasi jaringan gugus desa, Desa Karangsari memiliki cadangan kedelai 32,0 hari (surplus 11 hari di atas batas donor 21 hari). Anda dapat mengajukan transfer bantuan 350 kg kedelai dengan jarak angkut 4,2 km.`;
      toolSummary = { tool: 'optimize_distribution', label: 'Optimasi Jaringan Gugus Desa (F10)', ringkasan_data: { donor: 'Desa Karangsari', volume_kg: 350, doc_donor: 32.0, jarak_km: 4.2 } };
    } else if (q.includes('menu') || q.includes('pmt') || q.includes('balita') || q.includes('resep')) {
      reply = `Telah disusun menu PMT 7 hari tanpa terigu berbasis jagung, tempe bacem, dan bayam kelor lokal. Total biaya rata-rata Rp 5.950 per porsi dengan pemenuhan 101,8% energi dan 136,7% protein AKG balita.`;
      toolSummary = { tool: 'optimize_menu', label: 'Optimasi Menu Linear Programming (F9)', ringkasan_data: { prioritas: 'hindari_impor', biaya_porsi: 5950, persen_akg: '100%+' } };
    } else if (q.includes('panen') || q.includes('tanam') || q.includes('padi')) {
      reply = `Model prediksi panen Machine Learning memperkirakan panen padi sawah Sidomulyo (12 ha varietas Inpari 32) pada 28 November 2026 menghasilkan estimasi 3.960 kg beras bersih (+8,8 hari cadangan desa).`;
      toolSummary = { tool: 'predict_yield', label: 'Prediksi Panen ML (F7)', ringkasan_data: { komoditas: 'Padi', estimasi_kg: 3960, tambah_doc: 8.8 } };
    } else if (q.includes('harga') || q.includes('pasar') || q.includes('inflasi')) {
      const topPrice = [...stateOverview.komoditas].sort((a: any, b: any) => b.harga_sekarang - a.harga_sekarang)[0];
      reply = `Harga komoditas pangan lokal Sidomulyo terpantau stabil dengan skor eksposur pasar global ${stateOverview.skor_ketahanan?.skor_eksposur_global || 3.4}/10. Komoditas dengan harga tertinggi saat ini adalah ${topPrice?.nama || 'Cabai'} (Rp ${topPrice?.harga_sekarang?.toLocaleString('id-ID')}/${topPrice?.satuan}).`;
      toolSummary = { tool: 'price_signals', label: 'Sinyal Global & Harga Pasar (F8)', ringkasan_data: { eksposur: stateOverview.skor_ketahanan?.skor_eksposur_global, komoditas_tertinggi: topPrice?.nama } };
    } else if (q.includes('sukomakmur') || q.includes('defisit') || q.includes('tetangga')) {
      reply = `Desa Sukomakmur berada pada status Siaga (cadangan pangan terendah 9,5 hari). Sukomakmur telah mengajukan permohonan pinjam cadangan 500 kg beras ke lumbung Sidomulyo dan aman disetujui (sisa cadangan Sidomulyo tetap 36,9 hari di atas batas aman 21 hari).`;
      toolSummary = { tool: 'cluster_status', label: 'Jaringan Gugus Sumbermulyo (F10)', ringkasan_data: { desa: 'Sukomakmur', status: 'Siaga', permohonan: '500 kg Beras' } };
    } else if (q.includes('stok') || q.includes('beras') || q.includes('lumbung')) {
      const beras = stateOverview.komoditas.find((c: any) => c.id === 'c-beras') || { stok_efektif: 17100, hari_bertahan: 38.0 };
      reply = `Stok efektif beras Desa Sidomulyo saat ini mencapai ${formatAngka(beras.stok_efektif, 0)} kg, cukup untuk ${formatAngka(beras.hari_bertahan, 1)} hari konsumsi warga (Status: Aman di atas target 30 hari).`;
      toolSummary = { tool: 'get_commodity_stock', label: 'Inventarisasi Lumbung (F2)', ringkasan_data: { komoditas: 'Beras', stok_kg: beras.stok_efektif, doc_hari: beras.hari_bertahan } };
    } else {
      reply = `Hari ini ketahanan pangan pokok Desa Sidomulyo mampu bertahan ${pokokDays} hari (${stateOverview.pool_pokok?.status || 'Aman'}, target ${stateOverview.target_hari || 30} hari). Cadangan protein bertahan ${protDays} hari. Titik terlemah berada pada ${weakest.nama} (${weakest.hari_bertahan} hari) yang membutuhkan pemantauan ketat.`;
      toolSummary = { tool: 'get_status', label: 'Status Cadangan FEFO (F2)', ringkasan_data: { doc_pokok: pokokDays, doc_protein: protDays, terlemah: `${weakest.nama} (${weakest.hari_bertahan} hr)` } };
    }

    return {
      jawaban: reply,
      dasar_jawaban: [toolSummary],
      sumber_data: 'Engine Deterministik SIAPANSA',
      label_ai: 'Dibuat AI, periksa kembali sebelum bertindak',
    };
  }

  // 12. Reports (F12)
  if (cleanPath.startsWith('/reports/preview')) {
    const p = body.periode || 30;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const pokokDays = stateOverview.pool_pokok?.hari_bertahan ?? 32.8;
    const protDays = stateOverview.pool_protein?.hari_bertahan ?? 15.3;
    const weakest = stateOverview.titik_terlemah ?? { nama: 'Kedelai', hari_bertahan: 14.5, status: 'Waspada' };
    const skor = stateOverview.skor_ketahanan?.skor_total ?? 77.8;

    let narrative = `Berdasarkan inventarisasi stok per ${todayStr}, cadangan pangan pokok Desa Sidomulyo mampu bertahan selama ${pokokDays} hari (Status: ${stateOverview.pool_pokok?.status || 'Aman'}). Cadangan protein mampu bertahan ${protDays} hari. Titik terlemah berada pada komoditas ${weakest.nama} (${weakest.hari_bertahan} hari bertahan, Status: ${weakest.status}), yang memerlukan prioritas penguatan cadangan lumbung atau substitusi pangan lokal.`;

    if (p === 7) {
      narrative = `Evaluasi Kesiapsiagaan Darurat 7 Hari: Cadangan pangan pokok desa berada pada level ${pokokDays} hari, melampaui ambang batas siaga 7 hari. Titik terlemah ${weakest.nama} (${weakest.hari_bertahan} hari) berada di atas batas kritis 72 jam namun memerlukan pemantauan harian berkala.`;
    } else if (p === 90) {
      narrative = `Proyeksi Ketahanan Pangan Triwulan (90 Hari): Mempertimbangkan kalender tanam dan panen desa, cadangan pokok ${pokokDays} hari membutuhkan pasokan panen padi lokal musim mendatang. Alokasi transfer antar-desa Karangsari dan diversifikasi pangan non-terigu disarankan untuk mengamankan 90 hari ke depan.`;
    }

    const shareSlug = `sidomulyo-${todayStr.replace(/-/g, '')}`;
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://siapansi-nsxa.vercel.app';
    const fullShareUrl = `${baseUrl}/laporan-publik/${shareSlug}`;

    return {
      desa: {
        nama: 'Desa Sidomulyo',
        kecamatan: 'Sumbermulyo',
        kabupaten: 'Kabupaten Malang',
        jumlah_penduduk: 1800,
      },
      periode_hari: p,
      tanggal_cetak: todayStr,
      ringkasan_naratif: narrative,
      pool_pokok: stateOverview.pool_pokok,
      pool_protein: stateOverview.pool_protein,
      titik_terlemah: stateOverview.titik_terlemah,
      skor_ketahanan: stateOverview.skor_ketahanan,
      komoditas: stateOverview.komoditas,
      tiga_risiko_utama: stateOverview.peringatan_teratas,
      teks_whatsapp: `*LAPORAN KETAHANAN PANGAN DESA SIDOMULYO*\nTanggal: ${todayStr} (Periode ${p} Hari)\n\n• Cadangan Pokok: ${pokokDays} hari (${stateOverview.pool_pokok?.status || 'Aman'})\n• Cadangan Protein: ${protDays} hari (${stateOverview.pool_protein?.status || 'Waspada'})\n• Titik Terlemah: ${weakest.nama} (${weakest.hari_bertahan} hari)\n• Skor Ketahanan Desa: ${skor} / 100\n\nRingkasan:\n${narrative}\n\nBuka laporan resmi A4 publik di sini:\n${fullShareUrl}\n\n(Diterbitkan resmi oleh SIAPANSA — Musyawarah Desa Sidomulyo)`,
    };
  }

  if (cleanPath.startsWith('/reports/share')) {
    const now = new Date();
    const exp = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];
    const shareSlug = `sidomulyo-${todayStr.replace(/-/g, '')}`;
    return {
      url_publik: `/laporan-publik/${shareSlug}`,
      expires_at: exp.toISOString(),
    };
  }

  if (cleanPath.startsWith('/public/reports/')) {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const pokokDays = stateOverview.pool_pokok?.hari_bertahan ?? 32.8;
    const protDays = stateOverview.pool_protein?.hari_bertahan ?? 15.3;
    const weakest = stateOverview.titik_terlemah ?? { nama: 'Kedelai', hari_bertahan: 14.5, status: 'Waspada' };

    return {
      snapshot: {
        desa: {
          nama: 'Desa Sidomulyo',
          kecamatan: 'Sumbermulyo',
          kabupaten: 'Kabupaten Malang',
          jumlah_penduduk: 1800,
        },
        periode_hari: 30,
        tanggal_cetak: todayStr,
        ringkasan_naratif: `Laporan Publik Ketahanan Pangan Desa Sidomulyo: Cadangan pangan pokok desa bertahan ${pokokDays} hari dan protein bertahan ${protDays} hari jika pasokan dari luar terhenti. Situasi terkendali dengan prioritas pengawasan pada komoditas ${weakest.nama} (${weakest.hari_bertahan} hari).`,
        pool_pokok: stateOverview.pool_pokok,
        pool_protein: stateOverview.pool_protein,
        titik_terlemah: stateOverview.titik_terlemah,
        skor_ketahanan: stateOverview.skor_ketahanan,
        komoditas: stateOverview.komoditas,
        tiga_risiko_utama: stateOverview.peringatan_teratas,
      },
    };
  }

  // 13. Population (F4) & Commodities Norma
  if (cleanPath.startsWith('/population')) {
    if (method === 'PUT') {
      statePopulation = { ...statePopulation, ...body };
      const tot = Number(statePopulation.total) || 1800;
      stateOverview.komoditas.forEach((c: any) => {
        if (c.norma_per_kapita_hari) {
          c.kebutuhan_harian = +(c.norma_per_kapita_hari * tot).toFixed(1);
        }
      });
      recalculateOverviewSummary();
      return {
        status: 'sukses',
        pesan: `Data penduduk berhasil diperbarui (${tot} jiwa). Kebutuhan harian 10 komoditas telah dihitung ulang.`,
        data: statePopulation,
      };
    }
    return statePopulation;
  }

  if (cleanPath.includes('/norma') && method === 'PUT') {
    const parts = cleanPath.split('/');
    const cid = parts[parts.indexOf('commodities') + 1];
    const comm = stateOverview.komoditas.find((c: any) => c.id === cid || c.kode === cid);
    const newNorma = typeof body.norma_per_kapita_hari === 'number' ? body.norma_per_kapita_hari : parseFloat(body.norma_per_kapita_hari);
    if (comm && newNorma > 0) {
      comm.norma_per_kapita_hari = newNorma;
      const tot = Number(statePopulation.total) || 1800;
      comm.kebutuhan_harian = +(comm.norma_per_kapita_hari * tot).toFixed(1);
      recalculateOverviewSummary();
    }
    return {
      status: 'sukses',
      pesan: `Norma konsumsi ${comm?.nama || 'komoditas'} diubah menjadi ${newNorma} ${comm?.satuan || 'kg'}/kapita/hari.`,
    };
  }

  // 14. Settings (F14)
  if (cleanPath.startsWith('/settings')) {
    if (method === 'PUT') {
      stateSettings = { ...stateSettings, ...body };
      if (typeof body.target_hari === 'number') {
        stateOverview.target_hari = body.target_hari;
      }
      recalculateOverviewSummary();
      return stateSettings;
    }
    return stateSettings;
  }

  // 15. Demo Controls: Advance & Reset (F14)
  if (cleanPath.startsWith('/demo/advance')) {
    const days = body.days || 1;
    // Kurangi stok harian
    stateOverview.komoditas.forEach((c: any) => {
      c.stok_efektif = Math.max(0, Math.round((c.stok_efektif - c.kebutuhan_harian * days) * 10) / 10);
    });

    // Majukan jam virtual
    const d = new Date(stateSettings.jam_virtual);
    d.setDate(d.getDate() + days);
    stateSettings.jam_virtual = d.toISOString();
    stateOverview.as_of = d.toISOString().split('T')[0];
    stateOverview.jam_virtual = stateSettings.jam_virtual;

    recalculateOverviewSummary();
    return {
      status: 'sukses',
      pesan: `Waktu virtual berhasil dimajukan ${days} hari (Tanggal sekarang: ${stateOverview.as_of}). Konsumsi harian warga telah dipotong dari stok.`,
    };
  }

  if (cleanPath.startsWith('/demo/reset')) {
    stateOverview = JSON.parse(JSON.stringify(INITIAL_OVERVIEW));
    stateEvents.forEach((e) => (e.aktif = false));
    statePopulation = {
      total: 1800,
      kk: 520,
      balita: 140,
      ibu_hamil_menyusui: 45,
      lansia: 210,
      catatan_akg: 'Standar AKG Kemenkes 2019: 2.100 kkal & 57g protein per orang per hari. Balita dan ibu hamil/menyusui memiliki bobot kebutuhan gizi mikro khusus.',
    };
    stateSettings = {
      target_hari: 30,
      batas_donor: 21,
      ambang: { aman: 21, waspada: 14, siaga: 7, kritis: 0, bawah_72_jam: 3 },
      jam_virtual: '2026-11-12T08:00:00',
      ai_enabled: true,
    };
    stateMyTransfers = [
      {
        id: 'trf-1',
        dari_village_id: 'v-karangsari',
        dari_village_nama: 'Desa Karangsari',
        ke_village_id: 'v-sidomulyo',
        ke_village_nama: 'Desa Sidomulyo (Kita)',
        commodity_id: 'c-kedelai',
        commodity_nama: 'Kedelai',
        satuan: 'kg',
        jumlah: 350.0,
        jarak_km: 4.2,
        biaya_angkut: 44100,
        status: 'Diajukan',
        draf_pesan: 'Mohon dukungan pasokan cadangan kedelai 350 kg untuk pemenuhan gizi balita Sidomulyo.',
        created_at: '2026-11-12T08:30:00',
      },
    ];
    stateIncomingTransfers = [
      {
        id: 'trf-in-1',
        dari_village_id: 'v-sidomulyo',
        dari_village_nama: 'Desa Sidomulyo (Kita)',
        ke_village_id: 'v-sukomakmur',
        ke_village_nama: 'Desa Sukomakmur',
        commodity_id: 'c-beras',
        commodity_nama: 'Beras',
        satuan: 'kg',
        jumlah: 500.0,
        status: 'Diajukan',
        draf_pesan: 'Permohonan bantuan darurat cadangan beras 500 kg dari Lumbung Desa Sidomulyo untuk menangani defisit pangan 35 KK rentan di Dusun Krajan Sukomakmur.',
        doc_desa_kita_sebelum: 38.0,
        doc_desa_kita_sesudah: 36.9,
        aman_untuk_disetujui: true,
      },
    ];
    recalculateOverviewSummary();
    return { status: 'sukses', pesan: 'Semua data simulasi berhasil di-reset ke kondisi awal prototipe.' };
  }

  // Generic fallback
  return { status: 'sukses', pesan: 'Operasi berhasil.' };
}
