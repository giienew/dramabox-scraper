/**
 * Dramabox Scraper CLI Engine
 * Ultimate Developer Edition
 * Cloud Crypto Signature (Vercel) + Akamai WAF Bypass (HTTP/1.1 TLS Socket)
 * Author: Gienetic
 */
 
import readline from "readline";
import fs from "fs";
import tls from "tls"; 
import crypto from "crypto";
import zlib from "zlib";
import axios from "axios";

// --- KONFIGURASI API & SESI ---
const API_BASE = "https://nb-dramabox-gentoken.vercel.app";

let session = {
    token: "",
    deviceid: "",
    androidid: "",
    instanceid: crypto.randomBytes(16).toString('hex'),
    afid: Date.now() + "-" + Math.floor(Math.random() * 9999999999999999),
    ins: Date.now().toString(),
    st: "cK4n10B_0tTQBrxFyyBWnOKD" 
};

// --- CLI UI & COLORS ---
const c = {
    rst: "\x1b[0m", dim: "\x1b[2m", bld: "\x1b[1m",
    red: "\x1b[31m", grn: "\x1b[32m", ylw: "\x1b[33m",
    blu: "\x1b[34m", mag: "\x1b[35m", cyn: "\x1b[36m", wht: "\x1b[37m"
};

const log = {
    info: (msg) => console.log(`${c.cyn}[*]${c.rst} ${msg}`),
    ok: (msg) => console.log(`${c.grn}[+]${c.rst} ${msg}`),
    err: (msg) => console.log(`${c.red}[-]${c.rst} ${msg}`),
    warn: (msg) => console.log(`${c.ylw}[!]${c.rst} ${msg}`),
    step: (msg) => process.stdout.write(`${c.blu}[~]${c.rst} ${msg}`),
    header: (title) => console.log(`\n${c.mag}${c.bld}--- [ ${title} ] ---${c.rst}\n`)
};

function printBanner() {
    console.clear();
    console.log(`${c.cyn}${c.bld}`);
    console.log(`██████╗ ██████╗ █████╗ ███╗   ███╗█████╗ `);
    console.log(`██╔══██╗██╔══██╗██╔══██╗████╗ ████║██╔══██╗`);
    console.log(`██║  ██║██████╔╝███████║██╔████╔██║███████║`);
    console.log(`██║  ██║██╔══██╗██╔══██║██║╚██╔╝██║██╔══██║`);
    console.log(`██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║██║  ██║`);
    console.log(`╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝`);
    console.log(`██████╗  ██████╗ ██╗  ██╗`);
    console.log(`██╔══██╗██╔═══██╗╚██╗██╔╝`);
    console.log(`██████╔╝██║   ██║ ╚███╔╝ `);
    console.log(`██╔══██╗██║   ██║ ██╔██╗ `);
    console.log(`██████╔╝╚██████╔╝██╔╝ ██╗`);
    console.log(`╚═════╝  ╚═════╝ ╚═╝  ╚═╝${c.rst}`);
    console.log(`\n${c.dim}:: Core Engine V5.8.2 | Vercel Signature + TLS Bypass | Coded by Gienetic::${c.rst}\n`);
}

// --- CORE HELPERS ---
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
        log.ok(`Dump saved: ${c.bld}${safeFilename}${c.rst}`);
    } catch (e) {
        log.err(`Failed to write file ${filename}`);
    }
}

// --- VERCEL CLOUD CRYPTO ---
async function generateToken() {
    try {
        log.step("Initializing Session via Vercel... ");
        const res = await axios.get(`${API_BASE}/generate-token`, { timeout: 20000 });
        
        if (res.data && res.data.status && res.data.data) {
            session.token = res.data.data.sn;
            session.deviceid = res.data.data.device_id;
            session.androidid = res.data.data.android_id;
            console.log(`${c.grn}SUCCESS${c.rst}`);
            return true;
        }
        
        console.log(`${c.red}FAILED${c.rst}`);
        return false;
    } catch (error) {
        console.log(`${c.red}ERR: ${error.message}${c.rst}`);
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
        }, { timeout: 15000 });
        
        return (res.data && res.data.status) ? res.data.data : null;
    } catch (error) {
        return null;
    }
}


