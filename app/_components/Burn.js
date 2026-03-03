"use client";

import { useEffect, useState } from "react";
import Button from "@/app/_components/Button";
import { useRouter } from "next/navigation";

export default function BurnPage() {
  const [workoutInput, setWorkoutInput] = useState("");
  const [selectedWorkout, setSelectedWorkout] = useState("");
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [duration, setDuration] = useState(""); // in minutes
  const [intensity, setIntensity] = useState(""); // e.g., "low", "medium", "high"
  const [estimatedBurn, setEstimatedBurn] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // Fetch recent workouts from your DB/API
    async function fetchRecent() {
      try {
        const res = await fetch("/api/recentWorkouts");
        const data = await res.json();
        setRecentWorkouts(data || []);
      } catch (err) {
        console.error(err);
      }
    }

    fetchRecent();
  }, []);

  async function handleEstimate() {
    if (!duration || !intensity || (!workoutInput && !selectedWorkout)) {
      return alert(
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
      console.error(err);
      alert(`Error: ${err.message}`);
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
          onChange={(e) => setDuration(e.target.value)}
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
            Estimated Calories Burned Today:{" "}
            <strong>{estimatedBurn} kcal</strong>
          </p>
        </div>
      )}
    </div>
  );
}
