"use client";

import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-1/3 -translate-y-1/2 text-center"
    >
      <h1 className="text-foreground mb-2 font-sans text-3xl font-semibold">What can I help you with?</h1>
      <p className="text-muted-foreground font-sans">Start a conversation with AI</p>
    </motion.div>
  );
}
