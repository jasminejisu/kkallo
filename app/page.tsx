"use client";

import Link from "next/link";
import Header from "./_components/Header";
import Button from "@/app/_components/Button";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/_lib/supabase";

export default function Page() {
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <h1 className="text-3xl font-semibold">
          Welcome to Kkallo, Your calorie tracker!
        </h1>
        <h2 className="text-xl mt-6 max-w-2xl">
          Log your meals, track your calories, and achieve
          <br /> your health goals with Kkallo.
        </h2>
        <Link href="/goal">
          <Button variant="base" onClick={() => {}}>
            Start now!
          </Button>
        </Link>
      </div>
    </div>
  );
}
