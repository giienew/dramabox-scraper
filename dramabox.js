/*
 * Dramabox Scraper Snippet V3 (Ultimate Edition - V5.6.1 Bypass)
 * Created by Gienetic 
 * Powered by Custom API & Ultimate Akamai Bypass
 */

import axios from "axios";
import readline from "readline";
import fs from "fs";
import https from "https";

const API_BASE = "https://nb-dramabox-gentoken.vercel.app";

let session = {
    token: "",
    deviceid: "",
    androidid: ""
};

delete axios.defaults.headers.common['Accept'];

const androidHttpsAgent = new https.Agent({
    ciphers: [
        "TLS_AES_128_GCM_SHA256",
        "TLS_AES_256_GCM_SHA384",
        "TLS_CHACHA20_POLY1305_SHA256",
        "ECDHE-ECDSA-AES128-GCM-SHA256",
        "ECDHE-RSA-AES128-GCM-SHA256"
    ].join(':'),
    honorCipherOrder: true,
    minVersion: 'TLSv1.2'
});

async function generateToken() {
    try {
        console.log("--> Menghubungkan ke API Server Pribadi (Vercel)...");
        const res = await axios.get(`${API_BASE}/generate-token`);
        if (res.data && res.data.status && res.data.data) {
            const data = res.data.data;
            session.token = data.sn;
            session.deviceid = data.device_id;
            session.androidid = data.android_id;
            console.log("--> Login Berhasil. Sesi tersimpan.");
            return true;
        }
        return false;
    } catch (error) {
        console.log(`--> Gagal Init Token: ${error.message}`);
        return false;
    }
}

async function getRemoteSignature(bodyPayload) {
    try {
        const res = await axios.post(`${API_BASE}/sign`, {
            body: bodyPayload,
            device_id: session.deviceid,
            android_id: session.androidid,
            token: session.token
        });
        if (res.data && res.data.status) {
            return res.data.data;
        }
        return null;
    } catch (error) {
        return null;
    }
}

