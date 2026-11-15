/**
 * ตัวกลาง METAR/TAF แบบสาธารณะ (ไม่ใช้รหัส) สำหรับ Tpad Helicopter Planner v4.2.0
 * ทำเฉพาะ METAR/TAF เท่านั้น ไม่เกี่ยวกับ ADS-B (ADS-B ยังใช้ตัวกลางเดิมที่ต้องใช้รหัส)
 *
 * วิธีใช้
 *  1) script.google.com → โครงการใหม่ → วางโค้ดนี้ → บันทึก
 *  2) Deploy → New deployment → ชนิด Web app · Execute as: Me · Who has access: Anyone
 *  3) คัดลอก URL ที่ลงท้ายด้วย /exec แล้วส่งให้ผู้ดูแลแอป เพื่อใส่ที่ const METAR_URL ในไฟล์ HTML (ใส่ครั้งเดียว ทุกคนใช้ได้เลย)
 *
 * เรียกด้วย  URL/exec?type=metar&ids=VTBS   หรือ  ?type=taf&ids=VTBS
 *  - รับเฉพาะรหัส ICAO 4 ตัวอักษร ไม่เกิน 5 สนามบินต่อครั้ง (กันถูกใช้เกินจำเป็น)
 *  - ผลลัพธ์เป็นข้อความธรรมดา ถ้าผิดพลาดจะขึ้นต้นด้วย "ERROR:"
 *  - แคชผลไว้ 120 วินาที ช่วยประหยัดโควตา UrlFetch ของ Apps Script (บัญชีทั่วไปราว 20,000 ครั้ง/วัน)
 * หมายเหตุ: URL นี้เป็นสาธารณะ ใครรู้ลิงก์ก็เรียกได้ แต่ดึงได้เฉพาะ METAR/TAF จึงไม่มีข้อมูลลับ
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var t = String(p.type || "").toLowerCase();
  if (t !== "metar" && t !== "taf") return plain_("ERROR: type ต้องเป็น metar หรือ taf");
  var ids = String(p.ids || "").toUpperCase().split(/[,\s]+/)
    .filter(function (x) { return /^[A-Z]{4}$/.test(x); }).slice(0, 5);
  if (!ids.length) return plain_("ERROR: ไม่มีรหัส ICAO ที่ถูกต้อง");
  var key = "wx_" + t + "_" + ids.join(",");
  var cache = CacheService.getScriptCache();
  var hit = cache.get(key);
  if (hit !== null) return plain_(hit);
  var url = "https://aviationweather.gov/api/data/" + t + "?format=raw&ids=" + ids.join(",") +
    (t === "metar" ? "&hours=3" : "");
  try {
    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return plain_("ERROR: aviationweather.gov ตอบ HTTP " + res.getResponseCode());
    var body = res.getContentText().trim();
    try { cache.put(key, body, 120); } catch (x) { /* ข้ามการแคช */ }
    return plain_(body);
  } catch (err) { return plain_("ERROR: " + err); }
}
function plain_(t) { return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT); }
