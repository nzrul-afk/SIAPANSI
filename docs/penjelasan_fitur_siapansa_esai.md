# BAB III: PEMBAHASAN FITUR DAN FUNGSIONALITAS SISTEM SIAPANSA

## 3.2 Fitur Utama dan Kapabilitas Solutif Sistem SIAPANSA

Ketahanan pangan di tingkat desa sering kali dihadapkan pada kendala mendasar: pencatatan inventaris lumbung yang masih manual dan lambat, keterbatasan infrastruktur telekomunikasi di pelosok, minimnya kemampuan prediksi terhadap dinamika pasar dan anomali iklim, serta ketiadaan koordinasi logistik antardesa yang berdekatan. Menjawab rangkaian persoalan tersebut, aplikasi **SIAPANSA** (*Sistem Informasi & Peringatan Dini Ketahanan Pangan Desa*) dibangun dengan mengintegrasikan empat fitur utama yang terhubung dalam satu ekosistem digital yang adaptif dan inklusif.

Berikut adalah uraian mendalam mengenai masing-masing fitur utama SIAPANSA, ditinjau dari aspek fungsionalitas, landasan teoretis, dan nilai strategisnya dalam tata kelola ketahanan pangan desa.

---

### 3.2.1 Manajemen Inventaris Lumbung Digital & Fleksibilitas Komoditas (Offline-First Storage)

Fitur pertama yang menjadi pondasi hulu SIAPANSA adalah modul **Manajemen Lumbung Digital**. Pada sistem konvensional, pencatatan keluar-masuk beras atau gabah di lumbung desa mengandalkan buku catatan fisik yang rentan tercecer, usang, atau terlambat dilaporkan kepada pihak pemerintah desa. SIAPANSA mentransformasi proses ini menjadi pencatatan digital yang presisi, transparan, dan dapat diaudit setiap saat (*real-time inventory tracking*).

Keunggulan distingtif dari modul ini terletak pada dua aspek utama:
1. **Fleksibilitas Komoditas Kustom (*Custom Commodities*):**  
   SIAPANSA tidak membatasi pencatatan hanya pada beras saja. Menyadari bahwa pola pangan lokal di Indonesia sangat beragam, sistem menyediakan fitur pembuatan komoditas baru secara dinamis (*on-the-fly*). Aparatur lumbung dapat mencatat berbagai bahan pangan lokal lainnya, seperti jagung, kedelai, umbi-umbian, cabai, telur, hingga daging ayam. Setiap komoditas memiliki parameter satuan, kapasitas gudang, serta ambang batas keamanan masing-masing, sehingga merefleksikan kearifan lokal (*local wisdom*) dan potensi agraris riil di desa tersebut.
2. **Arsitektur Penyimpanan Tahan Gangguan Jaringan (*Offline-First Architecture*):**  
   Kondisi geografis desa di Indonesia kerap mengalami kendala *blank spot* atau pemadaman jaringan internet sewaktu-waktu. Untuk mencegah kegagalan pencatatan saat terjadi bencana alam atau gangguan sinyal, antarmuka SIAPANSA dilengkapi dengan penyimpanan lokal berbasis *IndexedDB/SQLite*. Operator lumbung tetap dapat mencatat mutasi barang, mengubah stok, dan mencetak bukti tanda terima tanpa adanya sambungan internet. Ketika perangkat kembali mendeteksi sinyal internet, modul sinkronisasi latar belakang (*Background Sync*) akan secara otomatis memperbarui basis data pusat tanpa ada data yang tertimpa atau hilang (*conflict-free synchronization*).

---

### 3.2.2 Dashboard Pemantauan Terpadu & Sistem Peringatan Dini (Early Warning System - EWS)

Data stok yang tercatat di lumbung tidak akan bernilai jika tidak disandingkan dengan kebutuhan nyata penduduk. Fitur **Dashboard Pemantauan Terpadu** berfungsi sebagai ruang kendali (*control room*) bagi Kepala Desa dan Badan Permusyawaratan Desa (BPD) untuk memantau situasi cadangan pangan secara terukur dan intuitif.

Inti dari fitur ini didasarkan pada komputasi ilmiah **Days of Coverage (DoC)**, yaitu rasio matematis yang menghitung berapa lama cadangan pangan yang ada mampu menopang konsumsi seluruh penduduk desa. Formula perhitungan DoC dirumuskan sebagai berikut:

$$\text{Days of Coverage (DoC)} = \frac{\text{Total Stok Efektif di Lumbung (kg)}}{\text{Populasi Desa (jiwa)} \times \text{Norma Konsumsi Harian AKG (kg/jiwa/hari)}}$$

Sistem menggunakan standar **Angka Kecukupan Gizi (AKG)** yang ditetapkan oleh Kementerian Kesehatan Republik Indonesia, yaitu sekitar 300 gram beras per kapita per hari (disesuaikan dengan komposisi usia dan kelompok rentan seperti balita dan lansia). Berdasarkan nilai DoC tersebut, sistem secara otomatis mengklasifikasikan situasi desa ke dalam tiga ambang batas (*threshold*):
* **Status Aman (DoC > 30 hari):** Cadangan lumbung mencukupi kebutuhan warga untuk kurun waktu lebih dari satu bulan ke depan; desa berada dalam posisi surplus mandiri.
* **Status Waspada (DoC 15–30 hari):** Cadangan mulai menipis mendekati ambang batas kritis; sistem menyarankan penjadwalan restok atau pengetatan alokasi distribusi.
* **Status Kritis (DoC < 15 hari):** Cadangan lumbung berada pada zona bahaya kerawanan pangan. Sistem seketika memicu notifikasi peringatan dini (*Early Warning Alert*) disertai instruksi mitigasi darurat bagi pengambil kebijakan.

