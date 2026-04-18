/*
 * Dramabox Scraper V5 (Ultimate Edition - Full Scrape API)
 * Created by Gienetic 
 * Powered by Custom API, Exsala Proxy & Ultimate Akamai Bypass
 * GitHub Ready Release
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
        process.stdout.write("--> Initializing Server Connection... ");
        const res = await axios.get(`${API_BASE}/generate-token`);
        if (res.data && res.data.status && res.data.data) {
            const data = res.data.data;
            session.token = data.sn;
            session.deviceid = data.device_id;
            session.androidid = data.android_id;
            console.log("OK. Session Saved.");
            return true;
        }
        return false;
    } catch (error) {
        console.log(`Failed: ${error.message}`);
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
        return (res.data && res.data.status) ? res.data.data : null;
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
        const safeFilename = filename.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
        fs.writeFileSync(safeFilename, JSON.stringify(data, null, 4));
        console.log(`\n[Saved] -> ${safeFilename}`);
    } catch (e) {
        console.log(`[Error] Failed saving to ${filename}`);
    }
}

async function postRequest(endpoint, body) {
    const signData = await getRemoteSignature(body);
    if (!signData) return { success: false, error: "Signature Failed" };

    const headers = {
        "mchid": "DRA1000042", "tz": "-420", "language": "in", "mcc": "510",
        "locale": "in_ID", "is_root": "1", "device-id": session.deviceid,
        "nchid": "DRA1000042", "md": "Redmi Note 5", "store-source": "store_google",
        "mf": "XIAOMI", "local-time": getLocalTime(), "time-zone": "+0700",
        "brand": "Xiaomi", "apn": "1", "lat": "0", "is_emulator": "0",
        "current-language": "in", "ov": "10", "version": "561",
        "afid": Date.now() + "-" + Math.floor(Math.random() * 9999999999999999),
        "package-name": "com.storymatrix.drama", "android-id": session.androidid,
        "srn": "1080x2160", "p": "60", "is_vpn": "1",
        "build": "Build/QQ3A.200805.001", "pline": "ANDROID", "vn": "5.6.1",
        "over-flow": "new-fly", "tn": `Bearer ${session.token}`,
        "cid": "DRA1000042", "sn": signData.sn, "active-time": "1297",
        "content-type": "application/json; charset=UTF-8", "accept-encoding": "gzip",
        "user-agent": "okhttp/4.10.0", "Connection": "Keep-Alive"
    };

    const fullEndpoint = endpoint.includes('?') ? `${endpoint}&timestamp=${signData.timestamp}` : `${endpoint}?timestamp=${signData.timestamp}`;

    try {
        const response = await axios.post(fullEndpoint, body, { headers, httpsAgent: androidHttpsAgent, timeout: 15000 });
        if (response.data && response.data.data) return { success: true, data: response.data.data };
        return { success: false, error: "Empty Data" };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

/* * -----------------------------------------------------------
 * CORE SCRAPING MODULES
 * -----------------------------------------------------------
 */

// Payload Result: res.data.searchList[i] -> { bookId, bookName, playCount, tagNames, corner: { name } }
async function doSearch() {
    console.log(`\n[ Search Drama - Advanced Filter ]`);
    const keyword = await ask("Keyword: ");
    console.log(`\nSort by: [1] Trending  [2] Latest  [3] Unwatched`);
    const sortChoice = await ask("Select (1/2/3): ");
    
    let sortType = 1;
    let typeName = "Trending";
    if (sortChoice.trim() === '2') { sortType = 2; typeName = "Latest"; }
    if (sortChoice.trim() === '3') { sortType = 3; typeName = "Unwatched"; }

    const searchSource = (sortType === 2 || sortType === 3) ? "搜索按钮" : "";
    const fromParam = (sortType === 2 || sortType === 3) ? "search_sug" : "search_result";

    let page = 1, keepFetching = true, allResults = [];

    while (keepFetching) {
        process.stdout.write(`\r-> Fetching Page ${page}... `);
        const body = {
            "searchSource": searchSource, "sortType": sortType, "synSwitch": 1,
            "pageNo": page, "pageSize": 20, "from": fromParam, "keyword": keyword
        };

        const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/search/search", body);

        if (res.success && res.data && res.data.searchList && res.data.searchList.length > 0) {
            allResults = allResults.concat(res.data.searchList);
            console.log(`OK! (${res.data.searchList.length} items)`);
            
            if (res.data.isMore === 0 || res.data.searchList.length < 20) {
                keepFetching = false;
            } else {
                page++;
                await new Promise(r => setTimeout(r, 800)); 
            }
        } else {
            console.log("End of results.");
            keepFetching = false;
        }
    }
    if (allResults.length > 0) saveToFile(`search_${typeName}_${keyword}.json`, allResults);
}

