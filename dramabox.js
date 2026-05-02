/**
 * Dramabox Scraper CLI Engine
 * Ultimate Developer Edition
 * Features: Cloud Crypto Signature, Akamai WAF Bypass (TLS Socket), SOCKS5 Auto-Rotation
 * Author: Gienetic
 */

import readline from "readline";
import fs from "fs";
import tls from "tls";
import crypto from "crypto";
import zlib from "zlib";
import axios from "axios";
import { SocksClient } from "socks";

// ============================================================================
// 1. SYSTEM CONFIGURATION
// ============================================================================
const CONFIG = {
    API_BASE: "https://nb-dramabox-gentoken.vercel.app",
    // Kamu harus memasukkan URL API SOCKS5 Pool di sini
    PROXY_API_URL: "https://exsalapi.my.id/api/network/socks5-pool?apikey=YOUR_API_KEY_HERE",
    TIMEOUT_MS: 15000,
    MAX_RETRIES: 5
};

let currentProxy = null;
const session = {
    token: "",
    deviceid: "",
    androidid: "",
    instanceid: crypto.randomBytes(16).toString("hex"),
    afid: `${Date.now()}-${Math.floor(Math.random() * 9999999999999999)}`,
    ins: Date.now().toString(),
    st: "cK4n10B_0tTQBrxFyyBWnOKD",
    cookies: []
};

// ============================================================================
// 2. UI & TERMINAL LOGGING UTILS
// ============================================================================
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

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(`${c.ylw}?${c.rst} ${q}`, resolve));

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
    console.log(`\n${c.dim}:: Core Engine V5.9.0 | SOCKS5 Auto-Rotation | Coded by Gienetic ::${c.rst}\n`);
}

// ============================================================================
// 3. CORE HELPERS
// ============================================================================
function getLocalTime() {
    const now = new Date();
    const offset = 7 * 60 * 60 * 1000; // GMT+7
    const bt = new Date(now.getTime() + offset);
    const pad = (n) => n.toString().padStart(2, "0");
    return `${bt.getUTCFullYear()}-${pad(bt.getUTCMonth() + 1)}-${pad(bt.getUTCDate())} ${pad(bt.getUTCHours())}:${pad(bt.getUTCMinutes())}:${pad(bt.getUTCSeconds())}.${bt.getUTCMilliseconds().toString().padStart(3, "0")} +0700`;
}

