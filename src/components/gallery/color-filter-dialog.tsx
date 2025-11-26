"use client";

import { useCallback } from "react";
import { X, Palette } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface ColorFilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedColor: string | null;
  onColorSelect: (color: string | null) => void;
  availableColors: string[];
}

/**
 * Client Component: Color filter dialog
 * Displays available colors in a modal for selection
 */
export function ColorFilterDialog({
  open,
  onOpenChange,
  selectedColor,
  onColorSelect,
  availableColors,
}: ColorFilterDialogProps) {
  const handleColorClick = useCallback(
    (color: string) => {
      if (selectedColor === color) {
        onColorSelect(null);
      } else {
        onColorSelect(color);
      }
      onOpenChange(false);
    },
    [selectedColor, onColorSelect, onOpenChange]
  );

  const handleClear = useCallback(() => {
    onColorSelect(null);
    onOpenChange(false);
  }, [onColorSelect, onOpenChange]);

  if (availableColors.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(theme.dialog.content, "p-3 sm:p-6")}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Filter by Color
          </DialogTitle>
          <DialogDescription>
            Select a color to filter images with similar dominant colors
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3">
            {availableColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorClick(color)}
                className={`relative w-12 h-12 rounded-lg border-2 transition-all hover:scale-110 ${
                  selectedColor === color
                    ? "border-primary ring-2 ring-primary ring-offset-2 scale-110"
                    : "border-border hover:border-primary/50"
                }`}
                style={{ backgroundColor: color }}
                title={color}
                aria-label={`Filter by ${color}`}
              >
                {selectedColor === color && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-background rounded-full border border-border" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {selectedColor && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-border"
                  style={{ backgroundColor: selectedColor }}
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Selected Color
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {selectedColor}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className={cn("flex items-center gap-2", theme.button.touch, "text-sm sm:text-base")}
              >
                <X className={cn(theme.button.icon)} />
                Clear
              </Button>
            </div>
          )}

          <div className={cn("flex justify-end gap-2 pt-2 border-t", theme.flex.colMobile)}>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={cn(theme.button.touch, "w-full sm:w-auto text-sm sm:text-base")}
            >
              Close
            </Button>
            {selectedColor && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClear}
                className={cn(theme.button.touch, "w-full sm:w-auto text-sm sm:text-base")}
              >
                Clear Filter
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

