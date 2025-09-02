"use client";

import { useState, useEffect } from "react";

interface TypewriterPlaceholderProps {
  prefix: string;
  phrases: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export function TypewriterPlaceholder({
  prefix,
  phrases,
  typingSpeed = 50,
  deletingSpeed = 30,
  pauseTime = 2000,
}: TypewriterPlaceholderProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) {
      const pauseTimer = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
      return () => clearTimeout(pauseTimer);
    }

    const phraseIndex = Math.min(currentPhraseIndex, phrases.length - 1);
    const currentPhrase = phrases[phraseIndex] || "";
    
    if (!isDeleting) {
      // Typing
      if (currentText.length < currentPhrase.length) {
        const timer = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Finished typing, pause before deleting
        setIsPaused(true);
      }
    } else {
      // Deleting
      if (currentText.length > 0) {
        const timer = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1));
        }, deletingSpeed);
        return () => clearTimeout(timer);
      } else {
        // Finished deleting, move to next phrase
        setIsDeleting(false);
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }
  }, [currentText, isDeleting, isPaused, currentPhraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className="inline-flex items-baseline">
      <span>{prefix}</span>
      <span className="ml-1 text-neutral-500">{currentText}</span>
      <span className="ml-0.5 inline-block h-5 w-0.5 bg-neutral-400 animate-pulse" />
    </span>
  );
}