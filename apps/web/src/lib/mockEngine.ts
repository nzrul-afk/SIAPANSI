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
      const newPlan = {
        id: `hp-${Date.now()}`,
        commodity_id: `c-${body.komoditas || 'padi'}`,
        commodity_nama: body.komoditas === 'padi' ? 'Padi (Beras)' : body.komoditas,
        luas_ha: body.luas_ha || 2.0,
        varietas: body.varietas || 'Unggul Lokal',
        kondisi_pupuk: body.kondisi_pupuk || 'cukup',
        sumber_air: body.sumber_air || 'irigasi_teknis',
        tanggal_tanam: '2026-11-12',
        aktif_di_proyeksi: true,
        prediksi: {
          volume_median_kg: +(body.luas_ha * 3300).toFixed(0),
          volume_p10_kg: +(body.luas_ha * 2800).toFixed(0),
          volume_p90_kg: +(body.luas_ha * 3750).toFixed(0),
          tanggal_panen_awal: '2027-02-15',
          tanggal_panen_akhir: '2027-02-28',
        },
      };
      stateHarvestPlans.push(newPlan);
      return { status: 'sukses', pesan: 'Rencana tanam baru berhasil ditambahkan.', data: newPlan };
    }

    if (method === 'PATCH') {
      return { status: 'sukses', pesan: 'Status aktif rencana tanam diperbarui.' };
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
    const luas = body.luas_ha || 2.5;
    return {
      komoditas: body.komoditas || 'padi',
      luas_ha: luas,
      volume_median_kg: +(luas * 3300).toFixed(1),
      volume_p10_kg: +(luas * 2800).toFixed(1),
      volume_p90_kg: +(luas * 3750).toFixed(1),
      tingkat_keyakinan: 'tinggi',
      tanggal_panen_awal: '2026-12-15',
      tanggal_panen_akhir: '2026-12-28',
      faktor_pengaruh: [
        { faktor: 'Luas Lahan', nilai: `${luas} ha`, dampak: 'Skala produktivitas optimal', arah: 'positif' },
        { faktor: 'Kondisi Pupuk', nilai: body.kondisi_pupuk || 'cukup', dampak: 'Menjaga vigor bulir padi', arah: 'positif' },
        { faktor: 'Sumber Pengairan', nilai: body.sumber_air || 'irigasi_teknis', dampak: 'Ketersediaan air stabil', arah: 'positif' },
      ],
    };
  }

  // 7. Prices & Global Signals (F8)
  if (cleanPath.startsWith('/prices/')) {
    const baseP = 14500;
    const series104 = [];
    const baseDate = new Date('2024-11-15');
    for (let w = 1; w <= 104; w++) {
      const dt = new Date(baseDate.getTime() + w * 7 * 86400000);
      series104.push({
        tanggal: dt.toISOString().split('T')[0],
        minggu_ke: w,
        harga: Math.round(baseP * (0.92 + 0.12 * Math.sin(w / 8))),
      });
    }
    return {
      kode: 'beras',
      nama: 'Beras',
      satuan: 'kg',
      harga_sekarang: baseP,
      perubahan_7d_pct: 0.8,
      prediksi_4w_pct: 1.4,
      volatilitas: 'Rendah',
      koefisien_variasi_pct: 3.2,
      metode_model: 'Holt-Winters ExponentialSmoothing',
      riwayat_104_minggu: series104,
      prediksi_4_minggu: [
        { minggu_ke_depan: 1, harga_prediksi: 14550, batas_atas_80: 14800, batas_bawah_80: 14300 },
        { minggu_ke_depan: 2, harga_prediksi: 14600, batas_atas_80: 14950, batas_bawah_80: 14250 },
        { minggu_ke_depan: 3, harga_prediksi: 14650, batas_atas_80: 15100, batas_bawah_80: 14200 },
        { minggu_ke_depan: 4, harga_prediksi: 14700, batas_atas_80: 15250, batas_bawah_80: 14150 },
      ],
    };
  }

  if (cleanPath.startsWith('/global/signals')) {
    return {
      skor_eksposur_global: 14.2,
      sinyal: [
        { kode: 'kurs_usd_idr', nama: 'Kurs USD/IDR', nilai: 16400, satuan: 'Rp', perubahan_14d_pct: 0.4, komoditas_terpapar: ['Terigu', 'Kedelai', 'Minyak'] },
        { kode: 'harga_pupuk_urea', nama: 'Harga Pupuk Urea', nilai: 420, satuan: 'USD/ton', perubahan_14d_pct: 1.5, komoditas_terpapar: ['Padi', 'Jagung'] },
        { kode: 'indeks_pangan_fao', nama: 'Indeks Pangan Dunia (FAO)', nilai: 125, satuan: 'poin', perubahan_14d_pct: 1.2, komoditas_terpapar: ['Terigu', 'Gula'] },
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
        { id: 'preset-pupuk-mahal', nama: 'Gagal panen karena pupuk mahal', delta_s: 0.0, delta_p: 0.0, delta_k: 0.05, delta_h: 0.40, durasi: 90 },
      ],
    };
  }

  if (cleanPath.startsWith('/scenarios/run') || (cleanPath === '/scenarios' && method === 'POST')) {
    const durasi = body.durasi || 60;
    const deltaS = body.delta_s || 0.6;
    const deltaP = body.delta_p || 0.4;
    const chart = [];
    for (let d = 0; d <= durasi; d += 5) {
      const bRem = Math.max(0, 810 - d * 13.5);
      const sRem = Math.max(0, 810 - d * 25.0 * (1 + deltaS * 0.5));
      chart.push({ hari: d, baseline: Math.round(bRem), skenario: Math.round(sRem) });
    }

    return {
      nama: body.nama || 'Konflik Jalur Gandum dan Pupuk',
      durasi: durasi,
      komoditas_penentu_baru: { nama: 'Kedelai', hari_bertahan: 9.8 },
      tambahan_biaya_rp: 14500000,
      skor_sebelum: { skor_total: 77.8 },
      skor_sesudah: { skor_total: +(77.8 - (deltaS * 20 + deltaP * 10)).toFixed(1) },
      komoditas_grafik: 'Terigu',
      grafik_proyeksi: chart,
      sumber_narasi: 'Engine Deterministik SIAPANSA',
      narasi_ringkasan: `Simulasi guncangan: Terigu turun drastis karena pasokan impor terpangkas ${(deltaS * 100).toFixed(0)}%. Harga pasar naik ${(deltaP * 100).toFixed(0)}%.`,
      rekomendasi: [
        { prioritas: 1, judul: 'Substitusi Pangan Lokal Desa', tindakan: 'Alihkan konsumsi terigu ke olahan singkong (mocaf) dan jagung lokal Desa Sidomulyo.' },
        { prioritas: 2, judul: 'Koordinasi Transfer Lumbung Tetangga', tindakan: 'Ajukan transfer kedelai 350 kg dari Desa Karangsari (cadangan aman 32 hari).' },
        { prioritas: 3, judul: 'Gelar Operasi Pasar / Pasar Murah Lumbung', tindakan: 'Lepas sebagian cadangan beras lumbung untuk meredam lonjakan harga pangan.' },
      ],
      per_komoditas: [
        { commodity_id: 'c-beras', nama: 'Beras', satuan: 'kg', rho_baseline: 0.05, rho_skenario: 0.05, doc_baseline: 38.0, doc_baseline_lebih_180: false, doc_skenario: 35.0, doc_skenario_lebih_180: false, kekurangan_skenario_kg: 0, harga_skenario: 14500, status: 'Aman' },
        { commodity_id: 'c-terigu', nama: 'Terigu', satuan: 'kg', rho_baseline: 1.0, rho_skenario: 0.4, doc_baseline: 15.0, doc_baseline_lebih_180: false, doc_skenario: 8.5, doc_skenario_lebih_180: false, kekurangan_skenario_kg: 1200, harga_skenario: 18500, status: 'Siaga' },
        { commodity_id: 'c-kedelai', nama: 'Kedelai', satuan: 'kg', rho_baseline: 0.85, rho_skenario: 0.5, doc_baseline: 14.5, doc_baseline_lebih_180: false, doc_skenario: 9.8, doc_skenario_lebih_180: false, kekurangan_skenario_kg: 750, harga_skenario: 16800, status: 'Siaga' },
        { commodity_id: 'c-jagung', nama: 'Jagung', satuan: 'kg', rho_baseline: 0.15, rho_skenario: 0.15, doc_baseline: 28.0, doc_baseline_lebih_180: false, doc_skenario: 25.0, doc_skenario_lebih_180: false, kekurangan_skenario_kg: 0, harga_skenario: 8500, status: 'Waspada' },
        { commodity_id: 'c-singkong', nama: 'Singkong', satuan: 'kg', rho_baseline: 0.0, rho_skenario: 0.0, doc_baseline: 20.0, doc_baseline_lebih_180: false, doc_skenario: 20.0, doc_skenario_lebih_180: false, kekurangan_skenario_kg: 0, harga_skenario: 6000, status: 'Waspada' },
      ],
    };
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
