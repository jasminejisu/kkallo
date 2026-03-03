"use client";

import Header from "@/app/_components/Header";
import "@/app/_styles/globals.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/_lib/supabase";

export default function AppLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) router.replace("/home");
    }
    checkAuth();
  }, []);

  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
