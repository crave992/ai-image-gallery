import { Image as ImageIcon } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReactNode } from "react";

interface DashboardSectionHeaderProps {
  title: string;
  description: string | ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
}

/**
 * Server Component: Reusable section header for dashboard cards
 * Pure presentational component
 */
export function DashboardSectionHeader({
  title,
  description,
  icon,
  action,
}: DashboardSectionHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            {icon || (
              <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            )}
            <span className="truncate">{title}</span>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            {description}
          </CardDescription>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </CardHeader>
  );
}
