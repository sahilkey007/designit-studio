#!/usr/bin/env node
/* Regenerates the blog cover SVGs in the Designit Design System style (deck cover): black ground, grainy
   blue/violet/magenta wash rising from the bottom edge, Poppins Regular statement at 60% white, sentence-case eyebrow.
   Reads assets/blog/*.svg (the original text), writes assets/blog/ds/*.svg (new path: /assets/ is immutable-cached).
   Poppins 400 is embedded as a data URI because SVGs used as <img> cannot load page fonts.
   Needs puppeteer-core + Chrome to measure line widths so no title overflows the card.
   Usage: node scripts/seo/ds_covers.js */
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const SRC = path.join(ROOT, 'assets/blog'), OUT = path.join(SRC, 'ds');
const puppeteer = require(process.env.PUPPETEER_PATH || 'puppeteer-core');
const font = fs.readFileSync(path.join(ROOT, 'assets/fonts/poppins-latin-400.woff2')).toString('base64');
const KEEP_UPPER = ['UX', 'UI', 'AI', 'CRO', 'ROI', 'B2B', 'SaaS'];
const sentence = s => s.toLowerCase().replace(/^./, c => c.toUpperCase()).replace(/\b(ux|ui|ai|cro|roi|b2b|saas)\b/gi, m => m.toLowerCase() === 'saas' ? 'SaaS' : m.toUpperCase());
const unesc = s => s.replace(/&amp;/g, '&');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await puppeteer.launch({ executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: 'new' });
  const p = await b.newPage();
  await p.setContent('<canvas id=c></canvas>');
  await p.addStyleTag({ content: `@font-face{font-family:P;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:400}` });
  await p.evaluate(() => document.fonts.load('400 68px P'));
  const width = (t, size) => p.evaluate((t, size) => { const c = document.getElementById('c').getContext('2d'); c.font = `400 ${size}px P`; c.letterSpacing = `${-0.05 * size}px`; return c.measureText(t).width; }, t, size);
  let n = 0;
  for (const f of fs.readdirSync(SRC).filter(x => x.endsWith('.svg'))) {
    const s = fs.readFileSync(path.join(SRC, f), 'utf8');
    const t = [...s.matchAll(/<text[^>]*font-size="(\d+)"[^>]*>([^<]*)<\/text>/g)].map(m => ({ size: +m[1], text: unesc(m[2]) }));
    const label = t.find(x => x.size === 13).text, lines = t.filter(x => x.size === 68).map(x => x.text);
    let size = 68;
    for (const l of lines) while (await width(l, size) > 690 && size > 40) size -= 2;
    const lh = Math.round(size * 1.06), y0 = 500 - 168 - lh * (lines.length - 1);
    const titles = lines.map((l, i) => `<text x="56" y="${y0 + lh * i}" font-family="Poppins" font-size="${size}" font-weight="400" letter-spacing="${(-0.05 * size).toFixed(2)}" fill="#fff" fill-opacity="0.6">${esc(l)}</text>`).join('\n  ');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice">
  <defs>
    <style>@font-face{font-family:Poppins;font-weight:400;src:url(data:font/woff2;base64,${font}) format('woff2')}</style>
    <radialGradient id="a" cx="0.26" cy="1.05" r="0.55"><stop offset="0" stop-color="#4185f4" stop-opacity="0.55"/><stop offset="1" stop-color="#4185f4" stop-opacity="0"/></radialGradient>
    <radialGradient id="b" cx="0.55" cy="1.1" r="0.5"><stop offset="0" stop-color="#865fc2" stop-opacity="0.6"/><stop offset="1" stop-color="#865fc2" stop-opacity="0"/></radialGradient>
    <radialGradient id="c" cx="0.84" cy="1.05" r="0.5"><stop offset="0" stop-color="#d75eb2" stop-opacity="0.5"/><stop offset="1" stop-color="#d75eb2" stop-opacity="0"/></radialGradient>
    <filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -0.45"/></filter>
  </defs>
  <rect width="800" height="500" fill="#000"/>
  <rect width="800" height="500" fill="url(#a)"/>
  <rect width="800" height="500" fill="url(#b)"/>
  <rect width="800" height="500" fill="url(#c)"/>
  <rect width="800" height="500" filter="url(#g)" opacity="0.16"/>
  <text x="56" y="84" font-family="Poppins" font-size="15" font-weight="400" letter-spacing="-0.33" fill="#fff" fill-opacity="0.7">${esc(sentence(label))}</text>
  ${titles}
  <line x1="56" y1="446" x2="744" y2="446" stroke="#fff" stroke-opacity="0.2" stroke-width="1"/>
  <text x="56" y="474" font-family="Poppins" font-size="14" font-weight="400" letter-spacing="-0.3" fill="#fff" fill-opacity="0.7">Designit</text>
  <text x="744" y="474" text-anchor="end" font-family="Poppins" font-size="14" font-weight="400" letter-spacing="-0.3" fill="#fff" fill-opacity="0.7">designit.co.in</text>
</svg>
`;
    fs.writeFileSync(path.join(OUT, f), svg); n++;
    if (size !== 68) console.log(f, 'title scaled to', size);
  }
  await b.close(); console.log('wrote', n, 'covers to assets/blog/ds/');
})();
