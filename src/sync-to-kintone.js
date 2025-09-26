import axios from "axios";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseURL = process.env.KINTONE_BASE_URL;
const username = process.env.KINTONE_USERNAME;
const password = process.env.KINTONE_PASSWORD;
const appId = 333;

const files = ["main.js", "App.css"];

const uploadFile = async (filePath) => {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath));

  const res = await axios.post(`${baseURL}/k/v1/file.json`, form, {
    headers: form.getHeaders(),
    auth: { username, password },
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
        headers: { "Content-Type": "application/json" },
        auth: { username, password },
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
        headers: { "Content-Type": "application/json" },
        auth: { username, password },
      }
    );
    console.log("已成功套用變更到 Kintone App");

    const res = await axios.get(`${baseURL}/k/v1/app/customize.json`, {
      params: { app: appId },
      headers: { "Content-Type": "application/json" },
      auth: { username, password },
    });

    const jsList = res.data.desktop.js.map(f => f.file?.name || f.url);
    const cssList = res.data.desktop.css.map(f => f.file?.name || f.url);
    console.log("✅ 部署後 JS 檔案：", jsList);
    console.log("✅ 部署後 CSS 檔案：", cssList);
  } catch (err) {
    console.error("部署失敗", err.response?.data || err.message);
  }
};

deployToKintone();
