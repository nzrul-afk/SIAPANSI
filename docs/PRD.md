# PRD SIAPANSA: Prototipe Aplikasi Ketahanan Pangan Desa Berbasis AI
Versi 1.0 · Kelompok 11, Politeknik Negeri Malang · Tema: Ketahanan Pangan dan Gizi Masyarakat · Dokumen kerja untuk AI coding agent (Antigravity)

## 0. Cara Memakai Dokumen Ini (untuk Agent)
1. Baca seluruh dokumen sebelum menulis kode. Buat rencana implementasi dan daftar tugas lebih dulu, lalu kerjakan per fase (Bagian 18).
2. Semua teks di layar berbahasa Indonesia yang sederhana. Hindari istilah teknis atau bahasa Inggris di UI.
3. Semua angka (hari bertahan, skor, prediksi, simulasi, usulan distribusi) dihitung oleh engine deterministik di backend. LLM hanya menjelaskan, merangkum, dan menyusun bahasa. LLM dilarang menghitung atau mengarang angka.
4. Data hanya berasal dari seed di Bagian 16 dan harus berlabel “Data simulasi” di UI. Jangan mengarang desa atau angka lain.
5. Jangan menambah fitur di luar daftar tanpa persetujuan. Bila ada yang ambigu, pilih opsi paling sederhana lalu catat di `docs/ASSUMPTIONS.md`.
6. Sebuah fase dianggap selesai bila memenuhi Definition of Done-nya, termasuk tes lulus dan aplikasi jalan dengan satu perintah (`docker compose up`).
7. API key hanya boleh ada di `.env` backend, tidak pernah di kode frontend atau repositori.

## 1. Ringkasan Produk
**Nama**: SIAPANSA. **Tagline**: “Tahu seberapa lama pangan desa bertahan, sebelum krisis datang.”
SIAPANSA adalah aplikasi web progresif (PWA) untuk membantu petugas persediaan pangan desa mencatat stok, memantau panen dan harga, menghitung berapa hari cadangan pangan desa bisa bertahan, mensimulasikan guncangan global (impor terganggu, rupiah melemah, pupuk mahal), menyusun menu bergizi dari bahan yang ada, dan mengatur pemerataan distribusi antar desa.

**Keputusan platform (final)**:
- Bentuk: Web + PWA, mobile-first, bisa di-install di HP, pencatatan stok tetap jalan saat offline.
- Data: dummy dari seed yang terkontrol, tetapi lewat lapisan adapter agar nanti bisa diganti sumber data nyata.
- AI: sungguhan. Model ML sederhana (prediksi panen dan harga), optimasi matematis (menu gizi dan distribusi), dan LLM API (penjelasan, rekomendasi, asisten tanya jawab).
- Pengguna utama: petugas yang mengurus persediaan pangan di desa.

## 2. Latar Belakang dan Masalah
Ketegangan geopolitik, ketergantungan impor gandum & kedelai, stunting nasional (19,8%), dan rentannya desa terhadap guncangan rantai pasok global.
Pernyataan masalah: “Saya petugas persediaan pangan desa. Saya tidak tahu pasti berapa hari pangan desa bisa bertahan, saya baru tahu harga naik setelah pedagang menaikkannya, dan saya tidak punya alat untuk memutuskan harus berbuat apa.”

## 3. Tujuan, Non-Tujuan, dan Metrik
- G1: Menjawab “berapa hari pangan desa bertahan?” per komoditas dan keseluruhan.
- G2: Memberi peringatan dini dari gabungan stok, harga, dan sinyal global.
- G3: Menguji skenario guncangan dan memberi rekomendasi tindakan.
- G4: Menyusun menu bergizi dari stok yang ada, terutama untuk kelompok rentan.
- G5: Mengusulkan pemerataan distribusi antar desa.
- G6: Cukup matang untuk didemokan langsung lewat HP.

## 4. Pengguna
- Persona Utama: Petugas Persediaan Pangan Desa (“Pak Joko”), 35–55 tahun. HP Android kelas menengah, sinyal naik-turun.
- Pemangku Sekunder: Kepala Desa, BPD, Dinas (hanya pembaca laporan publik).

## 5. Ruang Lingkup
- Must: F1–F10, F13, F14
- Should: F11 (Asisten LLM chat), F12 (Laporan publik A4/WA)
- Could: push notifications, ekspor CSV, foto bukti stok, mode gelap.
- Won't: integrasi API nyata, multi-village real login, pembayaran, IoT/satelit, native app.

## 6. Glosarium
- Hari Bertahan (DoC): Berapa hari stok efektif cukup memenuhi kebutuhan penduduk desa jika pasokan dari luar berhenti total.
- Stok Efektif: Stok yang belum kedaluwarsa.
- Komoditas Penentu: Komoditas dengan Hari Bertahan terendah.
- Kelompok Pangan: Pokok (beras, jagung, singkong kering, terigu), Protein (kedelai, telur), Pelengkap (minyak, gula, bawang merah, cabai rawit).
- Ambang Status: Aman (>=21 hari), Waspada (14-<21), Siaga (7-<14), Kritis (<7 hari), "< 72 jam" (<3 hari). Target: 30 hari.
- Skor Ketahanan: Indeks 0-100 gabungan Ketersediaan (40%), Akses (30%), Pemanfaatan (30%).

