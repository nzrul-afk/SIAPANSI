---
title: SIAPANSA API
emoji: 🌾
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# SIAPANSA — Sistem Ketahanan Pangan Desa Berbasis AI

> **Tagline:** “Tahu seberapa lama pangan desa bertahan, sebelum krisis datang.”  
> **Kelompok 11, Politeknik Negeri Malang** · Tema: Ketahanan Pangan dan Gizi Masyarakat · Prototipe Web PWA Mobile-First

---

## Ringkasan Proyek

SIAPANSA adalah aplikasi *Progressive Web App* (PWA) yang membantu perangkat desa/pengelola lumbung pangan ("Pak Joko"):
1. **Menghitung Hari Bertahan (*Days of Coverage* / DoC)**: Simulasi harian deterministik berbasis FEFO (*First Expired, First Out*) untuk pangan pokok, protein, dan komoditas titik terlemah.
2. **Peringatan Dini (R1–R8)**: Deteksi dini stok menipis, lonjakan harga lokal, transmisi sinyal global, dan kesenjangan gizi.
3. **Simulator Guncangan**: Menguji skenario guncangan rantai pasok global (impor macet, pupuk mahal, depresiasi rupiah) terhadap ketahanan desa beserta rekomendasi tindakan berprioritas.
4. **Perencanaan Menu Gizi & PMT**: Optimasi linear programming (*scipy.optimize*) berbasis bahan pangan lokal non-impor yang memenuhi target AKG.
5. **Jaringan Distribusi Gugus Desa**: Optimasi logistik transportasi antar desa berbasis batas aman donor (minimal 21 hari) dan target penerima (30 hari).
6. **Asisten Tanya-Jawab Terkendali (*Guardrailed AI*)**: LLM bertugas hanya menyusun bahasa dan draf pesan; seluruh angka mutlak dipasok oleh engine backend deterministik.
7. **Pencatatan Offline**: Didukung IndexedDB (Dexie) dan sinkronisasi idempoten berbasis UUID klien saat koneksi pulih.

---

## Panduan Setup Singkat (Maksimal 5 Langkah)

### Opsi A: Menggunakan Docker Compose (Satu Perintah)
1. Salin konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
2. Jalankan aplikasi via Docker Compose:
   ```bash
   docker compose up --build
   ```
3. Buka peramban di **http://localhost:8080** (Web PWA) atau **http://localhost:8000/docs** (OpenAPI Swagger).

---

### Opsi B: Pengembangan Lokal (Native Windows / PowerShell)
1. **Salin Environment**:
   ```powershell
   Copy-Item .env.example .env
   ```
2. **Instal Dependensi Backend & Train Model**:
   ```powershell
   pip install -r apps/api/requirements.txt
   python scripts/generate_harvest_data.py
   python scripts/seed.py
   ```
3. **Instal Dependensi Frontend**:
   ```powershell
   cd apps/web
   npm.cmd install
   cd ../..
   ```
4. **Jalankan Pengujian Unit & Skenario Demo**:
   ```powershell
   python -m pytest apps/api/tests -v
   ```
5. **Jalankan Aplikasi**:
   ```powershell
   # Menjalankan backend (port 8000):
   python -m uvicorn app.main:app --app-dir apps/api --port 8000 --reload

   # Di terminal terpisah, jalankan frontend (port 5173):
   cd apps/web; npm.cmd run dev
   ```
   Buka **http://localhost:5173** di browser atau HP Anda.

---

## Akun Demo Pengujian
- **Email:** `petugas@siapansa.demo`
- **Kata Sandi:** `demo1234`
- Atau gunakan tombol instan **"Masuk sebagai Petugas Desa (Demo)"** di layar login.

---

## Verifikasi Skenario Demo (Bagian 17 PRD)
1. **Kondisi Awal**: Beranda menampilkan pangan pokok 32,8 hari (Aman), protein 15,3 hari (Waspada), titik terlemah Kedelai 14,5 hari, skor ~77.
2. **Catat Stok Offline**: Tekan "Uji Mode Pesawat (Offline)" di bilah atas. Catat panen beras 500 kg. Muncul indikator antrean offline. Matikan mode pesawat; transaksi otomatis tersinkronisasi tanpa duplikat.
3. **Picu Guncangan Global**: Buka tab **Lainnya → Panel Demo**, picu *"Konflik Jalur Gandum dan Pupuk"*. Sinyal global memburuk, harga terigu naik ~19% dalam 7 hari, dan peringatan R2/R3 muncul.
4. **Simulasi**: Buka tab **Simulasi**, pilih preset krisis gandum. Hari Bertahan terigu turun ke ~24 hari, muncul estimasi tambahan biaya dan rekomendasi prioritas.
5. **Menu Gizi PMT**: Buka tab **Menu Gizi**, pilih prioritas *"Hindari Bahan Impor"*. Dihasilkan menu PMT balita tanpa terigu dan kedelai. Tekan *"Catat Pemakaian Stok"*.
6. **Bantuan Antar Desa**: Buka tab **Desa**, tekan *"Cari Bantuan Optimal"*. Sistem mengusulkan transfer terigu dari Karangsari dan Wonokerto. Tekan ajukan lalu jalankan *"Simulasikan Persetujuan"*. Stok terigu bertambah otomatis.
7. **Tanya Asisten**: Buka tab **Asisten**, ketuk chip pertanyaan cepat *"Desa mana yang bisa bantu kedelai?"*. Jawaban menyertakan chip rujukan *"Dasar jawaban"*.
8. **Laporan & Tautan Publik**: Buka tab **Laporan**, cetak satu halaman A4 atau buat tautan publik baca-saja tanpa login berlaku 7 hari.
9. **Reset Seed**: Buka tab **Lainnya → Panel Demo**, tekan *"Reset Data ke Kondisi Awal"* (< 5 detik).

---

## Lisensi & Atribusi
Prototipe ini dikembangkan untuk tujuan akademis dan demonstrasi kompetisi oleh Kelompok 11 Politeknik Negeri Malang. Seluruh data berlabel *"Data simulasi untuk prototipe"*.
