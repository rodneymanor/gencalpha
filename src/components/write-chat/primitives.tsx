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
    outline: "border border-input bg-card hover:bg-accent hover:text-accent-foreground",
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
      className={`inline-flex items-center justify-center rounded-[var(--radius-input)] text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`rounded-[var(--radius-input)] border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 ${className}`}
  >
    {children}
  </div>
);

export const ScrollArea = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`overflow-auto ${className}`}>{children}</div>
);