## 7. Alur Pengguna Utama
- Alur A: Catat stok (in/out, batch FEFO, antrean offline).
- Alur B: Pantau harian dan tanggapi peringatan.
- Alur C: Uji skenario guncangan.
- Alur D: Susun menu gizi / PMT.
- Alur E: Minta bantuan antar desa.
- Alur F: Laporan musyawarah desa.

## 8. Fitur F1 - F14
- F1: Login Demo & Profil Desa (petugas@siapansa.demo / demo1234)
- F2: Beranda: Hari Bertahan (DoC Pokok, Protein, Titik Terlemah), Skor, Proyeksi Stok, Ringkasan Harga, Status Sinkron
- F3: Manajemen Stok (Batch FEFO, ledger append-only, stock opname)
- F4: Penduduk & Norma Konsumsi (1800 jiwa, kebutuhan acuan AKG)
- F5: Peringatan Dini (Aturan R1 - R8)
- F6: Simulator Guncangan (Presets + slider, baseline vs scenario, rule-based recommendations)
- F7: Prediksi Panen ML (GradientBoostingRegressor median & quantile P10/P90)
- F8: Harga & Sinyal Global ML (Holt-Winters + event uplift + 5 global signals)
- F9: Menu Gizi & PMT (Linear programming + LLM cooking instructions)
- F10: Jaringan Desa & Distribusi (Peta Leaflet + LP transportasi + draf pesan LLM)
- F11: Asisten SIAPANSA (SSE tool-calling chat)
- F12: Laporan (A4 print layout, token share 7 hari, share WA)
- F13: PWA & Offline (Dexie IndexedDB, Workbox, auto-sync)
- F14: Mode Demo & Pengaturan (Maju waktu +1/+7/+30, picu event, reset seed)

## 9. Logika Perhitungan Engine
- Kebutuhan harian $D_k = \text{Penduduk} \times \text{norma}_k$
- Konservatif FEFO DoC hingga $H = 180$ hari
- Pool Pokok & Pool Protein
- Aturan peringatan R1 s.d. R8
- Formula Skor Ketahanan (Ketersediaan, Akses, Pemanfaatan)
- Formula Guncangan Skenario ($\rho'_k, harga'_k, panen'_k, drain_k, \text{kekurangan}_k$)
- Optimasi Menu (SciPy linprog / PuLP)
- Optimasi Distribusi Transportasi ($give_{ik} = \max(0, S_{ik} - 21 \times D_{ik})$, $need_{jk} = \max(0, 30 \times D_{jk} - S_{jk})$)

## 10. Arsitektur AI
- Engine deterministik memegang seluruh angka. LLM hanya memformat narasi dan draf.
- Guardrails: tanpa klaim medis/resep, batasan domain ketahanan pangan, tahan prompt injection.
- Fallback deterministik jika LLM gagal / tidak ada API key.

## 16. Data Seed
- Desa Sidomulyo: Penduduk 1.800 jiwa, 520 KK, balita 140, bumil 45, lansia 210.
- 10 Komoditas: Beras, Jagung pipil, Singkong kering, Terigu, Kedelai, Telur, Minyak goreng, Gula, Bawang merah, Cabai rawit.
- Target Baseline: Pokok 32,8 hari; Protein 15,3 hari; Terlemah: Kedelai 14,5 hari; Ketersediaan 66,4; Skor Ketahanan ~75.
- Gugus Desa: Karangsari, Sumberrejo, Mulyorejo, Tegalsari, Wonokerto.
- 17 Komposisi Makanan di `food_composition.csv`.

## 17. Skenario Demo (10 Langkah)
1. Kondisi awal normal
2. Catat stok offline di mode pesawat & sinkronisasi otomatis
3. Picu guncangan Konflik Gandum & Pupuk
4. Telusuri peringatan R2/R3
5. Simulasi guncangan & rekomendasi mitigasi
6. Susun menu gizi PMT balita tanpa bahan impor
7. Optimasi distribusi antar desa (terigu & kedelai) + draf bantuan
8. Tanya asisten AI dengan chip rujukan engine
9. Cetak pratinjau laporan A4 & link publik
10. Reset data ke kondisi awal (<5 detik)

## 18. Rencana Fase
- Fase 0: Fondasi (Monorepo, Docker, Makefile/scripts, design tokens, shell PWA, login, seed, jam virtual)
- Fase 1: Engine dan Stok (F3, F4, engine 9.1-9.4, Beranda F2, ledger & offline queue)
- Fase 2: Peringatan dan Simulator (F5 R1-R8 template, F6 simulator, 9.6 skor ketahanan, proyeksi stok)
- Fase 3: Machine Learning (F7 prediksi panen, F8 harga Holt-Winters & sinyal global)
- Fase 4: Optimasi (F9 menu LP, F10 distribusi LP)
- Fase 5: Lapisan LLM (LLMClient, U1-U5, validator angka, fallback, F11 asisten chat SSE, F12 laporan)
- Fase 6: PWA, Poles, Demo (F13 lengkap, F14 demo panel, full E2E demo, audit a11y & Lighthouse)

## 19. Nilai Golden Test
- Baseline DoC: Beras 38.0, Jagung 25.0, Singkong 20.0, Terigu 15.0, Kedelai 14.5, Telur 16.0, Minyak 18.0, Gula 25.0, Bawang 15.0, Cabai 14.8. Pool Pokok 32.8, Pool Protein 15.3.
- Skenario Konflik Gandum & Pupuk: Terigu $\rho'=0.38$, DoC ~24.2 hari, defisit ~1.199 kg; Kedelai $\rho'=0.414$, DoC ~24.7 hari, defisit ~446 kg.
