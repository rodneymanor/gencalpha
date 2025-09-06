"use client";

import { useState, useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // Add data-lpignore attributes after mount to prevent LastPass injection
  useEffect(() => {
    if (formRef.current) {
      // Add to form
      formRef.current.setAttribute('data-lpignore', 'true');
      
      // Add to all inputs
      const inputs = formRef.current.querySelectorAll('input[type="email"], input[type="password"]');
      inputs.forEach(input => {
        input.setAttribute('data-lpignore', 'true');
      });
    }
  }, []);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsSubmitting(true);
    try {
      await signIn(data.email, data.password);
      toast.success("Successfully logged in!");
      router.push("/write");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      {/* data-lpignore prevents LastPass from injecting DOM elements */}
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="you@example.com" 
                  autoComplete="email" 
                  {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center">
              <FormControl>
                <Checkbox
                  id="login-remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="size-4"
                />
              </FormControl>
              <FormLabel htmlFor="login-remember" className="text-muted-foreground ml-1 text-sm font-medium">
                Remember me for 30 days
              </FormLabel>
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isSubmitting || loading}>
          {isSubmitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
