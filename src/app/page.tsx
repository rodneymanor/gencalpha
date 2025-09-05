import { redirect } from "next/navigation";

export default function RootPage() {
  // Redirect to V1 login page (simpler, no AuthRedirectGuard issues)
  redirect("/auth/v1/login");
}
