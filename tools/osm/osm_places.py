#!/usr/bin/env python3
"""ดึงสถานที่จาก OpenStreetMap (ภายในประเทศไทย) ผ่าน Overpass API แล้วเขียน CSV
ข้อมูล © OpenStreetMap contributors สัญญาอนุญาต ODbL — https://www.openstreetmap.org/copyright
ผลลัพธ์: out/helipad_airport.csv, out/peak.csv, out/summary.json"""
import json, csv, os, sys, time, urllib.request, urllib.parse, datetime

EPS = ["https://overpass-api.de/api/interpreter",
       "https://overpass.kumi.systems/api/interpreter",
       "https://overpass.private.coffee/api/interpreter"]
AREA = 'area["ISO3166-1"="TH"][admin_level=2]->.th;'
Q = {
 "air": '[out:json][timeout:600];' + AREA + 'nwr["aeroway"~"^(helipad|heliport|aerodrome|airstrip)$"](area.th);out center tags;',
 "peak": '[out:json][timeout:600];' + AREA + 'node["natural"="peak"](area.th);out tags;',
}

def fetch(q):
    last = None
    for ep in EPS:
        for t in range(2):
            try:
                req = urllib.request.Request(ep, data=urllib.parse.urlencode({"data": q}).encode(),
                                             headers={"User-Agent": "Tpad-helicopter-planner (github.com/Ow3652/Tpadhelicopterplanner)"})
                with urllib.request.urlopen(req, timeout=900) as r:
                    return json.load(r)
            except Exception as e:
                last = e; print("fail", ep, e, file=sys.stderr); time.sleep(20)
    raise SystemExit(f"Overpass ล้มเหลวทุกเซิร์ฟเวอร์: {last}")

def dm(v, lat):
    h = ("N" if v >= 0 else "S") if lat else ("E" if v >= 0 else "W")
    v = abs(v); d = int(v); m = round((v - d) * 60, 2)
    if m >= 60: d += 1; m -= 60
    return (f"{d:02d}{m:05.2f}" if lat else f"{d:03d}{m:05.2f}") + h

def ll(e):
    if "lat" in e: return e["lat"], e["lon"]
    c = e.get("center"); return (c["lat"], c["lon"]) if c else (None, None)

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
    a = fetch(Q["air"]); rows = []
    for e in a.get("elements", []):
        la, lo = ll(e); t = e.get("tags", {})
        if la is None: continue
        em = ele_m(t.get("ele"))
        rows.append([t.get("name", "") or t.get("name:th", "") or t.get("name:en", ""), t.get("name:en", ""), t.get("aeroway", ""),
                     t.get("icao", ""), t.get("iata", ""), dm(la, True), dm(lo, False), "" if em is None else round(em / 0.3048),
                     round(la, 6), round(lo, 6), f"{e['type']}/{e['id']}"])
    order = {"aerodrome": 0, "airstrip": 1, "heliport": 2, "helipad": 3}
    rows.sort(key=lambda r: (order.get(r[2], 9), r[0] == "", r[0], r[8]))
    with open("out/helipad_airport.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["Name", "Name EN", "Type", "ICAO", "IATA", "LAT", "LON", "Elev ft", "Lat dd", "Lon dd", "OSM"]); w.writerows(rows)
    summ["air"] = {"rows": len(rows), "named": sum(1 for r in rows if r[0]),
                   "by_type": {k: sum(1 for r in rows if r[2] == k) for k in order}}
    time.sleep(10)
    # ยอดเขา
    p = fetch(Q["peak"]); rows = []
    for e in p.get("elements", []):
        t = e.get("tags", {}); nm = t.get("name", "") or t.get("name:th", "") or t.get("name:en", ""); em = ele_m(t.get("ele"))
        if not nm and em is None: continue
        rows.append([nm, t.get("name:en", ""), "" if em is None else round(em), "" if em is None else round(em / 0.3048),
                     dm(e["lat"], True), dm(e["lon"], False), round(e["lat"], 6), round(e["lon"], 6), f"node/{e['id']}"])
    rows.sort(key=lambda r: (-(r[2] if r[2] != "" else -1e9), r[0]))
    with open("out/peak.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f); w.writerow(["Name", "Name EN", "Elev m", "Elev ft", "LAT", "LON", "Lat dd", "Lon dd", "OSM"]); w.writerows(rows)
    summ["peak"] = {"rows": len(rows), "named": sum(1 for r in rows if r[0]), "with_ele": sum(1 for r in rows if r[2] != ""),
                    "all_nodes": len(p.get("elements", []))}
    json.dump(summ, open("out/summary.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(json.dumps(summ, ensure_ascii=False, indent=1))

if __name__ == "__main__":
    main()
