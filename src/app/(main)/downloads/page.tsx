"use client";

import { useState } from "react";

import { Smartphone, ArrowRight, CheckCircle, ExternalLink, Key } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Download page featuring two iOS shortcuts
export default function DownloadsPage() {
  const [installedIOSVideos, setInstalledIOSVideos] = useState(false);
  const [installedIOS, setInstalledIOS] = useState(false);

  // Handle iOS Shortcut (Add to Collections) installation
  const handleIOSVideosInstall = () => {
    // Direct link to iCloud shortcut
    window.open("https://www.icloud.com/shortcuts/4df1106c51d8490d912ef65502fb187c", "_blank");
    setInstalledIOSVideos(true);
  };

  // Handle iOS Shortcut (Voice Notes) installation
  const handleIOSInstall = () => {
    // Direct link to iCloud shortcut
    window.open("https://www.icloud.com/shortcuts/cdd9fc53f93149d0a5341589fd1cd4c0", "_blank");
    setInstalledIOS(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-6 py-8" style={{ maxWidth: "1000px" }}>
        {/* Setup Requirements (Emphasized) */}
        <div className="mb-6">
          <div className="border-brand-200 bg-brand-50 rounded-[var(--radius-card)] border p-4 shadow-[var(--shadow-soft-drop)]">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-button)] bg-white">
                <Key className="text-brand-700 h-4 w-4" />
              </div>
              <div className="text-brand-700 text-sm font-semibold tracking-wide">Important — Before You Start</div>
            </div>
            <ul className="list-disc space-y-2 pl-6 text-sm text-neutral-800">
              <li>
                Get your API key from Settings → API Keys.
                <Button asChild variant="soft" size="sm" className="ml-2 align-middle">
                  <a href="/settings?tab=api-keys">Open Settings</a>
                </Button>
              </li>
              <li>
                On first run, the shortcut will ask for your API key. Paste it when prompted — it will be saved locally
                for future use.
              </li>
              <li>The shortcut may request 2–3 permissions the first time. Allow them to continue.</li>
              <li>
                Link support (Collections shortcut): works with Instagram Reels (including share links that are Reels)
                and TikTok links.
              </li>
            </ul>
          </div>
        </div>

        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="bg-brand-50 text-brand-700 rounded-pill border-brand-200 mb-4 inline-flex items-center border px-3 py-1 text-sm font-medium">
            New Features
          </div>

          <h1 className="mb-3 text-4xl font-bold text-neutral-900">Expand what you can do with Gen.C</h1>

          <p className="mx-auto max-w-2xl text-lg text-neutral-600">
            Two new ways to capture and save content directly to your Gen.C collections. Install our mobile shortcuts
            to streamline your workflow on iPhone.
          </p>
        </div>

        {/* Setup Requirements (moved above) */}

        {/* Download Cards */}
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* iOS Shortcut - Save Videos Card */}
          <Card className="border-neutral-200 bg-neutral-50 transition-all duration-200 hover:border-neutral-300 hover:bg-white">
            <CardHeader className="pb-4">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-card)] border border-neutral-200 bg-white">
                  <Smartphone className="h-6 w-6 text-neutral-700" />
                </div>
                <div>
                  <CardTitle className="text-xl text-neutral-900">iOS Shortcut — Save Videos</CardTitle>
                  <p className="text-sm text-neutral-500">For iPhone Users</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">Save videos to collections</h3>
                <p className="mb-4 text-sm text-neutral-600">
                  On iPhone, use the Share Sheet to add videos from YouTube, Twitter, TikTok, and more directly to your
                  Gen.C collections in a single tap. Works from Safari and most social apps.
                </p>

                <ul className="mb-6 space-y-2">
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" /> One-tap saving via Share Sheet
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" /> Auto-metadata extraction
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" /> Collection organization
                  </li>
                  <li className="flex items-center gap-2 text-sm text-neutral-600">
                    <CheckCircle className="text-primary-500 h-4 w-4" /> Works on YouTube, TikTok, Twitter
                  </li>
                </ul>

                {installedIOSVideos ? (
                  <Button className="bg-primary-500 hover:bg-primary-600 w-full text-white" disabled>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Installed
                  </Button>
                ) : (
                  <Button
                    onClick={handleIOSVideosInstall}
                    className="bg-primary-500 hover:bg-primary-600 w-full text-white"
                  >
                    Get Shortcut
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
              <div>
                <h3 className="mb-2 font-semibold text-neutral-900">Voice notes shortcut</h3>
                <p className="mb-4 text-sm text-neutral-600">
                  Record thoughts instantly using your iPhone&apos;s voice memo button and add text notes. syncs with
                  Gen.C for seamless content creation workflow.
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
            <p className="text-center text-neutral-600">Simple steps to get started with both shortcuts</p>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* iOS Shortcut — Save Videos Steps */}
              <div>
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-neutral-900">
                  <Smartphone className="h-5 w-5" />
                  iOS Shortcut — Save Videos
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
                      <p className="font-medium text-neutral-900">Open a video</p>
                      <p className="text-sm text-neutral-600">Use Safari or the YouTube/TikTok/Twitter apps</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="bg-brand-100 text-brand-700 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">Share to Gen.C</p>
                      <p className="text-sm text-neutral-600">Use the Share Sheet → ‘Save to Gen.C’</p>
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
                      <p className="font-medium text-neutral-900">Auto-sync to Gen.C</p>
                      <p className="text-sm text-neutral-600">Voice notes appear in your Gen.C workspace</p>
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
