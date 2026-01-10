# Dramabox Scraper (Public Version)

Script scraper Dramabox berbasis Node.js yang menggunakan metode **Remote Signing**. Script ini aman untuk digunakan karena logika *Private Key* dan pembuatan *Signature* diproses melalui API Server terpisah, sehingga script client ini bersih, ringan, dan aman.

**Powered by: NB Community**

---

## ⚠️ PERINGATAN KERAS (DISCLAIMER)

Mohon dibaca dengan teliti sebelum menggunakan script ini:

1.  **TIDAK UNTUK DIPERJUALBELIKAN!**
    Script ini dibagikan secara **GRATIS** dan *Open Source* untuk tujuan edukasi. Saya sangat berharap tidak ada pihak yang tidak beretika yang mencoba mengambil keuntungan materi dengan menjual script ini. Tolong hargai karya orang lain.

2.  **STATUS TOKEN**
    Token dan Signature yang digunakan dalam script ini disediakan oleh server **NB Community**.
    * Token bersifat *shared* (bisa digunakan bersama oleh komunitas).
    * **Token bisa dibekukan (banned/freeze) kapan saja** oleh pihak NB Community atau Dramabox pusat jika terjadi indikasi penyalahgunaan (spam) atau update sistem.
    * Gunakan dengan bijak.

---

## 🛠️ Fitur Utama

* **Auto Token Generator:** Mengambil Token & Device ID valid secara otomatis dari server API tanpa perlu login manual.
* **Remote Signing:** Membuat Signature (`sn`) valid secara otomatis tanpa perlu menyimpan Private Key di script lokal Anda.
* **Search Drama:** Mencari judul drama berdasarkan kata kunci.
* **Latest Drama:** Mengambil daftar drama terbaru (Theater).
* **Unlimited Episodes:** Mengambil daftar episode secara massal (batch fetch) tanpa batas paging.

---

## ℹ️ Informasi Teknis

Script ini bekerja dengan melakukan request langsung ke API resmi Dramabox. Berikut adalah detail endpoint yang digunakan:

1.  **API Signer (Auth)**
    * **URL:** `https://nb-dramabox-gentoken.vercel.app`
    * **Fungsi:** Mengambil Token JWT, Device ID, dan membuat *Digital Signature* (`sn`) secara remote.

2.  **Search Drama**
    * **Endpoint:** `https://sapi.dramaboxdb.com/drama-box/search/suggest`
    * **Method:** `POST`
    * **Fungsi:** Mencari judul drama berdasarkan kata kunci (`keyword`) yang diinput user.

3.  **Latest / Theater**
    * **Endpoint:** `https://sapi.dramaboxdb.com/drama-box/he001/theater`
    * **Method:** `POST`
    * **Fungsi:** Mengambil daftar drama terbaru atau yang sedang tayang di halaman utama aplikasi (Channel ID 43).

4.  **Get Episodes (Batch)**
    * **Endpoint:** `https://sapi.dramaboxdb.com/drama-box/chapterv2/batch/load`
    * **Method:** `POST`
    * **Fungsi:** Mengambil daftar episode secara massal (*batching*). Script melakukan *looping* otomatis pada endpoint ini untuk mengambil seluruh episode dari awal hingga akhir.

---

## 📦 Cara Install & Jalankan

Pastikan Anda sudah menginstall [Node.js](https://nodejs.org/) di perangkat Anda (PC/Termux/VPS).

1.  **Clone Repository ini**
    ```bash
    git clone https://github.com/giienew/dramabox-scraper
    cd dramabox-scraper
    ```

2.  **Install Module yang Dibutuhkan**
    ```bash
    npm install axios readline fs
    ```
    *(Atau cukup ketik `npm install` jika file package.json sudah tersedia)*

3.  **Jalankan Script**
    ```bash
    node dramabox.js
    ```

---

## 📂 Struktur Output File

Hasil scraping akan disimpan secara otomatis dalam format JSON di folder yang sama agar mudah diolah:

* **`result_search.json`** : Berisi hasil pencarian drama (ID, Judul, Cover).
* **`result_latest.json`** : Berisi daftar drama yang sedang trending/terbaru.
* **`result_episode.json`** : Berisi daftar lengkap episode dari drama yang dipilih (Link, Durasi, Judul).

---

## 🤝 Credits

* **Author:** Gienetic
* **Provider:** NB Community

*Dibuat dengan ❤️ untuk komunitas coding Indonesia.*# dramabox-scraper
# dramabox-scraper
