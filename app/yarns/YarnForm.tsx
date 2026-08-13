"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  if (state !== handledState) {
    setHandledState(state);
    if (state.upgradeRequired) setUpgradeOpen(true);
    if (state.success) {
      setSuccessMessage(
        `「${state.createdName}」を登録しました。続けて登録できます。`
      );
      setFormKey((k) => k + 1);
    }
  }

  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  return (
    <>
      {successMessage && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
          <span>{successMessage}</span>
          <Link href="/yarns" className="whitespace-nowrap font-medium underline">
            一覧を見る
          </Link>
        </div>
      )}
      <form key={formKey} action={formAction} className="flex max-w-lg flex-col gap-4">
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