// --- RAW TLS SOCKET BYPASS (UNTUK PENGAMBILAN DATA) ---
function wRequest(urlStr, bodyObj, headersInput) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(urlStr);
        const bodyStr = JSON.stringify(bodyObj);
        const contentLength = Buffer.byteLength(bodyStr);

        let requestRaw = `POST ${urlObj.pathname}${urlObj.search} HTTP/1.1\r\n`;
        requestRaw += `Host: ${urlObj.hostname}\r\n`;
        
        for (const [key, value] of Object.entries(headersInput)) {
            if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'content-length') {
                 requestRaw += `${key}: ${value}\r\n`;
            }
        }
        
        requestRaw += `Content-Length: ${contentLength}\r\n`;
        requestRaw += `Connection: close\r\n\r\n`; 
        requestRaw += bodyStr; 

        const options = {
            host: urlObj.hostname,
            port: 443,
            servername: urlObj.hostname, 
            rejectUnauthorized: false, 
            ciphers: "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256",
            ALPNProtocols: ['http/1.1'] 
        };

        const socket = tls.connect(options, () => {
            socket.write(requestRaw);
        });

        let rawResponse = Buffer.alloc(0);

        socket.on('data', (chunk) => {
            rawResponse = Buffer.concat([rawResponse, chunk]);
        });

        socket.on('end', () => {
            const responseString = rawResponse.toString('binary');
            const headerBodySplitIndex = responseString.indexOf('\r\n\r\n');
            
            if (headerBodySplitIndex === -1) {
                return resolve({ success: false, error: "Invalid HTTP Format" });
            }

            const headerPart = responseString.substring(0, headerBodySplitIndex);
            let bodyBuffer = rawResponse.subarray(headerBodySplitIndex + 4); 

            const statusLine = headerPart.split('\r\n')[0];
            const statusCode = parseInt(statusLine.split(' ')[1]);

            const responseHeaders = {};
            const headerLines = headerPart.split('\r\n').slice(1);
            headerLines.forEach(line => {
                const parts = line.split(':');
                if (parts.length > 1) {
                    const key = parts[0].trim().toLowerCase();
                    const value = parts.slice(1).join(':').trim();
                    responseHeaders[key] = value;
                }
            });

            if (responseHeaders['st']) {
                session.st = responseHeaders['st'];
            }

            if (statusCode === 403 || statusCode === 401) {
                return resolve({ success: false, statusCode, raw: bodyBuffer.toString('utf8').substring(0, 200), error: `WAF Blocked (${statusCode})` });
            }

            if (responseHeaders['content-encoding'] === 'gzip') {
                try { bodyBuffer = zlib.gunzipSync(bodyBuffer); } catch (e) {}
            }

            const bodyString = bodyBuffer.toString('utf8');
            let finalDataString = bodyString;
            
            if (responseHeaders['transfer-encoding'] === 'chunked') {
                try {
                     const startBracket = bodyString.indexOf('{');
                     const endBracket = bodyString.lastIndexOf('}');
                     if(startBracket !== -1 && endBracket !== -1) {
                         finalDataString = bodyString.substring(startBracket, endBracket + 1);
                     }
                } catch(e){}
            }

            try {
                const parsed = JSON.parse(finalDataString);
                resolve({ success: statusCode === 200, statusCode: statusCode, data: parsed });
            } catch (e) {
                resolve({ success: false, statusCode: statusCode, raw: finalDataString.substring(0, 300), error: "JSON Parse Error" });
            }
        });

        socket.on('error', (err) => reject(err));
        socket.setTimeout(15000);
        socket.on('timeout', () => {
            socket.destroy();
            resolve({ success: false, error: "Socket Timeout" });
        });
    });
}

