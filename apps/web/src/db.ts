import Dexie, { type EntityTable } from 'dexie';
import type { Ingredient, Recipe } from '@fridgechef/shared';

/** วัตถุดิบหนึ่งชิ้นใน "ตู้เย็น" ของผู้ใช้ (CONTEXT.md: Fridge) — เก็บเฉพาะในเครื่อง */
export interface FridgeItem {
  id: string;
}

export interface MetaEntry {
  key: string;
  value: string;
}

export const db = new Dexie('fridgechef') as Dexie & {
  ingredients: EntityTable<Ingredient, 'id'>;
  recipes: EntityTable<Recipe, 'id'>;
  fridge: EntityTable<FridgeItem, 'id'>;
  meta: EntityTable<MetaEntry, 'key'>;
};

db.version(1).stores({
  ingredients: 'id, group',
  recipes: 'id',
  fridge: 'id',
  meta: 'key',
});
