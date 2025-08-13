"use client";
import { SignIn } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";
import Image from "next/image";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50 p-6">
      <div className="flex flex-row items-center gap-16 w-full max-w-6xl animate-fade-in">
        
        {/* Left Section */}
        <section className="flex flex-col items-center text-center flex-1 space-y-6">
          {/* App Logo */}
          <Image src="/assets/logo.svg" width={150} height={150} alt="Logo" />

          {/* Main Heading */}
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight underline">
            Your time, <span className="text-red-800">perfectly planned</span>
          </h1>

          {/* Subheading */}
          <p className="text-base md:text-lg text-gray-600 max-w-md font-bold">
            Join millions of professionals who easily book meetings with the #1 scheduling tool.
          </p>

          {/* Illustration */}
          <Image
            src="/assets/planning.svg"
            width={300}
            height={300}
            alt="Planning Illustration"
            className="drop-shadow-xl w-full max-w-sm "
          />
        </section>

        {/* Right Section - Sign In */}
        <div className="bg-white shadow-2xl rounded-2xl p-8 flex-1 max-w-sm transform transition-all hover:scale-105">
          <SignIn
            routing="hash"
            appearance={{
              baseTheme: neobrutalism,
            }}
          />
        </div>
      </div>
    </main>
  );
}
