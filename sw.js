/* Service worker ของ Tpad Helicopter Planner
 * ทุกครั้งที่ออกเวอร์ชันใหม่ ต้องแก้ VERSION ให้ตรงกับเลขเวอร์ชันของ index.html (และตั้ง BUILD กลับเป็น b1) ถ้าแก้ไฟล์แอปโดยใช้เลขเดิม ให้เพิ่ม BUILD (ไม่เช่นนั้นเครื่องที่ติดตั้งแล้วจะไม่รู้ว่ามีของใหม่)
 * หลักการ: เก็บไฟล์ของแอปไว้ในเครื่อง เปิดจากเครื่องก่อนเสมอ (ใช้ออฟไลน์ได้)
 * คำขอข้ามโดเมน: แคชเฉพาะ "ภาพแผนที่ (tile)" และข้อมูลความสูง AWS Terrain Tiles (v4.5.0) จากโดเมนที่กำหนดใน isTile() เท่านั้น
 *   (Apps Script, METAR, ADS-B, ฟอนต์, เรดาร์ฝน ห้ามแคช ปล่อยให้เบราว์เซอร์จัดการเอง)
 * แคชแผนที่แยกจากแคชของแอป (ชื่อไม่ขึ้นต้นด้วย tpad-) เพื่อไม่ถูกลบเมื่ออัปเดตเวอร์ชัน
 * เวอร์ชันใหม่จะรอ (ไม่สลับเอง) จนกว่าผู้ใช้กด "อัปเดตตอนนี้" ในแอป
 */
const VERSION = '4.7.9';
// BUILD: เพิ่มทุกครั้งที่แก้ไฟล์แอปโดยไม่เปลี่ยนเลขเวอร์ชัน (เช่น b2, b3) ไม่เช่นนั้นเครื่องที่ติดตั้งแล้วจะไม่เห็นการอัปเดต
const BUILD = 'b8';
const CACHE = 'tpad-' + VERSION + '-' + BUILD;
const TC_AUTO = 'tiles-auto', TC_AREA = 'tiles-area', TC_CFG = 'tiles-cfg';
const CORE = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => Promise.all(CORE.map((u) =>
    fetch(new Request(u, { cache: 'reload' })).then((r) => {
      if (!r.ok) throw new Error('precache ' + u + ' ' + r.status);
      return c.put(u, r);
    })
  ))));
  // ไม่เรียก skipWaiting เอง: รอให้ผู้ใช้เลือกอัปเดต
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(
    ks.filter((k) => k.startsWith('tpad-') && k !== CACHE).map((k) => caches.delete(k))
  )));
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
  else if (e.data && e.data.t === 'tilecfg') {
    CFG = { auto: !!e.data.auto, capMB: Math.max(1, +e.data.capMB || 200) };
    e.waitUntil(caches.open(TC_CFG).then((c) => c.put('cfg', new Response(JSON.stringify(CFG)))));
  }
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // ภาพแผนที่/ข้อมูลความสูง: ตรวจก่อน เพราะ Tpadterrain อาจอยู่โดเมนเดียวกับแอป (ow3652.github.io) แต่นอกขอบเขตของ service worker
  if (isTile(url)) { e.respondWith(tileFetch(e, url)); return; }
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  const isNav = req.mode === 'navigate';
  const rel = url.pathname.slice(scope.pathname.length);
  // คู่มือ HTML + รูป: เก็บไว้ใช้ออฟไลน์ (ใช้ของเก่าก่อน แล้วอัปเดตเบื้องหลัง) แคช manual-docs ไม่ขึ้นต้นด้วย tpad-
  if (rel === 'docs/manual.html' || rel.indexOf('docs/img/') === 0) { e.respondWith(docFetch(e)); return; }
  const isCore = rel === '' || CORE.includes(rel);
  // การนำทางไปไฟล์อื่น (เช่น docs/manual.pdf) ต้องไม่ถูกแทนด้วย index.html
  if (isNav ? !(rel === '' || rel === 'index.html') : !isCore) return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = (await c.match(rel === '' ? './' : rel, { ignoreSearch: true })) || (isNav ? await c.match('index.html') : null);
      if (hit) return hit;
      try { return await fetch(req); }
      catch (err) { return (await c.match('index.html')) || Response.error(); }
    })
  );
});

