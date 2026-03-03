import { supabase } from "@/app/_lib/supabase";

export async function getGoalType(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("goal_type, target_calories")
    .eq("id", userId)
    .single();

  if (error) {
    console.error(error);
    throw new Error("Goal type could not be loaded");
  }
  return data.goal_type;
}

export async function getWeeklyCalories(userId, dates) {
  const { data, error } = await supabase
    .from("dailySummary")
    .select("date, totalCalories")
    .eq("userId", userId)
    .in("date", dates);

  if (error) throw new Error(error.message);

  const dailyCalories = {};
  let totalCalories = 0;

  data?.forEach((day) => {
    dailyCalories[day.date] = day.totalCalories || 0;
    totalCalories += day.totalCalories || 0;
  });

  return {
    dailyCalories,
    totalCalories,
  };
}

export async function getMealsForDate(userId, date) {
  const { data, error } = await supabase
    .from("meals")
    .select("id, calories, summary, eatenDate")
    .eq("userId", userId)
    .eq("eatenDate", date);

  if (error) throw new Error(error.message);

  return data || [];
}
