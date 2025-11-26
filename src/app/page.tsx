import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth-service";

/**
 * Landing page - redirects to login if not authenticated, dashboard if authenticated
 */
export default async function HomePage() {
  const { user } = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  redirect("/login");
}
