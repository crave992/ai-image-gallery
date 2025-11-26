import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message: string | null;
  className?: string;
}

/**
 * Server Component: Reusable error message component for forms
 * Pure presentational component, no interactivity needed
 */
export function FormError({ message, className }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm",
        className
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
