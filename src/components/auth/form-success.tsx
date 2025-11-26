import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSuccessProps {
  message: string | null;
  className?: string;
}

/**
 * Server Component: Reusable success message component for forms
 * Pure presentational component, no interactivity needed
 */
export function FormSuccess({ message, className }: FormSuccessProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm",
        className
      )}
    >
      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
