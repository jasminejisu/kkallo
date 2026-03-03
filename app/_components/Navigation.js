import Link from "next/link";
import Button from "@/app/_components/Button";

export default function Navigation() {
  return (
    <nav className="flex justify-center items-center mb-2 md:mb-8 -mt-5">
      <ul className="flex gap-2 md:gap-10 items-center">
        <li>
          <Link href="/intake" className="transition-colors">
            <Button variant="secondary">Intake</Button>
          </Link>
        </li>
        <li>
          <Link href="/burn" className="transition-colors">
            <Button variant="secondary">Burn</Button>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
