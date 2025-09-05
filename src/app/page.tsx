import { redirect } from "next/navigation";

export default function RootPage() {
  // Since we can't determine auth state server-side easily, 
  // redirect to login page where proper auth handling occurs
  redirect("/auth/v2/login");
}