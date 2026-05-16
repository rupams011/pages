/**
 * Environment configuration for the frontend.
 * 
 * In development, API calls are made to localhost.
 * In production (GitHub Pages), they should point to the deployed backend URL.
 * 
 * Set NEXT_PUBLIC_API_URL in your .env file or GitHub Actions secrets.
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const env = {
  /** Base URL for API calls (e.g., "https://api.huesurge.com" or "http://localhost:4000") */
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',

  /** Base path for the app (e.g., "/HueHub" for GitHub Pages) */
  basePath,

  /** Better Auth base URL */
  authUrl: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:4000',
} as const;
