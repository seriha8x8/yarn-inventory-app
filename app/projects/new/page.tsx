import { requireUser } from "@/lib/auth";
import ProjectForm from "../ProjectForm";
import { createProject } from "../actions";

export default async function NewProjectPage() {
  const { supabase, user } = await requireUser();

  const { data: yarns } = await supabase
    .from("yarns")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">作品メモを登録</h1>
      <ProjectForm
        photoUrl={null}
        yarns={yarns ?? []}
        initialSelections={[]}
        action={createProject}
      />
    </div>
  );
}
