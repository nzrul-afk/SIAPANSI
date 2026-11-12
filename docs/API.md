# Ringkasan Kontrak API SIAPANSA (v1)

Semua endpoint diawali dengan prefix `/api/v1`. Format respons standar JSON dengan pesan error seragam berbahasa Indonesia:
`{"kode": "KODE_ERROR", "pesan": "Penjelasan ramah pengguna", "detail": "..."}`.

## 1. Autentikasi & Profil Desa
- `POST /api/v1/auth/login`: Masuk demo (`petugas@siapansa.demo` / `demo1234`). Mengembalikan JWT token (masa berlaku 7 hari) dan profil desa.
- `POST /api/v1/auth/logout`: Membersihkan cookie sesi.
- `GET /api/v1/me`: Memeriksa sesi dan profil pengguna aktif.
- `GET /api/v1/village`: Profil desa Sidomulyo (koordinat, luas lahan, penduduk).
- `PUT /api/v1/village`: Memperbarui data profil desa.

## 2. Kependudukan & Norma
- `GET /api/v1/population`: Angka agregat penduduk (total, KK, balita, bumil, lansia) & acuan AKG.
- `PUT /api/v1/population`: Memperbarui data agregat penduduk desa.
- `GET /api/v1/settings`: Pengaturan ambang status (21/14/7 hari), target (30 hari), batas donor (21 hari), saklar AI, jam virtual.
- `PUT /api/v1/settings`: Memperbarui pengaturan sistem.

## 3. Komoditas & Manajemen Stok
- `GET /api/v1/commodities`: Daftar 10 komoditas lengkap dengan stok awal, norma, harga, dan Hari Bertahan.
- `PUT /api/v1/commodities/{id}/norma`: Memperbarui norma konsumsi harian komoditas.
- `GET /api/v1/stock`: Ringkasan stok efektif, pool pokok, pool protein, dan titik terlemah.
- `GET /api/v1/stock/{commodity_id}`: Rincian komoditas (per gudang, daftar batch FEFO, riwayat transaksi, proyeksi 30 hari).
- `GET /api/v1/stock/transactions`: Riwayat transaksi ledger append-only.
- `POST /api/v1/stock/transactions`: Pencatatan transaksi stok (idempoten UUID, mendukung single item atau batch array untuk antrean offline).
- `POST /api/v1/stock/{commodity_id}/opname`: Pencatatan stock opname fisik (otomatis membuat transaksi Penyesuaian).

## 4. Status, Proyeksi, & Peringatan Dini
- `GET /api/v1/status/overview`: Kartu Beranda (angka besar Hari Bertahan pokok, protein, titik terlemah, skor ketahanan, 3 peringatan teratas).
- `GET /api/v1/status/projection?commodity=c-beras&days=30`: Deret proyeksi stok harian dengan garis ambang batas status.
- `GET /api/v1/alerts?tingkat=Kritis`: Daftar peringatan aturan R1–R8 berurutan keparahan.
- `PATCH /api/v1/alerts/{id}`: Memperbarui status penanganan atau tunda 24 jam (Kritis tidak dapat ditunda).

## 5. Simulator Guncangan
- `GET /api/v1/scenarios/presets`: 4 preset guncangan (Konflik Jalur Gandum, Gangguan Pelayaran, Perang Dagang, Gagal Panen).
- `POST /api/v1/scenarios/run`: Menghitung skenario instan (slider delta_s, delta_p, delta_h, delta_k, durasi) tanpa menyimpan.
- `POST /api/v1/scenarios`: Menyimpan skenario simulasi ke basis data.
- `GET /api/v1/scenarios`: Riwayat skenario tersimpan.
- `GET /api/v1/scenarios/{id}`: Detail skenario tersimpan.

## 6. Prediksi Panen (ML) & Harga
- `GET /api/v1/harvest-plans`: Jadwal rencana tanam aktif dan perkiraan panen desa.
- `POST /api/v1/forecast/harvest`: Prediksi panen instan (median, P10, P90, rentang tanggal, penjelasan faktor).
- `POST /api/v1/harvest-plans`: Menyimpan rencana tanam baru.
- `PATCH /api/v1/harvest-plans/{id}`: Mengaktifkan/menonaktifkan rencana tanam di proyeksi stok Beranda.
- `GET /api/v1/prices/{commodity_id}`: Riwayat harga 104 minggu + prediksi 4 minggu (rentang 80%).
- `GET /api/v1/global/signals`: 5 indikator global dan skor eksposur global desa.
- `GET /api/v1/global/events`: 3 kartu cerita peristiwa global.

## 7. Menu Gizi & PMT
- `POST /api/v1/menus/generate`: Optimasi menu linear programming per hari (kendala energi, protein, dan bahan lokal).
- `GET /api/v1/menus`: Riwayat menu tersimpan.
- `POST /api/v1/menus/{id}/commit`: Pencatatan otomatis transaksi stok keluar (PMT).

## 8. Jaringan Antar Desa
- `GET /api/v1/network/villages`: Peta & data 6 desa dalam gugus serta tabel surplus/defisit.
- `POST /api/v1/network/optimize`: Menjalankan optimasi transportasi linier bantuan antar desa.
- `GET /api/v1/transfers`: Daftar pengajuan bantuan keluar.
- `POST /api/v1/transfers`: Mengajukan permohonan bantuan antar desa (disertai draf pesan sopan).
- `GET /api/v1/transfers/incoming`: Permintaan masuk dari desa tetangga (dengan validasi batas aman donor 21 hari).
- `PATCH /api/v1/transfers/{id}`: Memperbarui status alur transfer (saat Diterima, stok otomatis masuk).

## 9. Asisten & Laporan
- `POST /api/v1/assistant/chat`: Tanya jawab asisten SIAPANSA (tool calling, streaming SSE opsional, guardrails ketat).
- `POST /api/v1/reports/preview`: Pratinjau snapshot laporan musyawarah desa A4.
- `POST /api/v1/reports/share`: Pembuatan tautan baca-saja publik acak (berlaku 7 hari).
- `GET /api/v1/public/reports/{token}`: Mengakses snapshot laporan publik tanpa login.

## 10. Mode Demo & Operasional
- `POST /api/v1/demo/advance`: Lompat waktu virtual (+1, +7, +30 hari).
- `POST /api/v1/demo/event`: Picu/hentikan peristiwa krisis global.
- `POST /api/v1/demo/approve-transfer`: Simulasikan persetujuan desa donor.
- `POST /api/v1/demo/reset`: Reset seluruh data ke kondisi awal seed (< 5 detik).
- `GET /api/v1/health`: Status operasional API.
- `GET /api/v1/ai/status`: Status provider LLM aktif atau mode template.
