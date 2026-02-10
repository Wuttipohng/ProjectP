const https = require('https');
const fs = require('fs');
const path = require('path');

// Source: Google Fonts GitHub (Noto Sans Thai regular ttf) - use raw.githubusercontent.com to avoid redirects
const URL = 'https://raw.githubusercontent.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansThai/NotoSansThai-Regular.ttf';
const outDir = path.join(__dirname, '..', 'public', 'fonts');
const outFile = path.join(outDir, 'NotoSansThai-Regular.ttf');

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, (res) => {
      // follow redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(download(res.headers.location, dest));
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    });
    req.on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

(async () => {
  try {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    console.log('Downloading NotoSansThai-Regular.ttf to', outFile);
    await download(URL, outFile);
    console.log('Download complete.');
  } catch (e) {
    console.error('Failed to download font:', e);
    process.exit(1);
  }
})();
