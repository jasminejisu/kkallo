"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/_lib/supabase";
import { useRouter } from "next/navigation";
import Button from "../../_components/Button";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [tempGoal, setTempGoal] = useState(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");

  useEffect(() => {
    const storedGoal = localStorage.getItem("tempGoal");
    if (!storedGoal) {
      router.push("/goal");
      return;
    }
    setTempGoal(JSON.parse(storedGoal));
  }, []);

  async function handleSignUp() {
    setLoading(true);
    setError("");
    setUsernameError("");
    setEmailError("");
    setPasswordError("");
    setHeightError("");
    setWeightError("");

    let valid = true;
    if (!username) {
      setUsernameError("Username is required.");
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
    } else if (isNaN(height) || Number(height) <= 0) {
      setHeightError("Enter a valid height in cm.");
      valid = false;
    }
    if (!weight) {
      setWeightError("Weight is required.");
      valid = false;
    } else if (isNaN(weight) || Number(weight) <= 0) {
      setWeightError("Enter a valid weight in kg.");
      valid = false;
    }

    if (!valid) {
      setLoading(false);
      return;
    }

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

    const userId = data.user?.id;
    if (!userId) {
      alert("Check your email to confirm your account, then sign in.");
      setLoading(false);
      return;
    }

    await supabase.from("profiles").upsert({
      id: userId,
      goalType: tempGoal.goalType,
      calorieGoal: tempGoal.calorieGoal,
      height: Number(height),
      weight: Number(weight),
      username: username,
    });

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      alert("Account created! Please sign in.");
      router.replace("/signin");
      return;
    }

    localStorage.removeItem("tempGoal");
    window.location.href = "/home";
  }

  return (
    <div className="p-6 max-w-md mx-auto flex flex-col">
      <h1 className="text-3xl mb-4 font-semibold">Sign Up</h1>
      {error && <p className="mb-4 text-red-400 text-sm">{error}</p>}

      <p className="ml-1.5 mb-2 font-semibold">Username</p>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border bg-primary-50 text-primary-900 p-2 w-full focus:text-primary-900 focus:bg-primary-50 focus:border-primary-400 focus:outline-none rounded-4xl shadow-sm"
      />
      {usernameError && (
        <p className="text-red-400 text-xs ml-1 mb-3 mt-1">{usernameError}</p>
      )}
      {!usernameError && <div className="mb-4" />}

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

      <p className="ml-1.5 mb-2 font-semibold">Height</p>
      <input
        type="number"
        placeholder="cm"
        value={height}
        onChange={(e) => setHeight(e.target.value)}
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
        onChange={(e) => setWeight(e.target.value)}
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
