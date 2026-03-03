import { supabase } from "@/app/_lib/supabase";

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, date, summary, calories, protein, carbs, fat } = body;

    if (!userId || !date || !summary) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { error: supaError, data: insertedMeal } = await supabase
      .from("meals")
      .insert([
        { userId, eatenDate: date, summary, calories, protein, carbs, fat },
      ])
      .select();

    if (supaError) {
      console.error("Supabase insert error:", supaError);
      return Response.json({ error: supaError.message }, { status: 500 });
    }

    const { data: dailyMeals, error: dailyError } = await supabase
      .from("meals")
      .select("*")
      .eq("userId", userId)
      .eq("eatenDate", date);

    if (dailyError) {
      console.error("Supabase fetch error:", dailyError);
      return Response.json({ error: dailyError.message }, { status: 500 });
    }

    const totalCalories = dailyMeals.reduce(
      (sum, meal) => sum + meal.calories,
      0,
    );

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("calorieGoal")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Supabase profile fetch error:", profileError);
      return Response.json({ error: profileError.message }, { status: 500 });
    }

    const goal = profile?.calorieGoal ?? null;

    const { error: summaryError, data: summaryData } = await supabase
      .from("dailySummary")
      .upsert(
        {
          userId,
          date,
          totalCalories: totalCalories,
          goalMet: goal !== null ? totalCalories >= goal : null,
        },
        { onConflict: ["userId", "date"] },
      )
      .select();

    if (summaryError) {
      console.error("Daily summary upsert error:", summaryError);
      return Response.json({ error: summaryError.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      meal: insertedMeal[0],
      dailySummary: summaryData[0],
    });
  } catch (err) {
    console.error("submitMeal error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
