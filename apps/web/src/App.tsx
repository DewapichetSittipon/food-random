import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getCandidates, randomPick, rerollPick, type Recipe } from '@fridgechef/shared';
import { db } from './db.ts';
import ResultScreen from './screens/ResultScreen.tsx';
import SelectScreen from './screens/SelectScreen.tsx';

interface ResultState {
  picked: Recipe;
  /** candidates ณ ตอนกดสุ่ม — ใช้เป็นตัวเลือกสำรองบนหน้าผลลัพธ์ */
  candidates: Recipe[];
}

export default function App() {
  const ingredients = useLiveQuery(() => db.ingredients.toArray());
  const recipes = useLiveQuery(() => db.recipes.toArray());
  const fridgeItems = useLiveQuery(() => db.fridge.toArray());
  const [result, setResult] = useState<ResultState | null>(null);

  const fridgeIds = useMemo(() => new Set((fridgeItems ?? []).map((f) => f.id)), [fridgeItems]);
  const candidates = useMemo(() => getCandidates(recipes ?? [], fridgeIds), [recipes, fridgeIds]);

  if (!ingredients || !recipes || !fridgeItems) return null;

  const toggle = (id: string) => {
    void (fridgeIds.has(id) ? db.fridge.delete(id) : db.fridge.put({ id }));
  };

  const randomize = () => {
    const picked = randomPick(candidates);
    if (picked) setResult({ picked, candidates });
  };

  const reroll = () => {
    if (!result) return;
    const picked = rerollPick(result.candidates, result.picked.id);
    if (picked) setResult({ picked, candidates: result.candidates });
  };

  return result ? (
    <ResultScreen
      result={result.picked}
      candidates={result.candidates}
      onPick={(c) => setResult({ picked: c, candidates: result.candidates })}
      onReroll={reroll}
      onBack={() => setResult(null)}
    />
  ) : (
    <SelectScreen
      ingredients={ingredients}
      fridgeIds={fridgeIds}
      matchCount={candidates.length}
      onToggle={toggle}
      onRandom={randomize}
    />
  );
}
