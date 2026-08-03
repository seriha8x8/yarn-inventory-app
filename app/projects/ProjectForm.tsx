"use client";

import { useActionState, useState } from "react";
import type { Project, Yarn } from "@/lib/types";
import type { ProjectFormState } from "./actions";
import PhotoField from "@/components/PhotoField";
import UpgradeModal from "@/components/UpgradeModal";
import YarnPicker from "./YarnPicker";

const initialState: ProjectFormState = { error: null };

const fieldClass =
  "rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

export default function ProjectForm({
  project,
  photoUrl,
  yarns,
  initialSelections,
  action,
}: {
  project?: Project;
  photoUrl: string | null;
  yarns: Yarn[];
  initialSelections: { yarn_id: string; used_count: number }[];
  action: (
    prevState: ProjectFormState,
    formData: FormData
  ) => Promise<ProjectFormState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [handledState, setHandledState] = useState(state);

  if (state !== handledState) {
    setHandledState(state);
    if (state.upgradeRequired) setUpgradeOpen(true);
  }

  return (
    <>
      <form action={formAction} className="flex max-w-lg flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          作品名／メモ
          <input
            name="title"
            required
            defaultValue={project?.title}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          作った日
          <input
            type="date"
            name="made_on"
            defaultValue={project?.made_on ?? ""}
            className={fieldClass}
          />
        </label>

        <YarnPicker yarns={yarns} initialSelections={initialSelections} />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="decrement_stock" />
          使用した毛糸の在庫数を自動で減らす
        </label>

        <PhotoField
          existingPhotoUrl={photoUrl}
          onAttemptBlocked={() => setUpgradeOpen(true)}
        />

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {pending ? "保存中..." : "保存"}
        </button>
      </form>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