// Payload Result: res.data.newTheaterList.records[i] -> { bookId, bookName, chapterCount, playCount, tags }
async function doLatest() {
    console.log(`\n[ Latest / Telah Tayang ]`);
    let page = 1, keepFetching = true, allResults = [];

    while (keepFetching) {
        process.stdout.write(`\r-> Fetching Page ${page}... `);
        const body = { "newChannelStyle": 1, "isNeedRank": 1, "pageNo": page, "index": 1, "channelId": 43 };
        const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", body);

        if (res.success && res.data.newTheaterList && res.data.newTheaterList.records.length > 0) {
            allResults = allResults.concat(res.data.newTheaterList.records);
            console.log(`OK! (${res.data.newTheaterList.records.length} items)`);
            
            const totalPages = res.data.newTheaterList.pages || 1;
            if (page >= totalPages) keepFetching = false;
            else {
                page++;
                await new Promise(r => setTimeout(r, 800));
            }
        } else {
            console.log("Failed or End of data.");
            keepFetching = false;
        }
    }
    if (allResults.length > 0) saveToFile("latest_full_release.json", allResults);
}

// Payload Result: res.data.columnVoList[i].bookList[j] -> { bookId, bookName, chapterCount }
async function doGetForYou() {
    console.log(`\n[ For You / Recommended ]`);
    const body = { "homePageStyle": 0, "isNeedRank": 1, "isNeedNewChannel": 1, "type": 0 };
    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", body);

    if (res.success && res.data.columnVoList) {
        let allBooks = [];
        res.data.columnVoList.forEach(col => {
            if (col.bookList && col.bookList.length > 0) allBooks = allBooks.concat(col.bookList);
        });
        console.log(`Successfully scraped ${allBooks.length} recommended items.`);
        saveToFile("foryou_recommended.json", allBooks);
    } else {
        console.log("Empty result.");
    }
}

// Payload Result: res.data.reserveBookList[i] -> { bookId, bookName, bookShelfTime, tags, introduction }
async function doGetComingSoon() {
    console.log(`\n[ Coming Soon / Akan Tayang ]`);
    process.stdout.write("-> Fetching coming soon list... ");
    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/reserveBook", {});

    if (res.success && res.data.reserveBookList && res.data.reserveBookList.length > 0) {
        const books = res.data.reserveBookList;
        console.log(`OK! (${books.length} items)`);
        
        books.forEach(book => {
            book.releaseDateLocal = book.bookShelfTime ? new Date(book.bookShelfTime).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : "TBA";
        });
        saveToFile("coming_soon.json", books);
    } else {
        console.log("Failed or Empty.");
    }
}

// Payload Result: res.data.rankList[i] -> { bookId, bookName, chapterCount, rankVo: { sort, hotCode } }
async function doGetRank() {
    console.log(`\n[ Charts & Ranking ]`);
    console.log(`[1] Trending  [2] Popular Search  [3] Newest`);
    const choice = await ask("Select Category (1-3): ");
    const rankType = ['1', '2', '3'].includes(choice.trim()) ? parseInt(choice.trim()) : 1;

    process.stdout.write(`-> Fetching Leaderboard Category ${rankType}... `);
    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/rank", { "rankType": rankType });

    if (res.success && res.data.rankList && res.data.rankList.length > 0) {
        const categoryName = res.data.rankTypeVoList?.find(r => r.rankType === rankType)?.rankName || `Rank_${rankType}`;
        console.log(`OK! (${res.data.rankList.length} items)`);
        saveToFile(`rank_${categoryName}.json`, res.data.rankList);
    } else {
        console.log("Empty Rank Result.");
    }
}

// Payload Result: res.data.columnVoList[i].bookList[j] -> { bookId, bookName, playCount, chapterCount, tags }
async function doGetVip() {
    console.log(`\n[ VIP / Weekly Selection ]`);
    process.stdout.write("-> Fetching VIP Exclusives... ");
    const body = { "homePageStyle": 0, "isNeedRank": 1, "index": 4, "type": 0, "channelId": 205 };
    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", body);

    if (res.success && res.data.columnVoList && res.data.columnVoList.length > 0) {
        let allBooks = [];
        res.data.columnVoList.forEach(col => {
            if (col.bookList && col.bookList.length > 0) allBooks = allBooks.concat(col.bookList);
        });
        console.log(`OK! (${allBooks.length} items across categories)`);
        saveToFile("vip_exclusive.json", allBooks);
    } else {
        console.log("Empty VIP result.");
    }
}

// Payload Result: res.data.classifyBookList.records[i] -> { bookId, bookName, tags, introduction }
async function doGetClassify() {
    console.log(`\n[ Classify / Jelajah Kategori ]`);
    let page = 1, keepFetching = true, allResults = [];

    while (keepFetching) {
        process.stdout.write(`\r-> Fetching Page ${page}... `);
        const body = { "typeList": [], "showLabels": true, "pageNo": page, "pageSize": 15 };
        const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/classify", body);

        if (res.success && res.data.classifyBookList && res.data.classifyBookList.records.length > 0) {
            allResults = allResults.concat(res.data.classifyBookList.records);
            console.log(`OK! (${res.data.classifyBookList.records.length} items)`);
            
            if (res.data.classifyBookList.isMore === 0 || res.data.classifyBookList.records.length < 15) {
                keepFetching = false;
            } else {
                page++;
                await new Promise(r => setTimeout(r, 800));
            }
        } else {
            console.log("End of list.");
            keepFetching = false;
        }
    }
    if (allResults.length > 0) saveToFile("classify_full.json", allResults);
}

