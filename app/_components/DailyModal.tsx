"use client";

import Button from "@/app/_components/Button";
import {
  deleteMeal,
  getMealsForDate,
  updateDailySummary,
} from "@/app/_lib/data-services";
import { createClient } from "@/app/_lib/supabase-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import toKey from "@/app/_utils/toKey";

type Meal = {
  id: string;
  calories: number;
  summary: string;
  eatenDate: string;
};

type DailyModalProps = {
  date: Date;
  userId: string;
  onClose: () => void;
  onMealDeleted: (date: Date, newTotal: number) => void;
};

export default function DailyModal({
  date,
  userId,
  onClose,
  onMealDeleted,
}: DailyModalProps) {
  const [meals, setMeals] = useState<Meal[]>([]);

  useEffect(function () {
    async function loadMeals() {
      const supabase = createClient();
      try {
        const meals = await getMealsForDate(supabase, userId, toKey(date));
        setMeals(meals);
      } catch (error) {
        toast.error("Failed to load meals. Please try again.");
      }
    }
    loadMeals();
  }, []);

  async function handleDeleteMeal(mealId: string) {
    const supabase = createClient();

    try {
      await deleteMeal(supabase, mealId);

      const updatedMeals = meals.filter((meal: Meal) => meal.id !== mealId);
      setMeals(updatedMeals);

      const newTotal = updatedMeals.reduce(
        (acc, meal) => acc + meal.calories,
        0,
      );

      // Update dailySummary
      await updateDailySummary(supabase, userId, toKey(date), newTotal);
      onMealDeleted(date, newTotal);
    } catch (err) {
      toast.error("Failed to delete meal. Please try again.");
    }
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
          Meals for{" "}
          {date.toLocaleString("default", {
            month: "long",
            day: "numeric",
          })}
        </h2>

        <div className="flex flex-col gap-3">
          {meals?.length ? (
            meals.map((m) => (
              <div
                key={m.id}
                className="bg-primary-200 rounded-lg p-4 flex justify-between items-center"
              >
                <span className="text-primary-600">{m.summary}</span>
                <span className="text-accent-400 font-bold">
                  {m.calories} kcal
                </span>
                <button
                  className="px-2 py-1 bg-red-500 rounded text-white text-sm"
                  onClick={() => handleDeleteMeal(m.id)}
                >
                  x
                </button>
              </div>
            ))
          ) : (
            <p className="text-primary-600 text-center">No meals found</p>
          )}
        </div>
        <div className="absolute top-0 right-2">
          <Button onClick={() => onClose()} variant="accent">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
