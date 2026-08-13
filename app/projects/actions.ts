"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, getUserPlan } from "@/lib/auth";
import { canAddPhoto } from "@/lib/plan";
import { uploadPhoto, deletePhoto } from "@/lib/photos";

export type ProjectFormState = {
  error: string | null;
  upgradeRequired?: boolean;
  success?: boolean;
  createdTitle?: string;
};

type Selection = { yarn_id: string; used_count: number };

function parseSelections(formData: FormData): Selection[] {
  const raw = String(formData.get("yarn_selections") ?? "[]");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is Selection =>
          item && typeof item.yarn_id === "string"
      )
      .map((item) => ({
        yarn_id: item.yarn_id,
        used_count: Math.max(0, Number(item.used_count) || 0),
      }));
  } catch {
    return [];
  }
}

async function decrementStock(
  supabase: SupabaseClient,
  userId: string,
  selections: Selection[]
) {
  for (const selection of selections) {
    const { data: yarn } = await supabase
      .from("yarns")
      .select("stock_count")
      .eq("id", selection.yarn_id)
      .eq("user_id", userId)
      .single();

    if (!yarn) continue;

    await supabase
      .from("yarns")
      .update({
        stock_count: Math.max(0, yarn.stock_count - selection.used_count),
      })
      .eq("id", selection.yarn_id)
      .eq("user_id", userId);
  }
}

export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const madeOn = String(formData.get("made_on") ?? "").trim() || null;

  if (!title) {
    return { error: "作品名は必須です" };
  }

  const selections = parseSelections(formData);

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ title, made_on: madeOn, user_id: user.id })
    .select()
    .single();

  if (error || !project) {
    return { error: error?.message ?? "登録に失敗しました" };
  }

  if (selections.length > 0) {
    await supabase.from("project_yarns").insert(
      selections.map((s) => ({
        project_id: project.id,
        yarn_id: s.yarn_id,
        used_count: s.used_count,
      }))
    );

    if (formData.get("decrement_stock") === "on") {
      await decrementStock(supabase, user.id, selections);
    }
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const path = `${user.id}/projects/${project.id}`;
    await uploadPhoto(supabase, path, photo);
    await supabase
      .from("projects")
      .update({ photo_url: path })
      .eq("id", project.id);
  }

  revalidatePath("/projects");
  revalidatePath("/yarns");
  return { error: null, success: true, createdTitle: title };
}

export async function updateProject(
  projectId: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const madeOn = String(formData.get("made_on") ?? "").trim() || null;

  if (!title) {
    return { error: "作品名は必須です" };
  }

  const { data: existing } = await supabase
    .from("projects")
    .select("photo_url")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { error: "作品メモが見つかりません" };
  }

  const removePhoto = formData.get("remove_photo") === "on";
  const photo = formData.get("photo");
  const hasNewPhoto = photo instanceof File && photo.size > 0;

  if (hasNewPhoto && !removePhoto && existing.photo_url) {
    const plan = await getUserPlan(supabase, user.id);
    if (!canAddPhoto(plan, 1)) {
      return { error: null, upgradeRequired: true };
    }
  }

  let photo_url: string | null = existing.photo_url;

  if (removePhoto && photo_url) {
    await deletePhoto(supabase, photo_url);
    photo_url = null;
  }

  if (hasNewPhoto) {
    const path = `${user.id}/projects/${projectId}`;
    await uploadPhoto(supabase, path, photo as File);
    photo_url = path;
  }

  const selections = parseSelections(formData);

  await supabase.from("project_yarns").delete().eq("project_id", projectId);
  if (selections.length > 0) {
    await supabase.from("project_yarns").insert(
      selections.map((s) => ({
        project_id: projectId,
        yarn_id: s.yarn_id,
        used_count: s.used_count,
      }))
    );

    if (formData.get("decrement_stock") === "on") {
      await decrementStock(supabase, user.id, selections);
    }
  }

  const { error } = await supabase
    .from("projects")
    .update({ title, made_on: madeOn, photo_url })
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/yarns");
  redirect(`/projects/${projectId}`);
}

export async function deleteProject(projectId: string) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("projects")
    .select("photo_url")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (existing?.photo_url) {
    await deletePhoto(supabase, existing.photo_url);
  }

  await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  revalidatePath("/projects");
  redirect("/projects");
}
