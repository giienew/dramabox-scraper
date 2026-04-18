# Dramabox Scraper V5 (Ultimate Edition)

**Dramabox Scraper V5 - Ultimate Edition.**
Script scraper berbasis Node.js yang telah di-upgrade secara masif menggunakan *headers* dan logika terbaru dari aplikasi original versi **5.6.1**. Script ini menggunakan metode **Remote Signing** untuk keamanan dan telah dilengkapi dengan **Exsala Video Decryptor** untuk mengekstrak URL streaming secara langsung.

**Status:** ✅ WORK 100% (VIP, All Menus Unlocked, & Video Decryptor)  
**Powered by:** Exsala API & NB Community

---

## 🔥 What's New in V5 (Ultimate Edition)?

Versi ini membawa perubahan besar-besaran dari versi sebelumnya, menjadikannya alat *data mining* terlengkap untuk Dramabox:

* ✅ **Header & Endpoint Terbaru (v5.6.1):** Menggunakan `p: 60` dan version code terbaru agar aman dari WAF Akamai. Endpoint pencarian di-upgrade ke `/search/search` dengan dukungan filter dinamis.
* ✅ **Smart Auto-Pagination:** Tidak ada lagi konfirmasi manual (y/n). Script akan membaca parameter `pages` dan `isMore` dari server untuk menguras seluruh halaman hingga akar-akarnya.
* ✅ **Advanced Search Filter:** Mendukung pencarian spesifik berdasarkan: Sedang Tren (Trending), Terbaru (Latest), dan Belum Ditonton (Unwatched).
* ✅ **Exsala Video Decryptor:** Fitur pemungkas (Menu 9) untuk men-decrypt URL MP4/M3U8 yang terenkripsi (`.encrypt.mp4`) menjadi *link* siap putar menggunakan Proxy API Exsala.
* ✅ **Clean & Professional Code:** Struktur kode modular, penamaan file *output* dinamis sesuai *keyword*, dan bersih dari komentar *spam*.

---

## ⚠️ PERINGATAN KERAS (DISCLAIMER)

Mohon dibaca dengan teliti sebelum menggunakan script ini:

1.  **TIDAK UNTUK DIPERJUALBELIKAN!**
    Script ini dibagikan secara **GRATIS** dan *Open Source* untuk tujuan edukasi. Jangan menjadi pihak tidak beretika yang mencoba mengambil keuntungan materi dari kode ini.
    
2.  **JANGAN HANYA PAMER JSON**
    Gunakan script ini untuk belajar struktur API, *HTTP Request*, sistem *Pagination*, dan *Data Mining*. Pahami kodenya, jangan cuma asal eksekusi.

3.  **STATUS TOKEN & API**
    Token dan Signature disediakan oleh server **Exsala API / NB Community**.
    * Token bersifat *shared*.
    * **Token bisa dibekukan (banned)** jika terjadi penyalahgunaan (spam request berlebihan tanpa *delay*). Script ini sudah dibekali *delay* otomatis untuk mengelabui proteksi.

---

## 🛠️ Fitur & Menu Tersedia

Script ini menyediakan 9 menu scraping yang komprehensif:

1.  **Search Drama:** Cari drama dengan fitur *Smart Filter* (Trending/Latest/Unwatched) & *Auto-Pagination*.
2.  **Latest / Newest:** Daftar drama terbaru rilis (*Full Auto-Pagination*).
3.  **For You / Recommended:** Rekomendasi drama berdasarkan algoritma.
4.  **Coming Soon:** Daftar drama yang akan tayang (beserta konversi waktu rilis lokal).
5.  **Top Ranking / Charts:** Scraping Leaderboard (Sedang Tren, Pencarian Populer, Terbaru).
6.  **VIP / Weekly Selection:** Daftar drama eksklusif pilihan editor.
7.  **Classify (Jelajah):** Browsing semua drama berdasarkan kategori (*Full Auto-Pagination*).
8.  **Get Episodes (Raw Data):** Ekstraksi metadata episode mentah (termasuk array `cdnList` yang berisi URL Video).
9.  **Decrypt Video URL:** Mengubah URL video mentah yang terenkripsi menjadi URL streaming murni menggunakan Exsala Proxy.

---

## ℹ️ Informasi Teknis

Script ini mensimulasikan *request* persis seperti aplikasi Android aslinya:

* **App Version Simulated:** `5.6.1`
* **Header Params:** `p: 60`, `vn: 5.6.1`, `apn: 1`
* **Signature:** Generated via Remote Vercel API.
* **Decryptor Engine:** `https://exsalapi.my.id/api/tools/dramabox/decrypt-video`

### Endpoint Coverage:
* `/search/search` (Advanced Search)
* `/he001/theater` (Latest, VIP, For You)
* `/he001/rank` (Top Charts)
* `/he001/reserveBook` (Coming Soon)
* `/he001/classify` (Categories)
* `/chapterv2/batch/load` (Raw Episodes & CDN Links)

---

## 📦 Cara Install & Jalankan

Pastikan Anda sudah menginstall [Node.js](https://nodejs.org/) di perangkat Anda (PC/Termux/VPS).

1.  **Clone Repository ini**
    ```bash
    git clone [https://github.com/giienew/dramabox-scraper](https://github.com/giienew/dramabox-scraper)
    cd dramabox-scraper
    ```

2.  **Install Module yang Dibutuhkan**
    ```bash
    npm install axios readline fs https
    ```
    *(Atau cukup ketik `npm install` jika file package.json sudah tersedia)*

3.  **Jalankan Script**
    ```bash
    node dramabox.js
    ```

---

## 📂 Struktur Output File

Hasil scraping akan disimpan secara otomatis dalam format JSON yang rapi dan terfilter regex:

* `search_[Kategori]_[Keyword].json`
* `latest_full_release.json`
* `vip_exclusive.json`
* `foryou_recommended.json`
* `rank_[NamaKategori].json`
* `coming_soon.json`
* `classify_full.json`
* `raw_episodes_[BookID].json`

---

## 🤝 Credits

* **Author:** Gienetic
* **Decryptor Engine:** Exsala API
* **Provider:** NB Community

*Dibuat dengan ❤️ dan Kopi. Silakan fork, pelajari, dan kembangkan!*