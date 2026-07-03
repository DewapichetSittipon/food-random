import type { Recipe } from './types.ts';

// ค่าคงที่ของอัลกอริทึมตามสเปก (docs/FridgeChef Spec.dc.html §02)
export const MIN_COVERAGE = 0.5;
export const PROTEIN_BONUS = 10;
export const MISSING_PENALTY = 4;
export const MAX_CANDIDATES = 6;
export const WEIGHT_POWER = 2;

export interface ScoredRecipe {
  recipe: Recipe;
  score: number;
  /** สัดส่วนวัตถุดิบหลักที่มี (0–1) */
  coverage: number;
  haveIds: string[];
  missingIds: string[];
}

/**
 * ขั้น Filter + Score: คืน null เมื่อขาดวัตถุดิบบังคับ
 * คะแนน = coverage×100 + โบนัสโปรตีน − ที่ขาด×ค่าปรับ
 */
export function scoreRecipe(recipe: Recipe, fridge: ReadonlySet<string>): ScoredRecipe | null {
  for (const id of recipe.requiredIngredientIds) {
    if (!fridge.has(id)) return null;
  }
  const core = recipe.coreIngredientIds;
  const haveIds = core.filter((id) => fridge.has(id));
  const missingIds = core.filter((id) => !fridge.has(id));
  const coverage = core.length === 0 ? 0 : haveIds.length / core.length;
  const proteinOk =
    recipe.proteinIngredientIds.length === 0 ||
    recipe.proteinIngredientIds.some((id) => fridge.has(id))
      ? 1
      : 0;
  const score = Math.round(
    coverage * 100 + proteinOk * PROTEIN_BONUS - missingIds.length * MISSING_PENALTY,
  );
  return { recipe, score, coverage, haveIds, missingIds };
}

/** เมนูเข้ารอบ: ผ่าน filter, coverage ถึงเกณฑ์, เรียงคะแนนมาก→น้อย, ตัดที่ MAX_CANDIDATES */
export function getCandidates(recipes: Recipe[], fridgeIds: Iterable<string>): ScoredRecipe[] {
  const fridge = new Set(fridgeIds);
  return recipes
    .map((r) => scoreRecipe(r, fridge))
    .filter((s): s is ScoredRecipe => s !== null && s.coverage >= MIN_COVERAGE)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATES);
}

/** Weighted random: น้ำหนัก = score^WEIGHT_POWER — คะแนนสูงถูกเลือกบ่อยกว่าแต่ตัวรองยังมีลุ้น */
export function weightedPick(
  candidates: ScoredRecipe[],
  rng: () => number = Math.random,
): ScoredRecipe | null {
  if (candidates.length === 0) return null;
  const weights = candidates.map((c) => Math.pow(c.score, WEIGHT_POWER));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return candidates[i]!;
  }
  return candidates[0]!;
}

/** สุ่มใหม่ต้องไม่ได้เมนูเดิม เว้นแต่เหลือ candidate ตัวเดียว */
export function rerollPick(
  candidates: ScoredRecipe[],
  currentRecipeId: string | null,
  rng: () => number = Math.random,
): ScoredRecipe | null {
  const pool =
    currentRecipeId === null
      ? candidates
      : candidates.filter((c) => c.recipe.id !== currentRecipeId);
  return weightedPick(pool.length > 0 ? pool : candidates, rng);
}
