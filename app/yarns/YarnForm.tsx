"use client";

import { useActionState, useState } from "react";
import type { Yarn } from "@/lib/types";
import type { YarnFormState } from "./actions";
import PhotoField from "@/components/PhotoField";
import UpgradeModal from "@/components/UpgradeModal";

const initialState: YarnFormState = { error: null };

const fieldClass =
  "rounded-md border border-stone-300 px-3 py-2 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-rose-900/40";

export default function YarnForm({
  yarn,
  photoUrl,
  action,
}: {
  yarn?: Yarn;
  photoUrl: string | null;
  action: (
    prevState: YarnFormState,
    formData: FormData
  ) => Promise<YarnFormState>;
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
          名前
          <input
            name="name"
            required
            defaultValue={yarn?.name}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          色
          <input
            name="color"
            defaultValue={yarn?.color ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          メーカー／ショップ
          <input
            name="manufacturer"
            defaultValue={yarn?.manufacturer ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          素材
          <input
            name="material"
            defaultValue={yarn?.material ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          太さ
          <input
            name="thickness"
            defaultValue={yarn?.thickness ?? ""}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          在庫数（玉）
          <input
            type="number"
            name="stock_count"
            min={0}
            defaultValue={yarn?.stock_count ?? 0}
            className={fieldClass}
          />
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
          className="rounded-md bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {pending ? "保存中..." : "保存"}
        </button>
      </form>
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </>
  );
}
