import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// 取得目前檔案的目錄（因為 ES Module 沒有 __dirname）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseURL = process.env.KINTONE_BASE_URL;
const username = process.env.KINTONE_USERNAME;
const password = process.env.KINTONE_PASSWORD;

// 要上傳的檔案清單
const files = ["main.js", "App.css"];

for (const file of files) {
  const content = fs.readFileSync(path.join(__dirname, file), "utf8");

  try {
    const response = await axios.post(
      `${baseURL}/k/v1/preview/app/customize.json`,
      {
        app: 333, // ← 請替換成你的 Kintone App ID
        scope: "ALL",
        desktop: {
          js: file.endsWith(".js") ? [{ type: "FILE", file: content }] : [],
          css: file.endsWith(".css") ? [{ type: "FILE", file: content }] : [],
        },
      },
      {
        auth: { username, password },
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log(`${file} 上傳成功`, response.data);
  } catch (err) {
    console.error(`${file} 上傳失敗`, err.response?.data || err.message);
  }
}