// Payload Result: res.data.chapterList[i] -> { chapterId, chapterIndex, bookId, cdnList... }
async function doGetEpisodes() {
    console.log(`\n[ Get Episodes (Pure Raw Data) ]`);
    const bookId = await ask("Book ID: ");
    console.log(`-> Extracting raw metadata for ID: ${bookId}...`);

    let allEpisodesRaw = [];
    let currentIndex = -1; 
    let keepGoing = true;
    let batchCount = 1;

    while (keepGoing) {
        process.stdout.write(`\r   Loading batch ${batchCount} (Cursor: ${currentIndex})... `);
        const body = {
            "boundaryIndex": 0, "index": parseInt(currentIndex), "currencyPlaySource": "ssym_rank_search",
            "needEndRecommend": 0, "currencyPlaySourceName": "搜索页面热门搜索_热搜榜", "preLoad": false,
            "rid": "", "pullCid": "", "enterReaderChapterIndex": 0,
            "loadDirection": currentIndex === -1 ? 0 : 2, "bookId": String(bookId)
        };

        const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/chapterv2/batch/load", body);

        if (res.success && res.data.chapterList && res.data.chapterList.length > 0) {
            const chapters = res.data.chapterList;
            const newChapters = chapters.filter(newEps => !allEpisodesRaw.some(existEps => existEps.chapterId === newEps.chapterId));

            if (newChapters.length === 0) {
                console.log("\n-> Cycle detected. Stopping extraction.");
                break;
            }

            allEpisodesRaw = allEpisodesRaw.concat(newChapters);
            currentIndex = parseInt(newChapters[newChapters.length - 1].chapterIndex);
            batchCount++;

            if (chapters.length < 5) keepGoing = false;
            await new Promise(r => setTimeout(r, 600)); 
        } else {
            keepGoing = false;
        }
    }
    
    allEpisodesRaw.sort((a, b) => a.chapterIndex - b.chapterIndex);
    console.log(`\n✅ Done! Extracted ${allEpisodesRaw.length} pure raw episodes.`);
    saveToFile(`raw_episodes_${bookId}.json`, allEpisodesRaw);
}

/* * -----------------------------------------------------------
 * EXSALA PROXY UTILITY MODULE
 * -----------------------------------------------------------
 */

// Payload Result: Decrypted playable video URL output directly to console
async function doDecryptUrl() {
    console.log(`\n[ Decrypt Video URL via Exsala Proxy ]`);
    const rawUrl = await ask("Masukkan URL Video (Encrypt/Raw): ");
    
    if (!rawUrl || rawUrl.trim() === "") {
        console.log("❌ URL tidak boleh kosong.");
        return;
    }

    const decryptedUrl = `https://exsalapi.my.id/api/tools/dramabox/decrypt-video?url=${rawUrl.trim()}&apikey=freepublic`;
    
    console.log(`\n✅ [Decrypted URL Ready]`);
    console.log(`${decryptedUrl}\n`);
    console.log("-> Silakan salin dan putar langsung di browser atau media player (VLC/IDM).");
}

/* * -----------------------------------------------------------
 * APPLICATION BOOTSTRAP
 * -----------------------------------------------------------
 */

async function main() {
    console.clear();
    console.log("================================================");
    console.log(" Dramabox Scraper V4 (Ultimate Edition)");
    console.log(" Engine by Gienetic | Exsala API");
    console.log("================================================");

    if (await generateToken()) {
        while (true) {
            console.log(`\n--- MAIN MENU ---`);
            console.log(`[1] Search Drama (Full Pagination)`);
            console.log(`[2] Latest / Newest (Full Pagination)`);
            console.log(`[3] For You / Recommended`);
            console.log(`[4] Coming Soon`);
            console.log(`[5] Top Ranking / Charts`);
            console.log(`[6] VIP / Weekly Selection`);
            console.log(`[7] Classify / Jelajah Kategori (Full Pagination)`);
            console.log(`[8] Get Episodes (Pure Raw Data)`);
            console.log(`[9] Decrypt Video URL (Exsala Proxy)`);
            console.log(`[0] Exit`);

            const c = await ask("\nSelect Menu: ");
            switch (c.trim()) {
                case "1": await doSearch(); break;
                case "2": await doLatest(); break;
                case "3": await doGetForYou(); break;
                case "4": await doGetComingSoon(); break;
                case "5": await doGetRank(); break;
                case "6": await doGetVip(); break;
                case "7": await doGetClassify(); break;
                case "8": await doGetEpisodes(); break;
                case "9": await doDecryptUrl(); break;
                case "0": console.log("Exiting... Goodbye!"); process.exit(0);
                default: console.log("Invalid selection. Try again.");
            }
        }
    } else {
        console.log("Critical Error: Failed to initialize API Session.");
    }
}

main();