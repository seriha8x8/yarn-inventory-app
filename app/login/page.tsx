import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/yarns");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <h1 className="text-2xl font-semibold">毛糸管理アプリ</h1>
      <LoginForm />
    </div>
  );
}
