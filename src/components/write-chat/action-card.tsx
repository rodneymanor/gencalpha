"use client";

import * as React from "react";

type Props = {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  active: boolean;
};

export function ActionCard({ icon, title, desc, onClick, active }: Props) {
  return (
    <button
      className="bg-card text-card-foreground border-border hover:border-ring disabled:hover:border-border cursor-pointer rounded-xl border-[0.5px] p-4 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      onClick={onClick}
      disabled={active}
    >
      <div className="flex items-center gap-3">
        <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-xl">
          {icon}
        </div>
        <div>
          <div className="text-foreground font-semibold">{title}</div>
          <div className="text-muted-foreground text-sm">{desc}</div>
        </div>
      </div>
    </button>
  );
}
