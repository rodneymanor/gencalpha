'use client'

import { useState, useEffect, use } from 'react'
import FirebaseConfigError from "@/components/firebase-config-error"
import { StreamlinedScriptWriter } from "@/components/script-generation/streamlined-script-writer"
import ExpandableSection from "@/components/ui/expandable-section"
import { ScriptCardGrid } from "@/components/script-display"
import { sampleScripts } from "@/components/script-display/sample-data"

export default function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const [hasFirebaseConfig, setHasFirebaseConfig] = useState(false)
  
  // Unwrap search params using React.use()
  const params = use(searchParams)
  
  // Process search params
  const initialPrompt = typeof params.prompt === "string" ? params.prompt : undefined
  const remountKey = typeof params.new === "string" ? params.new : undefined
  const fromLibrary = typeof params.from === "string" && params.from === "library"
  const preselectedGenerator = typeof params.generator === "string" ? params.generator : undefined
  const preselectedTemplate = typeof params.template === "string" ? params.template : undefined

  useEffect(() => {
    // Check Firebase config on client side
    const isConfigured = 
      typeof window !== 'undefined' && 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key"
    
    setHasFirebaseConfig(!!isConfigured)
  }, [])

  if (!hasFirebaseConfig && typeof window !== 'undefined') {
    return <FirebaseConfigError />
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans flex flex-col">
      {/* Main content area - constrain height to leave room for expand trigger */}
      <div className="flex-1 max-h-[calc(100vh-60px)] overflow-hidden">
        <StreamlinedScriptWriter
          key={remountKey}
          initialPrompt={initialPrompt}
          fromLibrary={fromLibrary}
          preselectedGenerator={preselectedGenerator}
          preselectedTemplate={preselectedTemplate}
          className="from-background to-background-muted bg-gradient-to-b h-full"
        />
      </div>

      {/* Expandable section trigger - always visible at bottom */}
      <ExpandableSection
        collapsedText="Explore Daily Content"
        expandedText="Hide Content Library"
      >
        <ScriptCardGrid 
          scripts={sampleScripts}
          title="Daily Content Examples"
          subtitle="Proven scripts that convert across different niches"
        />
      </ExpandableSection>
    </div>
  )
}