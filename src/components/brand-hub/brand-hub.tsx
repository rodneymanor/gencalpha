'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { CreatorPersonaGrid, type CreatorPersona } from '@/components/creator-personas/creator-persona-card'
import { PersonaApiService } from '@/app/(main)/personas/services/api'
import { UserManagementService } from '@/lib/user-management'

// Type definitions for brand voice and content data
interface BrandVoice {
  id: string
  title: string
  source: string
  icon: string
}

interface Creator {
  id: string
  name: string
  platform: string
  category: string
  postsAnalyzed: number
  avatar: string
}

interface ContentItem {
  id: string
  title: string
  creator: string
  views: string
  platform: 'instagram' | 'tiktok'
  insights: {
    hook: string
    format: string
    length: string
  }
}

interface TopicPillar {
  title: string
  description: string
  examples: string
}

interface TopicData {
  emoji: string
  name: string
  coreMessage: string
  personality: string
  keywords: string[]
  pillars: TopicPillar[]
}

interface BrandHubProps {
  initialBrandVoices?: BrandVoice[]
  initialCreators?: Creator[]
  initialContent?: ContentItem[]
  onSaveSettings?: (settings: any) => void
  onAnalyzeVideo?: (url: string) => void
  onAddCreator?: (handle: string, platform: string) => void
}