function buildHeaders(signature, tokenStr) {
    return {
        "accept-encoding": "gzip",
        "version": "580",
        "package-name": "com.storymatrix.drama",
        "p": "63",
        "cid": "DRA1000042",
        "apn": "2",
        "country-code": "ID",
        "mchid": "DRA1000042",
        "tz": "-420",
        "language": "in",
        "mcc": "510",
        "locale": "in_ID",
        "is_root": "0",
        "device-id": session.deviceid,
        "nchid": "DRA1000042",
        "instanceid": session.instanceid,
        "md": "Redmi Note 5",
        "store-source": "store_google",
        "mf": "XIAOMI",
        "device-score": "60",
        "local-time": getLocalTime(),
        "time-zone": "+0700",
        "brand": "Xiaomi",
        "lat": "0",
        "is_emulator": "0",
        "current-language": "in",
        "ov": "10",
        "afid": session.afid,
        "android-id": session.androidid,
        "srn": "1080x2160",
        "ins": session.ins,
        "is_vpn": "1",
        "build": "Build/QQ3A.200805.001",
        "pline": "ANDROID",
        "vn": "5.8.0",
        "over-flow": "new-fly",
        "tn": tokenStr ? `Bearer ${tokenStr}` : "",
        "sn": signature,
        "st": session.st,
        "active-time": Math.floor(Math.random() * 20000).toString(),
        "content-type": "application/json; charset=UTF-8",
        "user-agent": "okhttp/4.12.0"
    };
}

