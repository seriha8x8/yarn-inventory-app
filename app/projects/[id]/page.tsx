import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPhotoUrl } from "@/lib/photos";
import ProjectForm from "../ProjectForm";
import { updateProject, deleteProject } from "../actions";
import DeleteButton from "@/components/DeleteButton";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    notFound();
  }

  const [{ data: usages }, { data: yarns }] = await Promise.all([
    supabase
      .from("project_yarns")
      .select("id, used_count, yarn:yarns(id, name, manufacturer)")
      .eq("project_id", id)
      .returns<
        {
          id: string;
          used_count: number;
          yarn: { id: string; name: string; manufacturer: string | null } | null;
        }[]
      >(),
    supabase.from("yarns").select("*").eq("user_id", user.id).order("name"),
  ]);

  const photoUrl = getPhotoUrl(supabase, project.photo_url);
  const updateProjectWithId = updateProject.bind(null, project.id);
  const deleteProjectWithId = deleteProject.bind(null, project.id);
  const initialSelections = (usages ?? []).map((usage) => ({
    yarn_id: usage.yarn?.id ?? "",
    used_count: usage.used_count,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{project.title}</h1>
        <DeleteButton
          action={deleteProjectWithId}
          confirmMessage="この作品メモを削除しますか？"
        />
      </div>

      <ProjectForm
        project={project}
        photoUrl={photoUrl}
        yarns={yarns ?? []}
        initialSelections={initialSelections}
        action={updateProjectWithId}
      />

      <section className="flex flex-col gap-3">
        <h2 className="border-l-4 border-violet-300 pl-3 text-lg font-semibold">
          使用した毛糸
        </h2>
        {!usages || usages.length === 0 ? (
          <p className="text-sm text-stone-500 dark:text-stone-400">
            使用した毛糸がありません。
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {usages.map((usage) => (
              <li key={usage.id}>
                <Link
                  href={`/yarns/${usage.yarn?.id}`}
                  className="flex items-center justify-between rounded-md border border-rose-100 px-4 py-3 hover:border-rose-300 hover:bg-rose-50/70 dark:border-rose-950/60 dark:hover:border-rose-800 dark:hover:bg-rose-950/20"
                >
                  <span>
                    {usage.yarn?.name}
                    {usage.yarn?.manufacturer ? ` (${usage.yarn.manufacturer})` : ""}
                  </span>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
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
