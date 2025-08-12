import React from "react";

export interface ExampleIdeaProps {
  title: string;
  format: string;
  hook: string;
  keyPoints: string[];
}

export const ExampleIdea: React.FC<ExampleIdeaProps> = ({ title, format, hook, keyPoints }) => {
  return (
    <div className="mt-6 space-y-2">
      <p className="font-semibold">{title}</p>
      <ul className="ml-4 list-inside list-disc space-y-1">
        <li>Format: {format}</li>
        <li>Hook: &quot;{hook}&quot;</li>
        <li>
          Key Points:
          <ul className="mt-1 ml-4 list-inside list-disc">
            {keyPoints.map((point) => (
              <li key={`${title}-${point}`}>{point}</li>
            ))}
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default ExampleIdea;
