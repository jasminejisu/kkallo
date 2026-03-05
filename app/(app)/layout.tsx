import Header from "@/app/_components/Header";
import { Quicksand } from "next/font/google";
import { supabaseServer } from "@/app/_lib/supabase-server";
import { redirect } from "next/navigation";

const font = Quicksand({
  subsets: ["latin"],
  display: "swap",
});

interface AppLayoutProps {
  children: React.ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  return (
    <div>
      <Header />
      <main
        className={`${font.className} bg-primary-100 text-primary-800 font-semibold min-h-screen`}
      >
        {children}
      </main>
    </div>
  );
}
