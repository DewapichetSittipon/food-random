import type { PrismaClient } from '@prisma/client';
import type { Catalog, Ingredient, IngredientGroup, Recipe, Seasoning } from '@fridgechef/shared';
import { SEED_UPDATED_AT } from '@fridgechef/shared';

/** ประกอบคลังทั้งก้อนจาก Postgres เป็นรูป denormalized ที่ client ใช้ (ADR 0003) */
export async function buildCatalog(prisma: PrismaClient): Promise<Catalog> {
  const [ingredients, recipes] = await Promise.all([
    prisma.ingredient.findMany({ orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.recipe.findMany({
      include: { ingredients: { orderBy: { position: 'asc' } } },
      orderBy: { id: 'asc' },
    }),
  ]);

  const ingredientDocs: Ingredient[] = ingredients.map((i) => ({
    id: i.id,
    name: i.name,
    group: i.group as IngredientGroup,
    sortOrder: i.sortOrder,
  }));

  const recipeDocs: Recipe[] = recipes.map((r) => ({
    id: r.id,
    name: r.name,
    template: r.template,
    category: r.category,
    difficulty: r.difficulty as Recipe['difficulty'],
    cookTime: r.cookTime,
    servings: r.servings,
    coreIngredientIds: r.ingredients.map((ri) => ri.ingredientId),
    requiredIngredientIds: r.ingredients.filter((ri) => ri.isRequired).map((ri) => ri.ingredientId),
    proteinIngredientIds: r.ingredients.filter((ri) => ri.isProtein).map((ri) => ri.ingredientId),
    seasonings: r.seasonings as unknown as Seasoning[],
    steps: r.steps,
    tags: r.tags,
    updatedAt: r.updatedAt.toISOString(),
  }));

  const updatedAt = recipeDocs.reduce(
    (max, r) => (r.updatedAt > max ? r.updatedAt : max),
    SEED_UPDATED_AT,
  );

  return { ingredients: ingredientDocs, recipes: recipeDocs, updatedAt };
}
