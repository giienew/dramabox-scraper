# 🎬 Dramabox Scraper V5.9.0  
### Ultimate Developer Edition

Dramabox Scraper adalah **Node.js-based scraping toolkit** yang dirancang untuk melakukan ekstraksi data dari platform Dramabox dengan pendekatan **advanced bypass techniques**.

Versi **V5.9.0** menghadirkan peningkatan signifikan pada sisi **network layer, anti-bot bypass, dan decryption engine**, menjadikannya stabil untuk sistem dengan proteksi tinggi seperti Akamai & Aliyun.

---

## ⚡ Status

- ✅ Stable & Fully Working  
- ✅ Anti-Shadowban System  
- ✅ Akamai WAF Bypass Ready  
- ✅ VIP Content Decryption Enabled  

---

## 🧠 Core Technology

- **Cloud Crypto Signature** — Vercel-based Node engine  
- **Akamai WAF Bypass** — Raw TLS Socket (HTTP/1.1)  
- **SOCKS5 Auto-Rotation** — Intelligent IP switching  
- **Aliyun AES Decryptor** — Direct `.encrypt.mp4` processing  

---

## ⚠️ Important Notice

Dramabox menggunakan sistem proteksi ketat:

- Akamai WAF  
- Aliyun Security Layer  
- IP-based Shadowban  

Jika terkena limit, server tetap merespon namun **tanpa data (empty response)**.

### 🔐 Best Practice

- Gunakan **proxy (SOCKS5)**  
- Hindari request berlebihan  
- Gunakan rotasi IP  

---

## 🛡️ Proxy & API Integration

Script mendukung integrasi dengan **Exsala API** untuk:

- Proxy Pool Automation  
- Token Rotation  
- VIP Decryption  

### Konfigurasi:

```js
EXSALA_PROXY_API
```

Bisa menggunakan:
- Exsala API (recommended)  
- Proxy pribadi (custom endpoint)  

---

## 🚀 What's New — V5.9.0

### 1. Akamai WAF Bypass
Menggunakan `tls.connect` untuk koneksi HTTP/1.1 berbasis socket, menghindari deteksi library standar.

### 2. SOCKS5 Auto-Rotation
- Deteksi shadowban  
- Rotasi IP & token otomatis  
- Retry hingga data valid  

### 3. AES Decryption Engine
- AES-128-ECB  
- Tanpa emulator / Frida  
- Direct processing  

### 4. Smart Pagination
- Auto-detect `pages` & `isMore`  
- Crawling efisien  
- Delay natural  

### 5. Advanced Search
- Trending  
- Latest  
- Unwatched  

---

## 🧩 Features

- 🔍 Search Drama  
- 🆕 Latest Releases  
- 🎯 Recommendation (FYP)  
- ⏳ Coming Soon  
- 📊 Top Rankings  
- 💎 VIP Content  
- 🗂️ Category Browser  
- 📦 Raw Episode Extraction  
- 🔓 Decrypt Video URL  

---

## 📦 Installation

Pastikan Node.js sudah terinstall:  
https://nodejs.org/

### 1. Clone Repo

```bash
git clone https://github.com/giienew/dramabox-scraper
cd dramabox-scraper
```

### 2. Install Dependencies

```bash
npm install axios readline fs tls zlib crypto socks
```

### 3. Run

```bash
node dramabox.js
```

---

## 📁 Output

```
search_[category]_[keyword].json
latest_full_release.json
vip_exclusive.json
foryou_recommended.json
rank_[category].json
coming_soon.json
classify_full.json
raw_episodes_[bookId].json
```

---

## ⚖️ Disclaimer

- Open-source untuk edukasi  
- Tidak untuk diperjualbelikan  
- Gunakan untuk pembelajaran:
  - API Structure  
  - HTTP Networking  
  - TLS Socket  
  - Pagination  
  - Decryption  

Semua risiko penggunaan ditanggung pengguna.

---

## 🤝 Credits

- Author: Gienetic  
- Engine: Exsala API  
- Community: NB Community  

---

## ☕ Notes

Project ini dibuat untuk eksplorasi:

- Reverse Engineering  
- Network Analysis  
- API Automation  

Silakan fork dan kembangkan.