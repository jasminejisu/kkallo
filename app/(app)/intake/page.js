import Meal from "@/app/_components/Meal";

export const metadata = {
  title: "Intake",
};

export default function Page() {
  return (
    <div className="max-w-md mx-auto flex flex-col">
      <Meal />
    </div>
  );
}
