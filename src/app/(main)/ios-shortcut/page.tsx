"use client";

import { Download, Smartphone, Mic, Zap, Brain, ArrowRight } from "lucide-react";

export default function IOSShortcutPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container mx-auto px-6 py-16" style={{ maxWidth: "800px" }}>
          {/* Icon and Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 shadow-[var(--shadow-soft-drop)]">
              <Smartphone className="h-10 w-10 text-neutral-700" />
            </div>
            
            <h1 className="mb-4 text-4xl font-semibold text-neutral-900">
              Capture Ideas Instantly
            </h1>
            
            <p className="mx-auto max-w-xl text-lg text-neutral-600">
              Record voice notes and thoughts on the go, automatically transcribed and synced to your workspace.
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <button className="group flex items-center gap-3 rounded-[var(--radius-button)] bg-neutral-900 px-8 py-4 text-neutral-50 transition-all duration-200 hover:bg-neutral-800 hover:shadow-[var(--shadow-soft-drop)]">
              <Download className="h-5 w-5" />
              <span className="font-medium">Get Shortcut</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16" style={{ maxWidth: "800px" }}>
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-semibold text-neutral-900">
            What it does
          </h2>
          <p className="text-neutral-600">
            A powerful iOS shortcut that captures your thoughts and ideas seamlessly
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] bg-neutral-100">
              <Mic className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-900">
              Voice Recording
            </h3>
            <p className="text-sm text-neutral-600">
              Quick access from home screen, widget, or Siri to capture voice notes instantly
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] bg-neutral-100">
              <Zap className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-900">
              Auto-Transcription
            </h3>
            <p className="text-sm text-neutral-600">
              Converts your voice notes to text automatically with high accuracy transcription
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] bg-neutral-100">
              <Brain className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-900">
              Instant Sync
            </h3>
            <p className="text-sm text-neutral-600">
              Notes automatically appear in your workspace for script writing and content creation
            </p>
          </div>
        </div>

        {/* Simple Steps */}
        <div className="mt-16 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-8">
          <h3 className="mb-6 text-center text-lg font-semibold text-neutral-900">
            How to use
          </h3>
          
          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-neutral-100 text-sm font-medium text-neutral-700">
                1
              </div>
              <div>
                <p className="font-medium text-neutral-900">Install the shortcut</p>
                <p className="text-sm text-neutral-600">Click the button above to add it to your Shortcuts app</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-neutral-100 text-sm font-medium text-neutral-700">
                2
              </div>
              <div>
                <p className="font-medium text-neutral-900">Add to home screen</p>
                <p className="text-sm text-neutral-600">Create a widget or home screen icon for quick access</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-neutral-100 text-sm font-medium text-neutral-700">
                3
              </div>
              <div>
                <p className="font-medium text-neutral-900">Start recording</p>
                <p className="text-sm text-neutral-600">Tap to record, and your notes sync automatically to your workspace</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activation Methods */}
        <div className="mt-8 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6">
          <p className="mb-3 text-center text-sm font-medium text-neutral-900">
            Multiple ways to activate
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm text-neutral-600">
            <span className="rounded-pill bg-white px-3 py-1 border border-neutral-200">Home Screen</span>
            <span className="rounded-pill bg-white px-3 py-1 border border-neutral-200">Widget</span>
            <span className="rounded-pill bg-white px-3 py-1 border border-neutral-200">Action Button</span>
            <span className="rounded-pill bg-white px-3 py-1 border border-neutral-200">&ldquo;Hey Siri&rdquo;</span>
            <span className="rounded-pill bg-white px-3 py-1 border border-neutral-200">Share Sheet</span>
          </div>
        </div>
      </div>
    </div>
  );
}