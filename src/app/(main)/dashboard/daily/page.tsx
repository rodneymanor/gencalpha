import { Metadata } from "next";

import DailyPageSlideWrapper from "./_components/daily-page-slide-wrapper";

export const metadata: Metadata = {
  title: "Daily | Studio Admin",
  description: "Daily content inspiration and ideas",
};

export default function DailyPage() {
  return <DailyPageSlideWrapper />;
}
