"use client";

import { useState } from "react";

import { ModernAISidebar } from "@/components/test/modern-ai-sidebar";

export default function ModernSidebarTestPage() {
  const [selectedItem, setSelectedItem] = useState<string>("new-script");

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <ModernAISidebar selectedItem={selectedItem} onItemSelect={setSelectedItem} />

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex h-16 items-center border-b border-gray-200 bg-white px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Modern AI Sidebar Test</h1>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-xl font-medium text-gray-900">Testing Modern AI Sidebar Design</h2>

            <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">Design Features</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 280px width with smooth expand/collapse functionality</li>
                  <li>• Grouped sections: Create, Organize, Recent</li>
                  <li>• User profile with AI assistant status indicator</li>
                  <li>• Modern visual design with white background and gradients</li>
                  <li>• Multi-layer depth shadows</li>
                  <li>• Hover states and micro-animations (200-300ms)</li>
                  <li>• Interactive search functionality</li>
                  <li>• Badge indicators for notifications</li>
                  <li>• Smart suggestions section</li>
                </ul>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium text-gray-900">Currently Selected</h3>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <p className="font-medium text-blue-800">{selectedItem}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
