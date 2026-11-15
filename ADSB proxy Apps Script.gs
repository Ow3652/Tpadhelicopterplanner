/**
 * ตัวกลางดึงข้อมูล ADS-B และ METAR/TAF สำหรับ Tpad Helicopter Planner (ADS-B: v3.5 · METAR/TAF: v4.1.6)
 * วิธีใช้: script.google.com → โครงการใหม่ → วางโค้ดนี้ → Deploy → New deployment
 *   ชนิด Web app · Execute as: Me · Who has access: Anyone → คัดลอก URL (ลงท้าย /exec)
 *   นำ URL ไปวางในช่อง "URL ตัวกลาง Apps Script" ในกล่องชั้นข้อมูล
 * METAR/TAF: เรียกด้วย  URL/exec?type=metar&ids=VTBS  หรือ  ?type=taf&ids=VTBS  (ids คือรหัส ICAO 4 ตัว คั่นด้วยจุลภาคได้ไม่เกิน 10 สนามบิน)
 *   ผลลัพธ์เป็นข้อความธรรมดา ถ้าผิดพลาดจะขึ้นต้นด้วย "ERROR:" แคชผลไว้ 120 วินาที
 * หมายเหตุ: Apps Script มีโควตา UrlFetch ต่อวัน (บัญชีทั่วไปราว 20,000 ครั้ง) โค้ดนี้แคชผลไว้ 5 วินาที
 *   เพื่อให้หลายคนใช้พร้อมกันแล้วไม่ใช้โควตาเพิ่ม ตรวจเงื่อนไขของ adsb.lol / airplanes.live / adsb.fi ก่อนใช้งานจริง
 */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.type) return wx_(p);
  var la = Number(p.lat), lo = Number(p.lon), r = Math.min(250, Math.max(1, Math.round(Number(p.r) || 100)));
  if (!isFinite(la) || !isFinite(lo)) return out_({ error: "bad lat/lon" });
  var key = "ac_" + la.toFixed(1) + "_" + lo.toFixed(1) + "_" + Math.ceil(r / 10);
  var cache = CacheService.getScriptCache();
  var hit = cache.get(key);
  if (hit) return text_(hit);
  var srcs = [
    ["adsb.lol", "https://api.adsb.lol/v2/point/" + la + "/" + lo + "/" + r],
    ["airplanes.live", "https://api.airplanes.live/v2/point/" + la + "/" + lo + "/" + r],
    ["adsb.fi", "https://opendata.adsb.fi/api/v3/lat/" + la + "/lon/" + lo + "/dist/" + r]
  ];
  var errs = [];
  for (var i = 0; i < srcs.length; i++) {
    try {
      var res = UrlFetchApp.fetch(srcs[i][1], { muteHttpExceptions: true });
      if (res.getResponseCode() !== 200) { errs.push(srcs[i][0] + ": HTTP " + res.getResponseCode()); continue; }
      var body = res.getContentText();
      var j = JSON.parse(body);
      j._src = srcs[i][0];
      var t = JSON.stringify(j);
      try { cache.put(key, t, 5); } catch (x) { /* ข้อมูลใหญ่เกิน 100 KB ข้ามการแคช */ }
      return text_(t);
    } catch (err) { errs.push(srcs[i][0] + ": " + err); }
  }
  return out_({ error: errs.join(" | ") });
}
function text_(t) { return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.JSON); }
function out_(o) { return text_(JSON.stringify(o)); }

/* ===== METAR / TAF จาก aviationweather.gov (เพิ่มใน v4.1.6) ===== */
function wx_(p) {
  var t = String(p.type || "").toLowerCase();
  if (t !== "metar" && t !== "taf") return plain_("ERROR: type ต้องเป็น metar หรือ taf");
  var ids = String(p.ids || "").toUpperCase().split(/[,\s]+/).filter(function (x) { return /^[A-Z]{4}$/.test(x); }).slice(0, 10);
  if (!ids.length) return plain_("ERROR: ไม่มีรหัส ICAO ที่ถูกต้อง");
  var key = "wx_" + t + "_" + ids.join(",");
  var cache = CacheService.getScriptCache();
  var hit = cache.get(key);
  if (hit !== null) return plain_(hit);
  var url = "https://aviationweather.gov/api/data/" + t + "?format=raw&ids=" + ids.join(",") + (t === "metar" ? "&hours=3" : "");
  try {
    var res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) return plain_("ERROR: aviationweather.gov ตอบ HTTP " + res.getResponseCode());
    var body = res.getContentText().trim();
    try { cache.put(key, body, 120); } catch (x) { /* ข้ามการแคช */ }
    return plain_(body);
  } catch (err) { return plain_("ERROR: " + err); }
}
function plain_(t) { return ContentService.createTextOutput(t).setMimeType(ContentService.MimeType.TEXT); }
