"use client";

import { useState } from "react";
import { ModernAISidebar } from "@/components/test/modern-ai-sidebar";

export default function ModernSidebarTestPage() {
  const [selectedItem, setSelectedItem] = useState<string>("new-script");

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <ModernAISidebar selectedItem={selectedItem} onItemSelect={setSelectedItem} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Modern AI Sidebar Test</h1>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-medium text-gray-900 mb-6">Testing Modern AI Sidebar Design</h2>
            
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Design Features</h3>
                <ul className="text-gray-600 space-y-2">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Currently Selected</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 font-medium">{selectedItem}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
