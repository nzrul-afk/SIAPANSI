// SIAPANSA Client-Side Deterministic Mock Engine
// Runs locally in the browser when offline or when backend API is unreachable.

export interface MockResponse<T = any> {
  data: T;
  status: number;
}

const GOLDEN_OVERVIEW = {
  as_of: '2026-11-12',
  jam_virtual: '2026-11-12T08:00:00',
  label_data: 'Data simulasi untuk prototipe',
  target_hari: 30,
  kalimat_ringkasan: 'Jika pasokan dari luar berhenti, pangan pokok desa bertahan 32,8 hari. Titik terlemah: Kedelai (14,5 hari).',
  pool_pokok: { hari_bertahan: 32.8, status: 'Aman', level: 'aman', bawah_72_jam: false, progress_target_pct: 100.0 },
  pool_protein: { hari_bertahan: 15.3, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 51.0 },
  pool_pelengkap: { hari_bertahan: 20.4, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 68.0 },
  titik_terlemah: { commodity_id: 'c-kedelai', kode: 'kedelai', nama: 'Kedelai', hari_bertahan: 14.5, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 48.3 },
  skor_ketahanan: { skor_total: 77.8, ketersediaan: 66.4, akses: 94.3, pemanfaatan: 76.3, indeks_harga: 8.1, skor_eksposur_global: 3.4 },
  komoditas: [
    { id: 'c-beras', kode: 'beras', nama: 'Beras', satuan: 'kg', kelompok: 'pokok', kebutuhan_harian: 450.0, stok_efektif: 17100.0, hari_bertahan: 38.0, status: 'Aman', level: 'aman', bawah_72_jam: false, progress_target_pct: 100.0, harga_sekarang: 14500, perubahan_harga_7d_pct: 0.8, eksposur_impor: 0.02 },
    { id: 'c-jagung', kode: 'jagung', nama: 'Jagung pipil kering', satuan: 'kg', kelompok: 'pokok', kebutuhan_harian: 90.0, stok_efektif: 2520.0, hari_bertahan: 28.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 93.3, harga_sekarang: 8200, perubahan_harga_7d_pct: 0.0, eksposur_impor: 0.15 },
    { id: 'c-singkong', kode: 'singkong', nama: 'Singkong kering/gaplek', satuan: 'kg', kelompok: 'pokok', kebutuhan_harian: 90.0, stok_efektif: 1800.0, hari_bertahan: 20.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 66.7, harga_sekarang: 6000, perubahan_harga_7d_pct: 0.0, eksposur_impor: 0.0 },
    { id: 'c-terigu', kode: 'terigu', nama: 'Terigu', satuan: 'kg', kelompok: 'pokok', kebutuhan_harian: 54.0, stok_efektif: 810.0, hari_bertahan: 15.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 50.0, harga_sekarang: 13000, perubahan_harga_7d_pct: 0.0, eksposur_impor: 1.0 },
    { id: 'c-kedelai', kode: 'kedelai', nama: 'Kedelai', satuan: 'kg', kelompok: 'protein', kebutuhan_harian: 90.0, stok_efektif: 1305.0, hari_bertahan: 14.5, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 48.3, harga_sekarang: 12500, perubahan_harga_7d_pct: 0.0, eksposur_impor: 0.85 },
    { id: 'c-telur', kode: 'telur', nama: 'Telur ayam ras', satuan: 'kg', kelompok: 'protein', kebutuhan_harian: 45.0, stok_efektif: 720.0, hari_bertahan: 16.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 53.3, harga_sekarang: 28000, perubahan_harga_7d_pct: 0.0, eksposur_impor: 0.35 },
    { id: 'c-minyak', kode: 'minyak', nama: 'Minyak goreng curah', satuan: 'liter', kelompok: 'pelengkap', kebutuhan_harian: 36.0, stok_efektif: 1080.0, hari_bertahan: 30.0, status: 'Aman', level: 'aman', bawah_72_jam: false, progress_target_pct: 100.0, harga_sekarang: 16000, perubahan_harga_7d_pct: 0.0, eksposur_impor: 0.0 },
    { id: 'c-gula', kode: 'gula', nama: 'Gula pasir', satuan: 'kg', kelompok: 'pelengkap', kebutuhan_harian: 36.0, stok_efektif: 900.0, hari_bertahan: 25.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 83.3, harga_sekarang: 17500, perubahan_harga_7d_pct: 0.0, eksposur_impor: 0.45 },
    { id: 'c-bawang', kode: 'bawang_merah', nama: 'Bawang merah', satuan: 'kg', kelompok: 'pelengkap', kebutuhan_harian: 18.0, stok_efektif: 252.0, hari_bertahan: 14.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 46.7, harga_sekarang: 35000, perubahan_harga_7d_pct: 0.0, eksposur_impor: 0.05 },
    { id: 'c-cabai', kode: 'cabai_rawit', nama: 'Cabai rawit merah', satuan: 'kg', kelompok: 'pelengkap', kebutuhan_harian: 9.0, stok_efektif: 144.0, hari_bertahan: 16.0, status: 'Waspada', level: 'waspada', bawah_72_jam: false, progress_target_pct: 53.3, harga_sekarang: 45000, perubahan_harga_7d_pct: 0.0, eksposur_impor: 0.0 },
  ],
  peringatan_teratas: [
    { id: 'alt-R1-c-singkong', rule_code: 'R1', tingkat: 'Waspada', commodity_nama: 'Singkong kering/gaplek', judul: 'Cadangan Singkong kering/gaplek masuk status Waspada (20.0 hari)', penjelasan: 'Stok efektif Singkong saat ini cukup untuk 20.0 hari (di bawah batas Aman 21 hari).', status: 'Baru' },
    { id: 'alt-R1-c-terigu', rule_code: 'R1', tingkat: 'Waspada', commodity_nama: 'Terigu', judul: 'Cadangan Terigu masuk status Waspada (15.0 hari)', penjelasan: 'Stok efektif Terigu saat ini cukup untuk 15.0 hari.', status: 'Baru' },
    { id: 'alt-R1-c-kedelai', rule_code: 'R1', tingkat: 'Waspada', commodity_nama: 'Kedelai', judul: 'Cadangan Kedelai masuk status Waspada (14.5 hari)', penjelasan: 'Stok efektif Kedelai saat ini cukup untuk 14.5 hari.', status: 'Baru' },
  ],
};

