"use client";

import { useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Client Component: Search bar with instant results
 * Updates search query as user types
 */
export function SearchBar({
  value,
  onChange,
  placeholder = "Search by tags or description...",
  className,
}: SearchBarProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleClear = useCallback(() => {
    onChange("");
  }, [onChange]);

  return (
    <div className={cn("relative w-full", className)}>
      <Search
        className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2",
          "h-4 w-4 text-muted-foreground pointer-events-none"
        )}
      />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          "h-10 sm:h-9 w-full rounded-md border border-input bg-transparent pl-10 pr-10 text-base sm:text-sm",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className={cn(
            "absolute right-1 top-1/2 transform -translate-y-1/2",
            "h-8 w-8 p-0 hover:bg-transparent",
            "touch-manipulation"
          )}
          aria-label="Clear search"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