function getLocalTime() {
    const now = new Date();
    const offset = 7 * 60 * 60 * 1000;
    const bangkokTime = new Date(now.getTime() + offset);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${bangkokTime.getUTCFullYear()}-${pad(bangkokTime.getUTCMonth() + 1)}-${pad(bangkokTime.getUTCDate())} ${pad(bangkokTime.getUTCHours())}:${pad(bangkokTime.getUTCMinutes())}:${pad(bangkokTime.getUTCSeconds())}.${bangkokTime.getUTCMilliseconds().toString().padStart(3, '0')} +0700`;
}

function saveToFile(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 4));
        console.log(`\n[Saved] ${filename}`);
    } catch (e) {
        console.log("[Error] Save file failed");
    }
}

async function postRequest(endpoint, body) {
    const signData = await getRemoteSignature(body);
    if (!signData) {
        return {
            success: false,
            error: "Signature Failed"
        };
    }

    // Header disesuaikan dengan capture versi 5.6.1 terbaru
    const headers = {
        "mchid": "DRA1000042",
        "tz": "-420",
        "language": "in",
        "mcc": "510",
        "locale": "in_ID",
        "is_root": "1",
        "device-id": session.deviceid,
        "nchid": "DRA1000042",
        "md": "Redmi Note 5",
        "store-source": "store_google",
        "mf": "XIAOMI",
        "local-time": getLocalTime(),
        "time-zone": "+0700",
        "brand": "Xiaomi",
        "apn": "1",
        "lat": "0",
        "is_emulator": "0",
        "current-language": "in",
        "ov": "10",
        "version": "561",
        "afid": Date.now() + "-" + Math.floor(Math.random() * 9999999999999999),
        "package-name": "com.storymatrix.drama",
        "android-id": session.androidid,
        "srn": "1080x2160",
        "p": "60",
        "is_vpn": "1",
        "build": "Build/QQ3A.200805.001",
        "pline": "ANDROID",
        "vn": "5.6.1",
        "over-flow": "new-fly",
        "tn": `Bearer ${session.token}`,
        "cid": "DRA1000042",
        "sn": signData.sn,
        "active-time": "1297",
        "content-type": "application/json; charset=UTF-8",
        "accept-encoding": "gzip",
        "user-agent": "okhttp/4.10.0",
        "Connection": "Keep-Alive"
    };

    const fullEndpoint = endpoint.includes('?') ?
        `${endpoint}&timestamp=${signData.timestamp}` :
        `${endpoint}?timestamp=${signData.timestamp}`;

    try {
        const response = await axios.post(fullEndpoint, body, {
            headers,
            httpsAgent: androidHttpsAgent,
            timeout: 10000
        });
        if (response.data && response.data.data) {
            return {
                success: true,
                data: response.data.data
            };
        }
        return {
            success: false,
            error: "Empty Data"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function doSearch() {
    console.log(`\n[ Search Drama ]`);
    const keyword = await ask("Keyword: ");
    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/search/suggest", {
        "keyword": keyword
    });

    if (res.success && res.data.suggestList) {
        console.log(JSON.stringify(res.data.suggestList, null, 2));
        saveToFile("result_search.json", res.data.suggestList);
    } else {
        console.log("Empty result.");
    }
}

async function doLatest() {
    console.log(`\n[ Latest / Telah Tayang ]`);
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
        console.log(`\n--- Page ${page} ---`);
        const body = {
            "newChannelStyle": 1,
            "isNeedRank": 1,
            "pageNo": page,
            "index": 1,
            "channelId": 43
        };

        const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", body);

        if (res.success && res.data.newTheaterList && res.data.newTheaterList.records.length > 0) {
            const records = res.data.newTheaterList.records;
            records.forEach(book => {
                console.log(`[${book.bookId}] ${book.bookName}`);
                console.log(`   Eps:   ${book.chapterCount} | Views: ${book.playCount}`);
                console.log(`   Tags:  ${book.tags.join(", ")}`);
                console.log(`   Intro: ${book.introduction.substring(0, 60)}...`);
                console.log("-".repeat(40));
            });
            saveToFile(`latest_page_${page}.json`, records);
            const next = await ask("\nLoad more? (y/n): ");
            if (next.toLowerCase() !== 'y') keepFetching = false;
            else page++;
        } else {
            console.log("No more data.");
            keepFetching = false;
        }
    }
}

async function doGetForYou() {
    console.log(`\n[ For You / Recommended ]`);
    const body = {
        "homePageStyle": 0,
        "isNeedRank": 1,
        "isNeedNewChannel": 1,
        "type": 0
    };

    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", body);

    if (res.success && res.data.columnVoList) {
        let allBooks = [];
        res.data.columnVoList.forEach(column => {
            console.log(`\n=== ${column.title} ===`);
            if (column.bookList && column.bookList.length > 0) {
                column.bookList.forEach(book => {
                    console.log(`[${book.bookId}] ${book.bookName} | Eps: ${book.chapterCount}`);
                    allBooks.push(book);
                });
            } else {
                console.log("- Kosong -");
            }
        });
        saveToFile("result_foryou.json", allBooks);
    } else {
        console.log("Empty result.");
    }
}

async function doGetComingSoon() {
    console.log(`\n[ Coming Soon / Akan Tayang ]`);
    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/reserveBook", {});

    if (res.success && res.data.reserveBookList && res.data.reserveBookList.length > 0) {
        const books = res.data.reserveBookList;
        books.forEach(book => {
            const releaseDate = new Date(book.bookShelfTime).toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta'
            });
            console.log(`[${book.bookId}] ${book.bookName}`);
            console.log(`   Rilis: ${releaseDate}`);
            console.log(`   Eps:   ${book.chapterCount} | Tags: ${book.tags.join(", ")}`);
            console.log(`   Intro: ${book.introduction.substring(0, 80)}...`);
            console.log("-".repeat(40));
        });
        saveToFile("result_coming_soon.json", books);
    } else {
        console.log("Empty result.");
    }
}

async function doGetRank() {
    console.log(`\n[ Rank / Peringkat ]`);
    console.log(`1. Sedang Tren`);
    console.log(`2. Pencarian Populer`);
    console.log(`3. Terbaru`);

    const choice = await ask("Pilih Kategori Rank (1-3): ");
    const rankType = ['1', '2', '3'].includes(choice.trim()) ? parseInt(choice.trim()) : 2;

    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/rank", {
        "rankType": rankType
    });

    if (res.success && res.data.rankList && res.data.rankList.length > 0) {
        const categoryName = res.data.rankTypeVoList.find(r => r.rankType === rankType)?.rankName || "Rank";
        console.log(`\n=== ${categoryName} ===`);

        const books = res.data.rankList;
        books.forEach((book, index) => {
            console.log(`#${index + 1} [${book.bookId}] ${book.bookName}`);
            console.log(`   Hot:   ${book.rankVo.hotCode}`);
            console.log(`   Eps:   ${book.chapterCount} | Cast: ${book.protagonist || "-"}`);
            console.log(`   Tags:  ${book.tags.join(", ")}`);
            console.log(`   Intro: ${book.introduction.substring(0, 80)}...`);
            console.log("-".repeat(40));
        });
        saveToFile(`rank_type_${rankType}.json`, books);
    } else {
        console.log("Empty Rank Result.");
    }
}

