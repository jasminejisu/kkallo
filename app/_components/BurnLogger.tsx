"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/_components/Button";
import { createClient } from "@/app/_lib/supabase-client";
import { getRecentWorkouts, submitWorkout } from "@/app/_lib/data-services";

type AnalysisResult = {
  calorieBurn: number;
  overallCalorieBurn: number;
};

export default function BurnPage({ userId }: { userId: string }) {
  const [workoutInput, setWorkoutInput] = useState<string>("");
  const [selectedWorkout, setSelectedWorkout] = useState<string>("");
  const [recentWorkouts, setRecentWorkouts] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(0);
  const [intensity, setIntensity] = useState<string>("");
  const [estimatedBurn, setEstimatedBurn] = useState<AnalysisResult | null>(
    null,
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  async function loadRecentWorkouts() {
    const supabase = createClient();
    const workouts = await getRecentWorkouts(supabase, userId);
    setRecentWorkouts(workouts);
  }
  useEffect(function () {
    loadRecentWorkouts();
  }, []);

  async function handleEstimate() {
    setError(null);
    if (!duration || !intensity || (!workoutInput && !selectedWorkout)) {
      return setError(
        "Please enter or select a workout, duration, and intensity.",
      );
    }

    setSubmitting(true);

    const workout = workoutInput || selectedWorkout;

    try {
      const res = await fetch("/api/estimateBurn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workout,
          duration: Number(duration),
          intensity,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to estimate");

      setEstimatedBurn(data.estimatedCalories);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Error analyzing input: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit() {
    setError("");
    if (!estimatedBurn) return setError("Estimate your calories burned first");
    if (submitting) return;

    setSubmitting(true);
    try {
      const workoutData = {
        userId: userId,
        workoutType: workoutInput || selectedWorkout,
        duration: duration,
        intensity: intensity,
        calorieBurn: estimatedBurn.calorieBurn,
        overallCalorieBurn: estimatedBurn.overallCalorieBurn,
      };

      const supabase = createClient();
      await submitWorkout(supabase, workoutData);

      setEstimatedBurn(null);
      router.push("/home");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Error submitting meal: ${message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Log Your Workout</h1>
      <div className="flex gap-4 mb-4">
        {/* Select recent */}
        <select
          className="flex-1 border rounded-md p-2"
          value={selectedWorkout}
          onChange={(e) => setSelectedWorkout(e.target.value)}
        >
          <option value="">Select recent workout</option>
          {recentWorkouts.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>

        {/* Or new workout */}
        <input
          type="text"
          placeholder="New workout"
          className="flex-1 border rounded-md p-2"
          value={workoutInput}
          onChange={(e) => setWorkoutInput(e.target.value)}
        />
      </div>
      {/* Duration & Intensity */}
      <div className="mb-4">
        <input
          type="number"
          placeholder="Duration (minutes)"
          className="w-full border rounded-md p-2 mb-2"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
        <select
          className="w-full border rounded-md p-2"
          value={intensity}
          onChange={(e) => setIntensity(e.target.value)}
        >
          <option value="">Select intensity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <Button variant="accent" onClick={handleEstimate} disabled={submitting}>
        {submitting ? "Estimating..." : "Estimate Calorie Burn"}
      </Button>
      {estimatedBurn && (
        <div className="mt-6 text-lg">
          <p>
            Estimated Calories Burned from workout:{" "}
            <strong>{estimatedBurn.calorieBurn} kcal</strong>
          </p>
          <p>
            Estimated Calories Burned Today:{" "}
            <strong>{estimatedBurn.overallCalorieBurn} kcal</strong>
          </p>
          <Button variant="accent" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Log calorie burn"}
          </Button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
}