/* ---------- แคชภาพแผนที่ (tile) ---------- */
const TILEHOST = /(^|\.)(tile\.opentopomap\.org|tile-cyclosm\.openstreetmap\.fr|tile\.openstreetmap\.org|tile\.openstreetmap\.fr)$/;
function isTile(u) {
  return TILEHOST.test(u.hostname) || (u.hostname === 'server.arcgisonline.com' && u.pathname.indexOf('/MapServer/tile/') > 0) ||
    // v4.5.0: ข้อมูลความสูงภูมิประเทศ AWS Terrain Tiles (TAWS/กราฟความสูง) ผู้ใช้อนุญาตแล้ว
    (u.hostname === 's3.amazonaws.com' && u.pathname.indexOf('/elevation-tiles-prod/') === 0) || u.hostname === 'elevation-tiles-prod.s3.amazonaws.com' ||
    // v4.5.0 b5: ข้อมูลความสูง Copernicus DEM ที่สร้างเอง (รีโป Tpadterrain บน GitHub Pages)
    (u.hostname === 'ow3652.github.io' && u.pathname.indexOf('/Tpadterrain/') === 0) ||
    // v4.7.7 b15: แผ่นภาพชาร์ต ENR (รีโป Tpadenr บน GitHub Pages) — เฉพาะ tiles/ (meta.json ไม่แคช)
    (u.hostname === 'ow3652.github.io' && u.pathname.indexOf('/Tpadenr/tiles/') === 0);
}
// คีย์แคช: ตัดโดเมนย่อย a/b/c และพารามิเตอร์ _r ออก (ต้องตรงกับฟังก์ชัน tkey ในหน้าแอป)
function tkey(u) {
  try { const x = new URL(u); x.searchParams.delete('_r'); return 'https://' + x.hostname.replace(/^[abc]\./, '') + x.pathname + x.search; }
  catch (e) { return u; }
}
let CFG = null;
async function cfg() {
  if (CFG) return CFG;
  CFG = { auto: true, capMB: 200 };
  try {
    const r = await (await caches.open(TC_CFG)).match('cfg');
    if (r) CFG = Object.assign(CFG, await r.json());
  } catch (e) {}
  return CFG;
}
async function tput(name, key, resp) {
  const b = await resp.blob();
  const h = new Headers({ 'content-type': resp.headers.get('content-type') || 'image/png', 'x-sz': String(b.size) });
  await (await caches.open(name)).put(key, new Response(b, { headers: h }));
  return b.size;
}
let putN = 0;
async function trim(capMB) {
  const c = await caches.open(TC_AUTO), ks = await c.keys();
  if (ks.length * 30 * 1024 < capMB * 1024 * 1024 * 0.6) return;   // ยังห่างเพดานมาก ไม่ต้องนับ
  let tot = 0; const sz = [];
  for (const k of ks) { const r = await c.match(k); const n = r ? +r.headers.get('x-sz') || 25000 : 0; sz.push(n); tot += n; }
  const cap = capMB * 1024 * 1024;
  if (tot <= cap) return;
  for (let i = 0; i < ks.length && tot > cap * 0.9; i++) { await c.delete(ks[i]); tot -= sz[i]; }   // ลบแผ่นที่เก่าสุดก่อน
}
async function tileFetch(e, url) {
  const key = tkey(url.href), fresh = url.searchParams.has('_r');
  // caches.match ด้วย cacheName ไม่สร้างแคชเปล่าขึ้นมาเอง
  if (!fresh) {
    const h = (await caches.match(key, { cacheName: TC_AREA })) || (await caches.match(key, { cacheName: TC_AUTO }));
    if (h) return h;
  }
  let r;
  try { r = await fetch(url.href, { mode: 'cors', credentials: 'omit' }); }
  catch (err) {
    if (self.navigator && navigator.onLine === false) return Response.error();
    try { return await fetch(e.request); } catch (e2) { return Response.error(); }   // เซิร์ฟเวอร์ไม่ส่ง CORS: ใช้ได้แต่ไม่เก็บ
  }
  if (r.ok) {
    const cp = r.clone();
    e.waitUntil((async () => {
      try {
        const c = await cfg();
        if (await caches.match(key, { cacheName: TC_AREA })) { await tput(TC_AREA, key, cp); return; }
        if (c.auto) { await tput(TC_AUTO, key, cp); if (++putN % 40 === 0) await trim(c.capMB); }
      } catch (err) {}
    })());
  }
  return r;
}

async function docFetch(e) {
  const c = await caches.open('manual-docs'), hit = await c.match(e.request.url);
  const fresh = e.request.cache === 'reload' || e.request.cache === 'no-cache';   // หน้าแอปขอฉบับล่าสุด (ตอนเก็บล่วงหน้า): เน็ตก่อน
  const net = fetch(e.request.url).then((r) => { if (r && r.ok) c.put(e.request.url, r.clone()); return r; }).catch(() => null);
  // v4.7.7 b14: ออนไลน์ = เน็ตก่อน (รอไม่เกิน 4 วินาที) เพื่อให้เห็นคู่มือฉบับใหม่ทันที · ออฟไลน์/ช้า = ใช้ที่เก็บไว้
  if (fresh || !hit) return (await net) || hit || Response.error();
  const slow = new Promise((ok) => setTimeout(() => ok(null), 4000));
  const r = await Promise.race([net, slow]);
  if (r && r.ok) return r;
  e.waitUntil(net); return hit;
}
