# Postgres ย้ายไปอยู่บน Supabase (ใช้เป็นแค่ที่ตั้ง DB)

Render free tier ลบ Postgres ทิ้งหลัง 30 วัน เราจึงย้ายฐานข้อมูล production ไปอยู่บน Supabase free tier ซึ่งไม่หมดอายุ (แค่ pause เมื่อไม่มีการใช้งาน ~1 สัปดาห์ และปลุกได้จาก dashboard) — ได้ Table Editor บนเว็บเป็นช่องทางแก้สูตรหลังบ้านแทน Prisma Studio ด้วย

การตัดสินใจนี้**ไม่ได้กลับคำ ADR 0001**: เราใช้ Supabase เป็น Postgres hosting เท่านั้น ไม่ใช้ REST API/auth/client SDK ของมัน — API ยังเป็น Hono + Prisma ของเราเอง ฝั่งแอปไม่รู้จัก Supabase เลย

รายละเอียดการเชื่อมต่อ: runtime ใช้ transaction pooler (พอร์ต 6543, `pgbouncer=true&connection_limit=1`) ส่วน `prisma migrate` ใช้ `DIRECT_URL` ผ่าน session pooler (พอร์ต 5432) — dev ในเครื่องยังใช้ Postgres ใน docker เหมือนเดิม โดยชี้ทั้งสองตัวแปรไปที่เดียวกัน
