import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Gen.C",
  version: packageJson.version,
  copyright: `© ${currentYear}, Gen.C.`,
  meta: {
    title: "Gen.C - Your AI content co-pilot trained on what actually converts",
    description:
      "Gen.C is your AI co-pilot trained on proven, high-converting content. Just chat about your ideas and watch them transform into hooks, stories, and value bombs that speak directly to your audience.",
  },
};