async function doGetVip() {
    console.log(`\n[ VIP / Weekly Selection ]`);
    const body = {
        "homePageStyle": 0,
        "isNeedRank": 1,
        "index": 4,
        "type": 0,
        "channelId": 205
    };

    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", body);

    if (res.success && res.data.columnVoList && res.data.columnVoList.length > 0) {
        let allBooks = [];
        res.data.columnVoList.forEach(column => {
            console.log(`\n=== ${column.title} ===`);
            if (column.bookList && column.bookList.length > 0) {
                column.bookList.forEach(book => {
                    const badge = (book.corner && book.corner.name) ? `[${book.corner.name}]` : "";
                    const tags = book.tags ? book.tags.join(", ") : "-";

                    console.log(`${badge} [${book.bookId}] ${book.bookName}`);
                    console.log(`   Views: ${book.playCount} | Eps: ${book.chapterCount}`);
                    console.log(`   Tags:  ${tags}`);
                    console.log("-".repeat(40));
                    allBooks.push(book);
                });
            } else {
                console.log("- Kosong -");
            }
        });
        saveToFile("result_vip.json", allBooks);
    } else {
        console.log("Empty VIP result.");
    }
}

async function doGetClassify() {
    console.log(`\n[ Classify / Jelajah Kategori ]`);
    let page = 1;
    let keepFetching = true;

    while (keepFetching) {
        console.log(`\n--- Page ${page} ---`);
        const body = {
            "typeList": [],
            "showLabels": true,
            "pageNo": page,
            "pageSize": 15
        };

        const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/classify", body);

        if (res.success && res.data.classifyBookList && res.data.classifyBookList.records.length > 0) {
            const records = res.data.classifyBookList.records;
            records.forEach(book => {
                const badge = (book.corner && book.corner.name) ? `[${book.corner.name}] ` : "";
                console.log(`${badge}[${book.bookId}] ${book.bookName}`);
                console.log(`   Views: ${book.playCount} | Eps: ${book.chapterCount}`);
                console.log(`   Tags:  ${book.tags.join(", ")}`);
                console.log(`   Intro: ${book.introduction.substring(0, 60)}...`);
                console.log("-".repeat(40));
            });
            saveToFile(`classify_page_${page}.json`, records);
            const next = await ask("\nLoad page selanjutnya? (y/n): ");
            if (next.toLowerCase() !== 'y') keepFetching = false;
            else page++;
        } else {
            console.log("End of list.");
            keepFetching = false;
        }
    }
}


