'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Video, AlertCircle, Check, ExternalLink, Clock, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollectionCombobox } from '@/components/ui/collection-combobox';
import NotionPanelWrapper from '@/components/panels/notion/NotionPanelWrapper';
import type { PageProperty } from '@/components/panels/notion/NotionPanelProperties';

import { useAuth } from '@/contexts/auth-context';
import { useCollections } from './collections-context';
import { VideoCollectionService, type VideoProcessingData } from '@/lib/video-collection-service';
import { CollectionsService } from '@/lib/collections';

interface VideoManagementPanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialCollectionId?: string;
  onVideoAdded?: (videoId: string, collectionId: string) => void;
}

type ProcessingStage = 'idle' | 'validating' | 'scraping' | 'processing' | 'saving' | 'complete' | 'error';

interface ValidationResult {
  isValid: boolean;
  platform?: 'tiktok' | 'instagram' | 'youtube';
  error?: string;
}

export function VideoManagementPanel({
  isOpen,
  onClose,
  initialCollectionId = '',
  onVideoAdded
}: VideoManagementPanelProps) {
  const { user } = useAuth();
  const { state } = useCollections();
  
  // Form state
  const [videoUrl, setVideoUrl] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState(initialCollectionId);
  const [urlError, setUrlError] = useState('');
  
  // Processing state
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [processingMessage, setProcessingMessage] = useState('');

  // Panel state
  const [panelWidth, setPanelWidth] = useState(650);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Update selected collection when panel opens with a new collection
  useEffect(() => {
    if (isOpen && initialCollectionId) {
      setSelectedCollectionId(initialCollectionId);
    }
  }, [isOpen, initialCollectionId]);

  // URL validation
  const validateVideoUrl = useCallback((url: string): ValidationResult => {
    if (!url.trim()) {
      return { isValid: false, error: 'Video URL is required' };
    }

    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase().replace('www.', '');

      // TikTok validation
      if (hostname.includes('tiktok.com')) {
        if (urlObj.pathname.includes('/video/') || urlObj.pathname.includes('/@')) {
          return { isValid: true, platform: 'tiktok' };
        }
        return { isValid: false, error: 'Invalid TikTok video URL format' };
      }

      // Instagram validation
      if (hostname.includes('instagram.com')) {
        if (urlObj.pathname.includes('/p/') || urlObj.pathname.includes('/reel/')) {
          return { isValid: true, platform: 'instagram' };
        }
        return { isValid: false, error: 'Invalid Instagram video URL format' };
      }

      // YouTube validation (optional support)
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return { isValid: true, platform: 'youtube' };
      }

      return { isValid: false, error: 'Unsupported platform. Please use TikTok or Instagram URLs.' };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }, []);

  // Get validation result
  const validationResult = useMemo(() => validateVideoUrl(videoUrl), [videoUrl, validateVideoUrl]);

  // Handle URL change
  const handleUrlChange = (value: string) => {
    setVideoUrl(value);
    if (urlError) setUrlError('');
  };

  // Processing stages with messages
  const getProcessingStatus = (): { label: string; color: string; message: string } => {
    switch (processingStage) {
      case 'idle':
        return { label: 'Ready', color: 'default', message: '' };
      case 'validating':
        return { label: 'Validating', color: 'warning', message: 'Checking URL format...' };
      case 'scraping':
        return { label: 'Scraping', color: 'warning', message: 'Fetching video metadata...' };
      case 'processing':
        return { label: 'Processing', color: 'warning', message: 'Analyzing video content...' };
      case 'saving':
        return { label: 'Saving', color: 'warning', message: 'Adding to collection...' };
      case 'complete':
        return { label: 'Complete', color: 'success', message: 'Video added successfully!' };
      case 'error':
        return { label: 'Failed', color: 'error', message: processingMessage || 'An error occurred' };
      default:
        return { label: 'Unknown', color: 'default', message: '' };
    }
  };

  // Handle video submission
  const handleAddVideo = async () => {
    if (!user?.uid) {
      toast.error('You must be logged in to add videos');
      return;
    }

    if (!selectedCollectionId || selectedCollectionId === 'all-videos') {
      toast.error('Please select a collection');
      return;
    }

    // Validate URL
    const validation = validateVideoUrl(videoUrl);
    if (!validation.isValid) {
      setUrlError(validation.error || 'Invalid URL');
      return;
    }

    setProcessingStage('validating');
    setProcessingMessage('Validating video URL...');

    try {
      // Create video processing data
      const videoData: VideoProcessingData = {
        originalUrl: videoUrl.trim(),
        platform: validation.platform || 'unknown',
        addedAt: new Date().toISOString(),
        processing: {
          scrapeAttempted: false,
          transcriptAttempted: false,
          components: {
            hook: '',
            bridge: '',
            nugget: '',
            wta: ''
          }
        },
        metrics: {
          views: 0,
          likes: 0,
          comments: 0,
          saves: 0
        }
      };

      setProcessingStage('scraping');
      setProcessingMessage('Fetching video details...');

      // Add video to collection
      const result = await VideoCollectionService.addVideoToCollection(
        user.uid,
        selectedCollectionId,
        videoData
      );

      if (result.success) {
        setProcessingStage('complete');
        setProcessingMessage('Video added successfully!');
        
        toast.success('Video added to collection');
        
        // Reset form but keep the selected collection
        setVideoUrl('');
        setUrlError('');
        
        // Callback
        onVideoAdded?.(result.videoId || '', selectedCollectionId);
        
        // Close panel after brief delay
        setTimeout(() => {
          onClose();
          setProcessingStage('idle');
          setProcessingMessage('');
        }, 1500);
      } else {
        setProcessingStage('error');
        setProcessingMessage(result.message || 'Failed to add video');
        toast.error(result.message || 'Failed to add video to collection');
        
        // Reset to idle after delay
        setTimeout(() => {
          setProcessingStage('idle');
          setProcessingMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Failed to add video:', error);
      setProcessingStage('error');
      setProcessingMessage('An unexpected error occurred');
      toast.error('Failed to add video. Please try again.');
      
      setTimeout(() => {
        setProcessingStage('idle');
        setProcessingMessage('');
      }, 3000);
    }
  };

  // Get processing status
  const status = getProcessingStatus();

  // Panel properties
  const properties: PageProperty[] = [
    {
      id: 'collection',
      type: 'text' as const,
      name: 'Collection',
      value: state.collections.find(c => c.id === selectedCollectionId)?.title || 'Select collection',
      icon: 'folder'
    },
    {
      id: 'status',
      type: 'status' as const,
      name: 'Status',
      value: { label: status.label, color: status.color },
      icon: 'burst'
    }
  ];

  // Handle panel close
  const handleClose = () => {
    if (processingStage !== 'idle' && processingStage !== 'complete' && processingStage !== 'error') {
      return; // Prevent closing during processing
    }
    
    // Reset form state
    setVideoUrl('');
    setUrlError('');
    setSelectedCollectionId(initialCollectionId);
    setProcessingStage('idle');
    setProcessingMessage('');
    
    onClose();
  };

  // Available collections for selection
  const availableCollections = state.collections.filter(c => c.id !== 'all-videos');
  const isProcessing = !['idle', 'complete', 'error'].includes(processingStage);

  return (
    <NotionPanelWrapper
      isOpen={isOpen}
      isFullScreen={isFullScreen}
      onClose={handleClose}
      onToggleFullScreen={() => setIsFullScreen(!isFullScreen)}
      title="Add Video to Collection"
      properties={properties}
      width={panelWidth}
      onWidthChange={setPanelWidth}
      minWidth={550}
      maxWidth={900}
      isNewIdea={true}
      placeholder="Enter video URL..."
      showHeaderControls={true}
      footer={
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Video className="w-4 h-4" />
            <span>
              {isProcessing ? status.message : 'Add video from TikTok or Instagram'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="soft"
              size="sm"
              onClick={handleAddVideo}
              disabled={isProcessing || !validationResult.isValid || !selectedCollectionId || selectedCollectionId === 'all-videos'}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {status.label}...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Video
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      {/* Form Content */}
      <div className="p-6 space-y-6">
        {/* Collection Selection */}
        <div className="space-y-2">
          <Label htmlFor="collection-select" className="text-sm font-medium">
            Target Collection *
          </Label>
          <div className="space-y-1">
            <CollectionCombobox
              selectedCollectionId={selectedCollectionId}
              onChange={setSelectedCollectionId}
              placeholder="Select a collection"
              disabled={isProcessing}
              // Filter out "All Videos" option
              filterFn={(collection) => collection.id !== 'all-videos'}
            />
            <div className="text-xs text-neutral-400">
              Choose which collection to add this video to
            </div>
          </div>
        </div>

        {/* Video URL */}
        <div className="space-y-2">
          <Label htmlFor="video-url" className="text-sm font-medium">
            Video URL *
          </Label>
          <div className="space-y-1">
            <div className="relative">
              <Input
                id="video-url"
                type="url"
                placeholder="https://www.tiktok.com/@username/video/..."
                value={videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                className={`pr-10 ${urlError || !validationResult.isValid && videoUrl ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : validationResult.isValid ? 'border-green-300 focus:border-green-500 focus:ring-green-200' : ''}`}
                disabled={isProcessing}
              />
              {videoUrl && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  {validationResult.isValid ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              {urlError || (!validationResult.isValid && videoUrl) ? (
                <div className="flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="w-3 h-3" />
                  {urlError || validationResult.error}
                </div>
              ) : validationResult.isValid ? (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="w-3 h-3" />
                  Valid {validationResult.platform?.toUpperCase()} URL detected
                </div>
              ) : (
                <div className="text-xs text-neutral-400">
                  Paste a TikTok or Instagram video URL
                </div>
              )}
              
              {videoUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-1 text-xs hover:bg-neutral-100"
                  onClick={() => window.open(videoUrl, '_blank')}
                  disabled={!validationResult.isValid}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Preview
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Supported Platforms */}
        <div className="p-4 bg-neutral-50 rounded-[var(--radius-card)] border border-neutral-200">
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-4 h-4 text-neutral-600" />
            <span className="text-sm font-medium text-neutral-900">Supported Platforms</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span>TikTok Videos</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span>Instagram Reels/Posts</span>
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="p-4 bg-blue-50 rounded-[var(--radius-card)] border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
              <span className="text-sm font-medium text-blue-900">Processing Video</span>
            </div>
            <div className="text-xs text-blue-700">
              {status.message}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 bg-blue-200 rounded-full h-1">
                <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <span className="text-xs text-blue-600">{status.label}</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {processingStage === 'complete' && (
          <div className="p-4 bg-green-50 rounded-[var(--radius-card)] border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Video Added Successfully!</span>
            </div>
            <div className="text-xs text-green-700">
              The video has been added to your collection and is ready to use.
            </div>
          </div>
        )}
      </div>
    </NotionPanelWrapper>
  );
}
