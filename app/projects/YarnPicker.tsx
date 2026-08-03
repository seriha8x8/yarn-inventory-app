"use client";

import { useMemo, useState } from "react";
import type { Yarn } from "@/lib/types";

type Selection = { yarn_id: string; used_count: number };

export default function YarnPicker({
  yarns,
  initialSelections,
}: {
  yarns: Yarn[];
  initialSelections: Selection[];
}) {
  const [query, setQuery] = useState("");
  const [selections, setSelections] = useState<Selection[]>(initialSelections);

  const yarnById = useMemo(() => new Map(yarns.map((y) => [y.id, y])), [yarns]);
  const selectedIds = useMemo(
    () => new Set(selections.map((s) => s.yarn_id)),
    [selections]
  );

  const candidates = yarns.filter((yarn) => {
    if (selectedIds.has(yarn.id)) return false;
    if (!query) return true;
    const haystack = `${yarn.name} ${yarn.manufacturer ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  function addYarn(yarnId: string) {
    setSelections((prev) => [...prev, { yarn_id: yarnId, used_count: 1 }]);
  }

  function removeYarn(yarnId: string) {
    setSelections((prev) => prev.filter((s) => s.yarn_id !== yarnId));
  }

  function setUsedCount(yarnId: string, count: number) {
    setSelections((prev) =>
      prev.map((s) => (s.yarn_id === yarnId ? { ...s, used_count: count } : s))
    );
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <span>使用した毛糸</span>

      {selections.length > 0 && (
        <ul className="flex flex-col gap-2">
          {selections.map((s) => {
            const yarn = yarnById.get(s.yarn_id);
            return (
              <li
                key={s.yarn_id}
                className="flex items-center justify-between gap-3 rounded-md border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <span>{yarn?.name ?? "(削除済みの毛糸)"}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    value={s.used_count}
                    onChange={(e) =>
                      setUsedCount(s.yarn_id, Number(e.target.value) || 0)
                    }
                    className="w-20 rounded-md border border-zinc-300 px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
                  />
                  <span className="text-zinc-500">玉</span>
                  <button
                    type="button"
                    onClick={() => removeYarn(s.yarn_id)}
                    className="text-red-600 hover:underline dark:text-red-400"
                  >
                    削除
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <input
        type="text"
        placeholder="毛糸を検索"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
      />
      <ul className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
        {candidates.length === 0 ? (
          <li className="px-2 py-1 text-zinc-500">該当する毛糸がありません</li>
        ) : (
          candidates.map((yarn) => (
            <li key={yarn.id}>
              <button
                type="button"
                onClick={() => addYarn(yarn.id)}
                className="w-full rounded-md px-2 py-1 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                {yarn.name}
                {yarn.manufacturer ? ` (${yarn.manufacturer})` : ""}
              </button>
            </li>
          ))
        )}
      </ul>

      <input
        type="hidden"
        name="yarn_selections"
        value={JSON.stringify(selections)}
      />
    </div>
  );
}
