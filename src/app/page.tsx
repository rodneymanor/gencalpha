import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to dashboard as the main entry point
  redirect("/dashboard");
}