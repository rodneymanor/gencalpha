"use client";

import { Download, Chrome, Video, Zap, FolderOpen, ArrowRight, Shield } from "lucide-react";

export default function ChromeExtensionPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      {/* Hero Section - Using neutral-50 background for softer appearance */}
      <div className="bg-neutral-50 shadow-[var(--shadow-inset-subtle)]">
        <div className="container mx-auto px-6 py-16" style={{ maxWidth: "800px" }}>
          {/* Icon and Title */}
          <div className="mb-8 text-center">
            {/* Icon container with primary color accent */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 shadow-[var(--shadow-soft-drop)] transition-all duration-200">
              <Chrome className="text-brand-500 h-10 w-10" />
            </div>

            <h1 className="mb-4 text-4xl font-semibold text-neutral-950">Save Videos Instantly</h1>

            <p className="mx-auto max-w-xl text-lg text-neutral-600">
              Capture social media videos from anywhere on the web and save them directly to your collections with a
              single click.
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <a
              href="/downloads/genc-chrome-extension.zip"
              download="genc-chrome-extension.zip"
              className="group bg-brand-500 hover:bg-brand-600 flex items-center gap-3 rounded-[var(--radius-button)] px-8 py-4 text-white no-underline shadow-[var(--shadow-soft-drop)] transition-all duration-200 hover:-translate-y-px active:scale-[0.98]"
            >
              <Download className="h-5 w-5 text-white" />
              <span className="font-semibold">Download Extension</span>
              <ArrowRight className="h-4 w-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-16" style={{ maxWidth: "800px" }}>
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-2xl font-semibold text-neutral-950">What it does</h2>
          <p className="text-neutral-600">A powerful browser extension that streamlines your content workflow</p>
        </div>

        {/* Feature Grid */}
          <div className="grid gap-6 md:grid-cols-3">
          {/* Feature 1 */}
          {/* Feature card with primary accent */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6 transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="bg-brand-100 mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)]">
              <Video className="text-brand-700 h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-950">Universal Capture</h3>
            <p className="text-sm text-neutral-600">
              Works seamlessly across YouTube, TikTok, Twitter, Instagram, and more social platforms
            </p>
          </div>

          {/* Feature 2 - Brand accent for speed/efficiency */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6 transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="bg-brand-100 mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)]">
              <Zap className="text-brand-700 h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-950">One-Click Save</h3>
            <p className="text-sm text-neutral-600">
              Instantly save videos with metadata, thumbnails, and captions extracted automatically
            </p>
          </div>

          {/* Feature 3 - Success accent for organization */}
          <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-6 transition-all duration-200 hover:-translate-y-px hover:border-neutral-300 hover:shadow-[var(--shadow-soft-drop)]">
            <div className="bg-brand-100 mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)]">
              <FolderOpen className="text-brand-700 h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-neutral-950">Smart Organization</h3>
            <p className="text-sm text-neutral-600">
              Automatically categorizes content into your collections for easy access and management
            </p>
          </div>
        </div>

        {/* Install via Developer Mode */}
        <div className="mt-8 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-8 shadow-[var(--shadow-soft-drop)]">
          <h3 className="mb-6 text-center text-lg font-semibold text-neutral-950">Install via Developer Mode</h3>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              <div className="rounded-pill bg-brand-100 text-brand-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium">1</div>
              <div>
                <p className="font-medium text-neutral-950">Download and unzip</p>
                <p className="text-sm text-neutral-600">Download the ZIP above, then unzip it to a folder on your computer.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              <div className="rounded-pill bg-brand-100 text-brand-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium">2</div>
              <div>
                <p className="font-medium text-neutral-950">Open Chrome Extensions</p>
                <p className="text-sm text-neutral-600">In Chrome, go to chrome://extensions and toggle on Developer mode (top right).</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              <div className="rounded-pill bg-brand-100 text-brand-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium">3</div>
              <div>
                <p className="font-medium text-neutral-950">Load unpacked</p>
                <p className="text-sm text-neutral-600">Click “Load unpacked” and select the unzipped extension folder.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-4">
              <div className="rounded-pill bg-brand-100 text-brand-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium">4</div>
              <div>
                <p className="font-medium text-neutral-950">Pin and sign in</p>
                <p className="text-sm text-neutral-600">Pin the extension from the toolbar and sign in when prompted.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin-only access note */}
        <div className="mt-4 flex items-start gap-3 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100 p-4">
          <Shield className="text-neutral-700 mt-0.5 h-5 w-5" />
          <div>
            <p className="text-sm font-medium text-neutral-950">Admin-only access</p>
            <p className="text-sm text-neutral-600">This extension is not on a public store and is currently available only to admin accounts. If you don’t have admin access, please contact your workspace admin.</p>
          </div>
        </div>

        {/* Simple Steps - Elevated card with soft shadow */}
        <div className="mt-16 rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-8 shadow-[var(--shadow-soft-drop)]">
          <h3 className="mb-6 text-center text-lg font-semibold text-neutral-950">How to use</h3>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4">
              {/* Step numbers with primary accent */}
              <div className="rounded-pill bg-brand-100 text-brand-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium transition-all duration-150">
                1
              </div>
              <div>
                <p className="font-medium text-neutral-950">Browse your favorite platforms</p>
                <p className="text-sm text-neutral-600">Navigate to any supported video on the web</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4">
              {/* Step numbers with primary accent */}
              <div className="rounded-pill bg-brand-100 text-brand-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium transition-all duration-150">
                2
              </div>
              <div>
                <p className="font-medium text-neutral-950">Save with one click</p>
                <p className="text-sm text-neutral-600">Click the extension icon to save videos to your collections</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4">
              {/* Step numbers with primary accent */}
              <div className="rounded-pill bg-brand-100 text-brand-700 flex h-8 w-8 shrink-0 items-center justify-center text-sm font-medium transition-all duration-150">
                3
              </div>
              <div>
                <p className="font-medium text-neutral-950">Manage your content</p>
                <p className="text-sm text-neutral-600">Find, organize, and edit saved videos in your collections</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
