"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";

const initialState: AuthState = { error: null };

export default function LoginForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [signInState, signInAction, signInPending] = useActionState(
    signIn,
    initialState
  );
  const [signUpState, signUpAction, signUpPending] = useActionState(
    signUp,
    initialState
  );

  const state = mode === "signin" ? signInState : signUpState;
  const action = mode === "signin" ? signInAction : signUpAction;
  const pending = mode === "signin" ? signInPending : signUpPending;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 rounded-lg border border-stone-200 p-8 dark:border-stone-800">
      <div className="flex gap-2 text-sm">
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-2 font-medium ${
            mode === "signin"
              ? "bg-rose-600 text-white"
              : "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300"
          }`}
          onClick={() => setMode("signin")}
        >
          ログイン
        </button>
        <button
          type="button"
          className={`flex-1 rounded-md px-3 py-2 font-medium ${
            mode === "signup"
              ? "bg-rose-600 text-white"
              : "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300"
          }`}
          onClick={() => setMode("signup")}
        >
          新規登録
        </button>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          メールアドレス
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-md border border-stone-300 px-3 py-2 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-rose-900/40"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          パスワード
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="rounded-md border border-stone-300 px-3 py-2 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-stone-700 dark:bg-stone-900 dark:focus:ring-rose-900/40"
          />
        </label>

        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        {state.message && (
          <p className="text-sm text-green-600 dark:text-green-400">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-rose-600 px-4 py-2 font-medium text-white hover:bg-rose-700 disabled:opacity-50"
        >
          {pending
            ? "処理中..."
            : mode === "signin"
              ? "ログイン"
              : "アカウント作成"}
        </button>
      </form>
    </div>
  );
}
