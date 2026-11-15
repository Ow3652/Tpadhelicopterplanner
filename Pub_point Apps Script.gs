/**
 * Apps Script ตัวเดียว ใช้กับ Tpad Helicopter Planner (v4.2.3) ทำ 2 หน้าที่:
 *   1) จุดร่วม (Pub_point)  ทุกคนเพิ่ม/ลบ/อ่านได้ ไม่ต้องมีรหัส  -> แท็บ Pubpoint ของชีตที่ผูกกับสคริปต์นี้ (ชีตสาธารณะ)
 *   2) ข้อมูลส่วนตัวรายคน ต้องมีรหัสซิงก์: จุดของฉัน (My_Point), เส้นทางที่บันทึก (My_route),
 *      เส้นทางค้นหา (SAR_route), พื้นที่ค้นหา (SAR_area) -> เก็บในชีตส่วนตัว USER_SHEET_ID แท็บละคน ชื่อ <ประเภท>__<ชื่อผู้ใช้>
 *
 * ผู้ใช้และรหัส (แบบ A: รหัสต่อคน)
 *  - แท็บ Users ในชีตส่วนตัว: Key = รหัสซิงก์ | Name = ชื่อผู้ใช้ (อังกฤษ/ตัวเลข/_ ไม่เกิน 20 ตัว ไม่ซ้ำ) | Active = Y (รับ Y/YES/TRUE/1)
 *    เพิ่ม/ลบ/ปิดผู้ใช้ที่ชีตได้เลย ไม่ต้อง Deploy ใหม่ (มีผลภายใน USERS_CACHE_SEC วินาที)
 *  - รหัสเจ้าของเก็บใน Script Properties ชื่อ OWNER_KEY (จับคู่กับชื่อ OWNER_NAME) ชื่อเจ้าของใช้ในแท็บ Users ไม่ได้
 *  - ตาราง USERS ด้านล่างเป็นทางสำรองในโค้ด ปล่อยเป็นตัวอย่างหลอกได้ (รหัสที่ขึ้นต้นด้วย "เปลี่ยนรหัส"/"ตัวอย่าง" ถูกปฏิเสธเสมอ)
 *  - บันทึกการใช้งานส่วนตัว เก็บเฉพาะเวลา/ผู้ใช้/คำสั่ง ในแท็บ Log ของชีตส่วนตัว ไม่เก็บชื่อจุดหรือพิกัด
 *    (แท็บ Log ของชีตสาธารณะเก็บเฉพาะจุดร่วม ซึ่งเป็นข้อมูลสาธารณะอยู่แล้ว)
 *
 * วิธีติดตั้ง/อัปเดต
 *  1) เปิดชีต Pub_point > ส่วนขยาย > Apps Script > วางโค้ดนี้แทนของเดิม
 *  2) ตั้ง Script Properties (ครั้งเดียว ค่าไม่หายเมื่อวางโค้ดทับ): ไอคอนเฟือง Project Settings > Script Properties > Add script property
 *       USER_SHEET_ID = ID ชีตส่วนตัว "Tpad Users" (ข้อความยาวในลิงก์ชีต ระหว่าง /d/ กับ /edit) ชีตนี้ต้องไม่แชร์ลิงก์
 *       OWNER_KEY     = รหัสซิงก์ของเจ้าของ
 *       MAIN_ID       = ID ชีต AllCoordinateRTP ใช้ชั่วคราวตอนรัน migrateOwnerData() เท่านั้น ลบทิ้งได้หลังย้ายเสร็จ
 *     แล้วกด Save script properties
 *  3) เลือกฟังก์ชัน authorize กด Run หนึ่งครั้ง และกดอนุญาตสิทธิ์
 *  4) (ครั้งเดียว) ย้ายข้อมูลเดิมของเจ้าของ: เลือก migrateOwnerData กด Run ดูผลที่ Execution log ต้องเห็น "ต่างจากต้นฉบับ 0 เซลล์"
 *  5) Deploy > Manage deployments > ดินสอ > Version: New version > Deploy (Execute as: Me | Who has access: Anyone) ลิงก์ /exec เดิมใช้ต่อได้
 *  6) เปิดลิงก์ /exec ตรงๆ ต้องเห็น "ping":8 และ "cfg" เป็น true ทั้งหมด (หรือรัน checkSetup ดู Execution log)
 * ไฟล์นี้ไม่มีรหัสหรือ ID จริง จึงขึ้น GitHub ได้
 */
