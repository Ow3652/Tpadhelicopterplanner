# Tpad Helicopter Planner

โปรแกรมวางแผนเส้นทางบินเฮลิคอปเตอร์ (ไฟล์ HTML ไฟล์เดียว) สำหรับงานการบินตำรวจ ใช้ได้บน PC / iPad / Google Sites

- ใช้งาน: https://ow3652.github.io/Tpadhelicopterplanner/ (เปิดใน Safari แล้ว "เพิ่มไปยังหน้าจอโฮม" เพื่อใช้ออฟไลน์ได้)
- ประวัติการเปลี่ยนแปลง: [CHANGELOG.md](CHANGELOG.md)
- คู่มือ: [docs/manual.pdf](docs/manual.pdf) และ [docs/manual.docx](docs/manual.docx) (ฉบับ v4.4.0) มีลิงก์ในหน้าแอปด้วย
- สคริปต์ Google Apps Script: `Pub_point Apps Script.gs` (จุดร่วม + ข้อมูลส่วนตัวรายคน), `METAR proxy Apps Script.gs`, `ADSB proxy Apps Script.gs`
- ชุดทดสอบ: [tests/](tests/) (Playwright จำลองใน Chromium ไม่ใช่อุปกรณ์จริง)

ข้อมูลส่วนตัว (จุดของฉัน เส้นทาง) เก็บในชีตส่วนตัวของผู้ดูแล ไม่อยู่ในรีโปนี้ ผู้ดูแลเป็นผู้ออกรหัสซิงก์ให้ผู้ใช้
