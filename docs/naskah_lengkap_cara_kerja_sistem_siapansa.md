# CARA KERJA SISTEM SIAPANSA

## 1. Pengantar Operasional Sistem
Ketahanan pangan desa sering kali rapuh bukan semata-mata karena ketiadaan panen, melainkan akibat ketiadaan visibilitas data dan lambatnya respon saat terjadi guncangan pasar maupun anomali iklim global. Sebagai antitesis dari tata kelola pangan tradisional yang pasif dan sporadis, **SIAPANSA** (*Sistem Informasi & Peringatan Dini Ketahanan Pangan Desa*) mengintegrasikan seluruh rantai pengawasan pangan ke dalam arsitektur digital tertutup (*closed-loop operational system*). Sistem ini mengaitkan pencatatan stok fisik di lumbung hulu, pemrosesan komputasi cerdas berbasis kecerdasan buatan (*Artificial Intelligence*), visualisasi status darurat secara *real-time*, hingga eksekusi intervensi logistik bilateral antardesa.

---

## 2. Diagram Alur Sistem
Alur kerja SIAPANSA dirancang secara sistematis melalui empat tahapan utama yang saling berkesinambungan, sebagaimana diilustrasikan pada gambar berikut:

![Gambar 1. Diagram Alur Operasional Sistem SIAPANSA](C:/Users/naserul/.gemini/antigravity/brain/0eb43b9a-8988-40ed-848e-6f1418e534e7/diagram_alur_sederhana.png)
*Gambar 1. Diagram Alur Operasional Sistem SIAPANSA*

Penjelasan tahapan operasional diagram alur di atas adalah sebagai berikut:
1. **Tahap 1 (Input Data Lumbung & Demografi):** Operator lumbung mencatat mutasi keluar-masuk komoditas pangan. Sistem secara otomatis menyandingkan data stok tersebut dengan data demografi desa (jumlah jiwa, balita, dan lansia) serta norma konsumsi harian Angka Kecukupan Gizi (AKG) dan data eksternal (BMKG dan harga pasar).
2. **Tahap 2 (Analisis AI & Prediksi Ketahanan):** Mesin analitis menghitung daya tahan cadangan pangan (*Days of Coverage*) dan memproses kurasi berita serta sentimen risiko rantai pasok menggunakan *Natural Language Processing* (NLP).
3. **Tahap 3 (Dashboard EWS & Rekomendasi):** Sistem memetakan status desa ke dalam indikator visual (*Aman*, *Waspada*, atau *Kritis*). Apabila stok berada di bawah batas toleransi, *Early Warning System* (EWS) otomatis menyajikan arahan taktis bagi Kepala Desa.
4. **Tahap 4 (Aksi Lapangan & Logistik Antar-Desa):** Aparatur desa dan BUMDes mengeksekusi intervensi nyata, baik melalui operasi pasar penstabil harga, penyaluran bantuan darurat, maupun pertukaran komoditas surplus-defisit dengan desa mitra.

---

## 3. Penjelasan Fitur-Fitur Utama Aplikasi
Untuk menjalankan mandat operasional di atas, SIAPANSA dilengkapi empat pilar fitur utama:

### A. Manajemen Inventaris Lumbung Digital & Fleksibilitas Komoditas (*Offline-First Storage*)
Fitur ini mentransisikan pembukuan manual lumbung desa menjadi pencatatan digital terpusat. Keunggulannya meliputi:
* **Fleksibilitas Komoditas Kustom (*Custom Commodities*):** Sistem tidak membatasi pencatatan hanya pada beras. Aparatur lumbung dapat menambahkan komoditas lokal unggulan secara dinamis (jagung, kedelai, umbi-umbian, cabai, telur, daging) sesuai dengan profil agraris desa masing-masing.
* **Arsitektur Tahan Gangguan Sinyal (*Offline-First*):** Untuk mengantisipasi titik buta sinyal internet (*blank spot*) di daerah pelosok atau saat bencana, SIAPANSA mengadopsi penyimpanan lokal (*IndexedDB/SQLite*). Petugas tetap dapat mencatat mutasi stok secara lancar tanpa internet, dan sistem akan melakukan sinkronisasi otomatis (*background sync*) begitu jaringan kembali tersedia.

### B. Dashboard Pemantauan Terpadu & Sistem Peringatan Dini (*Early Warning System - EWS*)
Dashboard berfungsi sebagai ruang kendali (*control room*) bagi pembuat kebijakan desa. Inti dari fitur ini adalah perhitungan matematis **Days of Coverage (DoC)**:

$$\text{Days of Coverage (DoC)} = \frac{\text{Total Stok Efektif Lumbung (kg)}}{\text{Populasi Desa (jiwa)} \times \text{Norma Konsumsi AKG (300 g/jiwa/hari)}}$$

