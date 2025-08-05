import Link from "next/link";

import { DotPattern } from "@/components/magicui/dot-pattern";

import { LoginForm } from "../../_components/login-form";
import { GoogleButton } from "../../_components/social-auth/google-button";

export default function LoginV1() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <DotPattern wave={true} className="absolute inset-0 opacity-60" />
      <div className="w-full max-w-md space-y-8">
        <div className="mb-6 flex justify-center">
          <div className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors">
            <span className="text-foreground text-3xl font-bold">Gen</span>
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            <span className="text-foreground text-3xl font-bold">C</span>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium">Login to your account</h1>
          <p className="text-muted-foreground text-sm">Welcome back. Enter your email and password to continue.</p>
        </div>
        <div className="space-y-4">
          <LoginForm />
          <GoogleButton className="w-full" variant="outline" />
          <p className="text-muted-foreground text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="register" className="text-foreground hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
