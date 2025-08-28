'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Loader2, User, FileText } from 'lucide-react';

interface TikTokVideo {
  id: string;
  description: string;
  playUrl: string;
  downloadUrl: string;
  cover: string;
  createTime: number;
  duration: number;
  stats: {
    diggCount: number;
    shareCount: number;
    commentCount: number;
    playCount: number;
  };
}

interface TikTokUserInfo {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  verified: boolean;
  stats: {
    videoCount: number;
    followerCount: number;
    followingCount: number;
  };
}

interface ApiResponse {
  success: boolean;
  userInfo?: TikTokUserInfo;
  videos?: TikTokVideo[];
  metadata?: {
    totalVideos: number;
    fetchedAt: string;
  };
  error?: string;
  details?: string;
}

interface TranscriptResult {
  url: string;
  transcript: string;
  error?: string;
}

export default function TikTokUserFeedTestPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string>('');

  // Transcript scraper state
  const [transcriptUrls, setTranscriptUrls] = useState('');
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptResults, setTranscriptResults] = useState<TranscriptResult[]>([]);
  const [transcriptError, setTranscriptError] = useState('');
  const [currentProcessing, setCurrentProcessing] = useState({ current: 0, total: 0 });

  // Function to extract username from various TikTok URL formats
  const extractUsername = (input: string): string => {
    const trimmed = input.trim();
    
    // If it's already just a username (no URL), return as is
    if (!trimmed.includes('/') && !trimmed.includes('.')) {
      return trimmed.replace('@', ''); // Remove @ if present
    }

    try {
      // Handle various TikTok URL formats
      const url = new URL(trimmed);
      
      // Extract from different TikTok URL patterns:
      // https://www.tiktok.com/@username
      // https://tiktok.com/@username
      // https://www.tiktok.com/@username/video/123456789
      // https://vm.tiktok.com/shortcode/ (redirects, but we can't handle here)
      
      const pathSegments = url.pathname.split('/').filter(Boolean);
      
      // Look for username in path (starts with @)
      for (const segment of pathSegments) {
        if (segment.startsWith('@')) {
          return segment.substring(1); // Remove @ prefix
        }
      }
      
      // If no @username found, try to extract from subdomain or other patterns
      if (url.hostname.includes('tiktok.com')) {
        // For URLs like https://www.tiktok.com/discover or other patterns
        // Return empty string to trigger error
        return '';
      }
      
    } catch (e) {
      // Not a valid URL, treat as plain username
      return trimmed.replace('@', '');
    }
    
    return trimmed.replace('@', '');
  };

  // Function to fetch user feed data from API
  const fetchUserFeed = async () => {
    const rawInput = username.trim();
    if (!rawInput) {
      setError('Please enter a username or TikTok URL');
      return;
    }

    // Extract clean username from input
    const cleanUsername = extractUsername(rawInput);
    if (!cleanUsername) {
      setError('Could not extract username from the provided input. Please enter a valid TikTok username or profile URL.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const res = await fetch('/api/tiktok/user-feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: cleanUsername,
          count: 20
        }),
      });

      const data: ApiResponse = await res.json();
      setResponse(data);

      if (!data.success) {
        setError(data.error || 'Failed to fetch user feed');
      }
    } catch (err) {
      setError('Network error occurred while fetching data');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to copy URL to clipboard
  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Simple feedback - could be enhanced with toast notification
      console.log('URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Format number for display (e.g. 1000000 -> 1M)
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Delay utility function
  const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  // Extract individual video URLs from the user feed results
  const extractVideoUrls = (): string[] => {
    if (!response?.videos) return [];
    return response.videos.map(video => video.playUrl || video.downloadUrl).filter(Boolean);
  };

  // Process transcripts for video URLs from the user feed
  const processTranscripts = async () => {
    // First, check if we have video URLs from the user feed
    const videoUrls = extractVideoUrls();
    
    // If no videos from user feed, try to parse manual input
    let urlsToProcess: string[] = [];
    
    if (videoUrls.length > 0) {
      urlsToProcess = videoUrls;
      console.log(`Using ${videoUrls.length} video URLs from the user feed`);
    } else {
      // Parse manual input as fallback
      urlsToProcess = transcriptUrls
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      if (urlsToProcess.length === 0) {
        setTranscriptError('Please fetch user videos first, or enter video URLs manually');
        return;
      }
    }

    console.log(`Processing ${urlsToProcess.length} video URLs for transcription`);

    setTranscriptLoading(true);
    setTranscriptError('');
    setTranscriptResults([]);
    setCurrentProcessing({ current: 0, total: urlsToProcess.length });

    const results: TranscriptResult[] = [];

    for (let i = 0; i < urlsToProcess.length; i++) {
      const videoUrl = urlsToProcess[i];
      setCurrentProcessing({ current: i + 1, total: urlsToProcess.length });

      try {
        console.log(`Processing video ${i + 1}/${urlsToProcess.length}: ${videoUrl}`);
        
        // Call the video transcription API
        const response = await fetch('/api/video/transcribe-from-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl }),
        });

        const data = await response.json();

        if (data.success && data.transcript) {
          const result: TranscriptResult = {
            url: videoUrl,
            transcript: data.transcript,
          };
          results.push(result);
          setTranscriptResults([...results]);
        } else {
          const errorResult: TranscriptResult = {
            url: videoUrl,
            transcript: '',
            error: data.error || 'Failed to transcribe video',
          };
          results.push(errorResult);
          setTranscriptResults([...results]);
        }
      } catch (error) {
        console.error(`Error processing ${videoUrl}:`, error);
        const errorResult: TranscriptResult = {
          url: videoUrl,
          transcript: '',
          error: 'Network error or processing failed',
        };
        results.push(errorResult);
        setTranscriptResults([...results]);
      }

      // Add 5-second delay between requests (except for the last one)
      if (i < urlsToProcess.length - 1) {
        console.log(`Waiting 5 seconds before processing next video...`);
        await delay(5000);
      }
    }

    setTranscriptLoading(false);
    setCurrentProcessing({ current: 0, total: 0 });
    console.log(`✅ Completed processing ${urlsToProcess.length} videos`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-neutral-900">
            TikTok User Feed Test
          </h1>
          <p className="text-neutral-600">
            Test the /api/tiktok/user-feed endpoint to fetch video URLs
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-[var(--radius-card)] border border-neutral-200 p-6 shadow-[var(--shadow-soft-drop)]">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                TikTok Username or URL
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username, @username, or TikTok profile URL"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-button)] focus:border-primary-400 focus:ring-1 focus:ring-primary-400 focus:outline-none transition-colors"
                disabled={loading}
              />
              <p className="text-xs text-neutral-500 mt-1">
                Supports: username, @username, https://www.tiktok.com/@username, or profile URLs
              </p>
            </div>
            
            <button
              onClick={fetchUserFeed}
              disabled={loading || !username.trim()}
              className="w-full bg-neutral-900 text-neutral-50 px-4 py-2 rounded-[var(--radius-button)] hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Fetching Feed...
                </>
              ) : (
                'Fetch Feed'
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-destructive-50 border border-destructive-200 rounded-[var(--radius-card)] p-4">
            <p className="text-destructive-700 text-sm">{error}</p>
          </div>
        )}

        {/* Results Display */}
        {response && response.success && (
          <div className="space-y-6">
            {/* User Info */}
            {response.userInfo && (
              <div className="bg-white rounded-[var(--radius-card)] border border-neutral-200 p-6 shadow-[var(--shadow-soft-drop)]">
                <div className="flex items-start gap-4">
                  <img
                    src={response.userInfo.avatar}
                    alt={response.userInfo.nickname}
                    className="w-16 h-16 rounded-full bg-neutral-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).className = 'w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center';
                    }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {response.userInfo.nickname}
                      </h2>
                      {response.userInfo.verified && (
                        <User className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                    <p className="text-neutral-600">@{response.userInfo.username}</p>
                    <div className="flex gap-4 mt-2 text-sm text-neutral-600">
                      <span>{formatNumber(response.userInfo.stats.videoCount)} videos</span>
                      <span>{formatNumber(response.userInfo.stats.followerCount)} followers</span>
                      <span>{formatNumber(response.userInfo.stats.followingCount)} following</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Count Summary */}
            <div className="bg-white rounded-[var(--radius-card)] border border-neutral-200 p-4 shadow-[var(--shadow-soft-drop)]">
              <div className="text-center">
                <p className="text-neutral-600">
                  Found <span className="font-semibold text-neutral-900">{response.metadata?.totalVideos || 0}</span> videos
                </p>
                {response.metadata?.fetchedAt && (
                  <p className="text-sm text-neutral-500 mt-1">
                    Fetched at {new Date(response.metadata.fetchedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {/* Combined URLs Field */}
            {response.videos && response.videos.length > 0 && (
              <div className="bg-white rounded-[var(--radius-card)] border border-neutral-200 p-6 shadow-[var(--shadow-soft-drop)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900">All Video URLs</h3>
                  <button
                    onClick={() => copyToClipboard(response.videos!.map(video => video.playUrl || video.downloadUrl).filter(Boolean).join('\n'))}
                    className="bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-[var(--radius-button)] text-sm text-neutral-700 transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy All
                  </button>
                </div>
                <textarea
                  readOnly
                  value={response.videos.map(video => video.playUrl || video.downloadUrl).filter(Boolean).join('\n')}
                  className="w-full h-32 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-button)] text-sm font-mono resize-none"
                  placeholder="Video URLs will appear here..."
                />
              </div>
            )}

            {/* Individual Video URLs List */}
            {response.videos && response.videos.length > 0 && (
              <div className="bg-white rounded-[var(--radius-card)] border border-neutral-200 p-6 shadow-[var(--shadow-soft-drop)]">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Individual Videos</h3>
                <div className="space-y-3">
                  {response.videos.map((video, index) => {
                    // Prefer playUrl, fallback to downloadUrl
                    const videoUrl = video.playUrl || video.downloadUrl;
                    
                    return (
                      <div key={video.id} className="bg-neutral-50 rounded-[var(--radius-button)] p-4 border border-neutral-200">
                        <div className="flex items-start gap-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm font-medium text-neutral-700">#{index + 1}</span>
                            {video.cover && (
                              <img
                                src={video.cover}
                                alt="Video thumbnail"
                                className="w-8 h-8 rounded bg-neutral-200 object-cover flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            {video.description && (
                              <p className="text-sm text-neutral-600 mb-2 line-clamp-2">
                                {video.description}
                              </p>
                            )}

                            {/* Single Video URL */}
                            <div className="flex items-center gap-2 mb-2">
                              <a
                                href={videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary-600 hover:text-primary-700 truncate flex-1 hover:underline font-mono"
                              >
                                {videoUrl}
                              </a>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => copyToClipboard(videoUrl)}
                                  className="p-1 hover:bg-neutral-200 rounded transition-colors"
                                  title="Copy URL"
                                >
                                  <Copy className="w-3 h-3 text-neutral-500" />
                                </button>
                                <a
                                  href={videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 hover:bg-neutral-200 rounded transition-colors"
                                  title="Open in new tab"
                                >
                                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                                </a>
                              </div>
                            </div>

                            {/* Video Stats */}
                            <div className="flex gap-4 text-xs text-neutral-500">
                              <span>❤️ {formatNumber(video.stats.diggCount)}</span>
                              <span>💬 {formatNumber(video.stats.commentCount)}</span>
                              <span>📤 {formatNumber(video.stats.shareCount)}</span>
                              <span>▶️ {formatNumber(video.stats.playCount)}</span>
                              <span>⏱️ {video.duration}s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Transcript Scraper Section */}
        <div className="border-t-4 border-primary-200 pt-8 mt-12">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-semibold text-neutral-900 flex items-center justify-center gap-2">
              <FileText className="w-6 h-6" />
              TikTok Video Transcript Scraper
            </h2>
            <p className="text-neutral-600">
              Extract transcripts from TikTok videos using AI transcription (CDN → Gemini)
            </p>
          </div>

          {/* Input Section */}
          <div className="bg-white rounded-[var(--radius-card)] border border-neutral-200 p-6 shadow-[var(--shadow-soft-drop)] mb-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="transcript-urls" className="block text-sm font-medium text-neutral-700 mb-2">
                  Video Processing Options
                </label>
                
                {response?.videos && response.videos.length > 0 ? (
                  <div className="bg-primary-50 border border-primary-200 rounded-[var(--radius-button)] p-3 mb-3">
                    <p className="text-primary-700 text-sm font-medium">
                      ✅ Ready to process {response.videos.length} videos from the user feed above
                    </p>
                    <p className="text-primary-600 text-xs mt-1">
                      Click "Extract Transcripts" to transcribe all videos from the fetched user feed
                    </p>
                  </div>
                ) : (
                  <textarea
                    id="transcript-urls"
                    rows={4}
                    value={transcriptUrls}
                    onChange={(e) => setTranscriptUrls(e.target.value)}
                    placeholder="Alternative: Paste video CDN URLs here, one per line:&#10;https://v45.tiktokcdn-eu.com/...&#10;https://v15m.tiktokcdn-eu.com/..."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-[var(--radius-button)] focus:border-primary-400 focus:ring-1 focus:ring-primary-400 focus:outline-none transition-colors font-mono text-sm resize-none"
                    disabled={transcriptLoading}
                  />
                )}
                
                <p className="text-xs text-neutral-500 mt-1">
                  Downloads videos from CDN → Sends to Gemini AI for transcription → 5-second delays between requests
                </p>
              </div>

              <button
                onClick={processTranscripts}
                disabled={transcriptLoading || (extractVideoUrls().length === 0 && !transcriptUrls.trim())}
                className="w-full bg-neutral-900 text-neutral-50 px-4 py-2 rounded-[var(--radius-button)] hover:bg-neutral-800 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {transcriptLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing {currentProcessing.current}/{currentProcessing.total}...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Extract Transcripts
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Processing Status */}
          {transcriptLoading && (
            <div className="bg-primary-50 border border-primary-200 rounded-[var(--radius-card)] p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary-600" />
                <p className="text-primary-700 font-medium">
                  Processing video {currentProcessing.current} of {currentProcessing.total}
                </p>
              </div>
              <div className="w-full bg-primary-200 rounded-full h-2">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentProcessing.current / currentProcessing.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {transcriptError && (
            <div className="bg-destructive-50 border border-destructive-200 rounded-[var(--radius-card)] p-4 mb-6">
              <p className="text-destructive-700 text-sm">{transcriptError}</p>
            </div>
          )}

          {/* Results Display */}
          {transcriptResults.length > 0 && (
            <div className="bg-white rounded-[var(--radius-card)] border border-neutral-200 p-6 shadow-[var(--shadow-soft-drop)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  Transcript Results ({transcriptResults.length})
                </h3>
                <button
                  onClick={() => copyToClipboard(
                    transcriptResults.map((result, index) => 
                      `Video ${index + 1}: ${result.url}\n${result.error ? `Error: ${result.error}` : `Transcript: ${result.transcript}`}\n---`
                    ).join('\n\n')
                  )}
                  className="bg-neutral-100 hover:bg-neutral-200 px-3 py-1 rounded-[var(--radius-button)] text-sm text-neutral-700 transition-colors flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  Copy All
                </button>
              </div>

              <div className="space-y-4">
                {transcriptResults.map((result, index) => (
                  <div key={index} className="bg-neutral-50 rounded-[var(--radius-button)] p-4 border border-neutral-200">
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-neutral-700">Video {index + 1}</h4>
                        <button
                          onClick={() => copyToClipboard(result.error ? `Error: ${result.error}` : result.transcript)}
                          className="p-1 hover:bg-neutral-200 rounded transition-colors"
                          title="Copy transcript"
                        >
                          <Copy className="w-3 h-3 text-neutral-500" />
                        </button>
                      </div>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:text-primary-700 hover:underline break-all"
                      >
                        {result.url}
                      </a>
                    </div>

                    {result.error ? (
                      <div className="text-sm text-destructive-600 bg-destructive-50 rounded p-2 border border-destructive-200">
                        <strong>Error:</strong> {result.error}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-700">
                        <strong>Transcript:</strong>
                        <div className="mt-1 p-2 bg-white rounded border border-neutral-200 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs font-mono">
                          {result.transcript}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}