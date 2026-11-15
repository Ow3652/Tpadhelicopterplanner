/* Service worker ของ Tpad Helicopter Planner
 * ทุกครั้งที่ออกเวอร์ชันใหม่ ต้องแก้ VERSION ให้ตรงกับเลขเวอร์ชันของ index.html (และตั้ง BUILD กลับเป็น b1) ถ้าแก้ไฟล์แอปโดยใช้เลขเดิม ให้เพิ่ม BUILD (ไม่เช่นนั้นเครื่องที่ติดตั้งแล้วจะไม่รู้ว่ามีของใหม่)
 * หลักการ: เก็บไฟล์ของแอปไว้ในเครื่อง เปิดจากเครื่องก่อนเสมอ (ใช้ออฟไลน์ได้)
 * ไม่ยุ่งกับคำขอไปโดเมนอื่น (Apps Script, ภาพแผนที่, ฟอนต์) ปล่อยให้เบราว์เซอร์จัดการเอง
 * เวอร์ชันใหม่จะรอ (ไม่สลับเอง) จนกว่าผู้ใช้กด "อัปเดตตอนนี้" ในแอป
 */
const VERSION = '4.3.0';
// BUILD: เพิ่มทุกครั้งที่แก้ไฟล์แอปโดยไม่เปลี่ยนเลขเวอร์ชัน (เช่น b2, b3) ไม่เช่นนั้นเครื่องที่ติดตั้งแล้วจะไม่เห็นการอัปเดต
const BUILD = 'b2';
const CACHE = 'tpad-' + VERSION + '-' + BUILD;
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
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const scope = new URL(self.registration.scope);
  if (!url.pathname.startsWith(scope.pathname)) return;
  const isNav = req.mode === 'navigate';
  const rel = url.pathname.slice(scope.pathname.length);
  const isCore = rel === '' || CORE.includes(rel);
  if (!isNav && !isCore) return;
  e.respondWith(
    caches.open(CACHE).then(async (c) => {
      const hit = (await c.match(rel === '' ? './' : rel, { ignoreSearch: true })) || (isNav ? await c.match('index.html') : null);
      if (hit) return hit;
      try { return await fetch(req); }
      catch (err) { return (await c.match('index.html')) || Response.error(); }
    })
  );
});
