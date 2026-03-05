import Link from "next/link";
import Button from "@/app/_components/Button";

export const metadata = {
  title: "Set up your goal",
};

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 -mt-15">
      <h1 className="text-center text-3xl font-semibold text-primary-800">
        What&apos;s your goal for the month?
      </h1>
      <div className="flex justify-center items-center gap-10">
        <Link href="/goal/goalSetup?type=deficit">
          <Button>Deficit</Button>
        </Link>
        <Link href="/goal/goalSetup?type=surplus">
          <Button>Surplus</Button>
        </Link>
      </div>
    </div>
  );
}
