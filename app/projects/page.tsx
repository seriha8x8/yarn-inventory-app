import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getPhotoUrl } from "@/lib/photos";

export default async function ProjectsPage() {
  const { supabase, user } = await requireUser();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("made_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="border-l-4 border-rose-400 pl-3 text-xl font-semibold">
          作品メモ一覧
        </h1>
        <Link
          href="/projects/new"
          className="rounded-md bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700"
        >
          + 作品メモを登録
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <p className="text-sm text-stone-500 dark:text-stone-400">
          まだ作品メモがありません。
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="flex flex-col gap-2 rounded-lg border border-rose-100 p-4 hover:border-rose-300 hover:bg-rose-50/70 dark:border-rose-950/60 dark:hover:border-rose-800 dark:hover:bg-rose-950/20"
              >
                {project.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getPhotoUrl(supabase, project.photo_url) ?? undefined}
                    alt={project.title}
                    className="h-32 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-full items-center justify-center rounded-md bg-pink-50 text-xs text-pink-400 dark:bg-pink-950/30 dark:text-pink-500">
                    写真なし
                  </div>
                )}
                <span className="font-medium">{project.title}</span>
                {project.made_on && (
                  <span className="w-fit rounded-full bg-pink-50 px-2 py-0.5 text-xs text-pink-700 dark:bg-pink-950/40 dark:text-pink-300">
                    {project.made_on}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
