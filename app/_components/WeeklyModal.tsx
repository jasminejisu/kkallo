"use client";

import { useEffect, useState } from "react";
import Button from "@/app/_components/Button";
import { createClient } from "@/app/_lib/supabase-client";
import { getWeeklyCalories } from "@/app/_lib/data-services";
import DailyModal from "@/app/_components/DailyModal";
import toast from "react-hot-toast";
import toKey from "@/app/_utils/toKey";

type WeeklyModalProps = {
  week: Date[];
  userId: string;
  onClose: () => void;
};

type DailyModalState = {
  date: Date;
};

export default function WeeklyModal({
  week,
  userId,
  onClose,
}: WeeklyModalProps) {
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [dailyCalories, setDailyCalories] = useState<Record<string, number>>(
    {},
  );
  const [dailyModal, setDailyModal] = useState<DailyModalState | null>(null);

  useEffect(function () {
    async function loadCalories() {
      const supabase = createClient();
      try {
        const { dailyCalories, totalCalories } = await getWeeklyCalories(
          supabase,
          userId,
          week.map(toKey),
        );

        const weeklyCalories = { ...dailyCalories };
        week.forEach((day) => {
          const key = toKey(day);
          if (!weeklyCalories[key]) weeklyCalories[key] = 0;
        });

        setDailyCalories(weeklyCalories);
        setTotalCalories(totalCalories);
      } catch (error) {
        toast.error("Failed to load weekly calories. Please try again.");
      }
    }
    loadCalories();
  }, []);

  function handleDayClick(date: Date) {
    setDailyModal({ date });
  }

  function handleMealDeleted(date: Date, newTotal: number) {
    const key = toKey(date);
    const updated = { ...dailyCalories, [key]: newTotal };
    setDailyCalories(updated);
    setTotalCalories(Object.values(updated).reduce((acc, val) => acc + val, 0));
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={() => onClose()}
    >
      <div
        className="bg-primary-100 rounded-xl p-8 w-[90vw] max-w-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-primary-800 mb-6 text-center">
          Weekly Calories
        </h2>

        <div className="grid grid-cols-7 gap-4">
          {week.map((day) => {
            const key = toKey(day);
            const calories = dailyCalories[key] ?? 0;

            return (
              <div
                key={key}
                className="bg-primary-200 shadow-sm rounded-lg p-4 text-center cursor-pointer hover:bg-accent-200 transition-colors mt-2"
                onClick={() => {
                  handleDayClick(day);
                }}
              >
                <p className="text-sm text-primary-600">{day.getDate()}</p>
                <p className="text-lg font-bold text-accent-500">{calories}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <p className="text-primary-800 font-semibold">
            Weekly Total:
            <span className="ml-2 font-bold text-accent-400">
              {totalCalories === 0 ? "0" : totalCalories}
            </span>
          </p>
        </div>

        <div className="absolute top-0 right-2">
          <Button onClick={() => onClose()} variant="accent">
            Close
          </Button>
        </div>

        {dailyModal && (
          <DailyModal
            date={dailyModal.date}
            userId={userId}
            onClose={() => setDailyModal(null)}
            onMealDeleted={handleMealDeleted}
          />
        )}
      </div>
    </div>
  );
}
