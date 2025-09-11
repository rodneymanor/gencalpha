"use client";

import { useState, useEffect, useRef } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

const FormSchema = z.object({
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export default function PasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn } = useAuth();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    // Get email from URL parameters
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // If no email, redirect back to login
      router.push("/login");
    }

    // Add data-lpignore attributes after mount to prevent LastPass injection
    if (formRef.current) {
      formRef.current.setAttribute("data-lpignore", "true");
      const inputs = formRef.current.querySelectorAll('input[type="password"]');
      inputs.forEach((input) => {
        input.setAttribute("data-lpignore", "true");
        input.setAttribute("data-form-type", "other");
      });
    }
  }, [searchParams, router]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      // Authenticate with Firebase using the email and password
      await signIn(email, data.password);

      // On successful authentication, redirect to write page
      toast.success("Login successful!");
      router.push("/write");
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(error instanceof Error ? error.message : "Invalid password. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return null; // Will redirect to login
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8"
      suppressHydrationWarning
    >
      <div className="w-full max-w-md space-y-8">
        {/* Gen.C Logo */}
        <div className="flex justify-center">
          <div className="flex cursor-pointer items-center gap-2 transition-colors hover:opacity-80">
            <span className="text-3xl font-bold text-neutral-900">Gen</span>
            <div className="bg-brand-500 h-3 w-3 rounded-full"></div>
            <span className="text-3xl font-bold text-neutral-900">C</span>
          </div>
        </div>

        {/* Email Display */}
        <div className="text-center">
          <p className="text-sm text-neutral-600">Enter password for</p>
          <p className="text-lg font-medium text-neutral-900">{email}</p>
        </div>

        {/* Form Section */}
        <div className="space-y-6" suppressHydrationWarning>
          <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" data-lpignore="true">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        autoComplete="off"
                        data-lpignore="true"
                        data-form-type="other"
                        className="focus:border-brand-400 h-12 border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Login Button */}
              <Button
                className="active:bg-brand-700 bg-brand-500 hover:bg-brand-600 h-12 w-full text-neutral-50 transition-all duration-150"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>

          {/* Back Link */}
          <div className="text-center">
            <Link href="/login" className="hover:text-brand-600 text-sm text-neutral-600 hover:underline">
              ← Back to email
            </Link>
          </div>

          {/* Footer Links */}
          <p className="text-center text-sm text-neutral-600">
            Forgot your password?{" "}
            <Link href="/forgot-password" className="text-brand-600 hover:text-brand-700 hover:underline">
              Reset it
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
