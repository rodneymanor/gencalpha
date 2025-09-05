import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to the main write page where auth is handled properly
  redirect("/write");
}
