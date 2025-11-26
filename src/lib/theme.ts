/**
 * Centralized theme configuration
 * All design tokens, spacing, colors, and common class combinations
 * Change values here to update the entire application
 */

/**
 * Spacing scale
 * Used for gaps, padding, margins
 */
export const spacing = {
  xs: "0.5rem", // 8px
  sm: "0.75rem", // 12px
  md: "1rem", // 16px
  lg: "1.5rem", // 24px
  xl: "2rem", // 32px
  "2xl": "2.5rem", // 40px
  "3xl": "3rem", // 48px
} as const;

/**
 * Border radius scale
 */
export const radius = {
  none: "0",
  sm: "0.25rem", // 4px
  md: "0.5rem", // 8px
  lg: "0.625rem", // 10px (default)
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  full: "9999px",
} as const;

/**
 * Font sizes
 */
export const fontSize = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
} as const;

/**
 * Font weights
 */
export const fontWeight = {
  normal: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/**
 * Common class combinations
 * Reusable patterns for consistent styling
 */
export const theme = {
  // Container styles (mobile-first)
  container: {
    base: "w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8",
    card: "bg-card text-card-foreground rounded-lg border shadow-sm",
    section: "space-y-3 sm:space-y-4",
    mobile: "w-full px-3 sm:px-4",
  },

  // Text styles (mobile-first)
  text: {
    heading: {
      h1: "text-2xl sm:text-3xl font-bold text-foreground",
      h2: "text-xl sm:text-2xl font-semibold text-foreground",
      h3: "text-lg sm:text-xl font-semibold text-foreground",
      h4: "text-base sm:text-lg font-semibold text-foreground",
    },
    body: {
      base: "text-sm sm:text-base text-foreground",
      sm: "text-xs sm:text-sm text-foreground",
      xs: "text-xs text-foreground",
    },
    muted: {
      base: "text-xs sm:text-sm text-muted-foreground",
      xs: "text-xs text-muted-foreground",
    },
  },

  // Button styles (complementary to button variants, mobile-first)
  button: {
    icon: "h-4 w-4 sm:h-4 sm:w-4",
    iconSm: "h-3.5 w-3.5 sm:h-3 sm:w-3",
    iconLg: "h-5 w-5 sm:h-5 sm:w-5",
    touch: "min-h-[44px] min-w-[44px] touch-manipulation", // iOS/Android touch target minimum
  },

  // Input styles
  input: {
    base: "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm",
    search: "pl-10 pr-10",
  },

  // Grid layouts (mobile-first)
  grid: {
    imageGrid: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4",
    imageGridCompact: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1.5 sm:gap-2",
    responsive: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4",
  },

  // Flex layouts (mobile-first)
  flex: {
    center: "flex items-center justify-center",
    between: "flex items-center justify-between flex-wrap sm:flex-nowrap",
    start: "flex items-center justify-start",
    end: "flex items-center justify-end",
    col: "flex flex-col",
    row: "flex flex-row",
    colMobile: "flex flex-col sm:flex-row",
    rowMobile: "flex flex-row sm:flex-col",
  },

  // Spacing utilities (mobile-first)
  gap: {
    xs: "gap-1",
    sm: "gap-1.5 sm:gap-2",
    md: "gap-2 sm:gap-4",
    lg: "gap-4 sm:gap-6",
    xl: "gap-6 sm:gap-8",
  },

  space: {
    xs: "space-y-1",
    sm: "space-y-2 sm:space-y-2",
    md: "space-y-3 sm:space-y-4",
    lg: "space-y-4 sm:space-y-6",
    xl: "space-y-6 sm:space-y-8",
  },

  // Padding (mobile-first, following 16px standard)
  padding: {
    xs: "p-2",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  },

  // Margin
  margin: {
    xs: "m-2",
    sm: "m-3",
    md: "m-4",
    lg: "m-6",
    xl: "m-8",
  },

  // Border styles
  border: {
    base: "border border-border",
    muted: "border border-muted",
    primary: "border border-primary",
    dashed: "border-2 border-dashed border-border",
  },

  // Background styles
  background: {
    base: "bg-background",
    card: "bg-card",
    muted: "bg-muted",
    overlay: "bg-background/80 backdrop-blur-sm",
  },

  // Shadow styles
  shadow: {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  },

  // Transition styles
  transition: {
    base: "transition-all duration-200",
    colors: "transition-colors duration-200",
    transform: "transition-transform duration-200",
  },

  // Aspect ratios
  aspect: {
    square: "aspect-square",
    video: "aspect-video",
    auto: "aspect-auto",
  },

  // Common component patterns
  card: {
    base: "bg-card text-card-foreground rounded-lg border shadow-sm p-6",
    header: "space-y-1",
    content: "pt-1",
    footer: "flex items-center justify-between pt-4 border-t",
  },

  dialog: {
    content: "w-full max-w-full sm:max-w-md md:max-w-2xl lg:max-w-4xl max-h-[100vh] sm:max-h-[90vh] overflow-y-auto m-0 sm:m-4 rounded-none sm:rounded-lg",
    header: "space-y-1",
    mobile: "fixed inset-0 z-50 bg-background",
  },

  skeleton: {
    base: "animate-pulse bg-muted rounded",
    image: "bg-muted border border-border animate-pulse",
  },

  // Status colors (using theme variables)
  status: {
    error: "bg-destructive/10 text-destructive border-destructive/20",
    success: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    warning: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },

  // Image styles
  image: {
    container: "relative aspect-square rounded-lg overflow-hidden bg-muted border border-border",
    thumbnail: "w-full h-full object-cover",
    full: "w-full h-full object-contain",
  },

  // Badge/Tag styles (mobile-first)
  badge: {
    base: "px-2.5 sm:px-3 py-1 text-xs rounded-full font-medium",
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary text-secondary-foreground",
    muted: "bg-muted text-muted-foreground",
  },

  // Mobile-specific utilities
  mobile: {
    hide: "hidden sm:block",
    show: "block sm:hidden",
    fullWidth: "w-full",
    touchTarget: "min-h-[44px] min-w-[44px]",
    safeArea: "pb-safe-area-inset-bottom pt-safe-area-inset-top",
  },
} as const;

/**
 * Helper function to combine theme classes
 * Usage: cn(theme.card.base, theme.text.heading.h2, className)
 */
export function getThemeClasses(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Common responsive breakpoints
 */
export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

/**
 * Z-index scale
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
} as const;

