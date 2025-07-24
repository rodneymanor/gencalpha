import { Metadata } from "next";

import { ContentIdeasGrid } from "./_components/content-ideas-grid";
import { PersonalizationDialog } from "./_components/personalization-dialog";
import { ViralVideosMasonry } from "./_components/viral-videos-masonry";

export const metadata: Metadata = {
  title: "Daily | Studio Admin",
  description: "Daily content inspiration and ideas",
};

export default function DailyPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mx-auto max-w-4xl space-y-3 text-center">
        <h1 className="text-foreground text-2xl leading-tight font-bold md:text-3xl lg:text-4xl">
          Use the relevant Inspiration for your content.
        </h1>
        <h2 className="text-primary text-lg font-semibold md:text-xl lg:text-2xl">Short form Inspiration For You!</h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
          Short-form scripts. Human tone. AI speed.
        </p>
        <PersonalizationDialog />
      </div>

      {/* Viral Videos Masonry Grid */}
      <div className="mx-auto max-w-7xl">
        <ViralVideosMasonry />
      </div>

      {/* Content Ideas Grid */}
      <div className="mx-auto max-w-7xl">
        <ContentIdeasGrid />
      </div>
    </div>
  );
}
