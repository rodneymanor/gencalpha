import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to write page as the main entry point
  redirect("/write");
}
