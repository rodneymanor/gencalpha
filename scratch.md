// --- TYPE DEFINITIONS ---
interface VideoPlayerProps {
creatorName: string;
creatorHandle: string;
followers: string;
videoUrl: string;
views: string;
likes: string;
comments: string;
shares: string;
saves: string;
engagementRate: string;
caption: string;
transcript: string;
duration: string;
}

// --- ICON COMPONENTS ---
const PlayIcon = ({ className }: { className?: string }) => (
<svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
<path d="M7 5.76795V18.2321C7 19.2201 7.94273 19.8364 8.81833 19.382L18.8183 13.15C19.694 12.6956 19.694 11.3044 18.8183 10.85L8.81833 4.61795C7.94273 4.16356 7 4.77995 7 5.76795Z" />
</svg>
);
const InsightsIcon = ({ className }: { className?: string }) => (
<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M3 12h3M18 12h3M12 3v3M12 18v3M8.5 8.5l-2-2M17.5 17.5l-2-2M15.5 8.5l2-2M6.5 17.5l2-2" />
<circle cx="12" cy="12" r="4" />
</svg>
);
const HeartIcon = ({ className }: { className?: string }) => (
<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
</svg>
);
const EyeIcon = ({ className }: { className?: string }) => (
<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
<circle cx="12" cy="12" r="3" />
</svg>
);
const CommentIcon = ({ className }: { className?: string }) => (
<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
</svg>
);
const ShareIcon = ({ className }: { className?: string }) => (
<svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
<polyline points="16 6 12 2 8 6" />
<line x1="12" y1="2" x2="12" y2="15" />
</svg>
);
const TikTokIcon = ({ className }: { className?: string }) => (
<svg className={className} viewBox="0 0 24 24" fill="currentColor">
<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.88-1.59-1.94-2.2-4.42-1.8-6.83.39-2.4 1.91-4.45 3.72-5.96 1.95-1.64 4.59-2.5 7.1-2.45v4.03c-1.11.02-2.21.22-3.23.62-.65.25-1.26.6-1.81 1.02-.33.25-.65.52-.96.81-.02-3.2.01-6.39-.01-9.58Z"/>
</svg>
);

// --- UI SUB-COMPONENTS ---

