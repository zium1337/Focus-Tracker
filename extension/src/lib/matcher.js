const BLOCKED_PROTOCOLS = ["chrome://", "chrome-extension://", "edge://", "about:"];

export function isBlocked(url, patterns) {
  if (!url || typeof url !== "string") return false;
  if (BLOCKED_PROTOCOLS.some((p) => url.startsWith(p))) return false;
  if (!Array.isArray(patterns) || patterns.length === 0) return false;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();
  const schemelessUrl = parsed.href.slice((parsed.protocol + "//").length);

  for (const pattern of patterns) {
    if (!pattern || typeof pattern !== "string") continue;

    if (pattern.includes("/") || pattern.includes("://")) {
      if (url.startsWith(pattern) || schemelessUrl.startsWith(pattern)) {
        return true;
      }
      continue;
    }

    const patternLower = pattern.toLowerCase();
    if (hostname === patternLower) return true;
    if (hostname.endsWith("." + patternLower)) return true;
  }

  return false;
}
