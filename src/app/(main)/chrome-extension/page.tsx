"use client";

import { Download, Chrome, Video, Zap, FolderOpen, ArrowRight } from "lucide-react";

export default function ChromeExtensionPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="border-b border-neutral-200 bg-white">
        <div className="container mx-auto px-6 py-16" style={{ maxWidth: "800px" }}>
          {/* Icon and Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 shadow-[var(--shadow-soft-drop)]">
              <Chrome className="h-10 w-10 text-neutral-700" />
            </div>
            
            <h1 className="mb-4 text-4xl font-semibold text-neutral-900">
              Save Videos Instantly
            </h1>
            
            <p className="mx-auto max-w-xl text-lg text-neutral-600">
              Capture social media videos from anywhere on the web and save them directly to your collections with a single click.
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <button className="group flex items-center gap-3 rounded-[var(--radius-button)] bg-neutral-900 px-8 py-4 text-neutral-50 transition-all duration-200 hover:bg-neutral-800 hover:shadow-[var(--shadow-soft-drop)]">
              <Download className="h-5 w-5" />
              <span className="font-medium">Add to Chrome</span>
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
            A powerful browser extension that streamlines your content workflow
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Feature 1 */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] bg-neutral-100">
              <Video className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-900">
              Universal Capture
            </h3>
            <p className="text-sm text-neutral-600">
              Works seamlessly across YouTube, TikTok, Twitter, Instagram, and more social platforms
            </p>
          </div>

          {/* Feature 2 */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] bg-neutral-100">
              <Zap className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-900">
              One-Click Save
            </h3>
            <p className="text-sm text-neutral-600">
              Instantly save videos with metadata, thumbnails, and captions extracted automatically
            </p>
          </div>

          {/* Feature 3 */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-6 transition-all duration-200 hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] bg-neutral-100">
              <FolderOpen className="h-6 w-6 text-neutral-700" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-900">
              Smart Organization
            </h3>
            <p className="text-sm text-neutral-600">
              Automatically categorizes content into your collections for easy access and management
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
                <p className="font-medium text-neutral-900">Install the extension</p>
                <p className="text-sm text-neutral-600">Click the button above to add it to Chrome</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-neutral-100 text-sm font-medium text-neutral-700">
                2
              </div>
              <div>
                <p className="font-medium text-neutral-900">Browse your favorite platforms</p>
                <p className="text-sm text-neutral-600">Navigate to any supported video on the web</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-neutral-100 text-sm font-medium text-neutral-700">
                3
              </div>
              <div>
                <p className="font-medium text-neutral-900">Save with one click</p>
                <p className="text-sm text-neutral-600">Click the extension icon to save videos to your collections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}