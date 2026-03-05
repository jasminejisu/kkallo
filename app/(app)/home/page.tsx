import CalendarBlock from "@/app/_components/CalendarBlock";
import Button from "@/app/_components/Button";
import { supabaseServer } from "@/app/_lib/supabase-server";
import { getGoalType } from "@/app/_lib/data-services";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const goalType = await getGoalType(supabase, user.id);

  return (
    <div className="mt-1 md:mt-5 ">
      <div className="flex justify-center items-center px-4 mx-auto">
        <h1>{goalType}</h1>
        <CalendarBlock userId={user.id} />
      </div>
      <Link
        href="/goal"
        className="hover:text-accent-400 transition-colors flex justify-center px-4 py-4 mb-6 text-sm md:text-base -mt-5"
      >
        <Button variant="primary">Update your goal</Button>
      </Link>
    </div>
  );
}
