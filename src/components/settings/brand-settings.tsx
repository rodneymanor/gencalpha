"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { RSS_FEEDS, CATEGORY_KEYWORDS, type Category } from "@/lib/rss-service"

interface BrandSettings {
  userId: string
  selectedCategories: Category[]
  customKeywords: string[]
  updatedAt: string
}

export function BrandSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<BrandSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([])

  // Category information for display
  const categoryInfo = {
    ai: {
      label: "Artificial Intelligence",
      description: "AI, machine learning, and technology trends",
      icon: "🤖"
    },
    fitness: {
      label: "Fitness & Health", 
      description: "Workout routines, nutrition, and wellness tips",
      icon: "💪"
    },
    celebrities: {
      label: "Celebrities & Entertainment",
      description: "Celebrity news, entertainment, and pop culture", 
      icon: "⭐"
    },
    business: {
      label: "Business & Finance",
      description: "Startups, funding, market trends, and economics",
      icon: "💼"
    },
    gaming: {
      label: "Gaming",
      description: "Video games, esports, and gaming industry news",
      icon: "🎮"
    }
  }

  // Load user brand settings
  useEffect(() => {
    if (user) {
      loadBrandSettings()
    }
  }, [user])

  const loadBrandSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/user/brand-settings')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.settings) {
          setSettings(data.settings)
          setSelectedCategories(data.settings.selectedCategories || [])
        } else {
          // No settings found, start with empty
          setSelectedCategories([])
        }
      }
    } catch (error) {
      console.error('Error loading brand settings:', error)
      setSelectedCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const saveBrandSettings = async () => {
    if (!user) return

    try {
      setIsSaving(true)
      
      const settingsToSave: Omit<BrandSettings, 'updatedAt'> = {
        userId: user.uid,
        selectedCategories,
        customKeywords: [] // For future expansion
      }

      const response = await fetch('/api/user/brand-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsToSave)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setSettings(data.settings)
          // Show success message or toast
          console.log('Brand settings saved successfully')
        }
      }
    } catch (error) {
      console.error('Error saving brand settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCategoryToggle = (category: Category) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-neutral-200 rounded-[var(--radius-button)] animate-pulse" />
        <div className="h-32 bg-neutral-200 rounded-[var(--radius-card)] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Brand Settings</h2>
        <p className="text-neutral-600 mt-1">
          Choose the topics that are relevant to your brand to get personalized content suggestions.
        </p>
      </div>

      {/* Category Selection */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Content Categories</h3>
            <p className="text-sm text-neutral-600">
              Select the categories that align with your brand and content strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(Object.keys(RSS_FEEDS) as Category[]).map((category) => {
              const info = categoryInfo[category]
              const isSelected = selectedCategories.includes(category)
              const keywordCount = CATEGORY_KEYWORDS[category]?.length || 0

              return (
                <div
                  key={category}
                  className={`
                    p-4 rounded-[var(--radius-card)] border-2 transition-all duration-200 cursor-pointer
                    ${isSelected 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-neutral-200 bg-neutral-50 hover:border-neutral-300'
                    }
                  `}
                  onClick={() => handleCategoryToggle(category)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{info.icon}</span>
                        <h4 className="font-medium text-neutral-900">{info.label}</h4>
                      </div>
                      <p className="text-sm text-neutral-600 mb-2">
                        {info.description}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {keywordCount} keywords
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected Categories Preview */}
          {selectedCategories.length > 0 && (
            <div className="mt-6 p-4 bg-primary-50 rounded-[var(--radius-card)] border border-primary-200">
              <h4 className="font-medium text-primary-900 mb-2">Selected Categories</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map(category => (
                  <Badge key={category} variant="default" className="bg-primary-600 text-white">
                    {categoryInfo[category].icon} {categoryInfo[category].label}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-primary-700 mt-2">
                You'll receive trending content suggestions from these categories in your input dropdown.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveBrandSettings}
          disabled={isSaving}
          className="bg-neutral-900 text-neutral-50 hover:bg-neutral-800 rounded-[var(--radius-button)]"
        >
          {isSaving ? 'Saving...' : 'Save Brand Settings'}
        </Button>
      </div>
    </div>
  )
}