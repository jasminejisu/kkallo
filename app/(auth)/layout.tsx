import Header from "@/app/_components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
    </div>
  );
}
