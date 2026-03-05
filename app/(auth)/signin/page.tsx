"use client";

import { useState } from "react";
import { createClient } from "@/app/_lib/supabase-client";
import { useRouter } from "next/navigation";
import Button from "@/app/_components/Button";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");

  async function handleSignIn() {
    const supabase = createClient();
    setEmailError("");
    setPasswordError("");
    if (!email) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!password) {
      setPasswordError("Please enter your password.");
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message.toLowerCase().includes("invalid login")) {
        setEmailError("Email not found. Check your email address.");
        setPasswordError("Password is invalid. Please try again.");
      } else if (signInError.message.toLowerCase().includes("email")) {
        setEmailError("Email not found. Check your email address.");
      } else if (signInError.message.toLowerCase().includes("password")) {
        setPasswordError("Password is invalid. Please try again.");
      } else {
        setEmailError(signInError.message);
      }
      setLoading(false);
      return;
    }

    router.push("/home");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSignIn();
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20">
      <div className="bg-primary-100 p-8 rounded-xl w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-primary-800 text-center">
          Sign In
        </h1>

        <div className="flex flex-col gap-1">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-4 border bg-primary-50 text-primary-900 p-2 w-full focus:text-primary-900 focus:bg-primary-50 focus:border-primary-400 focus:outline-none rounded-4xl shadow-sm"
          />
          {emailError && (
            <p className="text-red-400 text-xs ml-1">{emailError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-1 border bg-primary-50 text-primary-900 p-2 w-full focus:text-primary-900 focus:bg-primary-50 focus:border-primary-400 focus:outline-none rounded-4xl shadow-sm"
          />
          {passwordError && (
            <p className="text-red-400 text-xs ml-1">{passwordError}</p>
          )}
        </div>

        <Button onClick={handleSignIn} disabled={loading} variant="accent">
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </div>
    </div>
  );
}
