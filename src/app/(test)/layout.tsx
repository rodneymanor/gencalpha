import { ReactNode } from "react";

import { AuthProvider } from "@/contexts/auth-context";

export default function TestLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AuthProvider>{children}</AuthProvider>;
}
