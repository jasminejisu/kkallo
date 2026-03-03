"use client";

import Navigation from "@/app/_components/Navigation";
import CalendarBlock from "@/app/_components/CalendarBlock";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/app/_lib/supabase";
import Button from "../../_components/Button";

export default function Page() {
  const [goalType, setGoalType] = useState(null);
  const [userId, setUserId] = useState(null);
  const [month, setMonth] = useState(
    new Date().toLocaleString("default", { month: "long" }),
  );

  useEffect(() => {
    async function fetchGoal() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const id = session?.user?.id;

      if (!id) return;

      setUserId(id);

      const { data } = await supabase
        .from("profiles")
        .select("goalType")
        .eq("id", id)
        .single();

      if (data) setGoalType(data.goalType);
    }

    fetchGoal();
  }, []);

  return (
    <div className="mt-1 md:mt-5 ">
      <h1 className="text-2xl md:text-4xl flex justify-center px-4  md:py-2">
        {month}
      </h1>

      <Navigation />
      <div className="flex justify-center items-center px-4 mx-auto">
        {userId && <CalendarBlock userId={userId} />}
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