async function postRequest(endpoint, body) {
    // 1. Minta Signature ke Vercel Cloud
    const signData = await getRemoteSignature(body);
    if (!signData) return { success: false, error: "Cloud signature generation failed" };

    // 2. Bangun headers menggunakan signature dari Vercel
    const headers = buildHeaders(signData.sn, session.token);
    const fullEndpoint = endpoint.includes('?') ? `${endpoint}&timestamp=${signData.timestamp}` : `${endpoint}?timestamp=${signData.timestamp}`;

    // 3. Tembak menggunakan Raw TLS Socket Bypass
    try {
        const response = await wRequest(fullEndpoint, body, headers);
        
        if (response.success && response.data && response.data.data) {
            return { success: true, data: response.data.data };
        }
        return { success: false, error: response.error || "Empty Data", raw: response.raw };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// --- CLI ENGINE ---
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(`${c.ylw}?${c.rst} ${q}`, resolve));

async function doSearch() {
    log.header("SEARCH ENGINE");
    const keyword = await ask("Enter Keyword (Title/Genre): ");
    
    console.log(`\n${c.dim}Filters:${c.rst} [1] Trending  [2] Latest  [3] Unwatched`);
    const sortChoice = await ask("Select Sort Type (1-3): ");
    
    let sortType = 1, typeName = "Trending";
    if (sortChoice.trim() === '2') { sortType = 2; typeName = "Latest"; }
    if (sortChoice.trim() === '3') { sortType = 3; typeName = "Unwatched"; }

    const searchSource = (sortType === 2 || sortType === 3) ? "搜索按钮" : "";
    const fromParam = (sortType === 2 || sortType === 3) ? "search_sug" : "search_result";

    let page = 1, keepFetching = true, allResults = [];
    console.log("");

    while (keepFetching) {
        process.stdout.write(`\r${c.blu}[~]${c.rst} Fetching page ${page}... `);
        const body = {
            "searchSource": searchSource, "sortType": sortType, "synSwitch": 1,
            "pageNo": page, "pageSize": 20, "from": fromParam, "keyword": keyword
        };

        const res = await postRequest("https://sapi.dramaboxvideo.com/drama-box/search/search", body);

        if (res.success && res.data && res.data.searchList && res.data.searchList.length > 0) {
            allResults = allResults.concat(res.data.searchList);
            console.log(`${c.grn}OK!${c.rst} (${res.data.searchList.length} items)`);
            
            if (res.data.isMore === 0 || res.data.searchList.length < 20) {
                keepFetching = false;
            } else {
                page++;
                await new Promise(r => setTimeout(r, 800)); 
            }
        } else {
            console.log(`${c.dim}End of results.${c.rst}`);
            keepFetching = false;
        }
    }
    if (allResults.length > 0) {
        log.info(`Total extracted: ${c.bld}${allResults.length} items${c.rst}`);
        saveToFile(`search_${typeName}_${keyword}.json`, allResults);
    }
}

async function doLatest() {
    log.header("LATEST RELEASES");
    let page = 1, keepFetching = true, allResults = [];

    while (keepFetching) {
        process.stdout.write(`\r${c.blu}[~]${c.rst} Fetching page ${page}... `);
        const body = { 
            "newChannelStyle": 1, 
            "isNeedRank": 1, 
            "pageNo": page, 
            "index": 1, 
            "channelId": 43,
            "recSessionId": crypto.randomBytes(32).toString('hex')
        };
        const res = await postRequest("https://sapi.dramaboxvideo.com/drama-box/he001/theater", body);

        if (res.success && res.data.newTheaterList && res.data.newTheaterList.records.length > 0) {
            allResults = allResults.concat(res.data.newTheaterList.records);
            console.log(`${c.grn}OK!${c.rst} (${res.data.newTheaterList.records.length} items)`);
            
            const totalPages = res.data.newTheaterList.pages || 1;
            if (page >= totalPages) keepFetching = false;
            else {
                page++;
                await new Promise(r => setTimeout(r, 800));
            }
        } else {
            console.log(`${c.dim}End of data.${c.rst}`);
            keepFetching = false;
        }
    }
    if (allResults.length > 0) {
        log.info(`Total extracted: ${c.bld}${allResults.length} items${c.rst}`);
        saveToFile("latest_full_release.json", allResults);
    }
}

async function doGetForYou() {
    log.header("FOR YOU (FYP)");
    log.step("Fetching algorithmic recommendations... ");
    const body = { 
        "homePageStyle": 0, 
        "isNeedRank": 1, 
        "isNeedNewChannel": 1, 
        "type": 0,
        "index": 0,
        "channelId": 175,
        "recSessionId": crypto.randomBytes(32).toString('hex')
    };
    const res = await postRequest("https://sapi.dramaboxvideo.com/drama-box/he001/theater", body);

    if (res.success && res.data.columnVoList) {
        console.log(`${c.grn}SUCCESS${c.rst}`);
        let allBooks = [];
        res.data.columnVoList.forEach(col => {
            if (col.bookList && col.bookList.length > 0) allBooks = allBooks.concat(col.bookList);
        });
        log.info(`Total extracted: ${c.bld}${allBooks.length} items${c.rst}`);
        saveToFile("foryou_recommended.json", allBooks);
    } else {
        console.log(`${c.red}FAILED/EMPTY${c.rst}`);
    }
}

async function doGetComingSoon() {
    log.header("COMING SOON");
    log.step("Fetching upcoming catalog... ");
    const res = await postRequest("https://sapi.dramaboxvideo.com/drama-box/he001/reserveBook", {});

    if (res.success && res.data.reserveBookList && res.data.reserveBookList.length > 0) {
        const books = res.data.reserveBookList;
        console.log(`${c.grn}SUCCESS${c.rst}`);
        
        books.forEach(book => {
            book.releaseDateLocal = book.bookShelfTime ? new Date(book.bookShelfTime).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : "TBA";
        });
        log.info(`Total extracted: ${c.bld}${books.length} items${c.rst}`);
        saveToFile("coming_soon.json", books);
    } else {
        console.log(`${c.red}FAILED/EMPTY${c.rst}`);
    }
}

async function doGetRank() {
    log.header("LEADERBOARDS");
    console.log(`${c.dim}Categories:${c.rst} [1] Trending  [2] Popular Search  [3] Newest`);
    const choice = await ask("Select Category (1-3): ");
    const rankType = ['1', '2', '3'].includes(choice.trim()) ? parseInt(choice.trim()) : 1;

    log.step(`Fetching Rank Type [${rankType}]... `);
    const res = await postRequest("https://sapi.dramaboxvideo.com/drama-box/he001/rank", { "rankType": rankType });

    if (res.success && res.data.rankList && res.data.rankList.length > 0) {
        console.log(`${c.grn}SUCCESS${c.rst}`);
        const categoryName = res.data.rankTypeVoList?.find(r => r.rankType === rankType)?.rankName || `Rank_${rankType}`;
        log.info(`Total extracted: ${c.bld}${res.data.rankList.length} items${c.rst}`);
        saveToFile(`rank_${categoryName}.json`, res.data.rankList);
    } else {
        console.log(`${c.red}FAILED/EMPTY${c.rst}`);
    }
}

async function doGetVip() {
    log.header("VIP EXCLUSIVES");
    log.step("Fetching VIP & Weekly Selection... ");
    const body = { "homePageStyle": 0, "isNeedRank": 1, "index": 4, "type": 0, "channelId": 205 };
    const res = await postRequest("https://sapi.dramaboxvideo.com/drama-box/he001/theater", body);

    if (res.success && res.data.columnVoList && res.data.columnVoList.length > 0) {
        console.log(`${c.grn}SUCCESS${c.rst}`);
        let allBooks = [];
        res.data.columnVoList.forEach(col => {
            if (col.bookList && col.bookList.length > 0) allBooks = allBooks.concat(col.bookList);
        });
        log.info(`Total extracted: ${c.bld}${allBooks.length} items across categories${c.rst}`);
        saveToFile("vip_exclusive.json", allBooks);
    } else {
        console.log(`${c.red}FAILED/EMPTY${c.rst}`);
    }
}

async function doGetClassify() {
    log.header("CLASSIFY EXPLORER");
    let page = 1, keepFetching = true, allResults = [];

    while (keepFetching) {
        process.stdout.write(`\r${c.blu}[~]${c.rst} Fetching page ${page}... `);
        const body = { "typeList": [], "showLabels": true, "pageNo": page, "pageSize": 15 };
        const res = await postRequest("https://sapi.dramaboxvideo.com/drama-box/he001/classify", body);

        if (res.success && res.data.classifyBookList && res.data.classifyBookList.records.length > 0) {
            allResults = allResults.concat(res.data.classifyBookList.records);
            console.log(`${c.grn}OK!${c.rst} (${res.data.classifyBookList.records.length} items)`);
            
            if (res.data.classifyBookList.isMore === 0 || res.data.classifyBookList.records.length < 15) {
                keepFetching = false;
            } else {
                page++;
                await new Promise(r => setTimeout(r, 800));
            }
        } else {
            console.log(`${c.dim}End of list.${c.rst}`);
            keepFetching = false;
        }
    }
    if (allResults.length > 0) {
        log.info(`Total extracted: ${c.bld}${allResults.length} items${c.rst}`);
        saveToFile("classify_full.json", allResults);
    }
}

async function doGetEpisodes() {
    log.header("RAW EPISODE FETCHER");
    const bookId = await ask("Target Book ID (e.g. 42000009439): ");
    log.info(`Target locked. Initiating metadata extraction...`);
    console.log(""); 

    let allEpisodesRaw = [];
    let currentIndex = -1; 
    let keepGoing = true;
    let batchCount = 1;

    while (keepGoing) {
        process.stdout.write(`\r${c.blu}[~]${c.rst} Streaming batch ${c.bld}#${batchCount}${c.rst} (Cursor: ${currentIndex})... `);
        const body = {
            "boundaryIndex": 0, "index": parseInt(currentIndex), "currencyPlaySource": "discover_175_rec",
            "needEndRecommend": 0, "currencyPlaySourceName": "首页发现_Untukmu_推荐列表", "preLoad": false,
            "rid": "", "pullCid": "", "enterReaderChapterIndex": 0,
            "loadDirection": currentIndex === -1 ? 0 : 2, 
            "startUpKey": crypto.randomUUID(),
            "bookId": String(bookId)
        };

        const res = await postRequest("https://sapi.dramaboxvideo.com/drama-box/chapterv2/batch/load", body);

        if (res.success && res.data.chapterList && res.data.chapterList.length > 0) {
            const chapters = res.data.chapterList;
            const newChapters = chapters.filter(newEps => !allEpisodesRaw.some(existEps => existEps.chapterId === newEps.chapterId));

            if (newChapters.length === 0) {
                console.log(`\n${c.ylw}[!] Anti-Loop mechanism triggered. Stopping.${c.rst}`);
                break;
            }

            allEpisodesRaw = allEpisodesRaw.concat(newChapters);
            currentIndex = parseInt(newChapters[newChapters.length - 1].chapterIndex);
            batchCount++;

            if (chapters.length < 5) keepGoing = false;
            await new Promise(r => setTimeout(r, 600)); 
        } else {
            console.log(`${c.red}FAILED/EMPTY${c.rst}`);
            keepGoing = false;
        }
    }
    
    allEpisodesRaw.sort((a, b) => a.chapterIndex - b.chapterIndex);
    console.log(`\n\n${c.grn}Extraction Complete!${c.rst}`);
    log.info(`Successfully parsed ${c.bld}${allEpisodesRaw.length}${c.rst} raw episodes.`);
    saveToFile(`raw_episodes_${bookId}.json`, allEpisodesRaw);
}

async function doDecryptUrl() {
    log.header("ALIYUN PROXY DECRYPTOR");
    const rawUrl = await ask("Input Target URL (.encrypt.mp4): ");
    
    if (!rawUrl || rawUrl.trim() === "") {
        log.err("URL cannot be empty.");
        return;
    }

    const decryptedUrl = `https://nb-dramabox-gentoken.vercel.app/decrypt-video?url=${encodeURIComponent(rawUrl.trim())}`;
    
    log.ok("Decryption Route Generated:");
    console.log(`\n${c.cyn}${c.bld}${decryptedUrl}${c.rst}\n`);
    log.info("Copy this URL to VLC/IDM/Browser to play.");
}

async function main() {
    printBanner();

    const isConnected = await generateToken();
    if (!isConnected) {
        log.err("FATAL: Failed to obtain Session via Vercel. Check network or API URL.");
        process.exit(1);
    }

    while (true) {
        console.log(`\n${c.wht}${c.bld}--- [ MAIN DASHBOARD ] ---${c.rst}`);
        console.log(`  ${c.cyn}[ 01 ]${c.rst} Search Drama (Deep Scan)`);
        console.log(`  ${c.cyn}[ 02 ]${c.rst} Fetch Latest Releases`);
        console.log(`  ${c.cyn}[ 03 ]${c.rst} Fetch For You (FYP)`);
        console.log(`  ${c.cyn}[ 04 ]${c.rst} Fetch Coming Soon`);
        console.log(`  ${c.cyn}[ 05 ]${c.rst} Fetch Leaderboards`);
        console.log(`  ${c.cyn}[ 06 ]${c.rst} Fetch VIP Exclusives`);
        console.log(`  ${c.cyn}[ 07 ]${c.rst} Classify Category Explorer`);
        console.log(`  ${c.mag}[ 08 ]${c.rst} ${c.bld}Extract Raw Episodes${c.rst}`);
        console.log(`  ${c.ylw}[ 09 ]${c.rst} Bypass & Decrypt URL`);
        console.log(`  ${c.red}[ 00 ]${c.rst} Exit Termux\n`);

        const c_input = await ask("Execute module: ");
        switch (c_input.trim()) {
            case "1": case "01": await doSearch(); break;
            case "2": case "02": await doLatest(); break;
            case "3": case "03": await doGetForYou(); break;
            case "4": case "04": await doGetComingSoon(); break;
            case "5": case "05": await doGetRank(); break;
            case "6": case "06": await doGetVip(); break;
            case "7": case "07": await doGetClassify(); break;
            case "8": case "08": await doGetEpisodes(); break;
            case "9": case "09": await doDecryptUrl(); break;
            case "0": case "00": 
                log.info("Shutting down core engine... Goodbye!"); 
                process.exit(0);
            default: 
                log.warn("Invalid module sequence. Select 00 - 09.");
        }
    }
}

main();