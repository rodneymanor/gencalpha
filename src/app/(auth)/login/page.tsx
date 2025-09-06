"use client";

import { useState } from "react";
import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { GoogleButton } from "../../(main)/auth/_components/social-auth/google-button";

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function LoginV1() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // For now, just validate email and show message
      // In production, this would handle magic link or redirect to password
      toast.success("Check your email for login instructions!");
      // You could redirect to a password page or send magic link here
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8" suppressHydrationWarning>
      <div className="w-full max-w-md space-y-8">
        {/* Gen.C Logo */}
        <div className="flex justify-center">
          <div className="flex cursor-pointer items-center gap-2 transition-colors hover:opacity-80">
            <span className="text-3xl font-bold text-neutral-900">Gen</span>
            <div className="h-3 w-3 rounded-full bg-brand-500"></div>
            <span className="text-3xl font-bold text-neutral-900">C</span>
          </div>
        </div>

        {/* Form Section */}
        <div className="space-y-6" suppressHydrationWarning>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        className="focus:border-brand-400 h-12 border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Next Button with Brand Color */}
              <Button
                className="active:bg-brand-700 h-12 w-full bg-brand-500 text-neutral-50 transition-all duration-150 hover:bg-brand-600"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Processing..." : "Next"}
              </Button>
            </form>
          </Form>

          {/* Google Login Button */}
          <GoogleButton className="h-12 w-full" variant="outline" />

          {/* Footer Links */}
          <p className="text-center text-sm text-neutral-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-brand-600 hover:text-brand-700 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
