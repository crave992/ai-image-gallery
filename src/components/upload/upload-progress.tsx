"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { UploadProgress } from "@/lib/client/image-service";
import { cn } from "@/lib/utils";

interface UploadProgressComponentProps {
  progress: UploadProgress[];
  onClose?: () => void;
}

/**
 * Upload progress component showing multiple file uploads
 */
export function UploadProgressComponent({
  progress,
  onClose,
}: UploadProgressComponentProps) {
  const allCompleted = progress.every((p) => p.status === "completed");
  const hasErrors = progress.some((p) => p.status === "error");

  return (
    <AnimatePresence>
      {progress.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 z-50 w-full max-w-md bg-card rounded-lg shadow-lg border border-border p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">
              Uploading {progress.length} file{progress.length > 1 ? "s" : ""}
            </h3>
            {onClose && (allCompleted || hasErrors) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {progress.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate flex-1">{item.filename}</span>
                  <div className="flex items-center gap-2 ml-2">
                    {item.status === "completed" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {item.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span
                      className={cn(
                        "text-xs font-medium",
                        item.status === "error" && "text-red-500",
                        item.status === "completed" && "text-green-500"
                      )}
                    >
                      {item.progress}%
                    </span>
                  </div>
                </div>
                <Progress
                  value={item.progress}
                  className={cn(
                    "h-1.5",
                    item.status === "error" && "bg-red-100",
                    item.status === "completed" && "bg-green-100"
                  )}
                />
                {item.error && (
                  <p className="text-xs text-red-500">{item.error}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

