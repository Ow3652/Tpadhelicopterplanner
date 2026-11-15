# ชุดทดสอบ Playwright (v4.0.x – v4.1.x)

สคริปต์ t1200–t3002 คือสคริปต์ทดสอบที่ใช้ระหว่างพัฒนา SIM / HSI / FMS / Direct to
ย้ายมาจากพื้นที่ทำงานบนเว็บ **ยังไม่เคยรันบน PC เครื่องนี้**

## ข้อควรรู้ก่อนรัน
- ทุกสคริปต์เปิดเพจที่ `http://localhost:8765/` และ **ระบุชื่อไฟล์ HTML ตายตัว** (เช่น `Tpad helicopter planner v4.1.3.html`)
  ต้องแก้ชื่อไฟล์ในสคริปต์ให้ตรงกับเวอร์ชันปัจจุบัน (v4.1.4) ก่อน
- สคริปต์แต่ละตัวทดสอบเรื่องเฉพาะ (เช่น t2800 = Direct to/ลบ/แทรกใน FMS ระหว่าง SIM,
  t2100 = ส่วนโค้ง Direct to, t1601 = ความแม่นการเลี้ยว, t3000/t3002 = ความถี่การวาด)
  ผลลัพธ์พิมพ์ที่หน้าจอ ต้องอ่านเอง ไม่มีระบบ pass/fail อัตโนมัติ
- เป็นการจำลองด้วย Chromium ไม่ใช่ iPad หรือ GPS จริง

## วิธีรัน (ใน PowerShell ที่โฟลเดอร์ TPAD)
1. ติดตั้ง Node.js และ Python (ถ้ายังไม่มี)
2. ติดตั้ง Playwright:  `npm install playwright` แล้ว `npx playwright install chromium`
3. เปิดเซิร์ฟเวอร์ (หน้าต่างแรก):  `python -m http.server 8765`
4. รันสคริปต์ (อีกหน้าต่าง):  `node tests\t2800.js`

## t4200.js (v4.2.0)
ทดสอบ METAR_URL และรหัสต่อคนด้วย Apps Script จำลอง ต้องมีไฟล์ `orig.html` (สำเนาของไฟล์ v4.2.0) และ `withurl.html` (สำเนาที่แก้ `const METAR_URL="https://script.google.com/macros/s/METARID/exec"`) ในโฟลเดอร์เดียวกับเซิร์ฟเวอร์
