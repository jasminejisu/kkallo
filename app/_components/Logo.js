import Link from "next/link";
import logo from "@/public/kkallo.png";
import Image from "next/image";

export default function Logo() {
  return (
    <div className=" border-primary-800 px-5 py-3">
      <Link href="/" className="flex items-center gap-2 md:gap-4">
        <Image
          src={logo}
          height={44}
          width={44}
          alt="Kkallo Logo in circle"
          quality={100}
          className="md:w-15 md:h-15 "
        />
        <span className="text-lg md:text-xl font-semibold text-primary-800 ">
          Kkallo
        </span>
      </Link>
    </div>
  );
}
