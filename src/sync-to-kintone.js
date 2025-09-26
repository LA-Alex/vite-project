import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseURL = process.env.KINTONE_BASE_URL;
const username = process.env.KINTONE_USERNAME;
const password = process.env.KINTONE_PASSWORD;
const appId = 333; // ← 你的 App ID

const files = ["main.js", "App.css"];

const uploadFile = async (filePath) => {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const res = await axios.post(`${baseURL}/k/v1/file.json`, form, {
    auth: { username, password },
    headers: form.getHeaders(),
  });

  return res.data.fileKey;
};

const deployToKintone = async () => {
  const jsFiles = [];
  const cssFiles = [];

  for (const file of files) {
    const fullPath = path.join(__dirname, file);
    try {
      const fileKey = await uploadFile(fullPath);
      if (file.endsWith(".js")) jsFiles.push({ type: "FILE", file: fileKey });
      if (file.endsWith(".css")) cssFiles.push({ type: "FILE", file: fileKey });
      console.log(`${file} 上傳成功`);
    } catch (err) {
      console.error(`${file} 上傳失敗`, err.response?.data || err.message);
    }
  }

  try {
    await axios.post(
      `${baseURL}/k/v1/preview/app/customize.json`,
      {
        app: appId,
        scope: "ALL",
        desktop: { js: jsFiles, css: cssFiles },
      },
      {
        auth: { username, password },
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("預覽設定成功");

    await axios.post(
      `${baseURL}/k/v1/app/deploy.json`,
      {
        apps: [{ app: appId }],
        revert: false,
      },
      {
        auth: { username, password },
        headers: { "Content-Type": "application/json" },
      }
    );
    console.log("已成功套用變更到 Kintone App");
  } catch (err) {
    console.error("部署失敗", err.response?.data || err.message);
  }
};

deployToKintone();
try {
  const res = await axios.get(`${baseURL}/k/v1/app/customize.json`, {
    params: { app: appId },
    auth: { username, password },
    headers: { "Content-Type": "application/json" },
  });

  const jsFiles = res.data.desktop.js.map((f) => f.file?.name || f.url);
  const cssFiles = res.data.desktop.css.map((f) => f.file?.name || f.url);

  console.log("✅ 部署後 JS 檔案：", jsFiles);
  console.log("✅ 部署後 CSS 檔案：", cssFiles);
} catch (err) {
  console.error(
    "❌ 無法取得 App 的 JS/CSS 設定",
    err.response?.data || err.message
  );
}
