import { getBackendUrl, REQUEST_TIMEOUT_MS } from "./config.js";

async function request(path, init = {}) {
  const baseUrl = await getBackendUrl();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(baseUrl + path, {
      ...init,
      signal: controller.signal,
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    return response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchStatus() {
  return request("/status");
}

export async function reportSite(blocked, url) {
  return request("/site-data", {
    method: "POST",
    body: JSON.stringify({
      is_blocked_site_detected: blocked,
      current_url: url,
    }),
  });
}
