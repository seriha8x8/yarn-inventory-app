import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <header className="border-b border-stone-200 dark:border-stone-800">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/yarns" className="hover:text-rose-600 dark:hover:text-rose-400">
            毛糸一覧
          </Link>
          <Link href="/projects" className="hover:text-rose-600 dark:hover:text-rose-400">
            作品メモ
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
          <span className="hidden sm:inline">{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="hover:underline">
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
