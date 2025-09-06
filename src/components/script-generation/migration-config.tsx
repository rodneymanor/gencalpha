"use client";

import React from "react";

import { Settings, Zap, MessageSquare, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface WorkflowOption {
  id: "chat" | "streamlined";
  title: string;
  description: string;
  pros: string[];
  cons: string[];
  badge?: string;
  recommended?: boolean;
}

const WORKFLOW_OPTIONS: WorkflowOption[] = [
  {
    id: "chat",
    title: "Chat-Based Workflow",
    description: "Current implementation with chat interface and slideout editor",
    pros: [
      "Familiar chat interface",
      "Supports conversations",
      "Video analysis integration",
      "Existing user base comfortable",
    ],
    cons: [
      "Multiple UI contexts",
      "Complex state management",
      "Disconnected editing experience",
      "Unclear AI progress",
    ],
    badge: "Current",
  },
  {
    id: "streamlined",
    title: "Streamlined Workflow",
    description: "Direct input-to-editor with Arc Timeline progress visualization",
    pros: [
      "Single-context experience",
      "Clear AI progress visualization",
      "Immediate editing access",
      "AI actions integrated",
      "Smooth transitions",
    ],
    cons: ["New user learning curve", "Less conversational", "Requires user education"],
    badge: "Recommended",
    recommended: true,
  },
];

interface MigrationConfigProps {
  currentWorkflow: "chat" | "streamlined";
  onWorkflowChange: (workflow: "chat" | "streamlined") => void;
  showComparison?: boolean;
}

export function MigrationConfig({ currentWorkflow, onWorkflowChange, showComparison = true }: MigrationConfigProps) {
  if (!showComparison) {
    // Simple toggle for production use
    return (
      <div className="bg-muted/50 flex items-center space-x-4 rounded-[var(--radius-card)] border p-4">
        <Settings className="text-muted-foreground h-5 w-5" />
        <div className="flex-1">
          <div className="text-sm font-medium">Script Generation Mode</div>
          <div className="text-muted-foreground text-xs">Choose your preferred script writing experience</div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={currentWorkflow === "chat" ? "default" : "outline"}
            size="sm"
            onClick={() => onWorkflowChange("chat")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button
            variant={currentWorkflow === "streamlined" ? "default" : "outline"}
            size="sm"
            onClick={() => onWorkflowChange("streamlined")}
          >
            <Zap className="mr-2 h-4 w-4" />
            Streamlined
          </Button>
        </div>
      </div>
    );
  }

  // Full comparison view for testing/admin
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="mb-2 text-2xl font-bold">Choose Your Script Writing Experience</h2>
        <p className="text-muted-foreground">
          We're testing a new streamlined workflow. Try both and let us know your preference!
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {WORKFLOW_OPTIONS.map((option) => (
          <Card
            key={option.id}
            className={`relative cursor-pointer transition-all hover:shadow-md ${currentWorkflow === option.id ? "ring-primary border-primary ring-2" : ""} ${option.recommended ? "border-primary/50" : ""} `}
            onClick={() => onWorkflowChange(option.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    {option.id === "chat" && <MessageSquare className="h-5 w-5" />}
                    {option.id === "streamlined" && <Zap className="h-5 w-5" />}
                    <span>{option.title}</span>
                  </CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </div>
                <div className="space-y-1">
                  {option.badge && <Badge variant={option.recommended ? "default" : "secondary"}>{option.badge}</Badge>}
                  {currentWorkflow === option.id && (
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pros */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-green-700">✅ Advantages</h4>
                <ul className="space-y-1">
                  {option.pros.map((pro, index) => (
                    <li key={index} className="text-muted-foreground flex items-start space-x-2 text-sm">
                      <span className="mt-0.5 text-green-500">•</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div>
                <h4 className="mb-2 text-sm font-semibold text-amber-700">⚠️ Considerations</h4>
                <ul className="space-y-1">
                  {option.cons.map((con, index) => (
                    <li key={index} className="text-muted-foreground flex items-start space-x-2 text-sm">
                      <span className="mt-0.5 text-amber-500">•</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action */}
              <div className="pt-2">
                <Button
                  className="w-full"
                  variant={currentWorkflow === option.id ? "default" : "outline"}
                  onClick={() => onWorkflowChange(option.id)}
                >
                  {currentWorkflow === option.id ? "Currently Active" : "Try This Workflow"}
                  {currentWorkflow !== option.id && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Migration Timeline */}
      <div className="bg-muted/30 rounded-[var(--radius-card)] p-6">
        <h3 className="mb-4 font-semibold">Migration Timeline</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <span>
              <strong>Phase 1 (Current):</strong> A/B testing with both workflows available
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span>
              <strong>Phase 2 (Next Week):</strong> User feedback collection and optimization
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span>
              <strong>Phase 3 (Coming Soon):</strong> Full migration to preferred workflow
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for workflow management
export function useWorkflowMigration() {
  const [workflow, setWorkflow] = React.useState<"chat" | "streamlined">("streamlined");

  React.useEffect(() => {
    // Check localStorage for user preference
    const saved = localStorage.getItem("script-workflow-preference");
    if (saved === "chat" || saved === "streamlined") {
      setWorkflow(saved);
    }
  }, []);

  const changeWorkflow = (newWorkflow: "chat" | "streamlined") => {
    setWorkflow(newWorkflow);
    localStorage.setItem("script-workflow-preference", newWorkflow);
  };

  return {
    currentWorkflow: workflow,
    setWorkflow: changeWorkflow,
  };
}
