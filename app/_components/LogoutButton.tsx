"use client";

import { createClient } from "@/app/_lib/supabase-client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/signin");
      router.refresh();
    }
  }

  return (
    <div>
      <button onClick={logout}>Log out</button>
    </div>
  );
}
