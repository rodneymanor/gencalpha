'use client';

import { useState } from 'react';
import { Copy, ExternalLink, Loader2, User, FileText, Download, Code } from 'lucide-react';

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

interface VoiceAnalysis {
  voiceProfile: {
    distinctiveness: string;
    complexity: string;
    primaryStyle: string;
  };
  linguisticFingerprint: {
    avgSentenceLength: number;
    vocabularyTier: {
      simple: number;
      moderate: number;
      advanced: number;
    };
    topUniqueWords: string[];
    avoidedWords: string[];
    grammarQuirks: string[];
  };
  hookReplicationSystem?: {
    primaryHookType: string;
    hookTemplates: Array<{
      template: string;
      type: string;
      frequency: number;
      effectiveness: string;
      emotionalTrigger: string;
      realExamples: string[];
      newExamples: string[];
    }>;
    hookProgression: {
      structure: string;
      avgWordCount: number;
      timing: string;
      examples: string[];
    };
    hookRules: string[];
  };
  openingFormulas: Array<{
    pattern: string;
    frequency: number;
    emotionalTrigger: string;
    examples: string[];
  }>;
  transitionPhrases: {
    conceptBridges: string[];
    enumeration: string[];
    topicPivots: string[];
    softeners: string[];
  };
  rhetoricalDevices: Array<{
    device: string;
    pattern: string;
    examples: string[];
  }>;
  microPatterns: {
    fillers: string[];
    emphasisWords: string[];
    numberPatterns: string;
    timeReferences: string[];
  };
  persuasionFramework: {
    painPoints: string[];
    solutions: string[];
    credibility: string[];
    urgency: string[];
  };
  contentTemplates: Array<{
    type: string;
    structure: string;
    avgLength: string;
    examples: string[];
  }>;
  signatureMoves: Array<{
    move: string;
    description: string;
    frequency: string;
    placement: string;
    verbatim: string[];
  }>;
  scriptGenerationRules?: {
    mustInclude: string[];
    neverInclude: string[];
    optimalStructure: {
      hookSection: string;
      bodySection: string;
      closeSection: string;
    };
    formulaForNewScript: string;
  };
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

  // Voice analysis state
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VoiceAnalysis | null>(null);
  const [analysisError, setAnalysisError] = useState('');
  const [manualTranscripts, setManualTranscripts] = useState('');

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

  const downloadAnalysis = (format: 'json' | 'text') => {
    if (!analysisResult) return;

    let content: string;
    let filename: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(analysisResult, null, 2);
      filename = `voice-analysis-${Date.now()}.json`;
      mimeType = 'application/json';
    } else {
      // Format as readable text
      content = formatAnalysisAsText(analysisResult);
      filename = `voice-analysis-${Date.now()}.txt`;
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatAnalysisAsText = (analysis: VoiceAnalysis): string => {
    let text = '=== VOICE PATTERN ANALYSIS ===\n\n';
    
    // Voice Profile
    text += '## VOICE PROFILE\n';
    text += `Distinctiveness: ${analysis.voiceProfile.distinctiveness}/10\n`;
    text += `Complexity: ${analysis.voiceProfile.complexity}\n`;
    text += `Primary Style: ${analysis.voiceProfile.primaryStyle}\n\n`;

    // Hook Replication System
    if (analysis.hookReplicationSystem) {
      text += '## HOOK REPLICATION SYSTEM\n';
      text += `Primary Hook Type: ${analysis.hookReplicationSystem.primaryHookType}\n\n`;
      
      text += 'Hook Templates:\n';
      analysis.hookReplicationSystem.hookTemplates.forEach((template, i) => {
        text += `\n${i + 1}. ${template.type.toUpperCase()} (${template.effectiveness} effectiveness)\n`;
        text += `   Template: ${template.template}\n`;
        text += `   Example: ${template.realExamples[0]}\n`;
      });
      
      text += '\nHook Rules:\n';
      analysis.hookReplicationSystem.hookRules.forEach(rule => {
        text += `• ${rule}\n`;
      });
      text += '\n';
    }

    // Linguistic Fingerprint
    text += '## LINGUISTIC FINGERPRINT\n';
    text += `Average Sentence Length: ${analysis.linguisticFingerprint.avgSentenceLength} words\n`;
    text += `Vocabulary Distribution: Simple ${analysis.linguisticFingerprint.vocabularyTier.simple}%, Moderate ${analysis.linguisticFingerprint.vocabularyTier.moderate}%, Advanced ${analysis.linguisticFingerprint.vocabularyTier.advanced}%\n`;
    text += `Top Unique Words: ${analysis.linguisticFingerprint.topUniqueWords.join(', ')}\n\n`;

    // Script Generation Rules
    if (analysis.scriptGenerationRules) {
      text += '## SCRIPT GENERATION FORMULA\n';
      text += '\nMust Include:\n';
      analysis.scriptGenerationRules.mustInclude.forEach(item => {
        text += `✓ ${item}\n`;
      });
      text += '\nNever Include:\n';
      analysis.scriptGenerationRules.neverInclude.forEach(item => {
        text += `✗ ${item}\n`;
      });
      text += `\nFormula: ${analysis.scriptGenerationRules.formulaForNewScript}\n`;
    }

    return text;
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

      // Add 2-second delay between requests (except for the last one)
      if (i < urlsToProcess.length - 1) {
        console.log(`Waiting 2 seconds before processing next video...`);
        await delay(2000);
      }
    }

    setTranscriptLoading(false);
    setCurrentProcessing({ current: 0, total: 0 });
    console.log(`✅ Completed processing ${urlsToProcess.length} videos`);
  };

