import { PanelLeft } from "lucide-react";

export const PanelToggleButton = ({ onClick }: { onClick?: () => void }) => {
  return (
    <button
      onClick={onClick}
      className="hover:bg-accent hover:text-accent-foreground rounded-md p-2 transition-colors"
      aria-label="Toggle panel"
    >
      <PanelLeft className="text-primary h-4 w-4" />
    </button>
  );
};
