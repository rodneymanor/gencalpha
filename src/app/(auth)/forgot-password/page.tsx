"use client";

import { useState } from "react";

import Link from "next/link";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      await resetPassword(data.email);
      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send reset email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="mb-6 flex justify-center">
            <div className="flex cursor-pointer items-center gap-2 transition-colors hover:opacity-80">
              <span className="text-3xl font-bold text-neutral-900">Gen</span>
              <div className="bg-brand-500 h-3 w-3 rounded-full"></div>
              <span className="text-3xl font-bold text-neutral-900">C</span>
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-medium text-neutral-900">Check your email</h1>
            <p className="text-sm text-neutral-600">We&apos;ve sent a password reset link to your email address.</p>
          </div>
          <div className="text-center">
            <Link href="/login" className="text-brand-600 hover:text-brand-700 hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="mb-6 flex justify-center">
          <div className="flex cursor-pointer items-center gap-2 transition-colors hover:opacity-80">
            <span className="text-3xl font-bold text-neutral-900">Gen</span>
            <div className="bg-brand-500 h-3 w-3 rounded-full"></div>
            <span className="text-3xl font-bold text-neutral-900">C</span>
          </div>
        </div>
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-medium text-neutral-900">Reset your password</h1>
          <p className="text-sm text-neutral-600">Enter your email and we&apos;ll send you a reset link.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-neutral-700">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="focus:border-brand-400 h-12 border-neutral-200 bg-neutral-50 text-neutral-900 placeholder:text-neutral-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="active:bg-brand-700 bg-brand-500 hover:bg-brand-600 h-12 w-full text-neutral-50 transition-all duration-150"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </Form>
        <div className="text-center">
          <Link href="/login" className="hover:text-brand-600 text-sm text-neutral-600 hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
