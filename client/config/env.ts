/**
 * Centralized, validated access to environment variables.
 *
 * Only NEXT_PUBLIC_* variables belong here — anything server-only or
 * secret must never be read from client-side code. See
 * docs/README-FRONTEND.md "Security Rules" for the full policy.
 *
 * Import this instead of reading process.env directly elsewhere in the app.
 */

function getRequiredEnvVar(name: string, value: string | undefined): string {
  if (!value || value.trim().length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env.local file (see .env.example).`,
    );
  }
  return value;
}

export const env = {
  apiUrl: getRequiredEnvVar(
    "NEXT_PUBLIC_API_URL",
    process.env.NEXT_PUBLIC_API_URL,
  ),
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
} as const;
