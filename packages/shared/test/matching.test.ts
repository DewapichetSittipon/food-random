import { describe, expect, it } from 'vitest';
import {
  MAX_CANDIDATES,
  MIN_COVERAGE,
  getCandidates,
  rerollPick,
  scoreRecipe,
  seedIngredients,
  seedRecipes,
  weightedPick,
} from '../src/index.ts';

const recipeById = (id: string) => {
  const r = seedRecipes.find((r) => r.id === id);
  if (!r) throw new Error(`ไม่พบเมนู ${id} ใน seed`);
  return r;
};

describe('scoreRecipe', () => {
  it('คืน null เมื่อขาดวัตถุดิบบังคับ (กะเพราไก่ไม่มีใบกะเพรา)', () => {
    const fridge = new Set(['chicken', 'chili', 'garlic']);
    expect(scoreRecipe(recipeById('pad-kra-pao-gai'), fridge)).toBeNull();
  });

  it('วัตถุดิบครบ = coverage 1 และได้โบนัสโปรตีน (100 + 10)', () => {
    const fridge = new Set(['chicken', 'holy-basil', 'chili', 'garlic']);
    const scored = scoreRecipe(recipeById('pad-kra-pao-gai'), fridge);
    expect(scored).not.toBeNull();
    expect(scored!.coverage).toBe(1);
    expect(scored!.score).toBe(110);
    expect(scored!.missingIds).toEqual([]);
  });

  it('หักคะแนนตามวัตถุดิบที่ขาด และไม่ได้โบนัสถ้าไม่มีโปรตีนตรง', () => {
    // หมูผัดกระเทียม: core = [pork, garlic], มีแค่ garlic → coverage 0.5, ไม่มีโบนัส, หัก 4
    const fridge = new Set(['chicken', 'holy-basil', 'chili', 'garlic']);
    const scored = scoreRecipe(recipeById('moo-pad-kratiam'), fridge);
    expect(scored).not.toBeNull();
    expect(scored!.coverage).toBe(0.5);
    expect(scored!.score).toBe(50 - 4);
    expect(scored!.missingIds).toEqual(['pork']);
  });

  it('เมนูไม่มีโปรตีน (ผัดผักบุ้ง) ได้โบนัสเสมอ', () => {
    const fridge = new Set(['morning-glory', 'garlic', 'chili']);
    const scored = scoreRecipe(recipeById('pad-pak-boong'), fridge);
    expect(scored!.score).toBe(110);
  });
});

describe('getCandidates', () => {
  it('สถานการณ์ตามสเปก: ไก่+กะเพรา+พริก+กระเทียม → กะเพราไก่คะแนนสูงสุด และมีไก่ผัดกระเทียมเข้ารอบ', () => {
    const cands = getCandidates(seedRecipes, ['chicken', 'holy-basil', 'chili', 'garlic']);
    expect(cands.length).toBeGreaterThan(0);
    const ids = cands.map((c) => c.recipe.id);
    expect(cands[0]!.score).toBe(110);
    expect(ids.slice(0, 2)).toContain('pad-kra-pao-gai');
    expect(ids).toContain('gai-pad-kratiam');
    // เรียงคะแนนมาก → น้อยเสมอ
    for (let i = 1; i < cands.length; i++) {
      expect(cands[i - 1]!.score).toBeGreaterThanOrEqual(cands[i]!.score);
    }
  });

  it(`ตัดเมนูที่ coverage < ${MIN_COVERAGE} ทิ้ง`, () => {
    // ต้มยำกุ้ง core 7 ตัว มีแค่กุ้ง (required ผ่าน) → coverage 1/7 ต้องไม่เข้ารอบ
    const cands = getCandidates(seedRecipes, ['shrimp']);
    expect(cands.map((c) => c.recipe.id)).not.toContain('tom-yum-goong');
  });

  it(`เลือกทุกอย่างในตู้เย็น → เข้ารอบไม่เกิน ${MAX_CANDIDATES} เมนู`, () => {
    const all = seedIngredients.map((i) => i.id);
    const cands = getCandidates(seedRecipes, all);
    expect(cands.length).toBe(MAX_CANDIDATES);
  });
});

describe('weightedPick', () => {
  const cands = getCandidates(seedRecipes, ['chicken', 'holy-basil', 'chili', 'garlic']);

  it('rng=0 ได้ตัวแรกเสมอ, rng ใกล้ 1 ได้ตัวท้ายๆ', () => {
    expect(weightedPick(cands, () => 0)!.recipe.id).toBe(cands[0]!.recipe.id);
    expect(weightedPick(cands, () => 0.999999)!.recipe.id).toBe(
      cands[cands.length - 1]!.recipe.id,
    );
  });

  it('คืน null เมื่อไม่มี candidate', () => {
    expect(weightedPick([], () => 0.5)).toBeNull();
  });
});

describe('rerollPick', () => {
  const cands = getCandidates(seedRecipes, ['chicken', 'holy-basil', 'chili', 'garlic']);

  it('สุ่มใหม่ไม่ได้เมนูเดิม เมื่อมี candidate มากกว่า 1', () => {
    const current = cands[0]!.recipe.id;
    for (let i = 0; i < 50; i++) {
      const picked = rerollPick(cands, current, Math.random);
      expect(picked!.recipe.id).not.toBe(current);
    }
  });

  it('เหลือ candidate ตัวเดียว → ยอมคืนตัวเดิม', () => {
    const only = [cands[0]!];
    const picked = rerollPick(only, cands[0]!.recipe.id, () => 0.5);
    expect(picked!.recipe.id).toBe(cands[0]!.recipe.id);
  });
});

describe('ความสอดคล้องของ seed', () => {
  const ingredientIds = new Set(seedIngredients.map((i) => i.id));

  it('ทุกการอ้างอิงวัตถุดิบในสูตรต้องมีอยู่จริงในแคตตาล็อก', () => {
    for (const r of seedRecipes) {
      for (const id of r.coreIngredientIds) expect(ingredientIds.has(id)).toBe(true);
    }
  });

  it('required และ protein ต้องเป็น subset ของ core เสมอ', () => {
    for (const r of seedRecipes) {
      const core = new Set(r.coreIngredientIds);
      for (const id of r.requiredIngredientIds) expect(core.has(id)).toBe(true);
      for (const id of r.proteinIngredientIds) expect(core.has(id)).toBe(true);
    }
  });
});
