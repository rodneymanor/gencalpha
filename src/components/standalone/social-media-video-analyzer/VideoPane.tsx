import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface VideoPaneProps {
  url: string
  setUrl: (v: string) => void
  videoSrc: string | null
  onLoadVideo: (inputUrl?: string) => void
}

export function VideoPane({ url, setUrl, videoSrc, onLoadVideo }: VideoPaneProps) {
  return (
    <div className="grid aspect-[9/16] w-full max-h-[80vh] place-items-center bg-black/95">
      {!videoSrc ? (
        <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 p-6">
          <h2 className="text-lg font-semibold">Analyze Social Media Video</h2>
          <p className="text-sm text-muted-foreground">Paste a TikTok, Instagram Reels, or YouTube Shorts URL</p>
          <div className="flex w-full max-w-md items-center gap-2">
            <Input
              placeholder="https://www.tiktok.com/@user/video/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onLoadVideo()}
              className="rounded-[var(--radius-button)]"
            />
            <Button onClick={() => onLoadVideo()} className="rounded-[var(--radius-button)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[.99]">
              Load Video
            </Button>
          </div>
          <div>
            <Button variant="secondary" onClick={() => onLoadVideo('https://www.tiktok.com/@sarahcreates/video/123456789')} className="rounded-[var(--radius-button)]">
              Load Sample Video
            </Button>
          </div>
        </div>
      ) : (
        <video src={videoSrc} controls className="h-full w-full object-contain" />
      )}
    </div>
  )
}



