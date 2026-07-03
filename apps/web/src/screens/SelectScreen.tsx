import {
  INGREDIENT_GROUP_NAMES,
  INGREDIENT_GROUP_ORDER,
  type Ingredient,
} from '@fridgechef/shared';

interface Props {
  ingredients: Ingredient[];
  fridgeIds: ReadonlySet<string>;
  matchCount: number;
  onToggle: (id: string) => void;
  onRandom: () => void;
}

export default function SelectScreen({
  ingredients,
  fridgeIds,
  matchCount,
  onToggle,
  onRandom,
}: Props) {
  const groups = INGREDIENT_GROUP_ORDER.map((key) => ({
    key,
    name: INGREDIENT_GROUP_NAMES[key],
    items: ingredients
      .filter((i) => i.group === key)
      .sort((a, b) => a.sortOrder - b.sortOrder),
  })).filter((g) => g.items.length > 0);

  const canRandom = matchCount > 0;

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col">
      <header className="px-6 pt-12 pb-3">
        <div className="text-[13px] font-medium text-ink-muted">ตู้เย็นของคุณ</div>
        <h1 className="mt-0.5 font-display text-2xl font-semibold leading-tight">
          มีอะไรอยู่บ้าง?
        </h1>
        <div className="mt-1.5 text-[13px] text-ink-muted">
          เลือก <b className="text-brand">{fridgeIds.size}</b> อย่างแล้ว · เจอ{' '}
          <b className="text-ok">{matchCount}</b> เมนู
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32">
        {groups.map((g) => (
          <section key={g.key} className="mt-5">
            <h2 className="mb-3 text-xs font-semibold tracking-wider text-ink-faint uppercase">
              {g.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              {g.items.map((item) => {
                const selected = fridgeIds.has(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onToggle(item.id)}
                    className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] px-3.5 text-sm font-medium transition-colors ${
                      selected
                        ? 'border-brand bg-brand text-white'
                        : 'border-chip-line bg-white text-ink-soft'
                    }`}
                  >
                    <span
                      className={`size-[7px] rounded-full ${selected ? 'bg-white' : 'bg-line'}`}
                    />
                    {item.name}
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 mx-auto max-w-md bg-gradient-to-t from-surface from-60% to-transparent px-6 pt-4 pb-7">
        <button
          type="button"
          onClick={onRandom}
          disabled={!canRandom}
          className={`pointer-events-auto flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl font-display text-[17px] font-semibold text-white ${
            canRandom
              ? 'shadow-brand/40 cursor-pointer bg-brand shadow-lg'
              : 'bg-ink-muted/50'
          }`}
        >
          <span className="text-[19px]">🎲</span>
          {canRandom ? `สุ่มเมนู (${matchCount} ตัวเลือก)` : 'เลือกวัตถุดิบก่อน'}
        </button>
      </div>
    </div>
  );
}
