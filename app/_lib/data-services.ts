import { SupabaseClient } from "@supabase/supabase-js";

export async function getGoalType(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("goalType, calorieGoal")
    .eq("id", userId)
    .single();

  if (error) {
    console.error(error);
    throw new Error(`Goal type could not be loaded for user ${userId}`);
  }
  return data;
}

export async function getWeeklyCalories(
  supabase: SupabaseClient,
  userId: string,
  dates: string[],
) {
  const { data, error } = await supabase
    .from("dailySummary")
    .select("date, totalCalories")
    .eq("userId", userId)
    .in("date", dates);

  if (error) {
    console.error(error);
    throw new Error(`Weekly calories could not be loaded for user ${userId}`);
  }

  const dailyCalories: Record<string, number> = {};
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

export async function getMealsForDate(
  supabase: SupabaseClient,
  userId: string,
  date: string,
) {
  const { data, error } = await supabase
    .from("meals")
    .select("id, calories, summary, eatenDate")
    .eq("userId", userId)
    .eq("eatenDate", date);

  if (error) {
    console.error(error);
    throw new Error(`Meals could not be loaded on date ${date}`);
  }

  return data || [];
}

export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  goalType: string,
  calorieGoal: number,
  height: number,
  weight: number,
  fullName: string,
) {
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: userId, goalType, calorieGoal, height, weight, fullName });

  if (error) throw new Error(`Profile could not be created: ${error.message}`);
}

export async function getName(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("fullName")
    .eq("id", userId)
    .single();

  if (error) throw new Error(`Name could not be loaded for user`);
  return data;
}

type MealData = {
  userId: string;
  eatenDate: string;
  summary: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export async function submitMeal(supabase: SupabaseClient, mealData: MealData) {
  const { error } = await supabase.from("meals").insert(mealData);

  if (error) throw new Error(`Meal could not be submitted`);
}

export async function getRecentWorkouts(
  supabase: SupabaseClient,
  userId: string,
) {
  const { data, error } = await supabase
    .from("workout")
    .select("workoutType")
    .eq("userId", userId)
    .order("loggedAt", { ascending: false })
    .limit(5);

  if (error) throw new Error(`Recent workouts could not be loaded`);

  return (data || []).map((w) => w.workoutType) as string[];
}

type WorkoutData = {
  userId: string;
  workoutType: string;
  calorieBurn: number;
  duration: number;
  intensity: string;
  overallCalorieBurn: number;
};

export async function submitWorkout(
  supabase: SupabaseClient,
  workoutData: WorkoutData,
) {
  const { error } = await supabase.from("workout").insert(workoutData);

  if (error) throw new Error(`Workout could not be submitted`);
}

export async function deleteMeal(supabase: SupabaseClient, mealId: string) {
  const { error } = await supabase.from("meals").delete().eq("id", mealId);

  if (error) throw new Error(`Meal could not be deleted`);
}

export async function updateDailySummary(
  supabase: SupabaseClient,
  userId: string,
  date: string,
  totalCalories: number,
) {
  const { error } = await supabase
    .from("dailySummary")
    .upsert({ userId, date, totalCalories });

  if (error) throw new Error(`Daily summary could not be updated`);
}
