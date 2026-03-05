"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/_components/Button";
import { createClient } from "@/app/_lib/supabase-client";
import { createProfile } from "@/app/_lib/data-services";

type TempGoal = {
  goalType: string;
  calorieGoal: number;
};

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(0);
  const [weight, setWeight] = useState<number>(0);
  const [tempGoal, setTempGoal] = useState<TempGoal | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fullNameError, setFullNameError] = useState<string>("");
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [heightError, setHeightError] = useState<string>("");
  const [weightError, setWeightError] = useState<string>("");
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("");

  useEffect(() => {
    const storedGoal = sessionStorage.getItem("tempGoal");
    if (!storedGoal) {
      router.push("/goal");
      return;
    }
    setTempGoal(JSON.parse(storedGoal));
  }, []);

  // Validate form field
  async function handleSignUp() {
    setLoading(true);
    setError("");
    setFullNameError("");
    setEmailError("");
    setPasswordError("");
    setHeightError("");
    setWeightError("");
    setConfirmPasswordError("");

    let valid = true;
    if (!fullName) {
      setFullNameError("Name is required.");
      valid = false;
    }
    if (!email) {
      setEmailError("Email is required.");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Enter a valid email address.");
      valid = false;
    }
    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      valid = false;
    }
    if (!height) {
      setHeightError("Height is required.");
      valid = false;
    } else if (height <= 0) {
      setHeightError("Enter a valid height in cm.");
      valid = false;
    }
    if (!weight) {
      setWeightError("Weight is required.");
      valid = false;
    } else if (weight <= 0) {
      setWeightError("Enter a valid weight in kg.");
      valid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match.");
      valid = false;
    }

    if (!valid) {
      setLoading(false);
      return;
    }

    // Supabase.auth.signUp
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("email")) {
        setEmailError(signUpError.message);
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }
    //userId is needed to create profile, so we create profile after signUp
    const userId = data.user?.id;
    if (!userId) {
      alert("Check your email to confirm your account, then sign in.");
      setLoading(false);
      return;
    }

    //createProfile()
    try {
      await createProfile(
        supabase,
        userId,
        tempGoal?.goalType ?? "",
        tempGoal?.calorieGoal ?? 0,
        height,
        weight,
        fullName,
      );
    } catch {
      setError("Failed to create profile. Please try again.");
      setLoading(false);
      return;
    }

    //supabase.auth.signInWithPassword to automatically sign in user after sign up
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      alert("Account created! Please sign in.");
      router.replace("/signin");
      return;
    }

    //sessionStorage
    sessionStorage.removeItem("tempGoal");
    setLoading(false);
    //router
    router.push("/home");
  }

  return (
    <div className="p-6 max-w-md mx-auto flex flex-col">
      <h1 className="text-3xl mb-4 font-semibold">Sign Up</h1>
      {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}

      <p className="ml-1.5 mb-2 font-semibold">Full name</p>
      <input
        type="text"
        placeholder="full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="border bg-primary-50 text-primary-900 p-2 w-full focus:text-primary-900 focus:bg-primary-50 focus:border-primary-400 focus:outline-none rounded-4xl shadow-sm"
      />
      {fullNameError && (
        <p className="text-red-400 text-xs ml-1 mb-3 mt-1">{fullNameError}</p>
      )}
      {!fullNameError && <div className="mb-4" />}

      <p className="ml-1.5 mb-2 font-semibold">Email</p>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border bg-primary-50 text-primary-900 p-2 w-full focus:text-primary-900 focus:bg-primary-50 focus:border-primary-400 focus:outline-none rounded-4xl shadow-sm"
      />
      {emailError && (
        <p className="text-red-400 text-xs ml-1 mb-3 mt-1">{emailError}</p>
      )}
      {!emailError && <div className="mb-4" />}

      <p className="ml-1.5 mb-2 font-semibold">Password</p>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border bg-primary-50 text-primary-900 p-2 w-full focus:text-primary-900 focus:bg-primary-50 focus:border-primary-400 focus:outline-none rounded-4xl shadow-sm"
      />
      {passwordError && (
        <p className="text-red-400 text-xs ml-1 mb-3 mt-1">{passwordError}</p>
      )}
      {!passwordError && <div className="mb-4" />}

      <p className="ml-1.5 mb-2 font-semibold">Confirm Password</p>
      <input
        type="password"
        placeholder="Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="border bg-primary-50 text-primary-900 p-2 w-full focus:text-primary-900 focus:bg-primary-50 focus:border-primary-400 focus:outline-none rounded-4xl shadow-sm"
      />
      {confirmPasswordError && (
        <p className="text-red-400 text-xs ml-1 mb-3 mt-1">
          {confirmPasswordError}
        </p>
      )}
      {!confirmPasswordError && <div className="mb-4" />}

      <p className="ml-1.5 mb-2 font-semibold">Height</p>
      <input
        type="number"
        placeholder="cm"
        value={height}
        onChange={(e) => setHeight(Number(e.target.value))}
        className="border bg-primary-50 text-primary-900 p-2 w-full focus:text-primary-900 focus:bg-primary-50 focus:border-primary-400 focus:outline-none rounded-4xl shadow-sm"
      />
      {heightError && (
        <p className="text-red-400 text-xs ml-1 mb-3 mt-1">{heightError}</p>
      )}
      {!heightError && <div className="mb-4" />}

      <p className="ml-1.5 mb-2 font-semibold">Weight</p>
      <input
        type="number"
        placeholder="kg"
        value={weight}
        onChange={(e) => setWeight(Number(e.target.value))}
        className="border bg-primary-50 text-primary-900 p-2 w-full focus:text-primary-900 focus:bg-primary-50 focus:border-primary-400 focus:outline-none rounded-4xl shadow-sm"
      />
      {weightError && (
        <p className="text-red-400 text-xs ml-1 mb-3 mt-1">{weightError}</p>
      )}
      {!weightError && <div className="mb-4" />}

      <Button onClick={handleSignUp} disabled={loading} variant="accent">
        {loading ? "Signing Up..." : "Sign Up & Continue"}
      </Button>
    </div>
  );
}
