/*
 * Dramabox Scraper Snippet
 * Created by Gienetic
 */

import axios from "axios";
import readline from "readline";
import fs from "fs";

const API_BASE = "https://nb-dramabox-gentoken.vercel.app";

let session = {
    token: "",
    deviceid: "",
    androidid: ""
};

async function generateToken() {
    try {
        console.log("--> Menghubungkan ke API Server...");
        const res = await axios.get(`${API_BASE}/generate-token`);

        if (res.data && res.data.status && res.data.data) {
            const data = res.data.data;
            session.token = data.sn;
            session.deviceid = data.device_id;
            session.androidid = data.android_id;

            console.log("--> Login Berhasil");
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
            return res.data.data.sn;
        }
        return null;
    } catch (error) {
        console.log("--> Gagal minta signature ke API");
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

async function postRequest(endpoint, body) {
    const signature = await getRemoteSignature(body);

    if (!signature) {
        return {
            success: false,
            error: "Gagal mendapatkan Signature dari API"
        };
    }

    const headers = {
        "User-Agent": "okhttp/4.10.0",
        "Accept-Encoding": "gzip",
        "Content-Type": "application/json; charset=UTF-8",
        "tn": `Bearer ${session.token}`,
        "version": "430",
        "vn": "4.3.0",
        "package-name": "com.storymatrix.drama",
        "p": "43",
        "cid": "DRA1000042",
        "apn": "1",
        "device-id": session.deviceid,
        "local-time": getLocalTime(),
        "time-zone": "+0700",
        "userid": "347814021",
        "android-id": session.androidid,
        "sn": signature,
        "language": "in",
        "current-language": "in"
    };

    try {
        const response = await axios.post(endpoint, body, {
            headers,
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

function saveToFile(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 4));
        console.log(`\n[Saved] ${filename}`);
    } catch (e) {
        console.log("[Error] Save file failed");
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function doSearch() {
    console.log(`\n[ Search Raw ]`);
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
    console.log(`\n[ Latest Raw ]`);
    const body = {
        "newChannelStyle": 1,
        "isNeedRank": 1,
        "pageNo": 1,
        "index": 1,
        "channelId": 43
    };
    const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/he001/theater", body);

    if (res.success && res.data.newTheaterList?.records) {
        console.log(JSON.stringify(res.data.newTheaterList.records, null, 2));
        saveToFile("result_latest.json", res.data.newTheaterList.records);
    } else {
        console.log("Empty result.");
    }
}

async function doGetEpisodes() {
    console.log(`\n[ Get Unlimited Episodes ]`);
    const bookId = await ask("Book ID: ");
    console.log(`Starting scraper for ID: ${bookId}...`);

    let allEpisodesRaw = [];
    let currentIndex = 1;
    let keepGoing = true;

    while (keepGoing) {
        process.stdout.write(`\rFetching batch starting at ${currentIndex}... `);
        const body = {
            "boundaryIndex": 0,
            "index": currentIndex,
            "currencyPlaySource": "ssym_ssjg",
            "currencyPlaySourceName": "搜索页面搜索结果",
            "preLoad": false,
            "bookId": bookId
        };

        const res = await postRequest("https://sapi.dramaboxdb.com/drama-box/chapterv2/batch/load", body);

        if (res.success && res.data.chapterList && res.data.chapterList.length > 0) {
            allEpisodesRaw = allEpisodesRaw.concat(res.data.chapterList);
            currentIndex += 5;
            await new Promise(r => setTimeout(r, 200));
        } else {
            console.log("Done.");
            keepGoing = false;
        }
    }
    console.log(`\nTotal Episodes: ${allEpisodesRaw.length}`);
    saveToFile("result_episode.json", allEpisodesRaw);
}

async function main() {
    console.clear();
    console.log("Dramabox Scraper (API Based) by Gienetic");

    if (await generateToken()) {
        while (true) {
            console.log(`\n1. Search Raw\n2. Latest Raw\n3. Get Episodes\n4. Exit`);
            const c = await ask("Select: ");
            switch (c.trim()) {
                case "1":
                    await doSearch();
                    break;
                case "2":
                    await doLatest();
                    break;
                case "3":
                    await doGetEpisodes();
                    break;
                case "4":
                    process.exit(0);
            }
        }
    } else {
        console.log("Gagal inisialisasi API.");
    }
}

main();