Selain DoC, dashboard menyajikan metrik komposit berupa **Indeks Ketahanan Pangan (IKP) Desa** yang memadukan indikator ketersediaan fisik, keterjangkauan akses, dan stabilitas pasokan ke dalam rentang skor 0 hingga 100, mempermudah pelaporan berkala ke dinas ketahanan pangan tingkat kecamatan dan kabupaten.

---

### 3.2.3 Mesin Analisis Pasar, Cuaca, & Kurasi Berita Berbasis Artificial Intelligence

Salah satu kelemahan pengelolaan pangan tradisional adalah sifatnya yang reaktif—desa baru menyadari krisis pangan setelah harga melonjak atau beras fisik habis di pasaran. Fitur **Analisis Pangan Cerdas** hadir sebagai lompatan inovasi dengan mengintegrasikan kapabilitas *Artificial Intelligence* (AI) dan analisis data deret waktu (*time-series analysis*) guna memberikan kemampuan proyeksi prediktif.

Fitur ini terdiri atas tiga pilar instrumen:
1. **Visualisasi Tren Harga Pasar Multi-Dimensi:**  
   Menyajikan grafik fluktuasi harga komoditas pangan pokok yang dapat difilter berdasarkan horizon waktu tahunan, bulanan, maupun pergerakan harian. Melalui visualisasi ini, pengelola desa dapat membaca pola musiman (*seasonal patterns*), seperti lonjakan harga menjelang hari raya keagamaan atau penurunan harga pada masa panen raya.
2. **Kurasi Berita Pangan Cerdas via Natural Language Processing (NLP):**  
   Mesin AI secara kontinyu memindai dan merangkum feed informasi dari portal berita nasional, rilis Perum BULOG, serta pembaruan iklim dari Badan Meteorologi, Klimatologi, dan Geofisika (BMKG). Berita-berita yang dikurasi mencakup isu krusial seperti kelangkaan pupuk subsidi, fenomena El Niño/La Niña, penyesuaian harga eceran tertinggi (HET), hingga regulasi impor pangan nasional.
3. **Sintesis Dampak dan Rekomendasi Terpadu AI (*AI Impact Synthesis*):**  
   Tidak sekadar menampilkan berita, model kecerdasan buatan menyintesis keterkaitan antara berita makro tersebut dengan kondisi mikro di lumbung desa. Sebagai contoh, apabila terdeteksi anomali curah hujan ekstrem pada laporan BMKG disertai kenaikan harga gabah regional, AI akan mengeluarkan ringkasan telaah: *"Tingginya curah hujan di wilayah penyangga berpotensi menghambat distribusi logistik gabah dalam 14 hari ke depan. Disarankan mempercepat penyerapan hasil panen petani lokal sebelum kadar air meningkat."* Pendekatan ini mengubah data mentah menjadi wawasan strategis yang siap dioperasionalkan.

---

### 3.2.4 Jaringan Kolaborasi Logistik & Mekanisme Barter Bilateral Antar-Desa

Ketahanan pangan tidak dapat diselesaikan secara ego sektoral (*silo mentality*). Suatu desa pertanian dataran rendah mungkin mengalami surplus beras yang berlimpah, namun mengalami krisis komoditas sayuran dan cabai. Sebaliknya, desa tetangga di kawasan dataran tinggi mengalami surplus hortikultura, namun kekurangan pasokan karbohidrat pokok. Fitur **Kolaborasi Logistik Antar-Desa** hadir sebagai jembatan ekonomi sirkular antardaerah.

Fitur ini memfasilitasi koordinasi antarpemerintah desa melalui mekanisme:
* **Peta Direktori Surplus-Defisit:** Setiap desa yang terhubung dalam sistem dapat mempublikasikan status komoditas berlebih yang siap disalurkan atau komoditas defisit yang mendesak dibutuhkan.
* **Mekanisme Barter Bilateral Berbasis BUMDes:** Sistem memfasilitasi kesepakatan transaksi pertukaran komoditas secara langsung antardesa (misalnya: Desa Sumber Rejo menukar surplus 2 ton beras dengan 800 kg sayuran dan cabai dari Desa Tumpakrejo). Nilai tukar didasarkan pada harga referensi yang adil dan transparan.
* **Pemangkasan Rantai Distribusi dan Tengkulak Spekulatif:** Dengan adanya pertukaran langsung antarlumbung desa melalui Badan Usaha Milik Desa (BUMDes), biaya transportasi logistik dapat diefisiensikan, margin keuntungan perantara yang spekulatif dapat dihilangkan, serta stabilitas harga di tingkat konsumen rumah tangga desa dapat dipertahankan.

---

### 3.2.5 Rangkuman Keterpaduan Sistemik

Secara konseptual, keempat fitur SIAPANSA tidak bekerja secara terpisah, melainkan beroperasi sebagai suatu siklus berkesinambungan (*closed-loop system*). 

Pencatatan yang akurat pada modul **Lumbung Digital** menjadi input data terpercaya bagi **Mesin Analisis AI**. Hasil komputasi dan proyeksi risiko kemudian ditayangkan pada **Dashboard EWS** untuk memberikan sinyal kewaspadaan dini kepada Kepala Desa. Ketika status defisit terdeteksi, aparatur desa dapat langsung mengaktivasi modul **Kolaborasi Logistik Antar-Desa** guna menambal defisit pangan melalui barter komoditas dengan desa mitra. Melalui sinergi terstruktur ini, SIAPANSA mentransformasi paradigma ketahanan pangan desa dari pola konvensional yang rentan menjadi sistem modern yang berdaulat, mandiri, dan berbasis data ilmiah (*data-driven smart village*).
