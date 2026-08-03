import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPhotoUrl } from "@/lib/photos";
import YarnForm from "../YarnForm";
import { updateYarn, deleteYarn } from "../actions";
import DeleteButton from "@/components/DeleteButton";

export default async function YarnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: yarn } = await supabase
    .from("yarns")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!yarn) {
    notFound();
  }

  const { data: usages } = await supabase
    .from("project_yarns")
    .select("id, used_count, project:projects(id, title, made_on)")
    .eq("yarn_id", id)
    .returns<
      {
        id: string;
        used_count: number;
        project: { id: string; title: string; made_on: string | null } | null;
      }[]
    >();

  const photoUrl = getPhotoUrl(supabase, yarn.photo_url);
  const updateYarnWithId = updateYarn.bind(null, yarn.id);
  const deleteYarnWithId = deleteYarn.bind(null, yarn.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{yarn.name}</h1>
        <DeleteButton
          action={deleteYarnWithId}
          confirmMessage="この毛糸を削除しますか？"
        />
      </div>

      <YarnForm yarn={yarn} photoUrl={photoUrl} action={updateYarnWithId} />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">この毛糸を使った作品メモ</h2>
        {!usages || usages.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            まだ作品メモがありません。
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {usages.map((usage) => (
              <li key={usage.id}>
                <Link
                  href={`/projects/${usage.project?.id}`}
                  className="flex items-center justify-between rounded-md border border-stone-200 px-4 py-3 hover:border-rose-200 hover:bg-rose-50/70 dark:border-stone-800 dark:hover:border-rose-900 dark:hover:bg-rose-950/20"
                >
                  <span>{usage.project?.title}</span>
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    使用: {usage.used_count}玉
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
