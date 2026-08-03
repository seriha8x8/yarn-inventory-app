"use client";

import { useState, type ChangeEvent } from "react";

export default function PhotoField({
  existingPhotoUrl,
  onAttemptBlocked,
}: {
  existingPhotoUrl: string | null;
  onAttemptBlocked: () => void;
}) {
  const [removePhoto, setRemovePhoto] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && existingPhotoUrl && !removePhoto) {
      e.target.value = "";
      setPreview(null);
      onAttemptBlocked();
      return;
    }
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span>写真（無料プランは1枚まで）</span>

      {existingPhotoUrl && (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingPhotoUrl}
            alt=""
            className="h-24 w-24 rounded-md border border-stone-200 object-cover dark:border-stone-800"
          />
          <label className="flex items-center gap-2 text-stone-600 dark:text-stone-400">
            <input
              type="checkbox"
              name="remove_photo"
              onChange={(e) => setRemovePhoto(e.target.checked)}
            />
            写真を削除する
          </label>
        </div>
      )}

      <input
        type="file"
        name="photo"
        accept="image/*"
        onChange={handleFileChange}
        className="text-sm"
      />
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-24 w-24 rounded-md border border-stone-200 object-cover dark:border-stone-800"
        />
      )}
    </div>
  );
}
