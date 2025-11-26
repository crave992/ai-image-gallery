import { toast } from "@/hooks/use-toast";

/**
 * Utility functions for showing toast notifications
 */

/**
 * Show an error toast notification
 * @param title - Error title
 * @param description - Error description (optional)
 */
export function showErrorToast(title: string, description?: string) {
  toast({
    variant: "destructive",
    title,
    description,
    duration: 5000,
  });
}

/**
 * Show a success toast notification
 * @param title - Success title
 * @param description - Success description (optional)
 */
export function showSuccessToast(title: string, description?: string) {
  toast({
    variant: "success",
    title,
    description,
    duration: 3000,
  });
}

/**
 * Show a warning toast notification
 * @param title - Warning title
 * @param description - Warning description (optional)
 */
export function showWarningToast(title: string, description?: string) {
  toast({
    variant: "warning",
    title,
    description,
    duration: 4000,
  });
}

/**
 * Show an info toast notification
 * @param title - Info title
 * @param description - Info description (optional)
 */
export function showInfoToast(title: string, description?: string) {
  toast({
    variant: "info",
    title,
    description,
    duration: 3000,
  });
}

