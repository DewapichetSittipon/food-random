/** กลุ่มของวัตถุดิบ ใช้จัดหมวด chips ในหน้าเลือก */
export type IngredientGroup = 'protein' | 'vegetable' | 'carb';

export const INGREDIENT_GROUP_NAMES: Record<IngredientGroup, string> = {
  protein: 'โปรตีน',
  vegetable: 'ผักและสมุนไพร',
  carb: 'คาร์โบไฮเดรต',
};

export const INGREDIENT_GROUP_ORDER: IngredientGroup[] = ['protein', 'vegetable', 'carb'];

/** วัตถุดิบ — ตัวตนถาวรเป็น slug id คู่กับชื่อไทยสำหรับแสดงผล (ดู CONTEXT.md) */
export interface Ingredient {
  id: string;
  name: string;
  group: IngredientGroup;
  sortOrder: number;
}

/** เครื่องปรุงของครัว — แสดงในหน้าวิธีทำเท่านั้น ไม่คิดคะแนน matching */
export interface Seasoning {
  name: string;
  amount: string;
}

/** เมนูหนึ่งจานพร้อมวิธีทำ (รูปแบบ denormalized ที่ client ใช้) */
export interface Recipe {
  id: string;
  name: string;
  /** ชื่อแม่แบบร่วม เช่น "ผัดกะเพรา" — UI แสดงเป็น "แม่แบบ · ผัดกะเพรา" */
  template: string;
  category: string;
  difficulty: 1 | 2 | 3;
  /** นาที */
  cookTime: number;
  servings: number;
  /** วัตถุดิบหลักทั้งหมดที่ใช้คิดคะแนน */
  coreIngredientIds: string[];
  /** วัตถุดิบบังคับ (subset ของ core) — ขาดตัวใดตัวหนึ่ง เมนูถูกกรองทิ้ง */
  requiredIngredientIds: string[];
  /** โปรตีนหลัก (subset ของ core) — มีอย่างน้อยหนึ่งตัวได้โบนัสคะแนน */
  proteinIngredientIds: string[];
  seasonings: Seasoning[];
  steps: string[];
  tags: string[];
  /** ISO timestamp สำหรับใช้เป็น ETag ของทั้งคลัง */
  updatedAt: string;
}

/** คลังทั้งก้อนที่ sync ระหว่าง API ↔ IndexedDB (ADR 0003: full snapshot) */
export interface Catalog {
  ingredients: Ingredient[];
  recipes: Recipe[];
  /** ค่า updatedAt สูงสุดในคลัง — ใช้เทียบว่ามีอะไรใหม่ไหมก่อนเขียนทับ */
  updatedAt: string;
}

export function difficultyLabel(d: Recipe['difficulty']): string {
  return d === 1 ? 'ง่ายมาก' : d === 2 ? 'ปานกลาง' : 'ท้าทาย';
}
