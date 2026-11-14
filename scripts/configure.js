// Usage: APP_URL=https://yourdomain.com VERSION_NAME=1.0.0 VERSION_CODE=1 [APP_ID=pk.ledger.app] node scripts/configure.js
// Writes the server URL, app version and app id into the Capacitor config, Gradle file and fallback pages.
const fs = require('fs'), path = require('path');
const url = (process.env.APP_URL || '').replace(/\/+$/, '');
const vn = process.env.VERSION_NAME || '1.0.0', vc = parseInt(process.env.VERSION_CODE || '1', 10);
const id = process.env.APP_ID || '';
if (!/^https:\/\/[^\s/]+/.test(url)) { console.error('APP_URL must be an https:// address, e.g. https://ledger.example.com'); process.exit(1); }
const cfgPath = path.join(__dirname, '../capacitor.config.json');
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
cfg.server.url = url; cfg.server.allowNavigation = [new URL(url).host];
cfg.android.appendUserAgent = `LedgerApp/${vn} (${vc})`;
if (id) cfg.appId = id;
fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
const g = path.join(__dirname, '../android/app/build.gradle');
let b = fs.readFileSync(g, 'utf8');
b = b.replace(/versionCode\s+\d+/, `versionCode ${vc}`).replace(/versionName\s+"[^"]*"/, `versionName "${vn}"`);
if (id) b = b.replace(/applicationId\s+"[^"]*"/, `applicationId "${id}"`).replace(/namespace\s*=?\s*"[^"]*"/, m => m);
fs.writeFileSync(g, b);
for (const f of ['index.html', 'error.html']) {
  const p = path.join(__dirname, '../www', f);
  fs.writeFileSync(p, fs.readFileSync(p, 'utf8').replace(/__APP_URL__|https:\/\/[^'"]+(?='\))/g, url));
}
console.log(`Configured: ${url}  v${vn} (${vc})`);
