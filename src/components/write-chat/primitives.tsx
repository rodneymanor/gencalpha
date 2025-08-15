"use client";

import React from "react";

export type ButtonVariant = "default" | "outline" | "ghost" | "secondary";
export type ButtonSize = "default" | "sm" | "icon";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  onClick,
  ...props
}: ButtonProps) => {
  const variants: Record<ButtonVariant, string> = {
    default: "bg-accent text-accent-foreground hover:bg-accent border border-input",
    outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  };

  const sizes: Record<ButtonSize, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={`focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${className}`}>
    {children}
  </div>
);

export const ScrollArea = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);
