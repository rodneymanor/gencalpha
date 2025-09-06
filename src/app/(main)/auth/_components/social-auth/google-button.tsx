"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { siGoogle } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export function GoogleButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { signInWithGoogle } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      router.push("/write");
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="outline"
      className={cn("text-foreground hover:bg-accent bg-white", className)}
      onClick={handleGoogleSignIn}
      disabled={isSubmitting}
      {...props}
    >
      <SimpleIcon icon={siGoogle} className="size-4" />
      Continue with Google
    </Button>
  );
}