const PUB_SHEET = 'Pubpoint';
// ค่าลับ/ค่าเฉพาะของคุณ อ่านจาก Script Properties (ไม่ฝังในโค้ด จึงขึ้น GitHub ได้ และวางโค้ดทับตอนอัปเดตแล้วค่าไม่หาย)
//   USER_SHEET_ID = ID ชีตแยกส่วนตัว "Tpad Users" (แท็บ Users + ข้อมูลส่วนตัวของทุกคน) ต้องไม่แชร์ลิงก์
//   OWNER_KEY     = รหัสซิงก์ของเจ้าของ (ผู้ใช้ชื่อ OWNER_NAME)
//   MAIN_ID       = ID ชีตหลัก AllCoordinateRTP ใช้ชั่วคราวตอนรัน migrateOwnerData() เท่านั้น
function cfg_(k) { return String(PropertiesService.getScriptProperties().getProperty(k) || '').trim(); }
const MAIN_ID = cfg_('MAIN_ID');
const OWNER_KEY = cfg_('OWNER_KEY');
const MY_ROUTE = 'My_route';
const SAR_ROUTE = 'SAR_route';
const SAR_AREA = 'SAR_area';
const LOG_NAME = 'Log';
// รหัสซิงก์ -> ชื่อผู้ใช้ สำรองในโค้ด (ปกติปล่อยเป็นตัวอย่างหลอก ใช้ OWNER_KEY และแท็บ Users แทน ห้ามใส่รหัสจริงที่นี่ถ้าจะส่งต่อหรือขึ้น GitHub)
const USERS = {
  'เปลี่ยนรหัสเจ้าของ': 'ow52',
  'เปลี่ยนรหัสผู้ใช้1': 'user1',
  'เปลี่ยนรหัสผู้ใช้2': 'user2'
};
const OWNER_NAME = 'ow52';         // ชื่อผู้ใช้ของเจ้าของ (OWNER_KEY จับคู่กับชื่อนี้) ต้องตรงกับชื่อในตาราง USERS สำรอง
const USER_SHEET_ID = cfg_('USER_SHEET_ID'); // ชีตแยก "Tpad Users" (ต้องไม่แชร์ลิงก์) เก็บแท็บ Users และแท็บข้อมูลของผู้ใช้อื่น
const USERS_TAB = 'Users';        // แท็บรายชื่อผู้ใช้ คอลัมน์: Key | Name | Active(Y/N) | Note
const USERS_CACHE_SEC = 120;       // แคชรายชื่อ (แก้ในชีตแล้วมีผลภายในเวลานี้)
const MAX_USERS = 150;             // จำนวนผู้ใช้สูงสุดที่รองรับ (กันสร้างแท็บเกิน) หนึ่งคนใช้ได้สูงสุด 4 แท็บ
const MAX_USERS_TABS = MAX_USERS * 4;
const TAB_ROWS = 200;              // แท็บผู้ใช้สร้างเล็กๆ (แถวเพิ่มเองเมื่อมีข้อมูล) กันชนเพดาน 10 ล้านเซลล์ของชีต

