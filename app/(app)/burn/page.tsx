import BurnLogger from "@/app/_components/Burn";
import { supabaseServer } from "@/app/_lib/supabase-client";

export const metadata = {
  title: "Burn",
};

export default function Page() {
export default async function Page() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();


  return (
    <div className="max-w-md mx-auto flex flex-col">
      <BurnLogger userId={user.id} />
    </div>
  );
}
