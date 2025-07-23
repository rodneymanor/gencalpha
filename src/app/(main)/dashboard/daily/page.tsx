import { Metadata } from "next";

import { ContentIdeasGrid } from "./_components/content-ideas-grid";
import { PersonalizationDialog } from "./_components/personalization-dialog";

export const metadata: Metadata = {
  title: "Daily | Studio Admin",
  description: "Daily content inspiration and ideas",
};

export default function DailyPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <h1 className="text-foreground text-3xl leading-tight font-bold md:text-4xl lg:text-5xl">
          Use the relevant Inspiration for your content.
        </h1>
        <h2 className="text-primary text-xl font-semibold md:text-2xl lg:text-3xl">Short form Inspiration For You!</h2>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg md:text-xl">
          Short-form scripts. Human tone. AI speed.
        </p>
        <PersonalizationDialog />
      </div>

      {/* Content Ideas Grid */}
      <div className="mx-auto max-w-7xl">
        <ContentIdeasGrid />
      </div>
    </div>
  );
}
