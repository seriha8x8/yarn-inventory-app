"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser, getUserPlan } from "@/lib/auth";
import { canAddPhoto } from "@/lib/plan";
import { uploadPhoto, deletePhoto } from "@/lib/photos";

export type YarnFormState = {
  error: string | null;
  upgradeRequired?: boolean;
};

function parseYarnFields(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim() || null,
    manufacturer: String(formData.get("manufacturer") ?? "").trim() || null,
    material: String(formData.get("material") ?? "").trim() || null,
    thickness: String(formData.get("thickness") ?? "").trim() || null,
    stock_count: Math.max(0, Number(formData.get("stock_count") ?? 0) || 0),
  };
}

export async function createYarn(
  _prevState: YarnFormState,
  formData: FormData
): Promise<YarnFormState> {
  const { supabase, user } = await requireUser();
  const fields = parseYarnFields(formData);

  if (!fields.name) {
    return { error: "名前は必須です" };
  }

  const { data: yarn, error } = await supabase
    .from("yarns")
    .insert({ ...fields, user_id: user.id })
    .select()
    .single();

  if (error || !yarn) {
    return { error: error?.message ?? "登録に失敗しました" };
  }

  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const path = `${user.id}/yarns/${yarn.id}`;
    await uploadPhoto(supabase, path, photo);
    await supabase.from("yarns").update({ photo_url: path }).eq("id", yarn.id);
  }

  revalidatePath("/yarns");
  redirect(`/yarns/${yarn.id}`);
}

export async function updateYarn(
  yarnId: string,
  _prevState: YarnFormState,
  formData: FormData
): Promise<YarnFormState> {
  const { supabase, user } = await requireUser();
  const fields = parseYarnFields(formData);

  if (!fields.name) {
    return { error: "名前は必須です" };
  }

  const { data: existing } = await supabase
    .from("yarns")
    .select("photo_url")
    .eq("id", yarnId)
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    return { error: "毛糸が見つかりません" };
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
    const path = `${user.id}/yarns/${yarnId}`;
    await uploadPhoto(supabase, path, photo as File);
    photo_url = path;
  }

  const { error } = await supabase
    .from("yarns")
    .update({ ...fields, photo_url })
    .eq("id", yarnId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/yarns");
  revalidatePath(`/yarns/${yarnId}`);
  redirect(`/yarns/${yarnId}`);
}

export async function deleteYarn(yarnId: string) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("yarns")
    .select("photo_url")
    .eq("id", yarnId)
    .eq("user_id", user.id)
    .single();

  if (existing?.photo_url) {
    await deletePhoto(supabase, existing.photo_url);
  }

  await supabase
    .from("yarns")
    .delete()
    .eq("id", yarnId)
    .eq("user_id", user.id);

  revalidatePath("/yarns");
  redirect("/yarns");
}
