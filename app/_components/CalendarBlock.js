"use client";

import * as React from "react";
import { useState } from "react";
import { supabase } from "@/app/_lib/supabase";
import { getWeeklyCalories, getMealsForDate } from "@/app/_lib/data-services";
import Button from "@/app/_components/Button";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function buildWeeks(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const weeks = [];
  let week = Array(firstDay.getDay()).fill(null);

  for (let d = 1; d <= lastDay.getDate(); d++) {
    week.push(new Date(year, month, d));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function dayClasses(date) {
  if (!date) return "invisible";
  return "bg-primary-50 text-primary-500 font-semibold";
}

export default function CalendarBlock({ userId }) {
  const today = new Date();
  const [current, setCurrent] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [weeklyModal, setWeeklyModal] = useState(null);
  const [dailyModal, setDailyModal] = useState(null);

  const year = current.getFullYear();
  const month = current.getMonth();
  const weeks = buildWeeks(year, month);

  const monthLabel = current.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  async function handleWeekClick(week) {
    const validDays = week.filter(Boolean);
    const dates = validDays.map((day) => toKey(day));
    const result = await getWeeklyCalories(userId, dates);

    validDays.forEach((d) => {
      const key = toKey(d);
      if (!result.dailyCalories[key]) result.dailyCalories[key] = 0;
    });

    setWeeklyModal({
      days: validDays,
      dailyCalories: result.dailyCalories,
      totalCalories: result.totalCalories,
    });
  }
  async function handleDayClick(date) {
    const meals = await getMealsForDate(userId, toKey(date));
    setDailyModal({ date, meals });
  }

  async function handleDeleteMeal(mealId, date) {
    if (!confirm("Are you sure you want to delete this meal?")) return;

    try {
      const { error } = await supabase.from("meals").delete().eq("id", mealId);

      if (error) throw new Error(error.message);

      // Update local state
      const updatedMeals = dailyModal.meals.filter((m) => m.id !== mealId);
      setDailyModal({ ...dailyModal, meals: updatedMeals });

      const dailyTotal = updatedMeals.reduce(
        (acc, meal) => acc + meal.calories,
        0,
      );

      // Update dailySummary
      await supabase.from("dailySummary").upsert(
        {
          userId,
          date: toKey(dailyModal.date),
          totalCalories: dailyTotal,
          goalMet: null,
        },
        { onConflict: ["userId", "date"] },
      );

      if (weeklyModal) {
        const updatedDailyCalories = { ...weeklyModal.dailyCalories };
        updatedDailyCalories[toKey(date)] = dailyTotal;

        const updatedTotal = Object.values(updatedDailyCalories).reduce(
          (sum, cals) => sum + cals,
          0,
        );

        setWeeklyModal({
          ...weeklyModal,
          dailyCalories: updatedDailyCalories,
          totalCalories: updatedTotal,
        });
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete meal: " + err.message);
    }
  }

  return (
    <div className="w-full max-w-md select-none -mt-10">
      {/* ── Weeks ── */}
      <div className="flex flex-col gap-1.5">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7 gap-1.5 transition-transform duration-200 ease-out hover:scale-[1.06] hover:z-10 hover:ring-2 hover:ring-accent-400 hover:ring-offset-1 hover:ring-offset-primary-500 relative cursor-default rounded-lg"
            onClick={() => handleWeekClick(week)}
          >
            {week.map((day, di) => (
              <div
                key={di}
                className={`aspect-square rounded-md flex items-center justify-center text-xs font-semibold transition-opacity ${dayClasses(day)}`}
              >
                {day?.getDate()}
              </div>
            ))}
          </div>
        ))}
        {weeklyModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setWeeklyModal(null)}
          >
            <div
              className="bg-primary-100 rounded-xl p-8 w-[90vw] max-w-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-primary-800 mb-6 text-center">
                Weekly Calories
              </h2>

              <div className="grid grid-cols-7 gap-4">
                {weeklyModal.days.map((day) => {
                  const key = toKey(day);
                  const calories = weeklyModal.dailyCalories[key] ?? 0;

                  return (
                    <div
                      key={key}
                      className="bg-primary-200 shadow-sm rounded-lg p-4 text-center cursor-pointer hover:bg-accent-200 transition-colors mt-2"
                      onClick={() => {
                        handleDayClick(day);
                      }}
                    >
                      <p className="text-sm text-primary-600">
                        {day.getDate()}
                      </p>
                      <p className="text-lg font-bold text-accent-500">
                        {calories}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-center">
                <p className="text-primary-800 font-semibold">
                  Weekly Total:
                  <span className="ml-2 font-bold text-accent-400">
                    {weeklyModal.totalCalories === 0
                      ? "0"
                      : weeklyModal.totalCalories}
                  </span>
                </p>
              </div>
            </div>
            <div className="absolute top-0 right-2">
              <Button onClick={() => setWeeklyModal(null)} variant="accent">
                Close
              </Button>
            </div>
          </div>
        )}
        {dailyModal && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setDailyModal(null)}
          >
            <div
              className="bg-primary-100 rounded-xl p-8 w-[90vw] max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-primary-800 mb-6 text-center">
                Meals for{" "}
                {dailyModal.date.toLocaleString("default", {
                  month: "long",
                  day: "numeric",
                })}
              </h2>

              <div className="flex flex-col gap-3">
                {dailyModal.meals?.length ? (
                  dailyModal.meals.map((meal) => (
                    <div
                      key={meal.id}
                      className="bg-primary-200 rounded-lg p-4 flex justify-between items-center"
                    >
                      <span className="text-primary-600">{meal.summary}</span>
                      <span className="text-accent-400 font-bold">
                        {meal.calories} kcal
                      </span>
                      <button
                        className="px-2 py-1 bg-red-500 rounded text-white text-sm"
                        onClick={() =>
                          handleDeleteMeal(meal.id, dailyModal.date)
                        }
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
                <Button onClick={() => setDailyModal(null)} variant="accent">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex gap-4 mt-5 justify-center text-[0.7rem] text-primary-300">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary-500 inline-block" />
          Goal met
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-accent-500 inline-block" />
          Partial
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary-800 inline-block" />
          Missed
        </span>
      </div>
    </div>
  );
}
