# Deploy เป็น service เดียว: Hono เสิร์ฟทั้ง API และ SPA

แทนที่จะแยก SPA ขึ้น CDN และ API เป็นอีก service เราให้ Hono เสิร์ฟไฟล์ static ของ React ที่ build แล้ว ควบคู่กับ route `/api/*` จาก origin เดียวกัน — ตัด CORS ทิ้งทั้งเรื่อง เหลือของที่ต้อง deploy แค่ Node service เดียว + managed Postgres ซึ่งเหมาะกับขนาดโปรเจกต์และทีม

ถ้าวันหนึ่งต้องการ CDN จริงจัง ค่อยแยก SPA ออกไปโดย API contract ไม่ต้องเปลี่ยน (เพิ่มแค่ CORS header)
