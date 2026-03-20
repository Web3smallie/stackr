/**
 * Returns the app base URL (without trailing slash or protocol for display,
 * or with https:// for full URLs).
 */
const raw = import.meta.env.VITE_APP_URL || "stackr-two.vercel.app";
// Strip protocol and trailing slash for display
export const APP_DOMAIN = raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
export const APP_URL = `https://${APP_DOMAIN}`;
