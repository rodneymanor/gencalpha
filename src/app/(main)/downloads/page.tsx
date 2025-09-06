"use client";

import { useState } from "react";

import { Download, Chrome, Smartphone, ArrowRight, CheckCircle, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Download page component featuring Chrome extension and iOS shortcut
export default function DownloadsPage() {
  const [installedChrome, setInstalledChrome] = useState(false);
  const [installedIOS, setInstalledIOS] = useState(false);

  // Handle Chrome extension installation
  const handleChromeInstall = () => {
    // Open Chrome Web Store link - placeholder URL for now
    window.open("https://chrome.google.com/webstore/", "_blank");
    setInstalledChrome(true);
  };

  // Handle iOS shortcut installation
  const handleIOSInstall = () => {
    // Open iOS Shortcuts app with custom shortcut - placeholder URL for now
    window.open("https://www.icloud.com/shortcuts/", "_blank");
    setInstalledIOS(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-6 py-8" style={{ maxWidth: "1000px" }}>
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="bg-brand-50 text-brand-700 rounded-pill border-brand-200 mb-4 inline-flex items-center border px-3 py-1 text-sm font-medium">
            New Features
          </div>

          <h1 className="mb-3 text-4xl font-bold text-neutral-900">Expand what you can do with Claude</h1>

          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            Two new ways to capture and save content directly to your Claude collections. Install our browser extension
            and mobile shortcut to streamline your workflow.
          </p>
        </div>

        {/* Download Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Chrome Extension Card */}
          <Card className="border-neutral-200 bg-neutral-50 transition-all duration-200 hover:border-neutral-300 hover:bg-white">
            <CardHeader className="pb-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-white">
                  <Chrome className="h-6 w-6 text-neutral-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-neutral-900">Chrome Extension</CardTitle>
                  <p className="text-sm text-neutral-500">For Desktop Browsers</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex aspect-video items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100">
                <div className="text-center">
                  <Download className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                  <p className="text-sm text-neutral-500">Extension Preview</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">Save videos to collections</h3>
                <p className="mb-4 text-sm text-neutral-600">
                  Add social videos from YouTube, Twitter, TikTok, and more directly to your Claude collections single
                  click. Works seamlessly across all major social media platforms.
                </p>

                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" />
                    One-click video saving
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" />
                    Auto-metadata extraction
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" />
                    Collection organization
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" />
                    Works on YouTube, TikTok, Twitter
                  </li>
                </ul>

                {installedChrome ? (
                  <Button className="bg-primary-500 hover:bg-primary-600 w-full text-white" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Installed
                  </Button>
                ) : (
                  <Button
                    onClick={handleChromeInstall}
                    className="bg-primary-500 hover:bg-primary-600 w-full text-white"
                  >
                    Add to Chrome
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* iOS Shortcut Card */}
          <Card className="border-neutral-200 bg-neutral-50 transition-all duration-200 hover:border-neutral-300 hover:bg-white">
            <CardHeader className="pb-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-white">
                  <Smartphone className="h-6 w-6 text-neutral-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-neutral-900">iOS Shortcut</CardTitle>
                  <p className="text-sm text-neutral-500">For iPhone Users</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex aspect-video items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-100">
                <div className="text-center">
                  <Download className="mx-auto mb-2 h-8 w-8 text-neutral-400" />
                  <p className="text-sm text-neutral-500">Shortcut Preview</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">Voice notes shortcut</h3>
                <p className="mb-4 text-sm text-neutral-600">
                  Record thoughts instantly using your iPhone&apos;s voice memo button and add text notes. syncs with
                  Claude for seamless content creation workflow.
                </p>

                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" />
                    Quick voice recording
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" />
                    Auto-transcription
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" />
                    Text note addition
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" />
                    Claude integration
                  </li>
                </ul>

                {installedIOS ? (
                  <Button className="bg-primary-500 hover:bg-primary-600 w-full text-white" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Installed
                  </Button>
                ) : (
                  <Button onClick={handleIOSInstall} className="bg-primary-500 hover:bg-primary-600 w-full text-white">
                    Get Shortcut
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works Section */}
        <Card className="mb-8 border-neutral-200 bg-white">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-neutral-900">How it works</CardTitle>
            <p className="text-center text-neutral-600">Simple steps to get started with both tools</p>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Chrome Extension Steps */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
                  <Chrome className="h-5 w-5" />
                  Chrome Extension
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-brand-100 text-brand-700 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Install the extension</p>
                      <p className="text-sm text-neutral-600">Add to Chrome from the Web Store</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-brand-100 text-brand-700 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Browse social videos</p>
                      <p className="text-sm text-neutral-600">Visit YouTube, TikTok, or Twitter</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-brand-100 text-brand-700 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Save to Claude</p>
                      <p className="text-sm text-neutral-600">Click the extension icon to save any video</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* iOS Shortcut Steps */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
                  <Smartphone className="h-5 w-5" />
                  iOS Shortcut
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="bg-brand-100 text-brand-700 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Install the shortcut</p>
                      <p className="text-sm text-neutral-600">Add from the iOS Shortcuts app</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-brand-100 text-brand-700 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Record your thoughts</p>
                      <p className="text-sm text-neutral-600">Use voice memo button or Siri activation</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-brand-100 text-brand-700 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Auto-sync to Claude</p>
                      <p className="text-sm text-neutral-600">Voice notes appear in your Claude workspace</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Section */}
        <Card className="border-neutral-200 bg-neutral-50">
          <CardContent className="py-6">
            <div className="text-center">
              <h3 className="mb-2 font-semibold text-neutral-900">Need help getting started?</h3>
              <p className="mb-4 text-neutral-600">Check out our detailed setup guides and troubleshooting tips</p>
              <Button variant="outline" className="border-neutral-200 hover:bg-white">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Documentation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
