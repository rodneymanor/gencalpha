import { redirect } from "next/navigation";

export default function Home() {
  redirect("/write");
  return <>Coming Soon</>;
}
