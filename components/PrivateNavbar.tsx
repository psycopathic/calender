"use client";
import Link from "next/link";
import Image from "next/image";
import { privateNavLinks } from "@/constants";
import { cn } from "@/lib/utils";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

export default function PrivateNavbar() {
  const pathname = usePathname();
  return (
    <>
      <nav className="flex justify-between items-center fixed z-50 w-full h-28 bg-gray-200 px-10 gap-4 shadow-2xl mb-28">
        <Link href="/events">
          <Image
            src="/assets/logo.svg"
            width={60}
            height={60}
            alt="Let's talk"
            className="hover:scale-150 duration-200"
          />
        </Link>
        {/* nav links  */}
        <section className="sticky top-0 flex justify-between text-black ">
          <div className="flex flex-1 max-sm:gap-0 sm:gap-6">
            {privateNavLinks.map((item) => {
              const isActive =
                pathname === item.route ||
                pathname.startsWith(`${item.route}/`);

              return (
                <Link
                  href={item.route}
                  key={item.label}
                  className={cn(
                    "flex gap-4 items-center p-4 rounded-lg justify-start hover:scale-150 duration-300 ",
                    isActive && "bg-blue-100 rounded-3xl"
                  )}
                >
                  <Image
                    src={item.imgURL}
                    alt={item.label}
                    width={30}
                    height={30}
                  />

                  <p className={cn("text-lg font-semibold max-lg:hidden")}>
                    {item.label}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
        {/* User button */}
        <div className="hover:scale-150 duration-500 ">
          <SignedIn>
            {/* Mount the UserButton component */}
            <UserButton />
          </SignedIn>
        </div>
      </nav>
    </>
  );
}