const GOLDEN_WAREHOUSES = [
  { id: 'wh-lumbung', village_id: 'v-sidomulyo', nama: 'Lumbung Pangan Desa', sumber: 'lumbung', share: 0.35 },
  { id: 'wh-poktan', village_id: 'v-sidomulyo', nama: 'Gudang Kelompok Tani', sumber: 'kelompok_tani', share: 0.25 },
  { id: 'wh-rt', village_id: 'v-sidomulyo', nama: 'Estimasi Cadangan Rumah Tangga', sumber: 'rumah_tangga', share: 0.30 },
  { id: 'wh-pedagang', village_id: 'v-sidomulyo', nama: 'Stok Pedagang Desa', sumber: 'pedagang', share: 0.10 },
];

export async function handleClientMockRoute(path: string, options: RequestInit = {}): Promise<any> {
  const method = (options.method || 'GET').toUpperCase();
  const cleanPath = path.replace(/^\/api\/v1/, '').replace(/^\/api/, '');
  const body = options.body ? JSON.parse(options.body.toString()) : {};

  // Auth login
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

  // Dashboard status overview
  if (cleanPath === '/status/overview') {
    return GOLDEN_OVERVIEW;
  }

  // Projection
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

  // Stock overview
  if (cleanPath === '/stock' && method === 'GET') {
    return {
      as_of: '2026-11-12',
      warehouses: GOLDEN_WAREHOUSES,
      commodities: GOLDEN_OVERVIEW.komoditas,
    };
  }

  // Stock transactions
  if (cleanPath.startsWith('/stock/transactions')) {
    return {
      status: 'sukses',
      pesan: 'Transaksi stok berhasil disimpan.',
      transaksi: { id: `tx-${Date.now()}`, ...body },
    };
  }

  // Stock opname
  if (cleanPath.includes('/opname')) {
    return {
      status: 'sukses',
      pesan: 'Penyesuaian stok opname berhasil.',
      stok_baru: body.stok_fisik || 17000,
    };
  }

  // Alerts
  if (cleanPath.startsWith('/alerts')) {
    return {
      peringatan: GOLDEN_OVERVIEW.peringatan_teratas,
      jumlah_aktif: 3,
      jumlah_waspada: 3,
      jumlah_siaga: 0,
      jumlah_kritis: 0,
    };
  }

  // Harvest plans
  if (cleanPath.startsWith('/harvest-plans')) {
    return {
      plans: [
        { id: 'hp-padi-1', komoditas: 'Padi (Beras)', luas_ha: 12.0, tanggal_tanam: '2026-09-28', perkiraan_panen: '2026-12-15', volume_median_kg: 39600, status_pupuk: 'cukup' },
        { id: 'hp-jagung-1', komoditas: 'Jagung', luas_ha: 2.0, tanggal_tanam: '2026-10-13', perkiraan_panen: '2026-12-20', volume_median_kg: 10000, status_pupuk: 'cukup' },
        { id: 'hp-singkong-1', komoditas: 'Singkong', luas_ha: 1.0, tanggal_tanam: '2026-06-15', perkiraan_panen: '2027-01-10', volume_median_kg: 6600, status_pupuk: 'cukup' },
      ],
    };
  }

  // Harvest forecast
  if (cleanPath.startsWith('/forecast/harvest')) {
    const luas = body.luas_ha || 2.0;
    return {
      komoditas: body.komoditas || 'padi',
      luas_ha: luas,
      volume_median_kg: +(luas * 3300).toFixed(1),
      volume_p10_kg: +(luas * 2800).toFixed(1),
      volume_p90_kg: +(luas * 3750).toFixed(1),
      tingkat_keyakinan: 'tinggi',
      tanggal_panen_median: '2026-12-25',
      faktor_pengaruh: [
        { faktor: 'Luas Lahan', nilai: `${luas} ha`, dampak: 'Skala panen utama', arah: 'positif' },
        { faktor: 'Kondisi Pupuk', nilai: body.kondisi_pupuk || 'Cukup', dampak: 'Menjaga produktivitas optimal', arah: 'positif' },
      ],
    };
  }

  // Prices
  if (cleanPath.startsWith('/prices/')) {
    const series = [];
    const baseP = 14500;
    for (let w = 1; w <= 104; w++) {
      series.push({ minggu_ke: w, tanggal: `2026-W${w}`, harga: Math.round(baseP * (0.95 + 0.05 * Math.sin(w / 10))) });
    }
    return {
      kode: 'beras',
      harga_sekarang: baseP,
      volatilitas: 'Rendah',
      series_104w: series,
      forecast_4w: [
        { minggu_ke_depan: 1, tanggal: '2026-11-19', harga_median: 14550, p10: 14300, p90: 14800 },
        { minggu_ke_depan: 2, tanggal: '2026-11-26', harga_median: 14600, p10: 14250, p90: 14950 },
        { minggu_ke_depan: 3, tanggal: '2026-12-03', harga_median: 14650, p10: 14200, p90: 15100 },
        { minggu_ke_depan: 4, tanggal: '2026-12-10', harga_median: 14700, p10: 14150, p90: 15250 },
      ],
    };
  }

  // Global signals & events
  if (cleanPath.startsWith('/global/signals')) {
    return {
      sinyal: [
        { kode: 'kurs_usd_idr', nama: 'Kurs USD/IDR', nilai: 16400, satuan: 'Rp', perubahan_14d_pct: 0.4 },
        { kode: 'harga_pupuk_urea', nama: 'Harga Pupuk Urea', nilai: 420, satuan: 'USD/ton', perubahan_14d_pct: 1.5 },
        { kode: 'indeks_pangan_global', nama: 'Indeks Pangan Dunia', nilai: 125, satuan: 'poin', perubahan_14d_pct: 1.2 },
      ],
    };
  }

  if (cleanPath.startsWith('/global/events')) {
    return {
      peristiwa: [
        { id: 'evt-1', nama: 'Konflik Jalur Gandum & Pupuk', aktif: false, intensitas: 0.6 },
        { id: 'evt-2', nama: 'Lonjakan Energi & Logistik', aktif: false, intensitas: 0.4 },
      ],
    };
  }

  // Scenario presets & run
  if (cleanPath.startsWith('/scenarios/presets')) {
    return {
      presets: [
        { id: 'preset-konflik-gandum', nama: 'Konflik jalur gandum dan pupuk', delta_s: 0.60, delta_p: 0.40, delta_k: 0.10, delta_h: 0.20, durasi: 60 },
        { id: 'preset-pupuk-mahal', nama: 'Gagal panen karena pupuk mahal', delta_s: 0.0, delta_p: 0.0, delta_k: 0.05, delta_h: 0.40, durasi: 90 },
      ],
    };
  }

  if (cleanPath.startsWith('/scenarios/run') || cleanPath.startsWith('/scenarios')) {
    return {
      skenario_nama: body.skenario_nama || 'Konflik Jalur Gandum dan Pupuk',
      durasi_hari: body.durasi || 60,
      ringkasan: 'Impor terigu macet 60% dan harga pupuk naik 40%. Cadangan Terigu desa anjlok ke status Siaga.',
      komoditas_terdampak: [
        {
          id: 'c-terigu',
          nama: 'Terigu',
          doc_awal: 15.0,
          doc_setelah_shock: 24.2,
          defisit_kg: 1199.0,
          kenaikan_harga_pct: 44.0,
          harga_setelah_shock: 18720,
          status_baru: 'Waspada',
        },
        {
          id: 'c-kedelai',
          nama: 'Kedelai',
          doc_awal: 14.5,
          doc_setelah_shock: 11.2,
          defisit_kg: 680.0,
          kenaikan_harga_pct: 35.0,
          harga_setelah_shock: 16875,
          status_baru: 'Siaga',
        },
      ],
      rekomendasi_tindakan: [
        { prioritas: 1, judul: 'Substitusi Pangan Lokal', deskripsi: 'Alihkan 40% kebutuhan olahan terigu ke tepung mocaf singkong dan jagung lokal Sidomulyo.' },
        { prioritas: 2, judul: 'Permohonan Transfer Lumbung', deskripsi: 'Minta dukungan pasokan kedelai 350 kg dari lumbung donor Desa Karangsari (cadangan surplus 32 hari).' },
        { prioritas: 3, judul: 'Stabilisasi Pasar Desa', deskripsi: 'Gelar pasar murah menggunakan stok lumbung cadangan untuk meredam spekulasi harga.' },
      ],
    };
  }

  // Nutrition & PMT menu
  if (cleanPath.startsWith('/menus/generate') || cleanPath.startsWith('/nutrition')) {
    return {
      sasaran: body.sasaran || 'balita',
      jumlah_penerima: body.jumlah_penerima || 140,
      durasi_hari: 7,
      total_biaya_rp: 832500,
      biaya_per_porsi_rp: 5950,
      energi_rata_rata_kkal: 412.5,
      protein_rata_rata_g: 8.2,
      pemenuhan_akg_energi_pct: 101.8,
      pemenuhan_akg_protein_pct: 136.7,
      pangan_lokal_pct: 95.0,
      jadwal_harian: [
        { hari_ke: 1, menu: 'Nasi Jagung + Tempe Bacem + Sayur Bayam Labu', energi_kkal: 420, protein_g: 8.5, biaya_porsi: 5800 },
        { hari_ke: 2, menu: 'Ubi Kukus Manis + Tahu Telur Puyuh + Sup Kelor', energi_kkal: 410, protein_g: 8.1, biaya_porsi: 6100 },
        { hari_ke: 3, menu: 'Singkong Keju Lokal + Pepes Ikan Lele + Sayur Katuk', energi_kkal: 415, protein_g: 8.4, biaya_porsi: 6200 },
        { hari_ke: 4, menu: 'Nasi Merah Lokal + Orek Tempe + Bening Jagung Manis', energi_kkal: 405, protein_g: 7.9, biaya_porsi: 5700 },
        { hari_ke: 5, menu: 'Bubur Jagung Gurih + Tahu Sutra Kukus + Tumis Kangkung', energi_kkal: 410, protein_g: 8.2, biaya_porsi: 5900 },
        { hari_ke: 6, menu: 'Pure Ubi Ungu + Bakso Lele Lokal + Sari Wortel', energi_kkal: 425, protein_g: 8.6, biaya_porsi: 6300 },
        { hari_ke: 7, menu: 'Tiwul Manis Tradisional + Botok Tempe Kelapa Muda', energi_kkal: 402, protein_g: 7.8, biaya_porsi: 5650 },
      ],
    };
  }

  // Network & village distribution
  if (cleanPath.startsWith('/network/villages')) {
    return {
      villages: [
        { id: 'v-sidomulyo', nama: 'Desa Sidomulyo', lat: -7.970, lon: 112.600, is_own: true, doc_pokok: 32.8, doc_protein: 15.3, status: 'Waspada' },
        { id: 'v-karangsari', nama: 'Desa Karangsari', lat: -7.945, lon: 112.625, is_own: false, doc_pokok: 36.0, doc_protein: 32.0, status: 'Aman' },
        { id: 'v-sumberrejo', nama: 'Desa Sumberrejo', lat: -7.990, lon: 112.635, is_own: false, doc_pokok: 40.0, doc_protein: 28.0, status: 'Aman' },
        { id: 'v-wonokerto', nama: 'Desa Wonokerto', lat: -7.930, lon: 112.580, is_own: false, doc_pokok: 22.0, doc_protein: 18.0, status: 'Waspada' },
        { id: 'v-sukomakmur', nama: 'Desa Sukomakmur', lat: -7.955, lon: 112.650, is_own: false, doc_pokok: 18.0, doc_protein: 12.0, status: 'Siaga' },
        { id: 'v-majumakmur', nama: 'Desa Majumakmur', lat: -8.005, lon: 112.595, is_own: false, doc_pokok: 29.0, doc_protein: 21.0, status: 'Aman' },
      ],
    };
  }

  if (cleanPath.startsWith('/network/optimize')) {
    return {
      target_hari: 30,
      batas_donor: 21,
      total_biaya_transport_rp: 142500,
      rekomendasi_transfer: [
        {
          id: 'trf-1',
          donor_id: 'v-karangsari',
          donor_nama: 'Desa Karangsari (Donor)',
          penerima_id: 'v-sidomulyo',
          penerima_nama: 'Desa Sidomulyo (Kita)',
          komoditas: 'Kedelai',
          volume_kg: 350.0,
          jarak_km: 4.2,
          biaya_transport_rp: 44100,
          dampak: 'Meningkatkan cadangan kedelai Sidomulyo dari 14.5 menjadi 18.4 hari.',
        },
        {
          id: 'trf-2',
          donor_id: 'v-karangsari',
          donor_nama: 'Desa Karangsari (Donor)',
          penerima_id: 'v-sidomulyo',
          penerima_nama: 'Desa Sidomulyo (Kita)',
          komoditas: 'Terigu',
          volume_kg: 400.0,
          jarak_km: 4.2,
          biaya_transport_rp: 50400,
          dampak: 'Meningkatkan cadangan terigu dari 15.0 menjadi 22.4 hari (Masuk Status Aman).',
        },
        {
          id: 'trf-3',
          donor_id: 'v-sumberrejo',
          donor_nama: 'Desa Sumberrejo (Donor)',
          penerima_id: 'v-sukomakmur',
          penerima_nama: 'Desa Sukomakmur',
          komoditas: 'Beras',
          volume_kg: 600.0,
          jarak_km: 3.2,
          biaya_transport_rp: 48000,
          dampak: 'Mengangkat Sukomakmur dari status Siaga ke Waspada.',
        },
      ],
    };
  }

  // Assistant chat
  if (cleanPath.startsWith('/assistant/chat')) {
    const q = (body.pertanyaan || '').toLowerCase();
    let reply = '';
    if (q.includes('beras')) {
      reply = 'Berdasarkan data lumbung per 12 November 2026, stok beras efektif Desa Sidomulyo tercatat 17.100 kg dengan konsumsi harian 450 kg. Cadangan beras dapat bertahan selama 38,0 hari (Status: Aman, melebihi target 30 hari).';
    } else if (q.includes('kedelai')) {
      reply = 'Cadangan kedelai saat ini adalah 1.305 kg, hanya cukup untuk 14,5 hari (Status: Waspada). Kedelai saat ini merupakan titik terlemah ketahanan pangan desa. Disarankan berkoordinasi dengan Desa Karangsari untuk transfer lumbung.';
    } else if (q.includes('terigu') || q.includes('gandum')) {
      reply = 'Stok terigu saat ini berada di 810 kg atau cukup untuk 15,0 hari (Status: Waspada). Ketergantungan impor terigu adalah 100%. Disarankan substitusi menggunakan tepung singkong (mocaf) dan jagung lokal.';
    } else if (q.includes('protein')) {
      reply = 'Ketahanan kelompok protein desa bertahan selama 15,3 hari (Status: Waspada). Komoditas terlemah adalah Kedelai (14,5 hari) dan Telur ayam (16,0 hari).';
    } else {
      reply = 'Ketahanan pangan pokok Desa Sidomulyo saat ini mampu bertahan 32,8 hari jika pasokan luar berhenti. Titik terlemah berada pada Kedelai (14,5 hari). Algoritma menyarankan menjaga alokasi stok donor dan diversifikasi pangan ke komoditas non-impor.';
    }

    return {
      jawaban: reply,
      sumber_data: 'Engine Ketahanan Pangan Desa Sidomulyo',
      label_ai: 'Dibuat AI, periksa kembali sebelum bertindak',
      angka_diverifikasi: true,
    };
  }

  // Reports
  if (cleanPath.startsWith('/reports')) {
    return {
      status: 'sukses',
      judul: 'Laporan Ketahanan Pangan Desa Sidomulyo',
      tanggal: '2026-11-12',
      ringkasan_eksekutif: 'Cadangan pokok desa bertahan 32,8 hari. Situasi aman terkendali, namun komoditas kedelai dan terigu memerlukan pengawasan ketat.',
    };
  }

  // Population & Settings
  if (cleanPath.startsWith('/population')) {
    return { total: 1800, kk: 520, balita: 140, ibu_hamil_menyusui: 45, lansia: 210 };
  }

  if (cleanPath.startsWith('/settings')) {
    return {
      target_hari: 30,
      batas_donor: 21,
      ambang: { aman: 21, waspada: 14, siaga: 7, kritis: 0, bawah_72_jam: 3 },
      jam_virtual: '2026-11-12T08:00:00',
    };
  }

  // Demo advance / reset
  if (cleanPath.startsWith('/demo/advance')) {
    return { status: 'sukses', pesan: 'Waktu virtual berhasil dimajukan 1 hari.' };
  }

  if (cleanPath.startsWith('/demo/reset')) {
    return { status: 'sukses', pesan: 'Semua data simulasi berhasil di-reset ke kondisi awal.' };
  }

  // Generic success
  return { status: 'sukses', pesan: 'Operasi berhasil.' };
}
