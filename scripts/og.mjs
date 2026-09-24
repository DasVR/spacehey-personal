// Renders the 1200×630 share images (Discord, iMessage, X) into static/og/.
// Run: npm run og   (needs Playwright + Chromium; not part of the build.)
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

let playwright;
try {
  playwright = await import('playwright');
} catch {
  const root = execSync('npm root -g').toString().trim();
  playwright = await import(pathToFileURL(`${root}/playwright/index.mjs`).href);
}

const avatar = `data:image/jpeg;base64,${readFileSync('static/photos/avatar.jpg').toString('base64')}`;
const mark = readFileSync('static/brand/mark.svg', 'utf8').replace(/stroke="#[0-9a-f]+"/i, 'stroke="currentColor"');

const cards = {
  casual: {
    bg: '#070707',
    ink: '#ece7dd',
    dim: '#8a847a',
    accent: '#e01b2e',
    mid: '#6e1019',
    dark: '#0b0b0b',
    kicker: 'TAP CARD · P.DASDEV.NET',
    name: 'ARRIQ',
    line: 'websites that don’t come out of a template drawer',
    foot: ['Save contact', 'The crate', 'Roll', 'Top 8'],
  },
  pro: {
    bg: '#f3f0e8',
    ink: '#1b1a17',
    dim: '#6b665c',
    accent: '#c4552f',
    mid: '#8b8579',
    dark: '#1b1a17',
    kicker: 'DASDEV.NET · PRO',
    name: 'Arriq',
    line: 'Web developer & design engineer — open to small-business sites',
    foot: ['Work', 'Stack', 'Save contact'],
  },
};

const html = (c, mode) => `<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Geist:wght@400;600&family=Geist+Mono&display=swap" rel="stylesheet">
<style>
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${c.bg};color:${c.ink};font-family:Geist,system-ui,sans-serif;display:grid;grid-template-columns:470px 1fr;gap:64px;padding:64px;overflow:hidden;position:relative}
body::before{content:'';position:absolute;inset:0;background:radial-gradient(60% 80% at 100% 0%,${c.accent}40,transparent 60%)}
canvas{width:470px;height:502px;border-radius:28px;image-rendering:pixelated;position:relative;box-shadow:0 40px 80px -30px #000a}
.r{display:flex;flex-direction:column;justify-content:space-between;position:relative}
.k{font-family:'Geist Mono',monospace;font-size:22px;letter-spacing:.14em;color:${c.accent};display:flex;align-items:center;gap:14px}
.k svg{width:34px;height:40px;color:${c.accent}}
h1{font-family:${mode === 'casual' ? 'Anton,Impact,sans-serif' : 'Geist,sans-serif'};font-size:${mode === 'casual' ? 150 : 140}px;white-space:nowrap;line-height:.9;font-weight:${mode === 'casual' ? 400 : 600};letter-spacing:${mode === 'casual' ? '0' : '-.04em'}}
p{font-size:36px;line-height:1.25;color:${c.ink};opacity:.85;max-width:560px}
.f{display:flex;flex-wrap:wrap;gap:10px}
.f span{font-size:20px;padding:8px 16px;border-radius:99px;border:1.5px solid ${c.dim}66;color:${c.dim}}
.f span:first-child{background:${c.accent};border-color:${c.accent};color:#fff}
</style></head><body>
<canvas id="c"></canvas>
<div class="r"><div class="k">${mark.replace(/<\?xml[^>]*>/, '')}${c.kicker}</div><div><h1>${c.name}</h1><p style="margin-top:22px">${c.line}</p></div>
<div class="f">${c.foot.map((f) => `<span>${f}</span>`).join('')}</div></div>
<script>
const B=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const pal=[hex('${c.dark}'),hex('${c.mid}'),hex('${c.ink === '#1b1a17' ? '#f3f0e8' : c.ink}')];
const img=new Image();img.onload=()=>{const cv=document.getElementById('c'),w=157,h=167;cv.width=w;cv.height=h;const x=cv.getContext('2d');
const s=Math.max(w/img.width,h/img.height),sw=w/s,sh=h/s;x.drawImage(img,(img.width-sw)/2,(img.height-sh)/2,sw,sh,0,0,w,h);
const d=x.getImageData(0,0,w,h),p=d.data;let lo=1,hi=0;const L=[];for(let i=0;i<w*h;i++){const v=(.2126*p[i*4]+.7152*p[i*4+1]+.0722*p[i*4+2])/255;L.push(v);lo=Math.min(lo,v);hi=Math.max(hi,v)}
for(let y=0;y<h;y++)for(let X=0;X<w;X++){const i=y*w+X,v=Math.max(0,(L[i]-lo)/Math.max(.08,hi-lo))*2,t=(B[(y%8)*8+X%8]+.5)/64,l=Math.min(2,Math.floor(v)+(v%1>t?1:0)),c=pal[l];p[i*4]=c[0];p[i*4+1]=c[1];p[i*4+2]=c[2];p[i*4+3]=255}
x.putImageData(d,0,0);document.body.dataset.ready=1};img.src='${avatar}';
</script></body></html>`;

const browser = await playwright.chromium.launch();
for (const [mode, c] of Object.entries(cards)) {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
  });
  page.on('pageerror', (e) => console.error(mode, e.message));
  await page.setContent(html(c, mode), { waitUntil: 'networkidle' }).catch(() => {});
  await page.waitForSelector('body[data-ready]', { state: 'attached' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `static/og/${mode}.png` });
  console.log(`static/og/${mode}.png`);
  await page.close();
}
await browser.close();
