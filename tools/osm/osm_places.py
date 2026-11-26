#!/usr/bin/env python3
"""ดึงสถานที่จาก OpenStreetMap (ภายในประเทศไทย) จากไฟล์ Geofabrik (thailand-latest.osm.pbf) ด้วย osmium แล้วเขียน CSV
ข้อมูล © OpenStreetMap contributors สัญญาอนุญาต ODbL — https://www.openstreetmap.org/copyright
ผลลัพธ์: out/helipad_airport.csv, out/peak.csv, out/summary.json"""
import json, csv, os, sys, time, urllib.request, urllib.parse, datetime

PBF_URL = "https://download.geofabrik.de/asia/thailand-latest.osm.pbf"
TH = (5.5, 97.3, 20.6, 105.7)  # กรอบประเทศไทยโดยประมาณ (S,W,N,E) — ใช้ตัดเฉพาะจุดนอกกรอบ (Geofabrik ตัดตามเขตแดนให้แล้ว)

def run(cmd):
    print("+", cmd, flush=True)
    if os.system(cmd) != 0: raise SystemExit("คำสั่งล้มเหลว: " + cmd)

def features(expr, name):
    """osmium tags-filter → export GeoJSON Sequence → รายการ (type,id,tags,lat,lon) จุดกลางของเส้น/พื้นที่ = ค่าเฉลี่ยพิกัด"""
    run(f"osmium tags-filter thailand.osm.pbf {expr} -o {name}.pbf --overwrite")
    run(f"osmium export {name}.pbf -f geojsonseq -o {name}.geojsonseq --overwrite -a type,id -x print_record_separator=false")
    out = []
    for line in open(f"{name}.geojsonseq", encoding="utf-8"):
        line = line.strip().lstrip("\x1e")
        if not line: continue
        g = json.loads(line); pr = g.get("properties", {}); geo = g.get("geometry") or {}
        pts = []
        def walk(c):
            if isinstance(c, (list, tuple)) and c and isinstance(c[0], (int, float)): pts.append(c)
            elif isinstance(c, (list, tuple)):
                for x in c: walk(x)
        walk(geo.get("coordinates"))
        if len(pts) > 1 and pts[0] == pts[-1]: pts = pts[:-1]  # จุดปิดรูปซ้ำจุดแรก
        if not pts: continue
        lo = sum(p[0] for p in pts) / len(pts); la = sum(p[1] for p in pts) / len(pts)
        if not (TH[0] <= la <= TH[2] and TH[1] <= lo <= TH[3]): continue
        t = {k: v for k, v in pr.items() if not k.startswith("@")}
        out.append((pr.get("@type", "n")[:1], pr.get("@id", ""), t, la, lo))
    # osmium export ให้ทั้งเส้นและพื้นที่ของ way เดียวกันได้ → ตัดซ้ำตาม (type,id)
    seen = set(); res = []
    for x in out:
        k = (x[0], x[1])
        if k in seen: continue
        seen.add(k); res.append(x)
    return res

def dm(v, lat):
    h = ("N" if v >= 0 else "S") if lat else ("E" if v >= 0 else "W")
    v = abs(v); d = int(v); m = round((v - d) * 60, 2)
    if m >= 60: d += 1; m -= 60
    return (f"{d:02d}{m:05.2f}" if lat else f"{d:03d}{m:05.2f}") + h

def ele_m(s):
    if not s: return None
    import re
    s = s.strip().lower()
    s = re.sub(r"(\d),(\d{3})(?!\d)", r"\1\2", s).replace(",", ".")
    try:
        if s.endswith("ft") or s.endswith("'"):
            return float(s.rstrip("ft' ").strip()) * 0.3048
        return float(s.split()[0].rstrip("m"))
    except Exception:
        return None

def main():
    os.makedirs("out", exist_ok=True)
    today = datetime.date.today().isoformat()
    summ = {"date": today, "source": "© OpenStreetMap contributors (ODbL)"}
    # ลานจอด ฮ./สนามบิน
    run(f"curl -sSfL --retry 3 -o thailand.osm.pbf {PBF_URL}")
    summ["pbf_bytes"] = os.path.getsize("thailand.osm.pbf")
    rows = []
    for (ty, oid, t, la, lo) in features("nwr/aeroway=helipad,heliport,aerodrome,airstrip", "air"):
        if t.get("aeroway") not in ("helipad", "heliport", "aerodrome", "airstrip"): continue  # ตัดวัตถุที่ติดมาเป็นส่วนประกอบของ relation (terminal/apron ฯลฯ)
        em = ele_m(t.get("ele"))
        rows.append([t.get("name", "") or t.get("name:th", "") or t.get("name:en", ""), t.get("name:en", ""), t.get("aeroway", ""),
                     t.get("icao", ""), t.get("iata", ""), dm(la, True), dm(lo, False), "" if em is None else round(em / 0.3048),
                     round(la, 6), round(lo, 6), f"{ {'n':'node','w':'way','r':'relation'}.get(ty,ty)}/{oid}"])
    order = {"aerodrome": 0, "airstrip": 1, "heliport": 2, "helipad": 3}
    rows.sort(key=lambda r: (order.get(r[2], 9), r[0] == "", r[0], r[8]))
    with open("out/helipad_airport.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["Name", "Name EN", "Type", "ICAO", "IATA", "LAT", "LON", "Elev ft", "Lat dd", "Lon dd", "OSM"]); w.writerows(rows)
    summ["air"] = {"rows": len(rows), "named": sum(1 for r in rows if r[0]),
                   "by_type": {k: sum(1 for r in rows if r[2] == k) for k in order}}
    # ยอดเขา
    P = features("n/natural=peak", "peak"); rows = []
    for (ty, oid, t, la, lo) in P:
        if t.get("natural") != "peak": continue
        nm = t.get("name", "") or t.get("name:th", "") or t.get("name:en", ""); em = ele_m(t.get("ele"))
        if not nm and em is None: continue
        rows.append([nm, t.get("name:en", ""), "" if em is None else round(em), "" if em is None else round(em / 0.3048),
                     dm(la, True), dm(lo, False), round(la, 6), round(lo, 6), f"node/{oid}"])
    rows.sort(key=lambda r: (-(r[2] if r[2] != "" else -1e9), r[0]))
    with open("out/peak.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["Name", "Name EN", "Elev m", "Elev ft", "LAT", "LON", "Lat dd", "Lon dd", "OSM"]); w.writerows(rows)
    summ["peak"] = {"rows": len(rows), "named": sum(1 for r in rows if r[0]), "with_ele": sum(1 for r in rows if r[2] != ""),
                    "all_nodes": len(P)}
    json.dump(summ, open("out/summary.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(json.dumps(summ, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
