import { PrismaClient } from '@prisma/client';
import { runSeed } from './run-seed.ts';

// สำหรับตอน deploy: seed เฉพาะเมื่อ DB ยังว่าง — ไม่แตะข้อมูลที่แก้ผ่านหลังบ้านแล้ว
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.recipe.count();
  if (count > 0) {
    console.log(`DB มี ${count} เมนูอยู่แล้ว — ข้าม seed`);
    return;
  }
  await runSeed(prisma);
  console.log('DB ว่าง — seed เริ่มต้นให้แล้ว');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
