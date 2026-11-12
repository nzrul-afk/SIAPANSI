# Asumsi dan Keputusan Desain SIAPANSA

Dokumen ini mencatat asumsi awal, keputusan arsitektur, dan jawaban atas pertanyaan terbuka sesuai Bagian 0 dan Bagian 21 PRD SIAPANSA.

## 1. Asumsi Data dan Lingkungan
- **Desa & Data Seed**: Menggunakan Desa Sidomulyo (fiktif) dan 10 komoditas acuan persis sesuai Bagian 16 PRD.
- **Ambang & Parameter**: Ambang batas Aman (>=21 hari), Waspada (14-20 hari), Siaga (7-13 hari), Kritis (<7 hari), target cadangan 30 hari, serta batas donor 21 hari disetujui sebagai baseline awal.
- **Format UI**: Bahasa Indonesia baku sederhana di seluruh antarmuka pengguna tanpa jargon teknis asing. Semua data berlabel "Data simulasi" dan keluaran AI berlabel "Dibuat AI".
- **OS & Toolchain Lokal**: Host lokal berjalan di Windows dengan PowerShell. Perintah build didukung via `docker compose`, `npm.cmd`, dan skrip Python, dengan `Makefile` disediakan untuk lingkungan Linux/Docker/CI.

## 2. Asumsi Teknis & Arsitektur
- **Backend**: Python 3.11 + FastAPI + Pydantic v2 + SQLite (kompatibel PostgreSQL).
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + Radix UI/lucide-react + TanStack Query + Recharts + react-leaflet + Dexie (IndexedDB) + vite-plugin-pwa.
- **Pemisahan Logika**: Seluruh kalkulasi (Hari Bertahan, Skor Ketahanan, Simulasi, Optimasi Menu & Distribusi) berada di modul engine murni tanpa I/O (`apps/api/engine`).
- **AI & LLM**: Google Gemini API via SDK official google-genai sebagai default provider. Tanpa API key atau jika saklar AI dimatikan, aplikasi 100% berjalan normal dengan template deterministik.
- **Offline & Ledger**: Pencatatan stok menggunakan ledger append-only dengan UUID klien di IndexedDB (Dexie). Tidak ada operasi hapus/edit (hanya transaksi penyesuaian/pembalik), memastikan sinkronisasi idempoten dan bebas konflik.
- **Jam Virtual**: Seluruh kalkulasi menerima parameter `as_of` sehingga simulasi lompat hari (+1, +7, +30) dapat berjalan deterministik.

## 3. Pertanyaan Terbuka untuk Konfirmasi
1. **API Key Gemini**: Apakah sudah ada `GEMINI_API_KEY` untuk pengujian Fase 5 (Lapisan LLM), atau pengujian awal diutamakan menggunakan mode template fallback?
2. **Target Deployment**: Apakah prototipe saat demo akan dijalankan sepenuhnya via Docker Compose lokal (dengan tunnel seperti Cloudflare Tunnel/ngrok untuk akses HP), atau dideploy ke platform cloud (misal Vercel + Railway/Render)?
