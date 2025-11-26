/**
 * Validates required environment variables
 * This should be called at startup to ensure all required env vars are present
 */

const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

const optionalEnvVars = {
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  AI_SERVICE_API_KEY: process.env.AI_SERVICE_API_KEY,
  AI_SERVICE_URL: process.env.AI_SERVICE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
} as const;

/**
 * Validates that all required environment variables are set
 * @throws Error if any required env var is missing
 */
export function validateEnvVars(): void {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value || value.trim() === "") {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env.local file and ensure all required variables are set."
    );
  }
}

/**
 * Gets validated environment variables
 * @returns Object with all env vars (required and optional)
 */
export function getEnvVars() {
  validateEnvVars();

  return {
    ...requiredEnvVars,
    ...optionalEnvVars,
  };
}

