export const DEFAULT_BACKEND_URL = "http://localhost:8000";
export const POLL_INTERVAL_MINUTES = 0.5;
export const STATUS_CACHE_TTL_MS = 1000;
export const REQUEST_TIMEOUT_MS = 2000;

export async function getBackendUrl() {
  const stored = await chrome.storage.local.get("backend_url");
  return stored.backend_url || DEFAULT_BACKEND_URL;
}

export async function getBlockedSites() {
  const stored = await chrome.storage.local.get("blocked_sites");
  return stored.blocked_sites || [];
}
