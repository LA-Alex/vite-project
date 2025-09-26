const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseURL = process.env.KINTONE_BASE_URL;
const username = process.env.KINTONE_USERNAME;
const password = process.env.KINTONE_PASSWORD;

// 要上傳的檔案清單
const files = ['test.js', 'test.css'];

(async () => {
  for (const file of files) {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');

    try {
      const response = await axios.post(`${baseURL}/k/v1/preview/app/customize.json`, {
        app: YOUR_APP_ID, // 替換成你的 App ID
        scope: 'ALL',
        desktop: {
          js: file.endsWith('.js') ? [{ type: 'FILE', file: content }] : [],
          css: file.endsWith('.css') ? [{ type: 'FILE', file: content }] : []
        }
      }, {
        auth: { username, password },
        headers: { 'Content-Type': 'application/json' }
      });

      console.log(`${file} 上傳成功`, response.data);
    } catch (err) {
      console.error(`${file} 上傳失敗`, err.response?.data || err.message);
    }
  }
})();
