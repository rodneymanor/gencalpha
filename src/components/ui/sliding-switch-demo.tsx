'use client'

import React, { useState } from 'react'
import { Bot, Globe, Pencil } from 'lucide-react'
import { SlidingSwitch, SlidingSwitchOption } from './sliding-switch'

export default function SlidingSwitchDemo() {
  const switchOptions: SlidingSwitchOption[] = [
    { value: 'writer', icon: <Bot size={20} /> },
    { value: 'global', icon: <Globe size={20} /> },
    { value: 'notes', icon: <Pencil size={20} /> },
  ]

  const [selectedValue, setSelectedValue] = useState(switchOptions[0].value)

  const handleOptionChange = (index: number, option: SlidingSwitchOption) => {
    setSelectedValue(option.value)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          Icon-Only Sliding Switch
        </h1>
        <p className="text-muted-foreground mb-8">
          The switch now uses only icons for selection. The text labels have been removed.
        </p>
        
        <div className="flex justify-center mb-8">
          <SlidingSwitch 
            options={switchOptions} 
            onChange={handleOptionChange}
          />
        </div>

        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <p className="text-muted-foreground">
            Selected Value: 
            <span className="font-mono bg-muted text-primary py-1 px-2 rounded-md ml-2">
              {selectedValue}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}