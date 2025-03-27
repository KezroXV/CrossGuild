"use client";
import { signIn } from "next-auth/react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FaGithub, FaGoogle } from "react-icons/fa";
import Image from "next/image";
import GoogleLogo from "@/public/logo-google.png";
import Link from "next/link";

export default function Login() {
  return (
    <div className="flex justify-center items-center min-h-screen p-4 dark:bg-black">
      <div className="relative bg-white  rounded-lg p-6 md:p-14 w-full max-w-[90%] sm:max-w-[440px] border-4 border-solid border-[#988AE6]  shadow-lg">
        <h1 className="text-2xl md:text-4xl font-semibold text-center mb-8 text-black dark:text-white">
          Login To CrossGuild
        </h1>
        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-2 border-2 border-[#988AE6] text-black font-bold p-3 rounded-md "
          >
            <Image src={GoogleLogo} alt="Google Logo" width={24} height={24} />
            Sign in with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center border-2 border-[#988AE6] gap-2 font-semibold text-black p-3 rounded-md "
          >
            <FaGithub />
            Sign in with GitHub
          </button>
        </div>
        <p className="text-[11px] sm:text-xs font-normal mt-6 text-center text-black dark:text-white">
          By clicking Create Account you agree to Recognotes{" "}
          <Link href="/privacy" className="text-[#6047EC] hover:underline">
            Terms
          </Link>{" "}
          of use and{" "}
          <Link href="/privacy" className="text-[#6047EC] hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
