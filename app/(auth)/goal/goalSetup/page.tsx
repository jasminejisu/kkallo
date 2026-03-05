"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Button from "@/app/_components/Button";

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");
  const [calories, setCalories] = useState<number>(1000);

  useEffect(
    function () {
      if (!type) router.push("/goal");
    },
    [type],
  );

  function handleDone(): void {
    const goalData = {
      goalType: type,
      calorieGoal: calories,
    };
    sessionStorage.setItem("tempGoal", JSON.stringify(goalData));
    router.push("/signup");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 -mt-15">
      <h1 className="text-center text-3xl font-semibold">Goal of the Month</h1>
      <div className="flex flex-col items-center">
        <p className="text-xl text-accent-500 uppercase font-semibold px-4 py-1 border-b border-primary-800 ">
          {type}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setCalories((c) => c + 10)}
          >
            ▲
          </Button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={calories}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const val = e.target.value.replace(/\D/g, "");
              setCalories(val === "" ? 0 : Number(val));
            }}
            className="w-20 text-center py-1 text-xl font-semibold border text-primary-800 bg-primary-50 border-primary-400 focus:outline-none rounded-4xl shadow-sm"
          />
          <span className="text-xl">calories</span>
          <Button
            variant="secondary"
            onClick={() => setCalories((c) => Math.max(0, c - 10))}
          >
            ▼
          </Button>
        </div>
        <Button variant="base" onClick={handleDone}>
          Let&apos;s go!
        </Button>
      </div>
    </div>
  );
}
