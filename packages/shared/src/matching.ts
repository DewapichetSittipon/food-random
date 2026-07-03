import type { Recipe } from './types.ts';

// ต่างจากสเปก §02 (coverage + คะแนน + weighted random): เข้ารอบเฉพาะเมนูที่
// วัตถุดิบครบทำได้จริง แล้วสุ่ม uniform — ผู้ใช้ต้องไม่ได้เมนูที่ขาดของ

/** จำนวนตัวเลือกสำรองสูงสุดที่แสดงบนหน้าผลลัพธ์ (ไม่จำกัดจำนวนเมนูที่เข้ารอบ) */
export const MAX_ALTERNATES = 6;

/**
 * เมนูที่ทำได้จริง: วัตถุดิบบังคับและวัตถุดิบหลักที่ไม่ใช่โปรตีนต้องมีครบทุกตัว
 * ส่วนโปรตีนเป็นทางเลือก — มีตัวใดตัวหนึ่งก็พอ (เช่น ไข่เจียวใช้ไข่ ไม่มีหมูสับก็ได้)
 */
export function canCook(recipe: Recipe, fridge: ReadonlySet<string>): boolean {
  for (const id of recipe.requiredIngredientIds) {
    if (!fridge.has(id)) return false;
  }
  const proteins = recipe.proteinIngredientIds;
  if (proteins.length > 0 && !proteins.some((id) => fridge.has(id))) return false;
  const proteinSet = new Set(proteins);
  for (const id of recipe.coreIngredientIds) {
    if (!proteinSet.has(id) && !fridge.has(id)) return false;
  }
  return true;
}

/** เมนูเข้ารอบ = ทุกเมนูที่ทำได้จริง คงลำดับตาม input — การสุ่มเกิดตอน pick */
export function getCandidates(recipes: Recipe[], fridgeIds: Iterable<string>): Recipe[] {
  const fridge = new Set(fridgeIds);
  return recipes.filter((r) => canCook(r, fridge));
}

/** สุ่ม uniform — ทุกเมนูที่ทำได้มีโอกาสเท่ากัน */
export function randomPick(candidates: Recipe[], rng: () => number = Math.random): Recipe | null {
  if (candidates.length === 0) return null;
  return candidates[Math.min(Math.floor(rng() * candidates.length), candidates.length - 1)]!;
}

/** สุ่มใหม่ต้องไม่ได้เมนูเดิม เว้นแต่เหลือ candidate ตัวเดียว */
export function rerollPick(
  candidates: Recipe[],
  currentRecipeId: string | null,
  rng: () => number = Math.random,
): Recipe | null {
  const pool =
    currentRecipeId === null ? candidates : candidates.filter((r) => r.id !== currentRecipeId);
  return randomPick(pool.length > 0 ? pool : candidates, rng);
}