async function doGetEpisodes() {
    console.log(`\n[ Get Unlimited Episodes (Raw Data) ]`);
    const bookId = await ask("Book ID: ");
    console.log(`Mulai mengambil raw data untuk ID: ${bookId}...`);

    let allEpisodesRaw = [];
    let currentIndex = -1; // Request tarikan pertama (Initial Load)
    let keepGoing = true;
    let batchCount = 1;

    while (keepGoing) {
        process.stdout.write(`\r--> Memuat batch ke-${batchCount} (Meneruskan dari Index: ${currentIndex})... `);
        
        // Payload cerdas menggunakan data validasi langsung dari aplikasi versi terbaru
        const body = {
            "boundaryIndex": 0, 
            "index": parseInt(currentIndex), 
            "currencyPlaySource": "ssym_rank_search",
            "needEndRecommend": 0,
            "currencyPlaySourceName": "搜索页面热门搜索_热搜榜",
            "preLoad": false,
            "rid": "",
            "pullCid": "",
            "enterReaderChapterIndex": 0,
            "loadDirection": currentIndex === -1 ? 0 : 2, // 0 = Load Awal, 2 = Load More (Scroll Bawah)
            "bookId": String(bookId)
        };

        const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/chapterv2/batch/load", body);

        if (res.success && res.data.chapterList && res.data.chapterList.length > 0) {
            const chapters = res.data.chapterList;
            
            // Filter cerdas: Abaikan jika ada episode yang tumpang tindih / berulang
            const newChapters = chapters.filter(newEps => 
                !allEpisodesRaw.some(existEps => existEps.chapterId === newEps.chapterId)
            );

            if (newChapters.length === 0) {
                console.log("\n⚠️ Loop mendeteksi data berulang. Ekstraksi dihentikan otomatis.");
                keepGoing = false;
                break;
            }

            // Memasukkan array mentah ke wadah utama
            allEpisodesRaw = allEpisodesRaw.concat(newChapters);
            
            // Kursor untuk request batch berikutnya dari episode paling terakhir
            const lastChapter = newChapters[newChapters.length - 1];
            currentIndex = parseInt(lastChapter.chapterIndex);
            batchCount++;

            // Jika API memberikan kurang dari 5 chapter, artinya itu adalah batch terakhir
            if (chapters.length < 5) {
                console.log(`\n✅ Ujung akhir episode telah ditemukan.`);
                keepGoing = false;
            }
            
            // Delay santai untuk mengelabui Akamai WAF
            await new Promise(r => setTimeout(r, 400)); 
        } else {
            console.log(`\n❌ Proses terhenti (API merespon kosong / End of List).`);
            keepGoing = false;
        }
    }
    
    // Finalisasi: Sorting array berdasarkan chapterIndex agar data tersimpan sempurna berurutan (EP 1, EP 2, EP 3...)
    allEpisodesRaw.sort((a, b) => a.chapterIndex - b.chapterIndex);

    console.log(`\n🎉 SELESAI! Berhasil menarik total ${allEpisodesRaw.length} raw episodes secara lengkap.`);
    saveToFile(`raw_episodes_${bookId}.json`, allEpisodesRaw);
}

async function main() {
    console.clear();
    console.log("Dramabox Scraper V4 (Ultimate Edition) - Gienetic");

    if (await generateToken()) {
        while (true) {
            console.log(`\n--- MAIN MENU ---`);
            console.log(`1. Search Drama`);
            console.log(`2. Latest / Newest`);
            console.log(`3. For You / Recommended`);
            console.log(`4. Coming Soon`);
            console.log(`5. Top Ranking / Charts`);
            console.log(`6. VIP / Weekly Selection`);
            console.log(`7. Classify / Jelajah Kategori`);
            console.log(`8. Get Episodes (Raw Data)`);
            console.log(`9. Exit`);

            const c = await ask("Select: ");
            switch (c.trim()) {
                case "1":
                    await doSearch();
                    break;
                case "2":
                    await doLatest();
                    break;
                case "3":
                    await doGetForYou();
                    break;
                case "4":
                    await doGetComingSoon();
                    break;
                case "5":
                    await doGetRank();
                    break;
                case "6":
                    await doGetVip();
                    break;
                case "7":
                    await doGetClassify();
                    break;
                case "8":
                    await doGetEpisodes();
                    break;
                case "9":
                    process.exit(0);
                default:
                    console.log("Invalid selection.");
            }
        }
    } else {
        console.log("Gagal inisialisasi API.");
    }
}

main();