"use client";

import { createContext, useContext, ReactNode, useMemo, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider component
 * Provides theme state and methods to child components
 * Uses localStorage to persist theme preference
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialize theme from localStorage or default to light
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";

    try {
      const stored = window.localStorage.getItem("theme");
      if (stored === "dark" || stored === "light") {
        return stored as Theme;
      }
    } catch {
      // Ignore localStorage errors
    }

    return "light";
  });

  // Apply theme to document
  useMemo(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Save to localStorage
    try {
      window.localStorage.setItem("theme", theme);
    } catch {
      // Ignore localStorage errors
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
