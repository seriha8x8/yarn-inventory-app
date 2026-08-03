import YarnForm from "../YarnForm";
import { createYarn } from "../actions";

export default function NewYarnPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">毛糸を登録</h1>
      <YarnForm photoUrl={null} action={createYarn} />
    </div>
  );
}