function saveToFile(filename, data) {
    try {
        const safeFilename = filename.replace(/[^a-z0-9_.-]/gi, "_").toLowerCase();
        fs.writeFileSync(safeFilename, JSON.stringify(data, null, 4));
        log.ok(`Dump saved: ${c.bld}${safeFilename}${c.rst}`);
    } catch (e) {
        log.err(`Failed to write file ${filename}`);
    }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ============================================================================
// 4. NETWORK & CRYPTO ENGINE
// ============================================================================
async function fetchNewProxy() {
    if (CONFIG.PROXY_API_URL.includes("YOUR_API_KEY")) {
        log.warn("Proxy API Key not set. Proceeding without proxy rotation.");
        return false;
    }

    try {
        const res = await axios.get(CONFIG.PROXY_API_URL, { timeout: 10000 });
        if (res.data?.status && res.data.data?.proxies) {
            const available = res.data.data.proxies.filter(p => p.status === "standby" && p.is_ready);
            
            if (available.length > 0) {
                const randomProxy = available[Math.floor(Math.random() * available.length)];
                const [ip, port] = randomProxy.address.split(":");
                currentProxy = { ip, port: parseInt(port, 10), loc: randomProxy.location };
                console.log(`\n${c.grn}[Proxy Rotated] ${currentProxy.ip}:${currentProxy.port} (${currentProxy.loc})${c.rst}`);
                return true;
            }
        }
        return false;
    } catch (error) {
        log.err(`Proxy Error: ${error.message}`);
        return false;
    }
}

async function generateToken() {
    try {
        log.step("Initializing Session via Vercel... ");
        const res = await axios.get(`${CONFIG.API_BASE}/generate-token`, { timeout: CONFIG.TIMEOUT_MS });
        
        if (res.data?.status && res.data?.data) {
            session.token = res.data.data.sn;
            session.deviceid = res.data.data.device_id;
            session.androidid = res.data.data.android_id;
            session.cookies = [];
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
        const payload = {
            body: bodyPayload, 
            device_id: session.deviceid,
            android_id: session.androidid, 
            token: session.token
        };
        const res = await axios.post(`${CONFIG.API_BASE}/sign`, payload, { timeout: CONFIG.TIMEOUT_MS });
        return res.data?.status ? res.data.data : null;
    } catch (error) {
        return null;
    }
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

function wRequest(urlStr, bodyObj, headersInput) {
    return new Promise(async (resolve) => {
        const urlObj = new URL(urlStr);
        const bodyStr = JSON.stringify(bodyObj);
        
        if (session.cookies.length > 0) headersInput["Cookie"] = session.cookies.join("; ");

        let requestRaw = `POST ${urlObj.pathname}${urlObj.search} HTTP/1.1\r\nHost: ${urlObj.hostname}\r\n`;
        for (const [k, v] of Object.entries(headersInput)) {
            if (!["host", "content-length", "cookie"].includes(k.toLowerCase())) requestRaw += `${k}: ${v}\r\n`;
        }
        if (headersInput["Cookie"]) requestRaw += `Cookie: ${headersInput["Cookie"]}\r\n`;
        requestRaw += `Content-Length: ${Buffer.byteLength(bodyStr)}\r\nConnection: close\r\n\r\n${bodyStr}`;

        const tlsOptions = {
            host: urlObj.hostname,
            servername: urlObj.hostname,
            rejectUnauthorized: false,
            ciphers: "TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256",
            ALPNProtocols: ["http/1.1"]
        };

        let socket;
        try {
            if (currentProxy?.ip && currentProxy?.port) {
                const proxyInfo = await SocksClient.createConnection({
                    proxy: { ipaddress: currentProxy.ip, port: currentProxy.port, type: 5 },
                    command: "connect",
                    destination: { host: urlObj.hostname, port: 443 }
                });
                tlsOptions.socket = proxyInfo.socket;
            } else {
                tlsOptions.port = 443;
            }
            socket = tls.connect(tlsOptions, () => socket.write(requestRaw));
        } catch (err) {
            return resolve({ success: false, error: `Socket/Proxy Error: ${err.message}` });
        }

        let rawResponse = Buffer.alloc(0);
        socket.on("data", (c) => rawResponse = Buffer.concat([rawResponse, c]));
        socket.on("end", () => {
            const resStr = rawResponse.toString("binary");
            const splitIdx = resStr.indexOf("\r\n\r\n");
            if (splitIdx === -1) return resolve({ success: false, error: "Invalid HTTP Format" });

            const headerPart = resStr.substring(0, splitIdx);
            let bodyBuffer = rawResponse.subarray(splitIdx + 4);
            const statusCode = parseInt(headerPart.split("\r\n")[0].split(" ")[1], 10);

            const headers = {};
            headerPart.split("\r\n").slice(1).forEach(line => {
                const parts = line.split(":");
                if (parts.length > 1) {
                    const key = parts[0].trim().toLowerCase();
                    const val = parts.slice(1).join(":").trim();
                    headers[key] = key === "set-cookie" ? [...(headers[key] || []), val] : val;
                }
            });

            if (headers["st"]) session.st = headers["st"];
            if (headers["set-cookie"]) {
                headers["set-cookie"].forEach(cStr => {
                    const mainCookie = cStr.split(";")[0];
                    session.cookies = session.cookies.filter(c => !c.startsWith(mainCookie.split("=")[0] + "="));
                    session.cookies.push(mainCookie);
                });
            }

            if (statusCode >= 400) return resolve({ success: false, statusCode, error: `WAF Blocked (${statusCode})` });

            if (headers["content-encoding"] === "gzip") {
                try { bodyBuffer = zlib.gunzipSync(bodyBuffer); } catch (e) {}
            }

            let finalDataStr = bodyBuffer.toString("utf8");
            if (headers["transfer-encoding"] === "chunked") {
                const start = finalDataStr.indexOf("{"), end = finalDataStr.lastIndexOf("}");
                if (start !== -1 && end !== -1) finalDataStr = finalDataStr.substring(start, end + 1);
            }

            try {
                resolve({ success: true, statusCode, data: JSON.parse(finalDataStr) });
            } catch (e) {
                resolve({ success: false, statusCode, error: "JSON Parse Error" });
            }
        });

        socket.on("error", (err) => resolve({ success: false, error: err.message }));
        socket.setTimeout(CONFIG.TIMEOUT_MS);
        socket.on("timeout", () => { socket.destroy(); resolve({ success: false, error: "Timeout" }); });
    });
}

async function postData(endpoint, body) {
    const signData = await getRemoteSignature(body);
    if (!signData) return { success: false, error: "Cloud signature generation failed" };

    const headers = buildHeaders(signData.sn, session.token);
    const qs = endpoint.includes("?") ? "&" : "?";
    const fullEndpoint = `${endpoint}${qs}timestamp=${signData.timestamp}`;

    const res = await wRequest(fullEndpoint, body, headers);
    return res.success && res.data?.data ? { success: true, data: res.data.data } : { success: false, error: res.error || "Empty Data" };
}

// ============================================================================
// 5. SCRAPING MODULES
// ============================================================================
async function doSearch() {
    log.header("SEARCH ENGINE");
    const keyword = await ask("Enter Keyword (Title/Genre): ");
    console.log(`\n${c.dim}Filters:${c.rst} [1] Trending  [2] Latest  [3] Unwatched`);
    const sortChoice = await ask("Select Sort Type (1-3): ");
    
    const sortType = parseInt(sortChoice) || 1;
    const typeName = ["", "Trending", "Latest", "Unwatched"][sortType];
    const searchSource = sortType >= 2 ? "搜索按钮" : "";
    const fromParam = sortType >= 2 ? "search_sug" : "search_result";

    let page = 1, allResults = [];
    console.log("");

    while (true) {
        process.stdout.write(`\r${c.blu}[~]${c.rst} Fetching page ${page}... `);
        const body = { searchSource, sortType, synSwitch: 1, pageNo: page, pageSize: 20, from: fromParam, keyword };
        const res = await postData("https://sapi.dramaboxvideo.com/drama-box/search/search", body);

        if (res.success && res.data?.searchList?.length > 0) {
            allResults.push(...res.data.searchList);
            console.log(`${c.grn}OK!${c.rst} (${res.data.searchList.length} items)`);
            if (res.data.isMore === 0 || res.data.searchList.length < 20) break;
            page++;
            await sleep(800);
        } else {
            console.log(`${c.dim}End of results.${c.rst}`);
            break;
        }
    }
    if (allResults.length) saveToFile(`search_${typeName}_${keyword}.json`, allResults);
}

async function doLatest() {
    log.header("LATEST RELEASES");
    let page = 1, allResults = [];
    while (true) {
        process.stdout.write(`\r${c.blu}[~]${c.rst} Fetching page ${page}... `);
        const body = { newChannelStyle: 1, isNeedRank: 1, pageNo: page, index: 1, channelId: 43, recSessionId: crypto.randomBytes(32).toString("hex") };
        const res = await postData("https://sapi.dramaboxvideo.com/drama-box/he001/theater", body);

        if (res.success && res.data?.newTheaterList?.records?.length > 0) {
            allResults.push(...res.data.newTheaterList.records);
            console.log(`${c.grn}OK!${c.rst}`);
            if (page >= (res.data.newTheaterList.pages || 1)) break;
            page++;
            await sleep(800);
        } else break;
    }
    if (allResults.length) saveToFile("latest_full_release.json", allResults);
}

async function doGetForYou() {
    log.header("FOR YOU (FYP)");
    log.step("Fetching algorithmic recommendations... ");
    const body = { homePageStyle: 0, isNeedRank: 1, isNeedNewChannel: 1, type: 0, index: 0, channelId: 175, recSessionId: crypto.randomBytes(32).toString("hex") };
    const res = await postData("https://sapi.dramaboxvideo.com/drama-box/he001/theater", body);

    if (res.success && res.data?.columnVoList) {
        console.log(`${c.grn}SUCCESS${c.rst}`);
        const books = res.data.columnVoList.flatMap(col => col.bookList || []);
        saveToFile("foryou_recommended.json", books);
    } else console.log(`${c.red}FAILED/EMPTY${c.rst}`);
}

async function doGetComingSoon() {
    log.header("COMING SOON");
    log.step("Fetching upcoming catalog... ");
    const res = await postData("https://sapi.dramaboxvideo.com/drama-box/he001/reserveBook", {});

    if (res.success && res.data?.reserveBookList?.length > 0) {
        console.log(`${c.grn}SUCCESS${c.rst}`);
        const books = res.data.reserveBookList.map(b => ({
            ...b, releaseDateLocal: b.bookShelfTime ? new Date(b.bookShelfTime).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "TBA"
        }));
        saveToFile("coming_soon.json", books);
    } else console.log(`${c.red}FAILED/EMPTY${c.rst}`);
}

async function doGetRank() {
    log.header("LEADERBOARDS");
    console.log(`${c.dim}Categories:${c.rst} [1] Trending  [2] Popular Search  [3] Newest`);
    const type = parseInt(await ask("Select Category (1-3): ")) || 1;
    log.step(`Fetching Rank Type [${type}]... `);
    
    const res = await postData("https://sapi.dramaboxvideo.com/drama-box/he001/rank", { rankType: type });
    if (res.success && res.data?.rankList?.length > 0) {
        console.log(`${c.grn}SUCCESS${c.rst}`);
        saveToFile(`rank_category_${type}.json`, res.data.rankList);
    } else console.log(`${c.red}FAILED/EMPTY${c.rst}`);
}

async function doGetVip() {
    log.header("VIP EXCLUSIVES");
    log.step("Fetching VIP & Weekly Selection... ");
    const res = await postData("https://sapi.dramaboxvideo.com/drama-box/he001/theater", { homePageStyle: 0, isNeedRank: 1, index: 4, type: 0, channelId: 205 });

    if (res.success && res.data?.columnVoList) {
        console.log(`${c.grn}SUCCESS${c.rst}`);
        const books = res.data.columnVoList.flatMap(col => col.bookList || []);
        saveToFile("vip_exclusive.json", books);
    } else console.log(`${c.red}FAILED/EMPTY${c.rst}`);
}

async function doGetClassify() {
    log.header("CLASSIFY EXPLORER");
    let page = 1, allResults = [];
    while (true) {
        process.stdout.write(`\r${c.blu}[~]${c.rst} Fetching page ${page}... `);
        const res = await postData("https://sapi.dramaboxvideo.com/drama-box/he001/classify", { typeList: [], showLabels: true, pageNo: page, pageSize: 15 });

        if (res.success && res.data?.classifyBookList?.records?.length > 0) {
            allResults.push(...res.data.classifyBookList.records);
            console.log(`${c.grn}OK!${c.rst}`);
            if (res.data.classifyBookList.isMore === 0) break;
            page++;
            await sleep(800);
        } else break;
    }
    if (allResults.length) saveToFile("classify_full.json", allResults);
}

async function doGetEpisodes() {
    log.header("RAW EPISODE FETCHER (SHADOWBAN BYPASS)");
    const bookId = await ask("Target Book ID (e.g. 42000009439): ");
    
    if ((await ask("Use Auto Proxy Rotation for this task? (y/n): ")).toLowerCase() === "y") {
        log.step("Fetching initial proxy... ");
        await fetchNewProxy();
    } else currentProxy = null;

    let allEpisodesRaw = [], currentIndex = -1, batchCount = 1, consecutiveSkips = 0;
    console.log("\nInitiating smart extraction...\n");

    while (true) {
        process.stdout.write(`\r${c.blu}[~]${c.rst} Fetching batch ${c.bld}#${batchCount}${c.rst} (Cursor: ${currentIndex})... `);
        const body = {
            boundaryIndex: 0, index: parseInt(currentIndex), currencyPlaySource: "discover_175_rec",
            needEndRecommend: 0, currencyPlaySourceName: "首页发现_Untukmu_推荐列表", preLoad: false,
            rid: "", pullCid: "", enterReaderChapterIndex: 0,
            loadDirection: currentIndex === -1 ? 0 : 2, startUpKey: crypto.randomUUID(), bookId: String(bookId)
        };

        const res = await postData("https://sapi.dramaboxvideo.com/drama-box/chapterv2/batch/load", body);
        const isKosong = res.success && (!res.data?.chapterList?.length);
        const isProxyErr = !res.success && res.error?.includes("Proxy");

        if (!res.success || isKosong) {
            consecutiveSkips++;
            console.log(`\n${c.ylw}[!] Blocked/Empty on index ${currentIndex}. Attempt ${consecutiveSkips}/${CONFIG.MAX_RETRIES}...${c.rst}`);
            
            if (consecutiveSkips >= CONFIG.MAX_RETRIES) {
                console.log(`${c.red}[-] Max retries reached. Safely exiting.${c.rst}`);
                break;
            }
            if (consecutiveSkips === 2 || consecutiveSkips === 4) {
                log.step("Rotating Session Token... ");
                await generateToken();
            }
            if (currentProxy && (consecutiveSkips === 3 || isProxyErr)) {
                log.step("Rotating Proxy IP... ");
                await fetchNewProxy();
            }

            if (currentIndex !== -1 && !isProxyErr) currentIndex += 5;
            await sleep(2000 + Math.random() * 2000);
            continue;
        }

        consecutiveSkips = 0;
        const newChapters = res.data.chapterList.filter(n => !allEpisodesRaw.some(e => e.chapterId === n.chapterId));
        
        if (!newChapters.length) {
            currentIndex += 5;
            consecutiveSkips++;
        } else {
            allEpisodesRaw.push(...newChapters);
            currentIndex = parseInt(newChapters[newChapters.length - 1].chapterIndex);
            console.log(`${c.grn}OK!${c.rst} Total: ${allEpisodesRaw.length}`);
        }
        batchCount++;
        await sleep(1000 + Math.random() * 800);
    }
    
    currentProxy = null; // Reset
    if (allEpisodesRaw.length) {
        allEpisodesRaw.sort((a, b) => a.chapterIndex - b.chapterIndex);
        log.info(`Extraction complete. Parsed ${c.bld}${allEpisodesRaw.length}${c.rst} episodes.`);
        saveToFile(`raw_episodes_${bookId}.json`, allEpisodesRaw);
    }
}

async function doDecryptUrl() {
    log.header("ALIYUN PROXY DECRYPTOR");
    const rawUrl = await ask("Input Target URL (.encrypt.mp4): ");
    if (!rawUrl.trim()) return log.err("URL cannot be empty.");

    const decryptedUrl = `${CONFIG.API_BASE}/api/tools/dramabox/decrypt-video?url=${encodeURIComponent(rawUrl.trim())}`;
    log.ok("Decryption Route Generated:");
    console.log(`\n${c.cyn}${c.bld}${decryptedUrl}${c.rst}\n`);
    log.info("Copy this URL to VLC/IDM/Browser to play/download.");
}

// ============================================================================
// 6. MAIN EXECUTION
// ============================================================================
async function main() {
    printBanner();
    if (!(await generateToken())) return process.exit(1);

    while (true) {
        console.log(`\n${c.wht}${c.bld}--- [ MAIN DASHBOARD ] ---${c.rst}`);
        const menus = [
            "Search Drama (Deep Scan)", "Fetch Latest Releases", "Fetch For You (FYP)",
            "Fetch Coming Soon", "Fetch Leaderboards", "Fetch VIP Exclusives",
            "Classify Category Explorer", `${c.bld}Extract Raw Episodes (SOCKS5 Auto-Rotate)${c.rst}`,
            "Bypass & Decrypt URL (Vercel Node)"
        ];
        
        menus.forEach((m, i) => console.log(`  ${c.cyn}[ 0${i + 1} ]${c.rst} ${m}`));
        console.log(`  ${c.red}[ 00 ]${c.rst} Exit Termux\n`);

        const choice = (await ask("Execute module: ")).trim();
        switch (choice) {
            case "1": case "01": await doSearch(); break;
            case "2": case "02": await doLatest(); break;
            case "3": case "03": await doGetForYou(); break;
            case "4": case "04": await doGetComingSoon(); break;
            case "5": case "05": await doGetRank(); break;
            case "6": case "06": await doGetVip(); break;
            case "7": case "07": await doGetClassify(); break;
            case "8": case "08": await doGetEpisodes(); break;
            case "9": case "09": await doDecryptUrl(); break;
            case "0": case "00": log.info("Shutting down core engine... Goodbye!"); return process.exit(0);
            default: log.warn("Invalid module sequence. Select 00 - 09.");
        }
    }
}

main();