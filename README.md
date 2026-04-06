# Dramabox Scraper V3 (Full Source Edition)

**Dramabox Scraper V3 - Full Source Edition.**
Script scraper berbasis Node.js yang telah di-update total menggunakan *headers* dan logika terbaru dari aplikasi original versi **5.6.1**. Script ini menggunakan metode **Remote Signing** agar aman digunakan tanpa menyimpan *Private Key* di sisi client.

**Status:** ✅ WORK 100% (VIP & All Menus Unlocked)
**Powered by: NB Community**

---

## 🔥 What's New in V3?

Berbeda dengan versi lama atau scraper "nanggung" lainnya, versi ini adalah **Full Edition**:

* ✅ **Header Terbaru (v4.9.2):** Menggunakan `p: 51` dan version code terbaru sehingga tidak terdeteksi sebagai aplikasi lawas.
* ✅ **VIP / Weekly Selection Fixed:** Menu "Anggota Saja" (Member Only) kini muncul dan bisa diambil datanya.
* ✅ **Full Pagination:** Tidak ada limit 55 record. Script bisa melakukan looping halaman (*load more*) sampai data habis ke akar-akarnya.
* ✅ **7+ Menu Lengkap:** Mengambil metadata dari hampir seluruh bagian aplikasi.
* ✅ **Clean Code:** Struktur kode rapi, rata kanan, modular, dan tanpa *encrypted code*.

---

## ⚠️ PERINGATAN KERAS (DISCLAIMER)

Mohon dibaca dengan teliti sebelum menggunakan script ini:

1.  **TIDAK UNTUK DIPERJUALBELIKAN!**
    Script ini dibagikan secara **GRATIS** dan *Open Source* untuk tujuan edukasi. Jangan menjadi pihak tidak beretika yang mencoba mengambil keuntungan materi dari kode ini.
    
2.  **JANGAN HANYA PAMER JSON**
    Gunakan script ini untuk belajar struktur API, *HTTP Request*, dan *Data Mining*. Pahami kodenya, jangan cuma asal run.

3.  **STATUS TOKEN**
    Token dan Signature disediakan oleh server **NB Community**.
    * Token bersifat *shared*.
    * **Token bisa dibekukan (banned)** jika terjadi penyalahgunaan (spam request berlebihan). Gunakan delay yang wajar.

---

## 🛠️ Fitur & Menu Tersedia

Script ini mampu mengambil data dari menu-menu berikut:

1.  **Search Drama:** Cari drama berdasarkan kata kunci.
2.  **Latest / Theater:** Daftar drama terbaru dengan fitur *pagination* (halaman berlanjut).
3.  **For You:** Rekomendasi drama berdasarkan algoritma (Recommended).
4.  **Coming Soon:** Daftar drama yang akan tayang (Reserve).
5.  **Top Ranking:**
    * Sedang Tren
    * Pencarian Populer
    * Terbaru
6.  **VIP / Weekly Selection:** Daftar drama pilihan editor / berbayar.
7.  **Classify (Jelajah):** Browsing drama berdasarkan kategori/filter.
8.  **Get Episodes:** Mengambil *list* episode lengkap secara massal (Batch Fetch).

---

## ℹ️ Informasi Teknis

Script ini bekerja dengan melakukan simulasi request persis seperti aplikasi Android aslinya:

* **App Version Simulated:** `4.9.2`
* **Header Params:** `p: 51`, `vn: 4.9.2`, `apn: 1`
* **Signature:** Generated via Remote API (Secure).

### Endpoint Coverage:
* `/search/suggest` (Search)
* `/he001/theater` (Latest, VIP, For You)
* `/he001/rank` (Top Charts)
* `/he001/reserveBook` (Coming Soon)
* `/he001/classify` (Categories)
* `/chapterV2/batch/load` (Episodes)

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
    npm install axios readline fs
    ```
    *(Atau cukup ketik `npm install` jika file package.json sudah tersedia)*

3.  **Jalankan Script**
    ```bash
    node dramabox.js
    ```

---

## 📂 Struktur Output File

Hasil scraping akan disimpan secara otomatis dalam format JSON yang rapi:

* `result_search.json`
* `latest_page_X.json` (Per halaman)
* `result_vip.json`
* `result_foryou.json`
* `rank_type_X.json`
* `result_coming_soon.json`
* `classify_page_X.json`
* `result_episode.json`

---

## 🤝 Credits

* **Author:** Gienetic
* **Provider:** NB Community

*Dibuat dengan ❤️ dan Kopi. Silakan comot, gratis.*