const BrandHub: React.FC<BrandHubProps> = ({
  initialBrandVoices = [],
  initialCreators = [],
  initialContent = [],
  onSaveSettings,
  onAnalyzeVideo,
  onAddCreator
}) => {
  // State management for the component
  const [activeSection, setActiveSection] = useState<'content-settings' | 'knowledge-base' | 'brand-voice'>('brand-voice')
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedUserType, setSelectedUserType] = useState<'Personal' | 'Business' | 'Agency/Freelancer'>('Personal')
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set())
  const [hasChanges, setHasChanges] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [creatorHandle, setCreatorHandle] = useState('')
  const [selectedPlatform, setSelectedPlatform] = useState<'instagram' | 'tiktok'>('instagram')
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>(initialBrandVoices)
  const [creators, setCreators] = useState<Creator[]>(initialCreators)
  const [contentItems, setContentItems] = useState<ContentItem[]>(initialContent)
  const { user } = useAuth()
  const [personas, setPersonas] = useState<CreatorPersona[]>([])
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null)
  const [isSavingPersona, setIsSavingPersona] = useState(false)

  // Topic configuration data following the numbered variant system
  const topicData: Record<string, TopicData> = {
    ai: {
      emoji: '🤖',
      name: 'Artificial Intelligence',
      coreMessage: 'AI isn\'t replacing you - it\'s waiting for you to lead with it',
      personality: 'The approachable tech translator - breaking down complex AI concepts with enthusiasm and patience',
      keywords: ['AI tools', 'ChatGPT', 'automation', 'prompt engineering', 'workflow'],
      pillars: [
        {
          title: 'Master Class Moments',
          description: 'Deep-dive tutorials on specific AI tools with step-by-step implementation guides',
          examples: 'Complete ChatGPT workflow setup, Building custom GPTs, Advanced prompting'
        },
        {
          title: 'AI in 60 Seconds',
          description: 'Lightning-fast demonstrations of AI solving real problems',
          examples: '5-second email rewrites, Instant presentation outlines, One-prompt solutions'
        },
        {
          title: 'The AI Reality Check',
          description: 'Debunking myths and showing what AI actually can and can\'t do',
          examples: 'AI won\'t take your job but..., The truth about AI limitations'
        },
        {
          title: 'This Week in AI',
          description: 'Breaking down the latest AI releases and what they mean for you',
          examples: 'New ChatGPT features explained, Tool of the week, Industry disruptions'
        },
        {
          title: 'AI Transformation Stories',
          description: 'Real people achieving incredible results with AI',
          examples: 'From 60-hour to 30-hour work weeks, Small business AI wins'
        }
      ]
    },
    content: {
      emoji: '📱',
      name: 'Content Creation',
      coreMessage: 'Your unique perspective is your unfair advantage - stop copying and start creating',
      personality: 'The encouraging coach who\'s been there - sharing wins and failures with transparency and infectious energy',
      keywords: ['content creation', 'Instagram growth', 'TikTok strategy', 'viral content', 'creator economy'],
      pillars: [
        {
          title: 'Creator Deep Dives',
          description: 'Comprehensive breakdowns of successful content strategies and why they work',
          examples: 'Analyzing viral videos frame by frame, 30-day content calendar creation'
        },
        {
          title: 'Growth Hacks in 30',
          description: 'Bite-sized tactics you can implement immediately',
          examples: 'Hook formulas that work, Best posting times revealed, Caption templates'
        },
        {
          title: 'Creator Economics 101',
          description: 'Understanding the business side of content creation',
          examples: 'How the algorithm really works, Platform changes explained'
        },
        {
          title: 'What\'s Working Now',
          description: 'Real-time updates on platform changes and trending formats',
          examples: 'This week\'s trending audio, New feature tutorials, Algorithm updates'
        },
        {
          title: 'Creator Spotlight',
          description: 'Success stories and mindset shifts from the creator journey',
          examples: 'From 0 to 100K in 6 months, Finding your content niche'
        }
      ]
    },
    productivity: {
      emoji: '⚡',
      name: 'Business Productivity',
      coreMessage: 'Productivity isn\'t about doing more - it\'s about doing what matters',
      personality: 'The no-BS efficiency expert who gets things done - practical, direct, but always supportive',
      keywords: ['productivity', 'time management', 'business systems', 'workflow optimization', 'automation'],
      pillars: [
        {
          title: 'System Blueprints',
          description: 'Complete productivity system implementations from start to finish',
          examples: 'Building your weekly planning system, Creating SOPs for delegation'
        },
        {
          title: '2-Minute Optimizations',
          description: 'Instant productivity wins you can implement right now',
          examples: 'Email templates that save hours, The 2-minute rule, Quick decisions'
        },
        {
          title: 'Productivity Psychology',
          description: 'Understanding why we procrastinate and how to overcome it',
          examples: 'The myth of multitasking, Energy vs time management'
        },
        {
          title: 'Tools That Actually Work',
          description: 'Testing and reviewing the latest productivity tools and methods',
          examples: 'New app reviews, AI productivity tools, Trending frameworks tested'
        },
        {
          title: 'The 4-Hour Success Stories',
          description: 'Real entrepreneurs who transformed their productivity',
          examples: 'From 80 to 40 hour weeks, Building a self-running business'
        }
      ]
    },
    nutrition: {
      emoji: '🥗',
      name: 'Nutrition',
      coreMessage: 'Nutrition isn\'t about perfection - it\'s about consistent, smart choices that fit your life',
      personality: 'The approachable nutritionist friend - evidence-based but never preachy, realistic and encouraging',
      keywords: ['nutrition', 'healthy eating', 'meal prep', 'gut health', 'balanced diet'],
      pillars: [
        {
          title: 'Nutrition Deep Science',
          description: 'Breaking down complex nutrition research into actionable advice',
          examples: 'Gut health masterclass, Understanding macros for energy'
        },
        {
          title: '60-Second Nutrition Wins',
          description: 'Quick tips and swaps that make a big difference',
          examples: '5-minute breakfast ideas, Smart snack swaps, One-ingredient additions'
        },
        {
          title: 'Nutrition Myths Busted',
          description: 'Debunking common nutrition misconceptions with science',
          examples: 'The truth about carbs, Protein myths decoded, Supplement facts'
        },
        {
          title: 'Trending Diets Reviewed',
          description: 'Honest analysis of popular nutrition trends',
          examples: 'Intermittent fasting reality, New superfoods tested'
        },
        {
          title: 'Food Freedom Stories',
          description: 'Real transformations through sustainable nutrition',
          examples: 'From diet prisoner to food freedom, Energy transformation stories'
        }
      ]
    }
  }

  // Event handlers using numbered variant progression for state changes
  const handleTopicSelect = (topicKey: string) => {
    setSelectedTopic(topicKey)
    setHasChanges(true)
  }

  const handleUserTypeSelect = (userType: 'Personal' | 'Business' | 'Agency/Freelancer') => {
    setSelectedUserType(userType)
    setHasChanges(true)
  }

  const handleGoalToggle = (goal: string) => {
    const newGoals = new Set(selectedGoals)
    if (newGoals.has(goal)) {
      newGoals.delete(goal)
    } else {
      newGoals.add(goal)
    }
    setSelectedGoals(newGoals)
    setHasChanges(true)
  }

  const handleSaveSettings = () => {
    if (!hasChanges) return
    
    const settings = {
      selectedTopic,
      selectedUserType,
      selectedGoals: Array.from(selectedGoals)
    }
    
    onSaveSettings?.(settings)
    setHasChanges(false)
  }

  const handleAnalyzeVideo = () => {
    if (!videoUrl.trim()) return
    
    onAnalyzeVideo?.(videoUrl)
    setVideoUrl('')
  }

  const handleAddCreator = () => {
    if (!creatorHandle.trim()) return
    
    onAddCreator?.(creatorHandle, selectedPlatform)
    setCreatorHandle('')
  }

  // Load user personas and current brand voice selection
  useEffect(() => {
    const loadPersonas = async () => {
      try {
        const list = await PersonaApiService.loadPersonas()
        const converted: CreatorPersona[] = list.map((p: any) => {
          const initials = (p.name || '?')
            .split(' ')
            .map((w: string) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
          return {
            id: p.id,
            name: p.name,
            initials,
            followers: p.username ? `@${p.username}` : (p.platform ?? 'TikTok'),
            lastEdited: p.lastUsedAt ? `Used ${new Date(p.lastUsedAt).toLocaleDateString()}` : 'Recently added',
            avatarVariant: 'light',
          }
        })
        setPersonas(converted)
      } catch (e) {
        console.error('Failed to load personas', e)
      }
    }

    const loadCurrentSelection = async () => {
      try {
        if (!user) return
        const profile = await UserManagementService.getUserProfile(user.uid)
        const brandPersonaId = (profile as any)?.brandPersonaId as string | undefined
        if (brandPersonaId) setSelectedPersonaId(brandPersonaId)
      } catch (e) {
        console.warn('Could not load current brand voice selection')
      }
    }

    loadPersonas()
    loadCurrentSelection()
  }, [user])

  const handleSaveBrandVoice = async () => {
    if (!user || !selectedPersonaId) return
    try {
      setIsSavingPersona(true)
      await UserManagementService.updateUserProfile(user.uid, { brandPersonaId: selectedPersonaId } as any)
      setHasChanges(false)
    } catch (e) {
      console.error('Failed to save brand voice', e)
    } finally {
      setIsSavingPersona(false)
    }
  }

  const handleImmediateSaveBrandVoice = async (personaId: string) => {
    if (!user) return
    try {
      setSelectedPersonaId(personaId)
      setIsSavingPersona(true)
      await UserManagementService.updateUserProfile(user.uid, { brandPersonaId: personaId } as any)
      setHasChanges(false)
    } catch (e) {
      console.error('Failed to save brand voice', e)
    } finally {
      setIsSavingPersona(false)
    }
  }

  // Component rendering with numbered variant system
  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header with neutral-200 border using numbered variants */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-background">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-500 rounded-[var(--radius-button)] flex items-center justify-center text-white font-semibold text-sm">
            C
          </div>
          <span className="text-neutral-900 font-medium text-sm">Brand Hub</span>
        </div>
        {/* Removed user initials avatar to avoid overlapping the modal close icon */}
        <div />
      </header>

      <div className="flex-1 min-h-0 flex">
        {/* Sidebar with neutral-50 background and numbered variant borders */}
        <aside className="w-60 shrink-0 border-r border-neutral-200 bg-neutral-50 p-4 overflow-y-auto">
          <nav className="space-y-1">
            <div 
              className={`flex items-center px-3 py-2 rounded-[var(--radius-button)] text-sm font-normal cursor-pointer transition-all duration-150 ${
                activeSection === 'content-settings' 
                  ? 'bg-brand-500 text-white' 
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
              onClick={() => setActiveSection('content-settings')}
            >
              <span className="mr-3 w-4 text-center">⚙</span>
              Content Settings
            </div>
            <div 
              className={`flex items-center px-3 py-2 rounded-[var(--radius-button)] text-sm font-normal cursor-pointer transition-all duration-150 ${
                activeSection === 'knowledge-base' 
                  ? 'bg-brand-500 text-white' 
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
              onClick={() => setActiveSection('knowledge-base')}
            >
              <span className="mr-3 w-4 text-center">📚</span>
              Knowledge Base
            </div>
            <div 
              className={`flex items-center px-3 py-2 rounded-[var(--radius-button)] text-sm font-normal cursor-pointer transition-all duration-150 ${
                activeSection === 'brand-voice' 
                  ? 'bg-brand-500 text-white' 
                  : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
              }`}
              onClick={() => setActiveSection('brand-voice')}
            >
              <span className="mr-3 w-4 text-center">✎</span>
              Brand Voice
            </div>
          </nav>
        </aside>

        {/* Main content area fills modal space and scrolls independently */}
        <main className="flex-1 min-h-0 h-full p-8 overflow-y-auto overscroll-contain bg-background">
          {/* Brand Voice Section */}
          {activeSection === 'brand-voice' && (
            <section className="flex min-h-0 flex-col">
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h1 className="text-2xl font-semibold text-neutral-900">Brand Voice</h1>
                </div>
                <p className="text-sm text-neutral-600">Choose your brand voice by selecting a persona</p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                <CreatorPersonaGrid
                  personas={personas}
                  selectedId={selectedPersonaId ?? undefined}
                  selectable={true}
                  onPersonaSelect={(id) => {
                    setSelectedPersonaId(id)
                    setHasChanges(true)
                  }}
                  onPersonaClick={(id) => {
                    // Save immediately when the card (not edit/delete) is clicked
                    handleImmediateSaveBrandVoice(id)
                  }}
                />

                <div className="mt-6">
                  <button
                    className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all duration-150 ${
                      selectedPersonaId
                        ? 'bg-brand-500 hover:bg-brand-600 text-white cursor-pointer'
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                    onClick={handleSaveBrandVoice}
                    disabled={!selectedPersonaId || isSavingPersona}
                  >
                    {isSavingPersona ? 'Saving...' : 'Set Brand Voice'}
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Knowledge Base Section */}
          {activeSection === 'knowledge-base' && (
            <section className="flex min-h-0 flex-col">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Knowledge Base</h1>
                <p className="text-sm text-neutral-600">Build your content knowledge by analyzing successful videos and tracking inspirational creators</p>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                {/* Add Content Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Add Content to Analyze</h3>
                  <p className="text-sm text-neutral-600 mb-4">Paste a video URL to extract insights and grow your topic expertise</p>
                  
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-primary-400 rounded-[var(--radius-button)] text-sm placeholder:text-neutral-500 transition-colors duration-150"
                      placeholder="Paste Instagram or TikTok video URL..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                    <button 
                      className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-[var(--radius-button)] text-sm font-medium transition-colors duration-150"
                      onClick={handleAnalyzeVideo}
                    >
                      <span>🔍</span>
                      <span>Analyze</span>
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <span className="flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-[var(--radius-button)] text-xs text-neutral-600">
                      <span>📱</span> Instagram Reels
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 bg-neutral-100 rounded-[var(--radius-button)] text-xs text-neutral-600">
                      <span>🎵</span> TikTok Videos
                    </span>
                  </div>
                </div>

                {/* Creator Tracking Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Track Inspirational Creators</h3>
                  <p className="text-sm text-neutral-600 mb-4">Follow creators in your niche for daily content inspiration</p>
                  
                  <div className="flex gap-3 mb-6">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 focus:border-primary-400 rounded-[var(--radius-button)] text-sm placeholder:text-neutral-500 transition-colors duration-150"
                      placeholder="@username or profile URL"
                      value={creatorHandle}
                      onChange={(e) => setCreatorHandle(e.target.value)}
                    />
                    <select 
                      className="px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-button)] text-sm text-neutral-900"
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value as 'instagram' | 'tiktok')}
                    >
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                    <button 
                      className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-[var(--radius-button)] text-sm font-medium transition-colors duration-150"
                      onClick={handleAddCreator}
                    >
                      <span>+</span>
                      <span>Add Creator</span>
                    </button>
                  </div>

                  {/* Tracked Creators List */}
                  <div className="space-y-3">
                    {creators.map((creator) => (
                      <div key={creator.id} className="flex items-center gap-3 p-4 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)]">
                        <div className="w-10 h-10 bg-neutral-100 rounded-[var(--radius-button)] flex items-center justify-center text-base">
                          {creator.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-neutral-900">{creator.name}</div>
                          <div className="text-xs text-neutral-600">{creator.platform} • {creator.category}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-neutral-100 rounded-[var(--radius-button)] text-xs text-neutral-600">
                            {creator.postsAnalyzed} posts analyzed
                          </span>
                          <button className="w-6 h-6 text-neutral-500 hover:text-neutral-700 text-sm">×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analyzed Content Grid */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">Recent Analysis</h3>
                  <p className="text-sm text-neutral-600 mb-4">Your analyzed content and extracted insights</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {contentItems.map((item) => (
                      <div key={item.id} className="bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)] p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-neutral-100 rounded-[var(--radius-button)] flex items-center justify-center text-base">
                            {item.platform === 'instagram' ? '📱' : '🎵'}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-neutral-900 mb-1">{item.title}</div>
                            <div className="text-xs text-neutral-600">{item.creator} • {item.views} views</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-1 bg-neutral-100 rounded-[var(--radius-button)] text-xs text-neutral-600">
                            Hook: {item.insights.hook}
                          </span>
                          <span className="px-2 py-1 bg-neutral-100 rounded-[var(--radius-button)] text-xs text-neutral-600">
                            Format: {item.insights.format}
                          </span>
                          <span className="px-2 py-1 bg-neutral-100 rounded-[var(--radius-button)] text-xs text-neutral-600">
                            Length: {item.insights.length}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Content Settings Section */}
          {activeSection === 'content-settings' && (
            <section className="flex min-h-0 flex-col">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-2">What You Post About</h1>
                <p className="text-sm text-neutral-600">Select your main content topic and configure your brand strategy</p>
              </div>
              {/* Scrollable content area for the entire panel */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                {/* Topic Selector Grid with numbered variants */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
                  {Object.entries(topicData).map(([key, topic]) => (
                    <div
                      key={key}
                      className={`p-4 border-2 rounded-[var(--radius-card)] cursor-pointer text-center transition-all duration-150 ${
                        selectedTopic === key
                          ? 'border-neutral-600 bg-neutral-50'
                          : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50'
                      }`}
                      onClick={() => handleTopicSelect(key)}
                    >
                      <div className="text-3xl mb-2">{topic.emoji}</div>
                      <div className="text-sm font-medium text-neutral-900">{topic.name}</div>
                    </div>
                  ))}
                </div>

                {/* Topic Details with numbered variant backgrounds */}
                {selectedTopic && (
                  <div className="bg-neutral-50 border border-neutral-200 rounded-[var(--radius-card)] p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-200">
                      <span className="text-2xl">{topicData[selectedTopic].emoji}</span>
                      <h2 className="text-lg font-semibold text-neutral-900">{topicData[selectedTopic].name}</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
                      {/* Left column: overview */}
                      <div className="space-y-5">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">Core Message</div>
                          <div className="text-sm text-neutral-900 leading-relaxed">{topicData[selectedTopic].coreMessage}</div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">Brand Personality</div>
                          <div className="text-sm text-neutral-900 leading-relaxed">{topicData[selectedTopic].personality}</div>
                        </div>

                        <div>
                          <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-2">Keywords</div>
                          <div className="flex flex-wrap gap-2">
                            {topicData[selectedTopic].keywords.map((keyword, index) => (
                              <span key={index} className="px-3 py-1 bg-neutral-100 rounded-[var(--radius-button)] text-xs text-neutral-600">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right column: pillars with internal scroll */}
                      <div className="min-h-0">
                        <div className="text-xs uppercase tracking-wider text-neutral-500 font-medium mb-3">Content Pillars</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 overflow-auto pr-1 max-h-[50vh]">
                          {topicData[selectedTopic].pillars.map((pillar, index) => (
                            <div key={index} className="bg-neutral-100 rounded-[var(--radius-button)] p-4">
                              <div className="text-sm font-semibold text-neutral-900 mb-2">{pillar.title}</div>
                              <div className="text-xs text-neutral-600 mb-2 leading-relaxed">{pillar.description}</div>
                              <div className="text-xs text-neutral-500 italic">Examples: {pillar.examples}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Goals Selection with numbered variant states */}
                <div className="mb-8">
                  <h2 className="text-lg font-medium text-neutral-900 mb-2">Your goals</h2>
                  <p className="text-sm text-neutral-600 mb-1">Select what are your goals with posting content</p>
                  <p className="text-xs text-neutral-500 mb-4">At least one goal must be selected</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      '📈 Grow my audience & go viral',
                      '🎓 Establish my authority & educate others',
                      '✨ Inspire & impact others',
                      '🎯 Attract more clients & increase sales'
                    ].map((goal) => (
                      <div
                        key={goal}
                        className={`flex items-center gap-3 p-4 border rounded-[var(--radius-button)] cursor-pointer transition-all duration-150 ${
                          selectedGoals.has(goal)
                            ? 'border-neutral-600 bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50'
                        }`}
                        onClick={() => handleGoalToggle(goal)}
                      >
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-all duration-150 ${
                          selectedGoals.has(goal)
                            ? 'bg-neutral-600 border-neutral-600 text-white text-xs'
                            : 'border-neutral-300'
                        }`}>
                          {selectedGoals.has(goal) && '✓'}
                        </div>
                        <span className="flex-1 text-sm text-neutral-900">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Button with numbered variant states */}
                <div className="pb-2">
                  <button
                    className={`px-4 py-2 rounded-[var(--radius-button)] text-sm font-medium transition-all duration-150 ${
                      hasChanges
                        ? 'bg-brand-500 hover:bg-brand-600 text-white cursor-pointer'
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                    onClick={handleSaveSettings}
                    disabled={!hasChanges}
                  >
                    Save Content Settings
                  </button>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default BrandHub
