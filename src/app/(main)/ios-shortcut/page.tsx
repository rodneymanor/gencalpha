"use client";

import { Download, Smartphone, Mic, Zap, Brain, ArrowRight } from "lucide-react";

export default function IOSShortcutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section - Using neutral-50 background for consistency */}
      <div className="border-b border-neutral-200 bg-neutral-50">
        <div className="container mx-auto px-6 py-16" style={{ maxWidth: "800px" }}>
          {/* Icon and Title */}
          <div className="mb-8 text-center">
            {/* Icon container with primary color accent */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 shadow-[var(--shadow-soft-drop)] transition-all duration-200">
              <Smartphone className="text-primary-600 h-10 w-10" />
            </div>

            <h1 className="mb-4 text-4xl font-semibold text-neutral-950">Capture Ideas Instantly</h1>

            <p className="mx-auto max-w-xl text-lg text-neutral-600">
              Record voice notes and thoughts on the go, automatically transcribed and synced to your workspace.
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            {/* Solid button - CTA only, following design system hierarchy */}
            <button className="group bg-brand-500 hover:bg-brand-600 flex items-center gap-3 rounded-[var(--radius-button)] px-8 py-4 text-white shadow-[var(--shadow-soft-drop)] transition-all duration-200 hover:-translate-y-px active:scale-[0.98]">
              <Download className="h-5 w-5 text-white" />
              <span className="font-semibold">Get Shortcut</span>
              <ArrowRight className="h-4 w-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16" style={{ maxWidth: "800px" }}>
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-semibold text-neutral-950">What it does</h2>
          <p className="text-neutral-600">A powerful iOS shortcut that captures your thoughts and ideas seamlessly</p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Feature 1 - Primary accent for core feature */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6 transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="bg-primary-100 mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)]">
              <Mic className="text-primary-700 h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-950">Voice Recording</h3>
            <p className="text-sm text-neutral-600">
              Quick access from home screen, widget, or Siri to capture voice notes instantly
            </p>
          </div>

          {/* Feature 2 - Brand accent for speed/efficiency */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6 transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="bg-brand-100 mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)]">
              <Zap className="text-brand-700 h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-950">Auto-Transcription</h3>
            <p className="text-sm text-neutral-600">
              Converts your voice notes to text automatically with high accuracy transcription
            </p>
          </div>

          {/* Feature 3 - Success accent for intelligent features */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6 transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="bg-success-100 mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)]">
              <Brain className="text-success-700 h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-950">Instant Sync</h3>
            <p className="text-sm text-neutral-600">
              Notes automatically appear in your workspace for script writing and content creation
            </p>
          </div>
        </div>

        {/* Simple Steps - Elevated card with soft shadow */}
        <div className="mt-16 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-8 shadow-[var(--shadow-soft-drop)]">
          <h3 className="mb-6 text-center text-lg font-semibold text-neutral-950">How to use</h3>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              {/* Step numbers with primary accent */}
              <div className="rounded-pill bg-primary-100 text-primary-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium transition-all duration-150">
                1
              </div>
              <div>
                <p className="font-medium text-neutral-950">Install the shortcut</p>
                <p className="text-sm text-neutral-600">Click the button above to add it to your Shortcuts app</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              {/* Step numbers with primary accent */}
              <div className="rounded-pill bg-primary-100 text-primary-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium transition-all duration-150">
                2
              </div>
              <div>
                <p className="font-medium text-neutral-950">Add to home screen</p>
                <p className="text-sm text-neutral-600">Create a widget or home screen icon for quick access</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              {/* Step numbers with primary accent */}
              <div className="rounded-pill bg-primary-100 text-primary-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium transition-all duration-150">
                3
              </div>
              <div>
                <p className="font-medium text-neutral-950">Start recording</p>
                <p className="text-sm text-neutral-600">
                  Tap to record, and your notes sync automatically to your workspace
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activation Methods - Subtle background with consistent styling */}
        <div className="mt-8 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 p-6 shadow-[var(--shadow-soft-drop)]">
          <p className="mb-3 text-center text-sm font-medium text-neutral-950">Multiple ways to activate</p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-neutral-600">
            {/* Activation method pills with hover states */}
            <span className="rounded-pill border border-neutral-200 bg-neutral-50 px-3 py-1 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-100">
              Home Screen
            </span>
            {/* Activation method pills with hover states */}
            <span className="rounded-pill border border-neutral-200 bg-neutral-50 px-3 py-1 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-100">
              Widget
            </span>
            {/* Activation method pills with hover states */}
            <span className="rounded-pill border border-neutral-200 bg-neutral-50 px-3 py-1 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-100">
              Action Button
            </span>
            {/* Activation method pills with hover states */}
            <span className="rounded-pill border border-neutral-200 bg-neutral-50 px-3 py-1 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-100">
              &ldquo;Hey Siri&rdquo;
            </span>
            {/* Activation method pills with hover states */}
            <span className="rounded-pill border border-neutral-200 bg-neutral-50 px-3 py-1 transition-all duration-150 hover:border-neutral-300 hover:bg-neutral-100">
              Share Sheet
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
