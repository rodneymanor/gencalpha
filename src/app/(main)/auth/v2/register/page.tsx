"use client";

import Link from "next/link";

import { AuthRedirectGuard } from "@/components/auth/auth-redirect-guard";
import { DotPattern } from "@/components/magicui/dot-pattern";

import { RegisterForm } from "../../_components/register-form";
import { GoogleButton } from "../../_components/social-auth/google-button";

export default function RegisterV2() {
  return (
    <AuthRedirectGuard>
      <DotPattern className="fixed inset-0 opacity-30" />
      <div className="w-full max-w-md space-y-8">
        <div className="mb-6 flex justify-center">
          <div className="hover:text-primary flex cursor-pointer items-center gap-2 transition-colors">
            <span className="text-foreground text-3xl font-bold">Gen</span>
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            <span className="text-foreground text-3xl font-bold">C</span>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium">Create your account</h1>
          <p className="text-muted-foreground text-sm">Please enter your details to register.</p>
        </div>
        <div className="space-y-4">
          <GoogleButton className="w-full" />
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">Or continue with</span>
          </div>
          <RegisterForm />
        </div>
        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link className="text-foreground hover:underline" href="login">
            Login
          </Link>
        </p>
      </div>
    </AuthRedirectGuard>
  );
}
