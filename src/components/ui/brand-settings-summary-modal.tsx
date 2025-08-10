"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from '@/components/ui/visually-hidden'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ClientOnboardingService } from '@/lib/services/client-onboarding-service'
import { OnboardingSelections } from '@/components/ui/onboarding-wizard-modal'
import { 
  User, 
  Target, 
  Video, 
  Hash, 
  Lightbulb, 
  Edit3,
  Globe
} from 'lucide-react'
import { ClarityLoader } from "@/components/ui/loading"

interface BrandSettingsSummaryModalProps {
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
}

// Content data (imported from onboarding wizard)
const CONTENT_TOPICS = {
  lifestyle_wellness: { name: "Lifestyle & Wellness", icon: "🌿" },
  beauty_fashion: { name: "Beauty & Fashion", icon: "💄" },
  entertainment_comedy: { name: "Entertainment & Comedy", icon: "🎭" },
  food_cooking: { name: "Food & Cooking", icon: "🍳" },
  education_diy: { name: "Educational & DIY", icon: "📚" },
  business_finance: { name: "Business & Finance", icon: "💼" },
  travel_adventure: { name: "Travel & Adventure", icon: "✈️" },
  technology_gaming: { name: "Technology & Gaming", icon: "🎮" },
  pets_animals: { name: "Pets & Animals", icon: "🐾" },
  fitness_sports: { name: "Fitness & Sports", icon: "💪" }
};

const CONTENT_TYPES = [
  { id: "educational", name: "Educational/Tutorial", icon: "🎓" },
  { id: "entertainment", name: "Entertainment/Comedy", icon: "😂" },
  { id: "lifestyle", name: "Lifestyle/Personal", icon: "✨" },
  { id: "reviews", name: "Product Reviews", icon: "⭐" },
  { id: "bts", name: "Behind-the-Scenes", icon: "🎬" },
  { id: "trends", name: "Challenges/Trends", icon: "🔥" }
];

const PLATFORMS = [
  { id: "tiktok", name: "TikTok", icon: "🎵" },
  { id: "instagram", name: "Instagram Reels", icon: "📸" },
  { id: "youtube", name: "YouTube Shorts", icon: "▶️" },
  { id: "all", name: "All Platforms", icon: "🌐" }
];

export function BrandSettingsSummaryModal({ 
  isOpen, 
  onClose, 
  onEdit 
}: BrandSettingsSummaryModalProps) {
  const [onboardingData, setOnboardingData] = useState<OnboardingSelections | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      loadOnboardingData()
    }
  }, [isOpen])

  const loadOnboardingData = async () => {
    try {
      setIsLoading(true)
      const data = await ClientOnboardingService.getSelections()
      setOnboardingData(data)
    } catch (error) {
      console.error('Failed to load onboarding data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    onEdit?.()
    onClose()
  }

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <VisuallyHidden>
              <DialogTitle>Loading Brand Settings</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <ClarityLoader size="sm" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!onboardingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Brand Settings
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-muted rounded-full">
                <Lightbulb className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">No brand settings found.</p>
              <p className="text-sm text-muted-foreground">Complete the onboarding process to set up your content preferences.</p>
            </div>
            <Button onClick={onClose} className="mt-4">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Brand Settings Summary
          </DialogTitle>
          <Button
            onClick={handleEdit}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Edit Settings
          </Button>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Content Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Video className="h-5 w-5" />
                  Content Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {onboardingData.contentTypes.map(typeId => {
                    const type = CONTENT_TYPES.find(t => t.id === typeId)
                    return type ? (
                      <Badge key={typeId} variant="secondary" className="gap-1">
                        <span>{type.icon}</span>
                        {type.name}
                      </Badge>
                    ) : null
                  })}
                </div>
                {onboardingData.contentTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">No content types selected</p>
                )}
              </CardContent>
            </Card>

            {/* Main Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Main Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {onboardingData.mainTopics.map(topicKey => {
                    const topic = CONTENT_TOPICS[topicKey as keyof typeof CONTENT_TOPICS]
                    return topic ? (
                      <Badge key={topicKey} variant="secondary" className="gap-1">
                        <span>{topic.icon}</span>
                        {topic.name}
                      </Badge>
                    ) : null
                  })}
                </div>
                {onboardingData.mainTopics.length === 0 && (
                  <p className="text-sm text-muted-foreground">No main topics selected</p>
                )}
              </CardContent>
            </Card>

            {/* Subtopics */}
            {onboardingData.subtopics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hash className="h-5 w-5" />
                    Specific Interests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {onboardingData.subtopics.map(subtopic => (
                      <Badge key={subtopic} variant="outline" className="text-xs">
                        {subtopic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Topics */}
            {onboardingData.customTopics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5" />
                    Custom Niches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {onboardingData.customTopics.map(topic => (
                      <Badge key={topic} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Platforms */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5" />
                  Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {onboardingData.platforms.map(platformId => {
                    const platform = PLATFORMS.find(p => p.id === platformId)
                    return platform ? (
                      <Badge key={platformId} variant="secondary" className="gap-1">
                        <span>{platform.icon}</span>
                        {platform.name}
                      </Badge>
                    ) : null
                  })}
                </div>
                {onboardingData.platforms.length === 0 && (
                  <p className="text-sm text-muted-foreground">No platforms selected</p>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}