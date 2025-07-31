"use client";

import { useState } from "react";
import { siGoogle } from "simple-icons";

import { SimpleIcon } from "@/components/simple-icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";

export function GoogleButton({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard/daily");
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button
      variant="secondary"
      className={cn(className)}
      onClick={handleGoogleSignIn}
      disabled={loading || isSubmitting}
      {...props}
    >
      <SimpleIcon icon={siGoogle} className="size-4" />
      Continue with Google
    </Button>
  );
}