function validName_(u) { return /^[A-Za-z0-9_]{1,20}$/.test(String(u || '')); }
function badKey_(k) { return !k || k.indexOf('เปลี่ยนรหัส') === 0 || k.indexOf('ตัวอย่าง') === 0; }
// อ่านแท็บ Users เป็นแผนที่ รหัส -> ชื่อ (เฉพาะแถว Active = Y) แคชไว้ชั่วคราว
function sheetUsers_() {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('users_v1');
  if (hit) { try { return JSON.parse(hit); } catch (e) { /* อ่านใหม่ */ } }
  const map = {};
  if (USER_SHEET_ID) {
    try {
      const s = SpreadsheetApp.openById(USER_SHEET_ID).getSheetByName(USERS_TAB);
      const last = s ? s.getLastRow() : 0;
      if (last >= 2) {
        s.getRange(2, 1, last - 1, 3).getDisplayValues().forEach(r => {
          const k = String(r[0]).trim(), n = String(r[1]).trim();
          if (badKey_(k) || !validName_(n) || n === OWNER_NAME) return;
          if (['Y', 'YES', 'TRUE', '1'].indexOf(String(r[2]).trim().toUpperCase()) < 0) return;
          map[k] = n;
        });
      }
    } catch (e) { /* อ่านชีตไม่ได้ ใช้เฉพาะ USERS ในโค้ด */ }
  }
  try { cache.put('users_v1', JSON.stringify(map), USERS_CACHE_SEC); } catch (e) { /* ข้ามการแคช */ }
  return map;
}
function userOf_(key) {
  key = String(key || '');
  if (badKey_(key)) return '';
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  if (OWNER_KEY && key === OWNER_KEY) return OWNER_NAME;
  if (has(USERS, key) && validName_(USERS[key])) return USERS[key];
  const m = sheetUsers_();
  return has(m, key) ? m[key] : '';
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
function fmt_(v, lat) {
  const h = lat ? (v < 0 ? 'S' : 'N') : (v < 0 ? 'W' : 'E');
  v = Math.abs(v);
  let d = Math.floor(v), m = Math.round((v - d) * 60 * 100) / 100;
  if (m >= 60) { d++; m = 0; }
  const ds = String(d); const w = lat ? 2 : 3;
  return '0'.repeat(Math.max(0, w - ds.length)) + ds + '° ' + (m < 10 ? '0' : '') + m.toFixed(2) + "' " + h;
}
function log_(q) {
  const ss = SpreadsheetApp.getActive();
  let l = ss.getSheetByName(LOG_NAME);
  if (!l) { l = ss.insertSheet(LOG_NAME); l.appendRow(['เวลา', 'คำสั่ง', 'ข้อมูล']); }
  const c = Object.assign({}, q); delete c.key; if (c.data) c.data = '(route ' + String(c.data).length + ' ตัวอักษร)';
  l.appendRow([new Date(), (q.t || 'pub') + ':' + q.op, JSON.stringify(c)]);
}
// บันทึกการใช้งานข้อมูลส่วนตัว ลงชีตส่วนตัว (USER_SHEET_ID) เฉพาะเวลา/คำสั่ง/ผู้ใช้ ไม่เก็บชื่อจุดหรือพิกัด
function logPrivate_(user, q) {
  try {
    const ss = SpreadsheetApp.openById(USER_SHEET_ID);
    let l = ss.getSheetByName(LOG_NAME);
    if (!l) {
      l = ss.insertSheet(LOG_NAME);
      if (l.getMaxRows() > 500) l.deleteRows(501, l.getMaxRows() - 500);
      if (l.getMaxColumns() > 3) l.deleteColumns(4, l.getMaxColumns() - 3);
      l.appendRow(['เวลา', 'ผู้ใช้', 'คำสั่ง']);
    }
    l.appendRow([new Date(), user, q.t + ':' + q.op]);
  } catch (e) { /* ไม่ให้การบันทึกทำให้คำสั่งหลักล้มเหลว */ }
}
function findRow_(s, key) {
  const last = s.getLastRow();
  if (last < 2) return -1;
  const names = s.getRange(2, 1, last - 1, 1).getValues().map(r => String(r[0]).trim().toUpperCase());
  const i = names.indexOf(String(key).trim().toUpperCase());
  return i < 0 ? -1 : i + 2;
}
function upsertRow_(s, key, row) {
  const r = findRow_(s, key);
  if (r > 0) s.getRange(r, 1, 1, row.length).setValues([row]); else s.appendRow(row);
}
// กันข้อความที่ขึ้นต้นด้วย = + @ ถูกตีเป็นสูตรในชีต
function safe_(v) { return /^[=+@]/.test(v) ? "'" + v : v; }
function pointRow_(q) {
  const la = Number(q.la), lo = Number(q.lo);
  if (!isFinite(la) || !isFinite(lo) || Math.abs(la) > 90 || Math.abs(lo) > 180) return null;
  return [safe_(String(q.n).trim()), fmt_(la, true), fmt_(lo, false), safe_(String(q.note || ''))];
}
// แท็บของผู้ใช้อื่น: สร้างให้เองครั้งแรก (จำกัดจำนวนแท็บกันสแปม)
function userTab_(ss, name, head) {
  let s = ss.getSheetByName(name);
  if (s) return s;
  const n = ss.getSheets().filter(x => x.getName().indexOf('__') > 0).length;
  if (n >= MAX_USERS_TABS) throw new Error('จำนวนแท็บผู้ใช้เต็ม');
  s = ss.insertSheet(name);
  // ลดขนาดแท็บใหม่ (ปกติ 1000 แถว x 26 คอลัมน์) เพื่อประหยัดเซลล์
  if (s.getMaxRows() > TAB_ROWS) s.deleteRows(TAB_ROWS + 1, s.getMaxRows() - TAB_ROWS);
  if (s.getMaxColumns() > head.length) s.deleteColumns(head.length + 1, s.getMaxColumns() - head.length);
  s.appendRow(head);
  return s;
}
// รันฟังก์ชันนี้หนึ่งครั้งเพื่อให้ Google ขอสิทธิ์เข้าถึงชีตที่ใช้ (หลังตั้ง Script Properties แล้ว)
function authorize() {
  if (MAIN_ID) SpreadsheetApp.openById(MAIN_ID).getName();
  if (USER_SHEET_ID) SpreadsheetApp.openById(USER_SHEET_ID).getName();
}

/**
 * ใช้ครั้งเดียว: คัดลอกข้อมูลส่วนตัวเดิมของเจ้าของ (My_Point, My_route, SAR_route, SAR_area ในชีต AllCoordinateRTP)
 * ไปแท็บ <ชื่อ>__OWNER_NAME ในชีตส่วนตัว USER_SHEET_ID แล้วเทียบทีละเซลล์ ไม่ลบต้นฉบับ
 * ต้องตั้ง Script Properties MAIN_ID (ชั่วคราว) และ USER_SHEET_ID ก่อน ผลดูที่ Execution log
 * ถ้าแท็บปลายทางมีข้อมูลอยู่แล้ว (เกินแถวหัวตาราง) จะข้าม ไม่เขียนทับ
 */
function migrateOwnerData() {
  if (!MAIN_ID || !USER_SHEET_ID) { Logger.log('ต้องตั้ง MAIN_ID และ USER_SHEET_ID ใน Script Properties ก่อน'); return; }
  const src = SpreadsheetApp.openById(MAIN_ID), dst = SpreadsheetApp.openById(USER_SHEET_ID);
  [['My_Point', ['Name', 'Lat', 'Lon', 'Note']], ['My_route', ['Name', 'Saved', 'Data']],
   ['SAR_route', ['Name', 'Pattern', 'Saved', 'Data']], ['SAR_area', ['Name', 'Pattern', 'Saved', 'Data']]].forEach(function (t) {
    const base = t[0], head = t[1];
    const a = src.getSheetByName(base);
    if (!a) { Logger.log(base + ': ไม่พบแท็บต้นฉบับ ข้าม'); return; }
    const last = a.getLastRow();
    if (last < 2) { Logger.log(base + ': ไม่มีข้อมูล ข้าม'); return; }
    const w = head.length;
    const vals = a.getRange(2, 1, last - 1, w).getValues().filter(function (r) { return String(r[0]).trim(); });
    const b = userTab_(dst, base + '__' + OWNER_NAME, head);
    if (b.getLastRow() > 1) { Logger.log(base + ': ปลายทางมีข้อมูลแล้ว ข้าม (ไม่เขียนทับ)'); return; }
    const need = vals.length + 2;
    if (b.getMaxRows() < need) b.insertRowsAfter(b.getMaxRows(), need - b.getMaxRows());
    const rg = b.getRange(2, 1, vals.length, w);
    rg.setNumberFormat('@');   // เก็บเป็นข้อความล้วน กันชีตแปลงวันที่/พิกัด
    rg.setValues(vals.map(function (r) { return r.map(function (c) { return String(c); }); }));
    // เทียบกับต้นฉบับทีละเซลล์
    const chk = b.getRange(2, 1, vals.length, w).getValues();
    let diff = 0;
    for (let i = 0; i < vals.length; i++) for (let j = 0; j < w; j++) if (String(chk[i][j]) !== String(vals[i][j])) diff++;
    Logger.log(base + ': คัดลอก ' + vals.length + ' แถว ไปแท็บ ' + b.getName() + ' ต่างจากต้นฉบับ ' + diff + ' เซลล์');
  });
}
// ตรวจว่าตั้ง Script Properties ครบหรือไม่ (ดูที่ View > Logs / Execution log) ไม่แสดงค่าจริง
function checkSetup() {
  Logger.log(JSON.stringify({ USER_SHEET_ID: !!USER_SHEET_ID, OWNER_KEY: !!OWNER_KEY, MAIN_ID_for_migration_only: !!MAIN_ID, OWNER_NAME: OWNER_NAME }));
}
// เปิดลิงก์ /exec ตรงๆ จะเห็น ping และธงว่าตั้งค่าครบหรือไม่ (true/false เท่านั้น ไม่เปิดเผยค่า)
function doGet() { return out_({ ok: true, ping: 8, cfg: { users: !!USER_SHEET_ID, owner: !!OWNER_KEY } }); }

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const q = JSON.parse(e.postData.contents);
    const priv = q.t === 'my' || q.t === 'route' || q.t === 'sarroute' || q.t === 'sararea';
    // จุดร่วมเป็นข้อมูลสาธารณะ บันทึกรายละเอียดได้ ส่วนข้อมูลส่วนตัวไม่บันทึกลงชีตสาธารณะ (ดู logPrivate_)
    if (!priv && q.op !== 'list' && q.op !== 'check') log_(q);
    // ---- ส่วนที่ต้องมีรหัส: จุดของฉัน และเส้นทางของฉัน ----
    if (q.t === 'my' || q.t === 'route' || q.t === 'sarroute' || q.t === 'sararea') {
      const user = userOf_(q.key);
      if (!user) return out_({ ok: false, err: 'รหัสไม่ถูกต้อง' });
      if (q.op === 'check') return out_({ ok: true, user: user });
      // ข้อมูลส่วนตัวของทุกคน (รวมเจ้าของ) อยู่ในชีตแยกส่วนตัว USER_SHEET_ID เท่านั้น ไม่เก็บในชีตสาธารณะ
      if (!USER_SHEET_ID) return out_({ ok: false, err: 'สคริปต์ยังไม่ได้ตั้งค่า Script Properties (USER_SHEET_ID)' });
      if (q.op !== 'list' && q.op !== 'check') logPrivate_(user, q);
      const main = SpreadsheetApp.openById(USER_SHEET_ID);
      if (q.t === 'my') {
        const s = userTab_(main, 'My_Point__' + user, ['Name', 'Lat', 'Lon', 'Note']);
        if (q.op === 'list') {
          const last = s.getLastRow();
          const rows = last < 2 ? [] : s.getRange(2, 1, last - 1, 4).getValues()
            .filter(r => String(r[0]).trim()).map(r => [String(r[0]), String(r[1]), String(r[2]), String(r[3] || '')]);
          return out_({ ok: true, rows: rows, user: user });
        }
        const key = String(q.n || '').trim();
        if (!key) return out_({ ok: false, err: 'no name' });
        if (q.op === 'delete') {
          const r = findRow_(s, key);
          if (r > 0) s.deleteRow(r);
          return out_({ ok: true, deleted: r > 0 });
        }
        if (q.op === 'upsert' || q.op === 'rename') {
          const row = pointRow_(q);
          if (!row) return out_({ ok: false, err: 'bad coordinates' });
          if (q.op === 'rename' && q.old) {
            const ro = findRow_(s, q.old);
            if (ro > 0) s.deleteRow(ro);
          }
          s.getRange(1, 4).setValue('Note');
          upsertRow_(s, key, row);
          return out_({ ok: true });
        }
        return out_({ ok: false, err: 'unknown op' });
      }
      // q.t === 'route' | 'sarroute' | 'sararea'  (แท็บเก็บ JSON ต่อแถว)
      const isSar = q.t !== 'route';
      const base = q.t === 'sarroute' ? SAR_ROUTE : q.t === 'sararea' ? SAR_AREA : MY_ROUTE;
      const head = isSar ? ['Name', 'Pattern', 'Saved', 'Data'] : ['Name', 'Saved', 'Data'];
      const s = userTab_(main, base + '__' + user, head);
      const dc = isSar ? 4 : 3;   // คอลัมน์ที่เก็บ JSON
      if (q.op === 'list') {
        const last = s.getLastRow();
        const routes = last < 2 ? [] : s.getRange(2, dc, last - 1, 1).getValues().map(r => String(r[0])).filter(x => x);
        return out_({ ok: true, routes: routes });
      }
      const name = String(q.name || '').trim();
      if (!name) return out_({ ok: false, err: 'no name' });
      if (q.op === 'del') {
        const r = findRow_(s, name);
        if (r > 0) s.deleteRow(r);
        return out_({ ok: true, deleted: r > 0 });
      }
      if (q.op === 'save') {
        const data = String(q.data || '');
        if (data.length > 45000) return out_({ ok: false, err: 'data too large' });
        upsertRow_(s, name, isSar ? [safe_(name), safe_(String(q.p || '')), String(q.at || ''), data] : [name, String(q.at || ''), data]);
        return out_({ ok: true });
      }
      return out_({ ok: false, err: 'unknown op' });
    }
    // ---- จุดร่วม (Pub_point) ไม่ต้องมีรหัส ----
    const s = SpreadsheetApp.getActive().getSheetByName(PUB_SHEET);
    if (!s) return out_({ ok: false, err: 'no sheet' });
    // v4.2.1: อ่านรายการจุดร่วม (ไม่ต้องใช้รหัส) ให้แอปที่เปิดจากไฟล์ในเครื่องอ่านผ่านสคริปต์ได้
    if (q.op === 'list') {
      const last = s.getLastRow();
      const rows = last < 2 ? [] : s.getRange(2, 1, last - 1, 4).getValues()
        .filter(r => String(r[0]).trim()).map(r => [String(r[0]), String(r[1]), String(r[2]), String(r[3] || '')]);
      return out_({ ok: true, rows: rows });
    }
    const key = String(q.n || '').trim();
    if (!key) return out_({ ok: false, err: 'no name' });
    if (q.op === 'delete') {
      const r = findRow_(s, key);
      if (r > 0) s.deleteRow(r);
      return out_({ ok: true, deleted: r > 0 });
    }
    if (q.op === 'upsert' || q.op === 'rename') {
      const row = pointRow_(q);
      if (!row) return out_({ ok: false, err: 'bad coordinates' });
      if (q.op === 'rename' && q.old) {
        const ro = findRow_(s, q.old);
        if (ro > 0) s.deleteRow(ro);
      }
      s.getRange(1, 4).setValue('Note');
      upsertRow_(s, key, row);
      return out_({ ok: true });
    }
    return out_({ ok: false, err: 'unknown op' });
  } catch (err) {
    return out_({ ok: false, err: String(err) });
  } finally {
    lock.releaseLock();
  }
}
