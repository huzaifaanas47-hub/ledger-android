const {chromium}=require('playwright');const fs=require('fs'),path=require('path');const {tile,markOnly,mono}=require('./mark.js');
const A=process.argv[2]||path.resolve(__dirname,'../..'),W=process.argv[3]||path.resolve(A,'assets/web'); // android project root, folder for the website icons
(async()=>{const br=await chromium.launch();const pg=await br.newPage();
async function png(svg,size,out,transparent=true){fs.mkdirSync(path.dirname(out),{recursive:true});await pg.setViewportSize({width:size,height:size});
 await pg.setContent(`<html><body style="margin:0;background:transparent"><div style="width:${size}px;height:${size}px">${svg.replace('width="1024" height="1024"',`width="${size}" height="${size}"`)}</div></body></html>`);
 await pg.screenshot({path:out,omitBackground:transparent,clip:{x:0,y:0,width:size,height:size}})}
// --- web
await png(tile('round'),192,W+'/icon-192.png');await png(tile('round'),512,W+'/icon-512.png');
await png(tile('square',1.0),512,W+'/icon-maskable.png',false);   // full-bleed, mark inside the 80% safe zone
await png(tile('square',1.0),180,W+'/apple-touch-icon.png',false);
await png(tile('round'),64,W+'/favicon.png');
fs.writeFileSync(W+'/logo.svg',tile('round'));
// --- android
const RES=A+'/android/app/src/main/res',OUT=A+'/assets/generated';
await png(tile('round'),1024,OUT+'/icon-1024.png');await png(tile('square',1.0),512,OUT+'/play-store-512.png',false);await png(tile('circle',1.1),512,OUT+'/icon-round-512.png');
fs.writeFileSync(A+'/assets/logo.svg',tile('round'));
for(const [d,px] of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})){
 await png(tile('round'),px,`${RES}/mipmap-${d}/ic_launcher.png`);await png(tile('circle',1.1),px,`${RES}/mipmap-${d}/ic_launcher_round.png`)}
for(const [d,px] of Object.entries({mdpi:108,hdpi:162,xhdpi:216,xxhdpi:324,xxxhdpi:432})){
 await png(markOnly(1.0),px,`${RES}/mipmap-${d}/ic_launcher_foreground.png`);await png(mono(1.0),px,`${RES}/mipmap-${d}/ic_launcher_monochrome.png`)}
// --- splash: green gradient, icon, wordmark
const fb=n=>'data:font/ttf;base64,'+fs.readFileSync(path.resolve(A,'assets/fonts',n)).toString('base64');const FB=fb('Poppins-Bold.ttf'),FM=fb('Poppins-Medium.ttf');
async function splash(w,h,out){await pg.setViewportSize({width:w,height:h});const u=Math.min(w,h),ic=Math.round(u*0.32);
 await pg.setContent(`<html><head><style>@font-face{font-family:P;src:url(${FB});font-weight:700}@font-face{font-family:P;src:url(${FM});font-weight:500}
 body{margin:0;width:${w}px;height:${h}px;background:linear-gradient(160deg,#0b6b4a,#032a1f);display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:P}
 img{width:${ic}px;height:${ic}px;filter:drop-shadow(0 ${u*0.02}px ${u*0.03}px rgba(0,0,0,.35))}h1{margin:${u*0.045}px 0 0;color:#fff;font-weight:700;font-size:${u*0.075}px}p{margin:${u*0.012}px 0 0;color:#a7e8cd;font-weight:500;font-size:${u*0.032}px}</style></head>
 <body><img src="data:image/svg+xml;base64,${Buffer.from(tile('round')).toString('base64')}"><h1>Ledger</h1><p>Your khata, always with you</p></body></html>`);
 await pg.waitForTimeout(250);await pg.screenshot({path:out})}
for(const dir of fs.readdirSync(RES).filter(x=>/^drawable(-(port|land))?(-\w+)?$/.test(x))){const f=`${RES}/${dir}/splash.png`;if(!fs.existsSync(f))continue;
 const b=fs.readFileSync(f);const w=b.readUInt32BE(16),h=b.readUInt32BE(20);await splash(w,h,f)}
await splash(1080,1920,OUT+'/splash-preview.png');
await br.close();console.log('done')})();
