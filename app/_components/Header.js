"use client";

import Logo from "@/app/_components/Logo";
import { useEffect, useState } from "react";
import { supabase } from "@/app/_lib/supabase";
import { useRouter } from "next/navigation";
import Button from "@/app/_components/Button";

export default function Header() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUsername(userId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single();
      if (profile) setUsername(profile.username);
    }

    async function loadUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchUsername(session.user.id);
      }
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchUsername(session.user.id);
        } else {
          setUser(null);
          setUsername(null);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/signin";
  }

  return (
    <header className="px-4 md:px-8 flex justify-between border-b border-primary-200">
      <Logo />

      {user ? (
        <div className="flex items-center">
          <span className="text-base md:text-base">
            Hello, <span className="font-semibold"> {username}</span>
          </span>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      ) : (
        <div className="flex items-center">
          <p>If you already have an account,</p>
          <Button variant="accent" onClick={() => router.push("/signin")}>
            Sign In
          </Button>
        </div>
      )}
    </header>
  );
}
