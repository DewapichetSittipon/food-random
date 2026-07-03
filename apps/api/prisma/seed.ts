import { PrismaClient } from '@prisma/client';
import { runSeed } from './run-seed.ts';

// CLI: `pnpm db:seed` — เขียนทับทั้งชุดเสมอ (ใช้ตอน dev/รีเซ็ตข้อมูล)
const prisma = new PrismaClient();

runSeed(prisma)
  .then(async () => {
    const counts = {
      ingredients: await prisma.ingredient.count(),
      recipes: await prisma.recipe.count(),
    };
    console.log(`seed เสร็จ: ${counts.recipes} เมนู, ${counts.ingredients} วัตถุดิบ`);
  })
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