  // Voice analysis function
  const analyzeVoicePatterns = async () => {
    let validTranscripts: string[] = [];

    // Use manual transcripts if provided, otherwise use auto-transcribed results
    if (manualTranscripts.trim()) {
      validTranscripts = manualTranscripts
        .split('\n---\n')
        .map(t => t.trim())
        .filter(t => t.length > 10); // Filter out very short entries
    } else {
      validTranscripts = transcriptResults
        .filter(result => result.transcript && !result.error)
        .map(result => result.transcript);
    }

    if (validTranscripts.length < 3) {
      setAnalysisError(`Need at least 3 transcripts to analyze voice patterns. ${manualTranscripts.trim() ? 'Separate transcripts with "---" on a new line.' : 'Either paste transcripts manually or fetch them from videos.'}`);
      return;
    }

    setAnalysisLoading(true);
    setAnalysisError('');
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/voice/analyze-patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcripts: validTranscripts }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze voice patterns');
      }

      const analysis = await response.json();
      setAnalysisResult(analysis);
      console.log('✅ Voice analysis completed:', analysis);
      
    } catch (error) {
      console.error('Voice analysis error:', error);
      setAnalysisError(error instanceof Error ? error.message : 'Failed to analyze voice patterns');
    } finally {
      setAnalysisLoading(false);
    }
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

        {/* Voice Analysis Section */}
        <div className="bg-white rounded-[var(--radius-card)] border border-neutral-200 p-6 shadow-[var(--shadow-soft-drop)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Voice Pattern Analysis
            </h2>
            <div className="flex gap-2">
              {analysisResult && (
                <>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(analysisResult, null, 2))}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-[var(--radius-button)] transition-colors flex items-center gap-2"
                    title="Copy JSON"
                  >
                    <Code className="w-4 h-4" />
                    Copy JSON
                  </button>
                  <button
                    onClick={() => downloadAnalysis('text')}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-[var(--radius-button)] transition-colors flex items-center gap-2"
                    title="Download as Text"
                  >
                    <Download className="w-4 h-4" />
                    Text
                  </button>
                  <button
                    onClick={() => downloadAnalysis('json')}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-[var(--radius-button)] transition-colors flex items-center gap-2"
                    title="Download as JSON"
                  >
                    <Download className="w-4 h-4" />
                    JSON
                  </button>
                </>
              )}
              <button
                onClick={analyzeVoicePatterns}
                disabled={analysisLoading || (!manualTranscripts.trim() && transcriptResults.filter(r => r.transcript && !r.error).length < 3)}
                className="px-4 py-2 bg-primary-500 text-white rounded-[var(--radius-button)] hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {analysisLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze Voice Patterns'
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="manualTranscripts" className="block text-sm font-medium text-neutral-700 mb-2">
                Manual Transcripts (Optional)
              </label>
              <textarea
                id="manualTranscripts"
                value={manualTranscripts}
                onChange={(e) => setManualTranscripts(e.target.value)}
                placeholder={`Paste your transcripts here, separated by "---" on a new line. For example:

This is the first transcript about something interesting...

---

This is the second transcript with different content...

---

This is the third transcript...`}
                className="w-full h-48 p-3 border border-neutral-200 rounded-[var(--radius-button)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm resize-none"
              />
              <p className="text-xs text-neutral-500 mt-1">
                If provided, these transcripts will be used instead of auto-generated ones. Separate each transcript with "---" on a new line.
              </p>
            </div>

            <p className="text-neutral-600">
              Analyze transcripts to identify voice patterns, hooks, and signature phrases. Requires at least 3 transcripts.
            </p>
          </div>

          {analysisError && (
            <div className="bg-destructive-50 text-destructive-700 p-3 rounded-[var(--radius-button)] border border-destructive-200 mb-4">
              {analysisError}
            </div>
          )}

          {analysisResult && (
            <div className="space-y-6">
              {/* Voice Profile */}
              <div className="bg-neutral-50 rounded-[var(--radius-button)] p-4 border border-neutral-200">
                <h3 className="font-medium text-neutral-900 mb-3">Voice Profile</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-600">Distinctiveness</div>
                    <div className="font-medium">{analysisResult.voiceProfile.distinctiveness}/10</div>
                  </div>
                  <div>
                    <div className="text-neutral-600">Complexity</div>
                    <div className="font-medium capitalize">{analysisResult.voiceProfile.complexity}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600">Primary Style</div>
                    <div className="font-medium capitalize">{analysisResult.voiceProfile.primaryStyle}</div>
                  </div>
                </div>
              </div>

              {/* Linguistic Fingerprint */}
              <div className="bg-neutral-50 rounded-[var(--radius-button)] p-4 border border-neutral-200">
                <h3 className="font-medium text-neutral-900 mb-3">Linguistic Fingerprint</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-neutral-600">Avg Sentence Length</div>
                      <div className="font-medium">{analysisResult.linguisticFingerprint.avgSentenceLength} words</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Simple Vocab</div>
                      <div className="font-medium">{analysisResult.linguisticFingerprint.vocabularyTier.simple}%</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Moderate Vocab</div>
                      <div className="font-medium">{analysisResult.linguisticFingerprint.vocabularyTier.moderate}%</div>
                    </div>
                    <div>
                      <div className="text-neutral-600">Advanced Vocab</div>
                      <div className="font-medium">{analysisResult.linguisticFingerprint.vocabularyTier.advanced}%</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-600 mb-1">Top Unique Words</div>
                    <div className="text-sm">
                      {analysisResult.linguisticFingerprint.topUniqueWords.map((word, i) => (
                        <span key={i} className="inline-block bg-primary-100 text-primary-700 px-2 py-1 rounded mr-2 mb-1">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  {analysisResult.linguisticFingerprint.grammarQuirks.length > 0 && (
                    <div>
                      <div className="text-neutral-600 mb-1">Grammar Quirks</div>
                      <div className="text-sm space-y-1">
                        {analysisResult.linguisticFingerprint.grammarQuirks.map((quirk, i) => (
                          <div key={i} className="text-neutral-700">• {quirk}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hook Replication System */}
              {analysisResult.hookReplicationSystem && (
                <div className="bg-primary-50 rounded-[var(--radius-button)] p-4 border border-primary-200">
                  <h3 className="font-medium text-neutral-900 mb-3">🎯 Hook Replication System</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600">Primary Hook Type:</span>
                      <span className="font-medium capitalize bg-primary-100 px-3 py-1 rounded">
                        {analysisResult.hookReplicationSystem.primaryHookType}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Hook Templates (Copy & Reuse)</h4>
                      <div className="space-y-2">
                        {analysisResult.hookReplicationSystem.hookTemplates.map((template, i) => (
                          <div key={i} className="bg-white rounded p-3 border border-neutral-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-primary-600">{template.type.toUpperCase()}</span>
                              <span className="text-xs text-neutral-500">
                                {template.effectiveness} effectiveness • {template.frequency}% usage
                              </span>
                            </div>
                            <div className="font-mono text-sm bg-neutral-100 p-2 rounded mb-2">
                              {template.template}
                            </div>
                            <div className="text-xs text-neutral-600">
                              <strong>Real:</strong> {template.realExamples[0]}
                            </div>
                            {template.newExamples?.[0] && (
                              <div className="text-xs text-success-600 mt-1">
                                <strong>New Topic:</strong> {template.newExamples[0]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Hook Rules</h4>
                      <ul className="text-sm space-y-1">
                        {analysisResult.hookReplicationSystem.hookRules.map((rule, i) => (
                          <li key={i} className="text-neutral-700">• {rule}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Opening Formulas */}
              <div className="bg-neutral-50 rounded-[var(--radius-button)] p-4 border border-neutral-200">
                <h3 className="font-medium text-neutral-900 mb-3">Opening Formulas</h3>
                <div className="space-y-3">
                  {analysisResult.openingFormulas.map((formula, index) => (
                    <div key={index} className="bg-white rounded-[var(--radius-button)] p-3 border border-neutral-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium capitalize">{formula.emotionalTrigger} Trigger</div>
                        <div className="text-xs text-neutral-600">{formula.frequency}% frequency</div>
                      </div>
                      <div className="text-sm text-neutral-700 mb-2 font-mono bg-neutral-50 p-2 rounded">
                        {formula.pattern}
                      </div>
                      <div className="text-xs text-neutral-600">
                        <strong>Examples:</strong> {formula.examples.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transition Phrases */}
              <div className="bg-neutral-50 rounded-[var(--radius-button)] p-4 border border-neutral-200">
                <h3 className="font-medium text-neutral-900 mb-3">Transition Phrases</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-600 mb-2">Concept Bridges</div>
                    <div className="space-y-1">
                      {analysisResult.transitionPhrases.conceptBridges.map((phrase, i) => (
                        <div key={i} className="bg-white px-2 py-1 rounded text-xs">&quot;{phrase}&quot;</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-neutral-600 mb-2">Enumeration</div>
                    <div className="space-y-1">
                      {analysisResult.transitionPhrases.enumeration.map((phrase, i) => (
                        <div key={i} className="bg-white px-2 py-1 rounded text-xs">&quot;{phrase}&quot;</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Micro Patterns */}
              <div className="bg-neutral-50 rounded-[var(--radius-button)] p-4 border border-neutral-200">
                <h3 className="font-medium text-neutral-900 mb-3">Micro Patterns</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-neutral-600 mb-2">Fillers</div>
                    <div>{analysisResult.microPatterns.fillers.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600 mb-2">Emphasis Words</div>
                    <div>{analysisResult.microPatterns.emphasisWords.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600 mb-2">Number Patterns</div>
                    <div className="capitalize">{analysisResult.microPatterns.numberPatterns}</div>
                  </div>
                  <div>
                    <div className="text-neutral-600 mb-2">Time References</div>
                    <div>{analysisResult.microPatterns.timeReferences.join(', ')}</div>
                  </div>
                </div>
              </div>

              {/* Signature Moves */}
              {analysisResult.signatureMoves.length > 0 && (
                <div className="bg-neutral-50 rounded-[var(--radius-button)] p-4 border border-neutral-200">
                  <h3 className="font-medium text-neutral-900 mb-3">Signature Moves</h3>
                  <div className="space-y-3">
                    {analysisResult.signatureMoves.map((move, index) => (
                      <div key={index} className="bg-white rounded-[var(--radius-button)] p-3 border border-neutral-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-sm">{move.move}</div>
                          <div className="text-xs text-neutral-600">{move.frequency} • {move.placement}</div>
                        </div>
                        <div className="text-sm text-neutral-700 mb-2">{move.description}</div>
                        <div className="text-xs text-neutral-600">
                          <strong>Examples:</strong> {move.verbatim.join(' • ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Script Generation Rules */}
              {analysisResult.scriptGenerationRules && (
                <div className="bg-success-50 rounded-[var(--radius-button)] p-4 border border-success-200">
                  <h3 className="font-medium text-neutral-900 mb-3">📝 Script Generation Formula</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-success-700 mb-2">✅ Must Include</h4>
                        <ul className="text-xs space-y-1">
                          {analysisResult.scriptGenerationRules.mustInclude.map((item, i) => (
                            <li key={i} className="text-neutral-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-destructive-700 mb-2">❌ Never Include</h4>
                        <ul className="text-xs space-y-1">
                          {analysisResult.scriptGenerationRules.neverInclude.map((item, i) => (
                            <li key={i} className="text-neutral-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Optimal Structure</h4>
                      <div className="bg-white rounded p-3 space-y-2 text-sm">
                        <div className="flex">
                          <span className="font-medium text-primary-600 min-w-[100px]">Hook:</span>
                          <span className="text-neutral-700">{analysisResult.scriptGenerationRules.optimalStructure.hookSection}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-primary-600 min-w-[100px]">Body:</span>
                          <span className="text-neutral-700">{analysisResult.scriptGenerationRules.optimalStructure.bodySection}</span>
                        </div>
                        <div className="flex">
                          <span className="font-medium text-primary-600 min-w-[100px]">Close:</span>
                          <span className="text-neutral-700">{analysisResult.scriptGenerationRules.optimalStructure.closeSection}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 mb-2">Step-by-Step Formula</h4>
                      <div className="bg-white rounded p-3 text-sm text-neutral-700 font-mono">
                        {analysisResult.scriptGenerationRules.formulaForNewScript}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}