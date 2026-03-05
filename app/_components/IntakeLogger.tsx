"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/app/_components/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "../_lib/supabase-client";
import { submitMeal } from "../_lib/data-services";

type AnalysisResult = {
  summary: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function IntakeLogger({ userId }: { userId: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function openFilePicker() {
    if (fileInputRef.current) fileInputRef.current.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  }

  function handleCancel() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function analyze() {
    setError(null);
    if (!file && !description.trim())
      return setError("Please provide an image or description");

    const formData = new FormData();
    if (file) formData.append("file", file);
    formData.append("description", description);

    try {
      const res = await fetch("/api/analyzeMeal", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "API error");
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(`Error analyzing input: ${message}`);
    }
  }

  async function handleSubmit() {
    setError(null);
    if (!result) return setError("Analyze your meal first");
    if (submitting) return;

    setSubmitting(true);
    try {
      const mealData = {
        userId: userId,
        eatenDate: new Date().toISOString().split("T")[0],
        summary: result.summary,
        calories: result.calories,
        protein: result.protein,
        carbs: result.carbs,
        fat: result.fat,
      };

      const supabase = createClient();
      await submitMeal(supabase, mealData);

      setSuccess(true);
      // Reset state
      setFile(null);
      setDescription("");
      setResult(null);
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
    <div>
      <h1 className="text-2xl font-bold text-primary-800 text-center mt-10">
        Analyze Your Meal
      </h1>
      <p className="text-lg mt-10">Image</p>
      <span className="flex flex-col items-center mt-3">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="mb-5"
          hidden
        />
        {!file && (
          <Button variant="secondary" onClick={openFilePicker}>
            Upload Image (Optional)
          </Button>
        )}

        {file && (
          <div className="mb-4 relative w-full h-64">
            <Image
              src={previewUrl ?? ""}
              alt="Meal preview"
              fill
              style={{ objectFit: "contain" }}
              className="rounded-md mt-5"
            />
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 bg-accent-300 text-primary-900 text-2xl rounded-full font-semibold hover:bg-primary-200 hover:text-accent-900 transition-colors duration-300 cursor-pointer w-8 h-8 flex items-center justify-center"
              title="Remove image"
            >
              ×
            </button>
          </div>
        )}
      </span>
      <p className="mt-10 mb-3 text-lg">Description</p>
      <span>
        <textarea
          placeholder="Add a description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border bg-accent-50 border-primary-500 p-2 w-full mb-4 mt-2 shadow-sm rounded-4xl focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent transition-colors duration-300 resize-none h-24"
        />
      </span>
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">
        {result && (
          <div className="text-lg">
            <p className="mb-2">{result.summary}</p>
            <p>Estimated Calories: {result.calories} kcal</p>
            <p>Estimated Protein: {result.protein} g</p>
            <p>Estimated Carbohydrates: {result.carbs} g</p>
            <p>Estimated Fat: {result.fat} g</p>
            <div>
              <Button
                variant="accent"
                onClick={handleSubmit}
                type="button"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        )}
        {!result && (
          <div className="w-full max-w-sm mx-auto flex flex-col items-center">
            <Button variant="accent" onClick={analyze}>
              Analyze
            </Button>
          </div>
        )}

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        {success && (
          <p className="text-green-500 text-center mt-2">
            Meal submitted successfully!
          </p>
        )}
      </div>
    </div>
  );
}
