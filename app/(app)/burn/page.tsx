import BurnLogger from "@/app/_components/BurnLogger";
import { supabaseServer } from "@/app/_lib/supabase-server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Burn",
};

export default async function Page() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  return (
    <div className="max-w-md mx-auto flex flex-col">
      <BurnLogger userId={user.id} />
    </div>
  );
}
