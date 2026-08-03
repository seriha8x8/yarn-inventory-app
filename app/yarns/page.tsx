import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getPhotoUrl } from "@/lib/photos";

type YarnSearchParams = {
  q?: string;
  color?: string;
  manufacturer?: string;
  material?: string;
  thickness?: string;
};

function uniqueValues(
  rows: Record<string, unknown>[] | null,
  key: string
): string[] {
  if (!rows) return [];
  const values = new Set<string>();
  for (const row of rows) {
    const value = row[key];
    if (typeof value === "string" && value) values.add(value);
  }
  return Array.from(values).sort();
}

export default async function YarnsPage({
  searchParams,
}: {
  searchParams: Promise<YarnSearchParams>;
}) {
  const params = await searchParams;
  const { supabase, user } = await requireUser();

  let query = supabase
    .from("yarns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (params.q) {
    const q = `%${params.q}%`;
    query = query.or(`name.ilike.${q},manufacturer.ilike.${q}`);
  }
  if (params.color) query = query.eq("color", params.color);
  if (params.manufacturer) query = query.eq("manufacturer", params.manufacturer);
  if (params.material) query = query.eq("material", params.material);
  if (params.thickness) query = query.eq("thickness", params.thickness);

  const [{ data: yarns }, { data: allYarns }] = await Promise.all([
    query,
    supabase
      .from("yarns")
      .select("color, manufacturer, material, thickness")
      .eq("user_id", user.id),
  ]);

  const options = {
    color: uniqueValues(allYarns, "color"),
    manufacturer: uniqueValues(allYarns, "manufacturer"),
    material: uniqueValues(allYarns, "material"),
    thickness: uniqueValues(allYarns, "thickness"),
  };

  const selectClass =
    "rounded-md border border-stone-300 px-2 py-1.5 text-sm dark:border-stone-700 dark:bg-stone-900";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">毛糸一覧</h1>
        <Link
          href="/yarns/new"
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          + 毛糸を登録
        </Link>
      </div>

      <form className="flex flex-wrap items-end gap-3" method="get">
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          フリーワード検索
          <input
            type="text"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="名前・メーカー名"
            className={selectClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          色
          <select
            name="color"
            defaultValue={params.color ?? ""}
            className={selectClass}
          >
            <option value="">すべて</option>
            {options.color.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          メーカー
          <select
            name="manufacturer"
            defaultValue={params.manufacturer ?? ""}
            className={selectClass}
          >
            <option value="">すべて</option>
            {options.manufacturer.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          素材
          <select
            name="material"
            defaultValue={params.material ?? ""}
            className={selectClass}
          >
            <option value="">すべて</option>
            {options.material.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-stone-500">
          太さ
          <select
            name="thickness"
            defaultValue={params.thickness ?? ""}
            className={selectClass}
          >
            <option value="">すべて</option>
            {options.thickness.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md border border-violet-300 px-3 py-1.5 text-sm text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-950/30"
        >
          絞り込む
        </button>
        <Link
          href="/yarns"
          className="text-sm text-rose-600 underline dark:text-rose-400"
        >
          リセット
        </Link>
      </form>

      {!yarns || yarns.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          該当する毛糸がありません。
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {yarns.map((yarn) => (
            <li key={yarn.id}>
              <Link
                href={`/yarns/${yarn.id}`}
                className="flex flex-col gap-2 rounded-lg border border-stone-200 p-4 hover:border-rose-200 hover:bg-rose-50/70 dark:border-stone-800 dark:hover:border-rose-900 dark:hover:bg-rose-950/20"
              >
                {yarn.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getPhotoUrl(supabase, yarn.photo_url) ?? undefined}
                    alt={yarn.name}
                    className="h-32 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded-md bg-violet-50 text-xs text-violet-400 dark:bg-violet-950/30 dark:text-violet-500">
                    写真なし
                  </div>
                )}
                <span className="font-medium">{yarn.name}</span>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  {[yarn.color, yarn.manufacturer, yarn.material, yarn.thickness]
                    .filter(Boolean)
                    .join(" / ")}
                </span>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  在庫: {yarn.stock_count}玉
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
