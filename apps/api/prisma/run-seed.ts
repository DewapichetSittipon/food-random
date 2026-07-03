import { type Prisma, PrismaClient } from '@prisma/client';
import { seedIngredients, seedRecipes } from '@fridgechef/shared';

/** เขียน seed ทับทั้งชุดใน transaction เดียว — idempotent, ใช้ทั้ง CLI และ bootstrap ตอน deploy */
export async function runSeed(prisma: PrismaClient): Promise<void> {
  // timeout ยาวกว่า default 5s — seed ~70 เมนูแบบยิงทีละ query ไป DB ระยะไกล (Supabase) ไม่ทัน
  await prisma.$transaction(
    async (tx) => {
      await tx.recipeIngredient.deleteMany();
      await tx.recipe.deleteMany();
      await tx.ingredient.deleteMany();

      await tx.ingredient.createMany({
        data: seedIngredients.map((i) => ({
          id: i.id,
          name: i.name,
          group: i.group,
          sortOrder: i.sortOrder,
        })),
      });

      for (const r of seedRecipes) {
        const required = new Set(r.requiredIngredientIds);
        const protein = new Set(r.proteinIngredientIds);
        await tx.recipe.create({
          data: {
            id: r.id,
            name: r.name,
            template: r.template,
            category: r.category,
            difficulty: r.difficulty,
            cookTime: r.cookTime,
            servings: r.servings,
            seasonings: r.seasonings as unknown as Prisma.InputJsonValue,
            steps: r.steps,
            tags: r.tags,
            ingredients: {
              create: r.coreIngredientIds.map((ingredientId, position) => ({
                ingredientId,
                position,
                isRequired: required.has(ingredientId),
                isProtein: protein.has(ingredientId),
              })),
            },
          },
        });
      }
    },
    { timeout: 120_000, maxWait: 10_000 },
  );
}
