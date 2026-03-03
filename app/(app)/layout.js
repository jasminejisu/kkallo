"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/_lib/supabase";
import Header from "@/app/_components/Header";
import { Quicksand } from "next/font/google";

export const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}

const font = Quicksand({
  subsets: ["latin"],
  display: "swap",
});

export default function AppLayout({ children }) {
  const [month, setMonth] = useState(new Date().getMonth());
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthChecked(true);
      } else {
        router.replace("/signin");
      }
    });
  }, []);

  if (!authChecked) return null;

  return (
    <AppContext.Provider value={{ month, setMonth }}>
      <Header />
      <main
        className={`${font.className} bg-primary-100 text-primary-800 font-semibold min-h-screen`}
      >
        {children}
      </main>
    </AppContext.Provider>
  );
}
