import { difficultyLabel, type ScoredRecipe } from '@fridgechef/shared';

interface Props {
  result: ScoredRecipe;
  candidates: ScoredRecipe[];
  ingredientNames: ReadonlyMap<string, string>;
  onPick: (candidate: ScoredRecipe) => void;
  onReroll: () => void;
  onBack: () => void;
}

export default function ResultScreen({
  result,
  candidates,
  ingredientNames,
  onPick,
  onReroll,
  onBack,
}: Props) {
  const r = result.recipe;
  const hasMissing = result.missingIds.length > 0;

  return (
    <div className="animate-pop mx-auto flex h-dvh max-w-md flex-col">
      <header className="bg-brand px-6 pt-12 pb-6 text-white">
        <button
          type="button"
          onClick={onBack}
          className="min-h-8 cursor-pointer rounded-full bg-white/15 px-3 text-[13px]"
        >
          ‹ เลือกใหม่
        </button>
        <div className="mt-4 text-xs font-medium opacity-85">แม่แบบ · {r.template}</div>
        <h1 className="mt-0.5 font-display text-3xl font-bold leading-tight">{r.name}</h1>
        <div className="mt-3.5 flex gap-4 text-[13px] opacity-90">
          <span>⏱ {r.cookTime} นาที</span>
          <span>🔥 {difficultyLabel(r.difficulty)}</span>
          <span>👤 {r.servings} ที่</span>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pt-5 pb-8">
        <div
          className={`rounded-2xl border px-4 py-3.5 ${
            hasMissing
              ? 'border-warn-line bg-warn-soft'
              : 'border-ok-line bg-ok-soft text-ok-deep'
          }`}
        >
          <div className="text-sm font-semibold">
            {hasMissing
              ? `มีวัตถุดิบหลัก ${result.haveIds.length}/${r.coreIngredientIds.length} — ขาดอีกนิดหน่อย`
              : '✓ คุณมีวัตถุดิบหลักครบทุกอย่าง!'}
          </div>
          {hasMissing && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {result.missingIds.map((id) => (
                <span
                  key={id}
                  className="rounded-full border border-dashed border-warn-dash bg-white px-2.5 py-1 text-xs text-warn-deep"
                >
                  + {ingredientNames.get(id) ?? id}
                </span>
              ))}
            </div>
          )}
        </div>

        <section className="mt-6">
          <h2 className="mb-3 font-display text-base font-semibold">เครื่องปรุงที่ต้องใช้</h2>
          <div className="flex flex-col gap-px overflow-hidden rounded-2xl bg-line">
            {r.seasonings.map((s) => (
              <div key={s.name} className="flex items-center justify-between bg-white px-4 py-3">
                <span className="text-sm">{s.name}</span>
                <span className="font-mono text-[13px] text-ink-muted">{s.amount}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3.5 font-display text-base font-semibold">วิธีทำ</h2>
          <ol className="m-0 flex list-none flex-col gap-4 p-0">
            {r.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-[26px] shrink-0 items-center justify-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand-deep">
                  {i + 1}
                </span>
                <p className="m-0 text-sm leading-relaxed text-ink-soft">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {candidates.length > 1 && (
          <section className="mt-7 border-t border-line pt-5">
            <h2 className="mb-3 text-[13px] font-semibold text-ink-faint">
              🔀 ตัวเลือกสำรอง (แตะเพื่อสลับ)
            </h2>
            <div className="flex flex-wrap gap-2">
              {candidates.map((c) => {
                const active = c.recipe.id === r.id;
                return (
                  <button
                    key={c.recipe.id}
                    type="button"
                    onClick={() => onPick(c)}
                    className={`min-h-9 cursor-pointer rounded-full border-[1.5px] px-3 text-[12.5px] font-medium ${
                      active
                        ? 'border-brand bg-brand-soft text-brand-deep'
                        : 'border-chip-line bg-white text-ink-soft'
                    }`}
                  >
                    {c.recipe.name} · {c.score}
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

      <footer className="border-t border-line bg-surface px-6 pt-3.5 pb-7">
        <button
          type="button"
          onClick={onReroll}
          className="flex min-h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-ink font-display text-base font-semibold text-white"
        >
          🎲 สุ่มเมนูใหม่
        </button>
      </footer>
    </div>
  );
}
