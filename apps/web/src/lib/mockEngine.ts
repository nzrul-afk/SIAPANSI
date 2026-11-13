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
    ke_village_nama: 'Desa Sidomulyo',
    commodity_id: 'c-kedelai',
    commodity_nama: 'Kedelai',
    satuan: 'kg',
    jumlah: 350.0,
    status: 'Diajukan',
    draf_pesan: 'Mohon dukungan pasokan cadangan kedelai 350 kg untuk pemenuhan gizi balita Sidomulyo.',
    created_at: '2026-11-12T08:30:00',
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

const CROP_BASE_SPECS: Record<string, { base_yield_kg_ha: number; konversi: number; days: number; varietas: string[] }> = {
  padi: { base_yield_kg_ha: 5500.0, konversi: 0.60, days: 105, varietas: ['Inpari 32', 'Ciherang', 'IR64'] },
  jagung: { base_yield_kg_ha: 5000.0, konversi: 1.00, days: 95, varietas: ['Bisi 18', 'Pioneer P27', 'NK212'] },
  kedelai: { base_yield_kg_ha: 1500.0, konversi: 1.00, days: 85, varietas: ['Anjasmoro', 'Grobogan', 'Argomulyo'] },
  singkong: { base_yield_kg_ha: 20000.0, konversi: 0.33, days: 210, varietas: ['Manggu', 'Kasesa', 'Adira 4'] },
  cabai_rawit: { base_yield_kg_ha: 8000.0, konversi: 1.00, days: 85, varietas: ['Dewata 43', 'Bara', 'Pelita'] },
  bawang_merah: { base_yield_kg_ha: 10000.0, konversi: 1.00, days: 60, varietas: ['Bima Brebes', 'Tajuk', 'Bauji'] },
};

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
    const fisik = body.jumlah_fisik ?? 17000;
    if (comm) {
      comm.stok_efektif = fisik;
      comm.hari_bertahan = +(fisik / comm.kebutuhan_harian).toFixed(1);
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
        comm.hari_bertahan = +(comm.stok_efektif / comm.kebutuhan_harian).toFixed(1);
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
    if (ev) ev.aktif = !!body.aktif;
    return { status: 'sukses', pesan: 'Status peristiwa guncangan berhasil diubah.' };
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
    const penerima = body.sasaran === 'balita' ? 140 : body.sasaran === 'ibu_hamil' ? 45 : 1800;
    const durasi = body.durasi || 7;
    const sampleMenus = [
      { nama: 'Nasi Jagung + Tempe Bacem + Sup Bayam Kelor', energi: 420, protein: 8.5, biaya: 5800 },
      { nama: 'Ubi Kukus Gurih + Telur Dadar Daun Kelor + Bening Labu', energi: 410, protein: 8.2, biaya: 6100 },
      { nama: 'Singkong Mocaf + Bakso Lele Lokal + Tumis Kangkung', energi: 415, protein: 8.4, biaya: 6200 },
      { nama: 'Nasi Merah + Orek Tempe Manis + Sayur Katuk Jagung', energi: 405, protein: 7.9, biaya: 5700 },
      { nama: 'Bubur Jagung Manis + Tahu Sutra Kukus + Sari Kacang Hijau', energi: 412, protein: 8.1, biaya: 5900 },
      { nama: 'Pure Ubi Ungu + Pepes Ikan Nila Desa + Sayur Bening Bayam', energi: 425, protein: 8.6, biaya: 6300 },
      { nama: 'Tiwul Singkong Manis + Botok Tempe Tahu Kelapa Muda', energi: 402, protein: 7.8, biaya: 5650 },
    ];

    const daysPlan = [];
    for (let d = 1; d <= durasi; d++) {
      const sm = sampleMenus[(d - 1) % sampleMenus.length];
      daysPlan.push({
        hari: d,
        nama_menu: sm.nama,
        biaya_per_porsi_rp: sm.biaya,
        energi_per_porsi_kkal: sm.energi,
        protein_per_porsi_g: sm.protein,
        persen_energi: Math.round((sm.energi / 400) * 100),
        persen_protein: Math.round((sm.protein / 6.0) * 100),
        bahan: [
          { food_id: 'b-jagung', nama: 'Jagung Pipil Lokal', sumber: 'Lumbung Desa', gram_per_porsi: 60, total_kg: +(0.06 * penerima).toFixed(1), energi_kkal: 210, protein_g: 2.5, biaya_rp: 600 },
          { food_id: 'b-tempe', nama: 'Tempe / Kedelai Lokal', sumber: 'Pengrajin Desa', gram_per_porsi: 45, total_kg: +(0.045 * penerima).toFixed(1), energi_kkal: 120, protein_g: 4.8, biaya_rp: 1800 },
          { food_id: 'b-sayur', nama: 'Sayur Hijau (Bayam/Kelor)', sumber: 'Kebun Gizi', gram_per_porsi: 40, total_kg: +(0.04 * penerima).toFixed(1), energi_kkal: 35, protein_g: 0.9, biaya_rp: 1200 },
          { food_id: 'b-minyak', nama: 'Minyak Goreng Curah', sumber: 'Stok Desa', gram_per_porsi: 5, total_kg: +(0.005 * penerima).toFixed(1), energi_kkal: 45, protein_g: 0.0, biaya_rp: 400 },
        ],
      });
    }

    return {
      id: `menu-${Date.now()}`,
      sasaran: body.sasaran || 'balita',
      sasaran_label: body.sasaran === 'balita' ? 'Balita Posyandu (140 anak)' : 'Ibu Hamil & Menyusui',
      jumlah_penerima: penerima,
      durasi: durasi,
      biaya_rata_per_porsi_rp: 5950,
      biaya_total_rp: 5950 * penerima * durasi,
      disclaimer: 'Dibuat AI, periksa kembali sebelum bertindak. Nilai gizi dihitung berbasis Linear Programming dan harus diverifikasi dengan petugas gizi Puskesmas.',
      substitusi_impor: [
        'Mengganti 100% terigu impor dengan tepung mocaf singkong dan jagung lokal.',
        'Mengutamakan protein nabati lokal (tempe lumbung & telur ayam peternak desa).',
      ],
      rencana_harian: daysPlan,
    };
  }

  if (cleanPath.includes('/menus/') && cleanPath.endsWith('/commit')) {
    return {
      status: 'sukses',
      transaksi_pmt: [
        { commodity: 'jagung', volume: 8.4 },
        { commodity: 'kedelai', volume: 6.3 },
      ],
    };
  }

  // 10. Inter-Village Network & Transport Optimizer (F10)
  if (cleanPath.startsWith('/network/villages')) {
    return {
      desa: [
        {
          id: 'v-sidomulyo',
          nama: 'Desa Sidomulyo',
          is_own: true,
          penduduk: 1800,
          catatan_peran: 'Desa Kita (Pertanian Padi & Lumbung)',
          status: 'Waspada',
          lat: -7.970,
          lon: 112.600,
          doc_by_kode: { beras: 38.0, jagung: 28.0, singkong: 20.0, terigu: 15.0, kedelai: 14.5, telur: 16.0, minyak: 30.0, gula: 25.0, bawang_merah: 14.0, cabai_rawit: 16.0 },
        },
        {
          id: 'v-karangsari',
          nama: 'Desa Karangsari',
          is_own: false,
          penduduk: 1650,
          catatan_peran: 'Surplus Kedelai & Sentra Tahu Tempe',
          status: 'Aman',
          lat: -7.945,
          lon: 112.625,
          doc_by_kode: { beras: 36.0, jagung: 30.0, singkong: 22.0, terigu: 24.0, kedelai: 32.0, telur: 25.0, minyak: 35.0, gula: 28.0, bawang_merah: 18.0, cabai_rawit: 20.0 },
        },
        {
          id: 'v-sumberrejo',
          nama: 'Desa Sumberrejo',
          is_own: false,
          penduduk: 2100,
          catatan_peran: 'Surplus Padi & Lumbung Induk',
          status: 'Aman',
          lat: -7.990,
          lon: 112.635,
          doc_by_kode: { beras: 42.0, jagung: 25.0, singkong: 18.0, terigu: 20.0, kedelai: 18.0, telur: 22.0, minyak: 30.0, gula: 24.0, bawang_merah: 16.0, cabai_rawit: 18.0 },
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
        },
        {
          id: 'v-sukomakmur',
          nama: 'Desa Sukomakmur',
          is_own: false,
          penduduk: 1950,
          catatan_peran: 'Defisit Pangan (Lahan Tambang/Industri)',
          status: 'Siaga',
          lat: -7.955,
          lon: 112.650,
          doc_by_kode: { beras: 16.0, jagung: 14.0, singkong: 12.0, terigu: 10.0, kedelai: 9.5, telur: 11.0, minyak: 15.0, gula: 18.0, bawang_merah: 10.0, cabai_rawit: 12.0 },
        },
        {
          id: 'v-majumakmur',
          nama: 'Desa Majumakmur',
          is_own: false,
          penduduk: 1550,
          catatan_peran: 'Sentra Hortikultura & Telur Unggas',
          status: 'Aman',
          lat: -8.005,
          lon: 112.595,
          doc_by_kode: { beras: 29.0, jagung: 22.0, singkong: 20.0, terigu: 18.0, kedelai: 16.0, telur: 38.0, minyak: 25.0, gula: 22.0, bawang_merah: 28.0, cabai_rawit: 30.0 },
        },
      ],
    };
  }

  if (cleanPath.startsWith('/network/optimize')) {
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
          draf_pesan: 'Mohon dukungan pasokan cadangan kedelai 350 kg dari lumbung donor Karangsari untuk Posyandu Sidomulyo.',
          dampak_doc: 'Menaikkan cadangan kedelai Sidomulyo dari 14.5 menjadi 18.4 hari.',
          alasan: 'Karangsari surplus kedelai (32 hari, aman di atas batas donor 21 hari).',
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
          dampak_doc: 'Menaikkan cadangan terigu Sidomulyo dari 15.0 menjadi 22.4 hari (Masuk Status Aman).',
          alasan: 'Rute terpendek 4.2 km dengan biaya angkut paling efisien.',
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
    stateMyTransfers.push(tr);
    return { status: 'sukses', pesan: 'Permintaan bantuan berhasil dibuat.', data: tr };
  }

  if (cleanPath.startsWith('/transfers/incoming')) {
    return {
      permintaan_masuk: [
        {
          id: 'trf-in-1',
          dari_village_id: 'v-sidomulyo',
          dari_village_nama: 'Desa Sidomulyo',
          ke_village_id: 'v-sukomakmur',
          ke_village_nama: 'Desa Sukomakmur',
          commodity_id: 'c-beras',
          commodity_nama: 'Beras',
          satuan: 'kg',
          jumlah: 500.0,
          status: 'Diajukan',
          draf_pesan: 'Permohonan pinjaman cadangan beras 500 kg untuk penanganan darurat kekurangan pangan warga.',
          doc_desa_kita_sebelum: 38.0,
          doc_desa_kita_sesudah: 36.9,
          aman_untuk_disetujui: true,
        },
      ],
    };
  }

  if (cleanPath.startsWith('/demo/approve-transfer')) {
    if (stateMyTransfers.length > 0) {
      stateMyTransfers[0].status = 'Disetujui';
    }
    return {
      status: 'sukses',
      pesan: 'Permintaan transfer antar-desa berhasil disetujui. Cadangan komoditas otomatis disesuaikan.',
    };
  }

  // 11. Assistant Chat (F11)
  if (cleanPath.startsWith('/assistant/chat')) {
    const q = (body.pesan || body.pertanyaan || '').toLowerCase();
    let reply = '';
    let toolSummary = { tool: 'get_status', label: 'Engine Ketahanan Pangan Desa Sidomulyo', ringkasan_data: { status: 'Aman', doc_pokok: 32.8 } };

    if (q.includes('terigu') && (q.includes('60') || q.includes('krisis') || q.includes('impor'))) {
      reply =
        'Bila impor terganggu 60%, cadangan terigu Desa Sidomulyo (saat ini 810 kg) akan anjlok menjadi 8,5 hari bertahan (Status: Siaga). Disarankan substitusi menggunakan tepung mocaf singkong dan jagung lokal.';
      toolSummary = { tool: 'simulate_shock', label: 'Engine Simulasi Guncangan (F6)', ringkasan_data: { shock: 'Impor -60%', doc_baru: 8.5, status: 'Siaga' } };
    } else if (q.includes('kedelai') && (q.includes('bantu') || q.includes('desa'))) {
      reply =
        'Berdasarkan optimasi jaringan gugus desa, Desa Karangsari memiliki cadangan kedelai 32 hari (surplus 11 hari di atas batas donor 21 hari). Anda dapat mengajukan transfer bantuan 350 kg kedelai dengan jarak angkut 4,2 km.';
      toolSummary = { tool: 'optimize_distribution', label: 'Optimasi Jaringan Desa (F10)', ringkasan_data: { donor: 'Desa Karangsari', volume_kg: 350, doc_donor: 32.0 } };
    } else if (q.includes('menu') || q.includes('pmt')) {
      reply =
        'Telah disusun menu PMT 7 hari tanpa terigu berbasis jagung, tempe bacem, dan bayam kelor lokal. Total biaya rata-rata Rp 5.950 per porsi dengan pemenuhan 101,8% energi dan 136,7% protein AKG balita.';
      toolSummary = { tool: 'optimize_menu', label: 'Optimasi Menu LP (F9)', ringkasan_data: { prioritas: 'hindari_impor', biaya_porsi: 5950, persen_akg: '100%+' } };
    } else if (q.includes('status') || q.includes('hari ini') || q.includes('pangan')) {
      reply =
        'Hari ini ketahanan pangan pokok Desa Sidomulyo bertahan 32,8 hari (Status: Aman, melampaui target 30 hari). Titik terlemah berada pada Kedelai (14,5 hari) dan Terigu (15,0 hari) yang memerlukan pemantauan ketat.';
      toolSummary = { tool: 'get_status', label: 'Status Cadangan FEFO (F2)', ringkasan_data: { doc_pokok: 32.8, terlemah: 'Kedelai (14.5 hari)' } };
    } else {
      reply =
        `Pertanyaan Anda terkait data pangan desa telah diverifikasi engine deterministik. Cadangan pangan pokok desa mampu bertahan 32,8 hari. Seluruh rekomendasi AI telah disesuaikan dengan stok riil lumbung Sidomulyo.`;
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
    return {
      desa: {
        nama: 'Desa Sidomulyo',
        kecamatan: 'Sumbermulyo',
        kabupaten: 'Kabupaten Malang',
        jumlah_penduduk: 1800,
      },
      periode_hari: p,
      tanggal_cetak: '2026-11-12',
      ringkasan_naratif:
        'Cadangan pangan pokok Desa Sidomulyo mampu bertahan selama 32,8 hari. Situasi umum aman terkendali di atas target 30 hari, namun komoditas kedelai (14,5 hari) dan terigu (15,0 hari) berada pada status Waspada dan memerlukan prioritas substitusi lokal.',
      pool_pokok: stateOverview.pool_pokok,
      pool_protein: stateOverview.pool_protein,
      titik_terlemah: stateOverview.titik_terlemah,
      skor_ketahanan: stateOverview.skor_ketahanan,
      komoditas: stateOverview.komoditas,
      tiga_risiko_utama: stateOverview.peringatan_teratas,
      teks_whatsapp:
        '*LAPORAN KETAHANAN PANGAN DESA SIDOMULYO*\nTanggal: 12 Nov 2026\nCadangan Pokok: 32,8 hari (Aman)\nTitik Terlemah: Kedelai (14,5 hari - Waspada)\nSkor Desa: 77.8 / 100\n(Data simulasi prototipe SIAPANSA)',
    };
  }

  if (cleanPath.startsWith('/reports/share')) {
    return {
      url_publik: '/laporan-publik/sidomulyo-nov2026',
      expires_at: '2026-11-19T23:59:59',
    };
  }

  if (cleanPath.startsWith('/public/reports/')) {
    return {
      snapshot: {
        desa: { nama: 'Desa Sidomulyo, Kab. Malang' },
        periode_hari: 30,
        tanggal_cetak: '2026-11-12',
        ringkasan_naratif:
          'Laporan Publik Ketahanan Pangan Desa Sidomulyo: Cadangan pangan pokok bertahan 32,8 hari jika pasokan luar berhenti. Situasi terkendali dengan kewaspadaan pada kedelai dan terigu.',
        komoditas: stateOverview.komoditas,
      },
    };
  }

  // 13. Population (F4) & Commodities Norma
  if (cleanPath.startsWith('/population')) {
    if (method === 'PUT') {
      return { status: 'sukses', pesan: 'Data jumlah penduduk berhasil diperbarui.' };
    }
    return { total: 1800, kk: 520, balita: 140, ibu_hamil_menyusui: 45, lansia: 210 };
  }

  if (cleanPath.includes('/norma') && method === 'PUT') {
    return { status: 'sukses', pesan: 'Norma konsumsi per kapita berhasil diperbarui.' };
  }

  // 14. Settings (F14)
  if (cleanPath.startsWith('/settings')) {
    if (method === 'PUT') {
      return {
        target_hari: body.target_hari || 30,
        batas_donor: body.batas_donor || 21,
        ambang: { aman: 21, waspada: 14, siaga: 7, kritis: 0, bawah_72_jam: 3 },
        jam_virtual: '2026-11-12T08:00:00',
      };
    }
    return {
      target_hari: 30,
      batas_donor: 21,
      ambang: { aman: 21, waspada: 14, siaga: 7, kritis: 0, bawah_72_jam: 3 },
      jam_virtual: '2026-11-12T08:00:00',
    };
  }

  // 15. Demo Controls: Advance & Reset (F14)
  if (cleanPath.startsWith('/demo/advance')) {
    const days = body.days || 1;
    // kurangi stok sedikit untuk mensimulasikan konsumsi harian
    stateOverview.komoditas.forEach((c: any) => {
      c.stok_efektif = Math.max(0, c.stok_efektif - c.kebutuhan_harian * days);
      c.hari_bertahan = +(c.stok_efektif / c.kebutuhan_harian).toFixed(1);
    });
    return {
      status: 'sukses',
      pesan: `Waktu virtual berhasil dimajukan ${days} hari. Konsumsi harian warga telah dipotong dari stok.`,
    };
  }

  if (cleanPath.startsWith('/demo/reset')) {
    stateOverview = JSON.parse(JSON.stringify(INITIAL_OVERVIEW));
    return { status: 'sukses', pesan: 'Semua data simulasi berhasil di-reset ke kondisi awal prototipe.' };
  }

  // Generic fallback
  return { status: 'sukses', pesan: 'Operasi berhasil.' };
}
