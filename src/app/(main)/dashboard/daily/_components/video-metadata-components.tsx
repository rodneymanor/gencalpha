import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "@/lib/collections";

export function MetadataTab({ video }: { video: Video }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Platform:</span>
            <Badge>{video.platform}</Badge>
          </div>
          {video.metadata?.author && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Author:</span>
              <span>{video.metadata.author}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Added:</span>
            <span>{new Date(video.addedAt).toLocaleDateString()}</span>
          </div>
          {video.duration && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span>
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <span className="text-muted-foreground text-sm">Original URL:</span>
            <div className="mt-1">
              <a
                href={video.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm break-all hover:underline"
              >
                {video.originalUrl}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {video.tags && video.tags.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {video.metadata?.hashtags && video.metadata.hashtags.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Hashtags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {video.metadata.hashtags.map((hashtag: string) => (
                <Badge key={hashtag} variant="secondary">
                  #{hashtag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
