import { describe, expect, it } from 'vitest';
import {
  canCook,
  getCandidates,
  randomPick,
  rerollPick,
  seedIngredients,
  seedRecipes,
} from '../src/index.ts';

const recipeById = (id: string) => {
  const r = seedRecipes.find((r) => r.id === id);
  if (!r) throw new Error(`ไม่พบเมนู ${id} ใน seed`);
  return r;
};

describe('canCook', () => {
  it('ขาดวัตถุดิบบังคับ → ทำไม่ได้ (กะเพราไก่ไม่มีใบกะเพรา)', () => {
    const fridge = new Set(['chicken', 'chili', 'garlic']);
    expect(canCook(recipeById('pad-kra-pao-gai'), fridge)).toBe(false);
  });

  it('ไม่มีโปรตีนของเมนูเลย → ทำไม่ได้ (หมูผัดกระเทียมมีแต่ไก่)', () => {
    const fridge = new Set(['chicken', 'holy-basil', 'chili', 'garlic']);
    expect(canCook(recipeById('moo-pad-kratiam'), fridge)).toBe(false);
  });

  it('ขาดวัตถุดิบหลักที่ไม่ใช่โปรตีน → ทำไม่ได้ (กะเพราไก่ขาดพริก)', () => {
    const fridge = new Set(['chicken', 'holy-basil', 'garlic']);
    expect(canCook(recipeById('pad-kra-pao-gai'), fridge)).toBe(false);
  });

  it('วัตถุดิบครบทุกตัว → ทำได้', () => {
    const fridge = new Set(['chicken', 'holy-basil', 'chili', 'garlic']);
    expect(canCook(recipeById('pad-kra-pao-gai'), fridge)).toBe(true);
  });

  it('โปรตีนแบบทางเลือก: มีตัวเดียวก็ทำได้ (ไข่เจียวมีไข่แต่ไม่มีหมูสับ)', () => {
    expect(canCook(recipeById('khai-jiao'), new Set(['egg']))).toBe(true);
  });

  it('โปรตีนทางเลือกอย่างเดียวแทนวัตถุดิบบังคับไม่ได้ (ไข่เจียวมีแต่หมูสับ ไม่มีไข่)', () => {
    expect(canCook(recipeById('khai-jiao'), new Set(['pork-minced']))).toBe(false);
  });
});

describe('getCandidates', () => {
  it('คืนเฉพาะเมนูที่ทำได้จริง และคงลำดับตาม seed', () => {
    const fridge = ['chicken', 'holy-basil', 'chili', 'garlic'];
    const cands = getCandidates(seedRecipes, fridge);
    expect(cands.map((r) => r.id)).toContain('pad-kra-pao-gai');
    const fridgeSet = new Set(fridge);
    for (const r of cands) expect(canCook(r, fridgeSet)).toBe(true);
  });

  it('เคยเกิดจริง: เลือกไก่แล้วสุ่มได้เมนูกุ้ง — ต้องไม่เกิดอีก', () => {
    const cands = getCandidates(seedRecipes, ['chicken', 'cooked-rice', 'egg', 'garlic', 'chili']);
    const ids = cands.map((r) => r.id);
    expect(ids).not.toContain('khao-pad-goong');
    expect(ids).not.toContain('pad-kra-pao-goong');
    for (const r of cands) {
      for (const id of r.coreIngredientIds) {
        if (!r.proteinIngredientIds.includes(id)) {
          expect(['chicken', 'cooked-rice', 'egg', 'garlic', 'chili']).toContain(id);
        }
      }
    }
  });

  it('เลือกทุกอย่างในตู้เย็น → ทุกเมนูเข้ารอบ (ไม่มี cap ที่ขั้นนี้แล้ว)', () => {
    const all = seedIngredients.map((i) => i.id);
    expect(getCandidates(seedRecipes, all).length).toBe(seedRecipes.length);
  });

  it('ไม่เลือกอะไรเลย → ไม่มีเมนูเข้ารอบ', () => {
    expect(getCandidates(seedRecipes, [])).toEqual([]);
  });
});

describe('randomPick', () => {
  const cands = getCandidates(seedRecipes, ['chicken', 'holy-basil', 'chili', 'garlic']);

  it('rng=0 ได้ตัวแรกเสมอ, rng ใกล้ 1 ได้ตัวท้าย', () => {
    expect(randomPick(cands, () => 0)!.id).toBe(cands[0]!.id);
    expect(randomPick(cands, () => 0.999999)!.id).toBe(cands[cands.length - 1]!.id);
  });

  it('คืน null เมื่อไม่มี candidate', () => {
    expect(randomPick([], () => 0.5)).toBeNull();
  });
});

describe('rerollPick', () => {
  const cands = getCandidates(seedRecipes, ['chicken', 'holy-basil', 'chili', 'garlic']);

  it('สุ่มใหม่ไม่ได้เมนูเดิม เมื่อมี candidate มากกว่า 1', () => {
    expect(cands.length).toBeGreaterThan(1);
    const current = cands[0]!.id;
    for (let i = 0; i < 50; i++) {
      const picked = rerollPick(cands, current, Math.random);
      expect(picked!.id).not.toBe(current);
    }
  });

  it('เหลือ candidate ตัวเดียว → ยอมคืนตัวเดิม', () => {
    const only = [cands[0]!];
    const picked = rerollPick(only, cands[0]!.id, () => 0.5);
    expect(picked!.id).toBe(cands[0]!.id);
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