Berdasarkan nilai DoC, sistem mengklasifikasikan situasi desa ke dalam tiga zona ambang batas:
* **Status Aman (DoC > 30 hari):** Cadangan pangan mencukupi lebih dari satu bulan; desa berada dalam posisi surplus mandiri.
* **Status Waspada (DoC 15–30 hari):** Stok mendekati batas rawan; sistem merekomendasikan pengetatan alokasi dan percepatan serapan gabah lokal.
* **Status Kritis (DoC < 15 hari):** Peringatan bahaya pangan (*EWS alert*) berbunyi, memicu protokol darurat bagi Kepala Desa untuk segera melakukan intervensi sebelum stok fisik habis.
Dashboard juga menyajikan skor komposit **Indeks Ketahanan Pangan (IKP) Desa** (skala 0–100) sebagai indikator agregat ketersediaan, keterjangkauan, dan stabilitas pasokan pangan desa.

### C. Modul Analisis Pasar, Cuaca, & Kurasi Berita Berbasis AI
Fitur ini mengubah data pasif menjadi proyeksi cerdas melalui tiga instrumen:
* **Tren Harga Multi-Periode:** Grafik fluktuasi harga bahan pokok historis (tahunan, bulanan, harian) untuk membaca siklus musiman inflasi komoditas.
* **Kurasi Berita Pangan Cerdas (NLP):** Pemindaian otomatis rilis berita nasional (Badan Pangan Nasional, Perum Bulog, BMKG) seputar pupuk subsidi, cuaca ekstrem, dan regulasi impor.
* **Sintesis Dampak Terpadu (*AI Impact Synthesis*):** AI secara otomatis menghubungkan laporan anomali cuaca BMKG dan lonjakan harga pasar dengan stok lumbung desa, menghasilkan ringkasan naratif probabilitas risiko pasokan dalam 14–30 hari ke depan.

### D. Jaringan Logistik & Kolaborasi Barter Bilateral Antar-Desa
Ketahanan pangan desa diwujudkan melalui semangat ekonomi sirkular regional. Fitur ini memfasilitasi kerja sama antardesa:
* **Peta Direktori Surplus-Defisit:** Menghubungkan desa yang berlebih stok dengan desa yang kekurangan pasokan.
* **Barter Bilateral BUMDes:** Memfasilitasi pertukaran langsung komoditas pangan bernilai setara (contoh: Desa Sumber Rejo yang surplus beras menukar pasokannya dengan Desa Tumpakrejo yang memiliki surplus sayuran dan cabai).
* **Efisiensi Rantai Distribusi:** Memangkas perantara spekulatif (tengkulak), menekan ongkos logistik transportasi, dan menjamin kestabilan harga pangan di tingkat rumah tangga desa.

---

## 4. Fungsi Artificial Intelligence (AI) di Dalam Aplikasi
Kecerdasan buatan (*Artificial Intelligence*) dalam SIAPANSA berfungsi sebagai **Intelligent Decision Support System (IDSS)** yang bertindak layaknya asisten analis ahli bagi Kepala Desa:
1. **Pemrosesan Bahasa Alami (*Natural Language Processing* / NLP):** Membaca, menyaring, dan mengekstraksi sentimen dari berita rantai pasok pangan secara *real-time*. Sinyal krisis dari media massa langsung diubah menjadi faktor penimbang status kerentanan desa.
2. **Pemodelan Prediktif & Deteksi Anomali Harga (*Time-Series Forecasting*):** Memproyeksikan kecenderungan pergerakan harga komoditas dan mendeteksi anomali lonjakan harga yang berpotensi memicu *panic buying* atau penurunan daya beli warga miskin.
3. **Sintesis Dampak Multivariabel (*Cross-Variable Inference*):** Menggabungkan tiga variabel bebas (anomali iklim BMKG, tren harga pasar, dan stok fisik lumbung) ke dalam satu kesimpulan sebab-akibat yang mudah dipahami aparatur desa.
4. **Mesin Rekomendasi Preskriptif (*Prescriptive Action Engine*):** Menyusun rekomendasi langkah taktis otomatis bagi pemerintah desa, mulai dari batasan kuota penjualan lumbung saat aman, hingga prioritas penyaluran bansos pangan darurat bagi keluarga balita stunting dan lansia saat kritis.
5. **Algoritma Pencocokan Cerdas (*Smart Matching Algorithm*):** Menghitung paritas nilai tukar yang adil dan memilih rute desa mitra terdekat dalam transaksi barter komoditas antardesa untuk meminimalkan emisi serta ongkos bahan bakar logistik.

---

## 5. Kesimpulan
Melalui keterpaduan antara pencatatan lumbung digital yang tahan offline, sistem peringatan dini berbasis DoC, kecerdasan buatan analitis, serta kolaborasi barter antardesa, SIAPANSA menghadirkan paradigma baru dalam tata kelola ketahanan pangan desa. Aplikasi ini mentransformasi desa dari entitas agraris yang rentan terhadap guncangan geopolitik global menjadi komunitas yang mandiri, adaptif, dan berdaulat pangan berbasis data presisi (*data-driven village resilience*).
