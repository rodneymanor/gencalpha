"use client";

import { useState } from "react";

import { Settings, User } from "lucide-react";

import { UserProfileSlideout } from "@/components/standalone/user-profile-slideout";
import { Button } from "@/components/ui/button";

export function BrandProfileButton() {
  const [isSlideoutOpen, setIsSlideoutOpen] = useState(false);
  
  console.log("BrandProfileButton render - isSlideoutOpen:", isSlideoutOpen);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          console.log("Brand button clicked");
          setIsSlideoutOpen(true);
        }}
        className="gap-2 rounded-[var(--radius-button)] border-border"
      >
        <User className="h-4 w-4" />
        Profile
      </Button>

      {/* Slideout Overlay */}
      {isSlideoutOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSlideoutOpen(false)}
          />
          
          {/* Slideout Panel */}
          <div className="bg-background border-border w-[400px] max-w-[90vw] border-l shadow-[var(--shadow-soft-drop)]">
            <UserProfileSlideout onClose={() => setIsSlideoutOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}