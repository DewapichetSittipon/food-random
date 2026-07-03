# FridgeChef 🍳

PWA แบบ Offline-First สำหรับ**สุ่มเมนูอาหารไทยจากวัตถุดิบในตู้เย็น** — เลือกว่ามีอะไรอยู่บ้าง กดสุ่ม แล้วได้เมนูพร้อมวิธีทำทันที ทำงานได้แม้ไม่มีเน็ต

สเปกต้นทาง: [`docs/FridgeChef Spec.dc.html`](./docs/FridgeChef%20Spec.dc.html) · ศัพท์โดเมน: [`CONTEXT.md`](./CONTEXT.md) · การตัดสินใจ: [`docs/adr/`](./docs/adr/)

## โครงสร้าง

```
apps/web        React 19 + Vite + Tailwind v4 + Dexie (IndexedDB) + vite-plugin-pwa
apps/api        Hono + Prisma → GET /api/catalog (full snapshot) + เสิร์ฟ SPA ที่ build แล้ว
packages/shared type โดเมน, seed 10 เมนู, อัลกอริทึม matching (pure functions + tests)
```

matching และ random ทำงาน**ในเครื่องผู้ใช้ทั้งหมด** — API มีหน้าที่เดียวคือ sync คลังเมนู (ADR 0003)

## เริ่มต้น (dev)

ต้องมี Node 22+, pnpm 10, Docker

```bash
pnpm install
pnpm db:up               # Postgres 16 ใน docker
cp apps/api/.env.example apps/api/.env
pnpm db:migrate          # สร้าง schema
pnpm db:seed             # ใส่ 10 เมนูจาก packages/shared
pnpm dev                 # api :3000 + web :5173 (proxy /api ให้แล้ว)
```

เปิด http://localhost:5173 — ตู้เย็นเริ่มต้นติ๊ก ไก่/ใบกะเพรา/พริก/กระเทียม ไว้ให้ กดสุ่มได้เลย

## Production

```bash
pnpm build               # test+build ทุก package, web ออกที่ apps/web/dist
pnpm start               # Hono เสิร์ฟทั้ง API และ SPA ที่ :3000 (ADR 0004)
```

## งานหลังบ้าน

แก้/เพิ่มสูตรผ่าน Prisma Studio (ยังไม่มี Admin UI):

```bash
pnpm db:studio
```

ตาราง: `recipes`, `ingredients`, `recipe_ingredients` (flag `isRequired` = วัตถุดิบบังคับ, `isProtein` = โปรตีนหลัก) — client จะได้ของใหม่ในการ sync รอบถัดไปโดยอัตโนมัติ

## Deploy (Render)

repo นี้มี [`render.yaml`](./render.yaml) (Blueprint) + [`Dockerfile`](./Dockerfile) พร้อมแล้ว:

1. เข้า https://dashboard.render.com/blueprints → **New Blueprint Instance** → เลือก repo นี้
2. Render จะสร้าง web service `fridgechef` + Postgres `fridgechef-db` ให้เอง พร้อมต่อ `DATABASE_URL` อัตโนมัติ
3. ตอนบูต container จะ `migrate deploy` เสมอ และ seed เฉพาะเมื่อ DB ว่าง — ข้อมูลที่แก้ผ่านหลังบ้านไม่ถูกทับ

ข้อจำกัด free tier: service หลับเมื่อไม่มีคนใช้ (ตื่นช้า ~1 นาที) และ Postgres ฟรีมีอายุ 30 วัน (ต้องอัปเกรดถ้าใช้ยาว)

## ทดสอบ

```bash
pnpm test                # vitest — อัลกอริทึม matching + ความสอดคล้องของ seed
pnpm typecheck
```
