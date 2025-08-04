import Link from "next/link";

import { RegisterForm } from "../../_components/register-form";
import { GoogleButton } from "../../_components/social-auth/google-button";

export default function RegisterV1() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
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
          <p className="text-muted-foreground text-sm">Fill in your details below to get started.</p>
        </div>
        <div className="space-y-4">
          <RegisterForm />
          <GoogleButton className="w-full" variant="outline" />
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link href="login" className="text-foreground hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
