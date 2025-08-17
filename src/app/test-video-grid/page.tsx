interface VideoData {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
}

const sampleVideos: VideoData[] = [
  {
    id: "1",
    title: "Creative Process Behind the Scenes",
    creator: "creative_mind",
    thumbnail: "https://picsum.photos/300/400?random=1",
  },
  {
    id: "2",
    title: "Dance Challenge Trending",
    creator: "dancequeen",
    thumbnail: "https://picsum.photos/300/400?random=2",
  },
  {
    id: "3",
    title: "Product Showcase Tutorial",
    creator: "tech_reviewer",
    thumbnail: "https://picsum.photos/300/400?random=3",
  },
  {
    id: "4",
    title: "Cooking Tips & Tricks",
    creator: "chef_anna",
    thumbnail: "https://picsum.photos/300/400?random=4",
  },
  {
    id: "5",
    title: "Travel Vlog Highlights",
    creator: "wanderlust_soul",
    thumbnail: "https://picsum.photos/300/400?random=5",
  },
  {
    id: "6",
    title: "Comedy Sketch Series",
    creator: "funny_creator",
    thumbnail: "https://picsum.photos/300/400?random=6",
  },
];

function VideoCard({ video }: { video: VideoData }) {
  return (
    <div className="bg-card overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-soft-drop)]">
      <div className="relative aspect-[9/16] overflow-hidden bg-black">
        <img src={video.thumbnail} alt={video.title} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-foreground mb-1 text-sm font-medium">{video.title}</h3>
        <p className="text-muted-foreground text-xs">@{video.creator}</p>
      </div>
    </div>
  );
}

export default function TestVideoGridPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-foreground mb-2 text-2xl font-semibold">Video Grid Test</h1>
          <p className="text-muted-foreground">Testing video grid component with Clarity Design System</p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sampleVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      </div>
    </div>
  );
}
