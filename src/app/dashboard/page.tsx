import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth-service";
import { DashboardContent } from "@/components/gallery/dashboard-content";

/**
 * Dashboard page - Protected route for authenticated users
 */
export default async function DashboardPage() {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect("/login?redirectTo=/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardContent user={user} />
    </div>
  );
}
