/**
 * Application-wide constants and configuration.
 * Import from `@/config/config` — never hardcode these values elsewhere.
 */

/** Base URL for client-side API calls. Empty string uses relative paths (same-origin). */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

/** Public-facing app name */
export const APP_NAME = "CrossGuild";

/** Routes that require authentication (enforced by middleware) */
export const PROTECTED_ROUTES = {
  admin: ["/admin"],
  auth: ["/profile", "/settings"],
} as const;

/** Auth pages — redirect away if user is already signed in */
export const AUTH_ROUTES = [
  "/login",
  "/auth/signin",
  "/auth/register",
  "/password-reset",
] as const;

/** Default pagination size for list endpoints */
export const DEFAULT_PAGE_SIZE = 20;

/** Max items per cart line (sanity check) */
export const MAX_CART_ITEM_QUANTITY = 99;
