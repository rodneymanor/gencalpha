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
      className="bg-card text-card-foreground hover:bg-accent/70 border-border rounded-[var(--radius-card)] border p-4 text-left shadow-[var(--shadow-soft-drop)] transition-transform duration-150 hover:scale-[1.01]"
      onClick={onClick}
      disabled={active}
    >
      <div className="flex items-center gap-3">
        <div className="bg-secondary/10 text-secondary flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)]">
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
