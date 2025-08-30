"use client";

// Floating Action Button Component

import React, { useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Link, FileText, Upload, X, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Action items
  const actions = [
    {
      icon: Link,
      label: "Add Link",
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => {
        onClick();
        setIsExpanded(false);
      },
    },
    {
      icon: FileText,
      label: "Add Note",
      color: "bg-green-500 hover:bg-green-600",
      onClick: () => {
        console.log("Add note");
        setIsExpanded(false);
      },
    },
    {
      icon: Upload,
      label: "Upload File",
      color: "bg-purple-500 hover:bg-purple-600",
      onClick: () => {
        console.log("Upload file");
        setIsExpanded(false);
      },
    },
  ];

  return (
    <div className={cn("fixed right-6 bottom-6 z-50", className)}>
      {/* Expanded actions */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExpanded(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            />

            {/* Action buttons */}
            <div className="absolute right-0 bottom-16 space-y-3">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.3, y: 20 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: {
                        delay: index * 0.05,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.3,
                      y: 20,
                      transition: {
                        delay: (actions.length - index - 1) * 0.05,
                      },
                    }}
                    className="flex items-center justify-end gap-3"
                  >
                    {/* Label */}
                    <motion.span
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="rounded-full bg-neutral-900 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-neutral-50"
                    >
                      {action.label}
                    </motion.span>

                    {/* Button */}
                    <button
                      onClick={action.onClick}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg transition-all hover:shadow-xl",
                        action.color,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        animate={{ rotate: isExpanded ? 45 : 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full",
          "bg-neutral-900 text-neutral-50 hover:bg-neutral-800",
          "shadow-[var(--shadow-soft-drop)] hover:shadow-xl",
          "transition-all duration-200",
          "group",
        )}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="relative"
            >
              <Plus className="h-6 w-6" />

              {/* Sparkle animation */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="text-brand-500 h-3 w-3" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse effect */}
        {!isExpanded && (
          <motion.div
            className="absolute inset-0 rounded-full bg-neutral-900 opacity-20"
            animate={{
              scale: [1, 1.5, 1.5],
              opacity: [0.2, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </motion.button>

      {/* Tooltip */}
      {!isExpanded && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="pointer-events-none absolute right-0 bottom-full mb-2"
        >
          <div className="rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-neutral-50">
            Add Content
          </div>
        </motion.div>
      )}
    </div>
  );
};
