import { seedCatalog, type Catalog } from '@fridgechef/shared';
import { db } from './db.ts';

/** ตู้เย็นเริ่มต้นตามสเปก — ให้ลองกดสุ่มได้ทันทีตั้งแต่ครั้งแรก */
const DEFAULT_FRIDGE_IDS = ['chicken', 'holy-basil', 'chili', 'garlic'];

/** เขียนคลังทับทั้งชุดใน transaction เดียว (ADR 0003: full snapshot) */
export async function applyCatalog(catalog: Catalog): Promise<void> {
  await db.transaction('rw', [db.ingredients, db.recipes, db.fridge, db.meta], async () => {
    await db.ingredients.clear();
    await db.recipes.clear();
    await db.ingredients.bulkAdd(catalog.ingredients);
    await db.recipes.bulkAdd(catalog.recipes);
    // ล้างของในตู้เย็นที่ไม่มีในแคตตาล็อกแล้ว
    const valid = new Set(catalog.ingredients.map((i) => i.id));
    const fridgeIds = await db.fridge.toCollection().primaryKeys();
    await db.fridge.bulkDelete(fridgeIds.filter((id) => !valid.has(id)));
    await db.meta.put({ key: 'catalogUpdatedAt', value: catalog.updatedAt });
  });
}

/** first run: ยังไม่มีคลังในเครื่อง → ใช้ seed ที่ฝังมากับ bundle ก่อน แล้วค่อย sync ทับ */
export async function ensureSeeded(): Promise<void> {
  const count = await db.recipes.count();
  if (count > 0) return;
  await applyCatalog(seedCatalog);
  await db.fridge.bulkPut(DEFAULT_FRIDGE_IDS.map((id) => ({ id })));
}

/** ดึง snapshot จาก API — เงียบๆ ถ้าออฟไลน์/ล้มเหลว เพราะแอปใช้ของใน IndexedDB ได้เสมอ */
export async function syncCatalog(): Promise<void> {
  try {
    const res = await fetch('/api/catalog');
    if (!res.ok) return;
    const catalog = (await res.json()) as Catalog;
    const current = await db.meta.get('catalogUpdatedAt');
    if (current?.value === catalog.updatedAt) return;
    await applyCatalog(catalog);
  } catch {
    // ออฟไลน์อยู่ — ไว้ค่อย sync รอบหน้า
  }
}