// Shadcn-inspired switch for toggling between Play and Insights
const ModeSwitch = ({ isOn, onToggle }: { isOn: boolean, onToggle: () => void }) => (
<button onClick={onToggle} className="relative w-[68px] h-9 flex items-center bg-gray-200 rounded-full p-1 transition-colors duration-300 ease-in-out flex-shrink-0">
<div className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${isOn ? 'translate-x-[32px]' : 'translate-x-0'}`}></div>
<div className="w-1/2 flex justify-center z-10">
<PlayIcon className={`w-5 h-5 transition-colors duration-300 ${!isOn ? 'text-gray-800' : 'text-gray-400'}`} />
</div>
<div className="w-1/2 flex justify-center z-10">
<InsightsIcon className={`w-5 h-5 transition-colors duration-300 ${isOn ? 'text-gray-800' : 'text-gray-400'}`} />
</div>
</button>
);

// Displays a single video metric with an icon and value
const Metric = ({ icon, value }: { icon: React.ReactNode, value: string }) => (

  <div className="flex items-center gap-1.5 text-gray-600">
    {icon}
    <span className="text-xs font-medium">{value}</span>
  </div>
);

// --- CONTENT VIEWS ---

// View for the Video Player
const VideoPlayerView: React.FC<Pick<VideoPlayerProps, 'videoUrl' | 'views' | 'likes' | 'comments' | 'shares'>> =
({ videoUrl, views, likes, comments, shares }) => (
<div className="flex flex-col h-full">
<div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden shadow-inner flex-shrink-0">
<iframe
                className="absolute top-0 left-0 w-full h-full"
                src={videoUrl}
                title="Video Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
</div>
<div className="mt-3 grid grid-cols-4 gap-2 px-1 flex-shrink-0">
<Metric icon={<EyeIcon className="w-4 h-4" />} value={views} />
<Metric icon={<HeartIcon className="w-4 h-4" />} value={likes} />
<Metric icon={<CommentIcon className="w-4 h-4" />} value={comments} />
<Metric icon={<ShareIcon className="w-4 h-4" />} value={shares} />
</div>
<div className="mt-4 flex-shrink-0">
<button className="w-full h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
Remix
</button>
</div>
</div>
);

// View for the Social Media Insights
const InsightsPanelView: React.FC<Omit<VideoPlayerProps, 'videoUrl' | 'creatorName' | 'creatorHandle' | 'followers'>> =
(props) => (
<div className="h-full overflow-y-auto text-sm text-gray-700 pr-2">
<h2 className="text-lg font-bold text-gray-900 mb-3">Social Media Insights</h2>

        <div className="space-y-5">
            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Hook Ideas From the Video</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>"You won't believe this one simple trick for..."</li>
                    <li>"Are you making this common mistake when...?"</li>
                    <li>"Stop wasting time on [problem], do this instead."</li>
                </ul>
            </div>

            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Metrics</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div className="flex justify-between"><span>Likes:</span> <span className="font-medium text-gray-800">{props.likes}</span></div>
                    <div className="flex justify-between"><span>Comments:</span> <span className="font-medium text-gray-800">{props.comments}</span></div>
                    <div className="flex justify-between"><span>Shares:</span> <span className="font-medium text-gray-800">{props.shares}</span></div>
                    <div className="flex justify-between"><span>Saves:</span> <span className="font-medium text-gray-800">{props.saves}</span></div>
                    <div className="flex justify-between"><span>Views:</span> <span className="font-medium text-gray-800">{props.views}</span></div>
                    <div className="flex justify-between"><span>Engagement Rate:</span> <span className="font-medium text-gray-800">{props.engagementRate}</span></div>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Content Ideas From the Video</h3>
                <div className="space-y-2">
                    <p><strong>Expand on the Core Concept:</strong> A deep-dive tutorial on the main technique shown in the video.</p>
                    <p><strong>Behind-the-Scenes:</strong> Show the process of creating the original video, including mistakes.</p>
                    <p><strong>Tool Spotlight:</strong> Create a dedicated review or tutorial for a specific tool mentioned.</p>
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Caption</h3>
                <p className="text-xs p-3 bg-gray-50 rounded-md border">{props.caption}</p>
            </div>

            <div>
                <h3 className="font-semibold text-gray-800 mb-2">Transcript</h3>
                <p className="text-xs p-3 bg-gray-50 rounded-md border"><strong>Duration:</strong> {props.duration}s</p>
                <p className="text-xs p-3 bg-gray-50 rounded-md border mt-1 whitespace-pre-wrap">{props.transcript}</p>
            </div>
        </div>
    </div>

);

// --- MAIN APP COMPONENT ---
const App: React.FC<VideoPlayerProps> = (props) => {
const { creatorName, followers } = props;
const [showInsights, setShowInsights] = useState(false);

return (
<div className="font-sans bg-gray-50 text-zinc-800 flex justify-center items-start p-4 min-h-screen">
{/_ Animated container for the side panel _/}
<div className={`sticky top-0 z-50 p-3 bg-gray-100 rounded-[28px] transition-all duration-500 ease-out ${showInsights ? 'w-[800px]' : 'w-[375px]'}`}>
{/_ Inner container with shadow and border _/}
<div className="h-full w-full bg-white shadow-lg border border-gray-200 rounded-[22px] flex flex-col">
{/_ Flex container for the panel content _/}
<div className="flex-1 flex flex-col p-4 min-w-0">

            {/* --- Creator Header --- */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 flex-shrink-0">
              <TikTokIcon className="h-10 w-10 flex-shrink-0 text-black" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm text-zinc-800 truncate">{creatorName}</div>
                <div className="text-xs text-gray-500">{followers} Followers</div>
              </div>
              <ModeSwitch isOn={showInsights} onToggle={() => setShowInsights(!showInsights)} />
            </div>

            {/* --- Main Content Area (Animated) --- */}
            <div className="mt-4 flex-1 min-h-0">
                {showInsights ? <InsightsPanelView {...props} /> : <VideoPlayerView {...props} />}
            </div>
          </div>
        </div>
      </div>
    </div>

);
};

// --- DEFAULT EXPORT AND PROPS ---
export default function RefactoredApp() {
const videoData: VideoPlayerProps = {
creatorName: "The Art of Code",
creatorHandle: "@artofcode",
followers: "1.2M",
videoUrl: "https://www.youtube.com/embed/wA_24AIXqgM",
views: "2.1M",
likes: "180K",
comments: "1,245",
shares: "24.3K",
saves: "95K",
engagementRate: "8.5%",
duration: "58",
caption: "Here's a quick look at how to build animated UIs with React and Tailwind CSS. It's easier than you think! #react #tailwindcss #uidev #webdev #coding",
transcript: `(Upbeat music starts)
Hey everyone! Today I'm going to show you how to create a slick, animated sliding panel using just React and Tailwind CSS.
First, we'll set up our state with useState to track whether the panel is open or closed.
Next, we'll apply conditional classes based on that state. This is where the magic happens. We'll change the width and add transition properties...
(Music fades)
...and just like that, you have a beautiful, animated UI. Let me know what you want to see next!`,
};

return <App {...videoData} />;
}
