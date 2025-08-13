"use client";

import { Button } from "@/components/write-chat/primitives";

type EmulateInputPanelProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function EmulateInputPanel({ value, onChange, onSubmit, disabled }: EmulateInputPanelProps) {
  return (
    <div className="bg-card border-border text-card-foreground rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft-drop)]">
      <div className="text-foreground mb-2 font-semibold">Describe your video idea</div>
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className="text-foreground placeholder:text-muted-foreground bg-background/60 w-full resize-none rounded-[var(--radius-input)] p-2 text-sm focus:outline-none"
          placeholder="e.g., Teach the simplest habit that boosted my productivity"
        />
        <Button size="sm" disabled={disabled} onClick={onSubmit}>
          Generate
        </Button>
      </div>
    </div>
  );
}

export default EmulateInputPanel;
