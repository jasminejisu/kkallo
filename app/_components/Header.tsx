import Logo from "@/app/_components/Logo";
import Button from "@/app/_components/Button";
import { supabaseServer } from "@/app/_lib/supabase-server";
import Link from "next/link";
import LogoutButton from "@/app/_components/LogoutButton";
import { getName } from "@/app/_lib/data-services";

export default async function Header() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = user ? await getName(supabase, user.id) : null;

  return (
    <header className="px-4 md:px-8 flex justify-between border-b border-primary-200">
      <Logo />

      {user ? (
        <div className="flex items-center">
          <span className="text-base md:text-base">
            Hello, <span className="font-semibold"> {name?.fullName}</span>
          </span>
          <LogoutButton />
        </div>
      ) : (
        <div className="flex items-center">
          <p>If you already have an account,</p>
          <Link href="/signin" className="ml-2">
            <Button variant="accent">Sign In</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
