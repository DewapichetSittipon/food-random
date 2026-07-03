# Stack: pnpm monorepo — React PWA / Hono + Prisma / Postgres

เลือก TypeScript ทั้งระบบ จัดเป็น pnpm workspaces สามส่วน: `apps/web` (React PWA + Dexie), `apps/api` (Hono + Prisma), `packages/shared` (type ของโดเมน, seed data, และโค้ด matching) เหตุผลหลักคือ type ของ Menu/Ingredient ต้องเป็นชุดเดียวกันทั้งฝั่งแอปและ API และโค้ด matching ต้อง unit test ได้โดยไม่ผูกกับ UI

เลือก Prisma แทน query builder อื่นเพราะช่วงแรกยังไม่มี Admin UI — การแก้สูตรหลังบ้านทำผ่าน Prisma Studio ได้ทันที เลือก Postgres ตามความคุ้นเคยของทีม แม้โหลดงานจริงเล็กพอที่ SQLite จะรับได้
