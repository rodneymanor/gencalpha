import React from "react";

export interface ContentIdeaSectionProps {
  title: string;
  approaches: Array<{
    title: string;
    description: string;
  }>;
}

export const ContentIdeaSection: React.FC<ContentIdeaSectionProps> = ({ title, approaches }) => {
  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-3">Choose ONE approach:</p>
      <ul className="mb-4 list-inside list-disc space-y-2">
        {approaches.map((approach) => (
          <li key={`${title}-${approach.title}`}>
            <strong className="font-semibold">{approach.title}:</strong> {approach.description}
          </li>
        ))}
      </ul>
      <div className="space-y-1">
        <p>
          <strong className="font-semibold">Format:</strong> [Specify format]
        </p>
        <p>
          <strong className="font-semibold">Hook:</strong> [One-sentence compelling opener]
        </p>
        <p>
          <strong className="font-semibold">Key Points:</strong> [2-3 bullet points of what to cover]
        </p>
      </div>
    </div>
  );
};

export default ContentIdeaSection;
