import { POLL_INTERVAL_MINUTES, STATUS_CACHE_TTL_MS, getBlockedSites } from "./lib/config.js";
import { fetchStatus, reportSite } from "./lib/api.js";
import { isBlocked } from "./lib/matcher.js";

const POLL_ALARM_NAME = "focus-tracker-poll";
const lastReportedByTab = new Map();
let lastSessionActive = false;

async function refreshStatus() {
  let sessionActive = false;
  let online = true;
  try {
    const status = await fetchStatus();
    sessionActive = !!status.is_session_active;
  } catch (err) {
    online = false;
    console.warn("Focus Tracker: fetchStatus failed", err.message);
  }

  const effectiveActive = online && sessionActive;

  await chrome.storage.session.set({
    session_active: effectiveActive,
    backend_online: online,
    fetched_at: Date.now(),
  });

  if (lastSessionActive && !effectiveActive) {
    await broadcastRemoveOverlay();
    lastReportedByTab.clear();
  } else if (!lastSessionActive && effectiveActive) {
    await scanAllTabs();
  }
  lastSessionActive = effectiveActive;
}

async function broadcastRemoveOverlay() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (!tab.id) continue;
    try {
      await chrome.tabs.sendMessage(tab.id, { type: "REMOVE_OVERLAY" });
    } catch {
      // ignore
    }
  }
}

async function scanAllTabs() {
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id && tab.url) {
      evaluateTab(tab.id, tab.url);
    }
  }
}

async function ensureFreshStatus() {
  const stored = await chrome.storage.session.get(["fetched_at"]);
  const age = Date.now() - (stored.fetched_at || 0);
  if (age > STATUS_CACHE_TTL_MS) {
    await refreshStatus();
  }
}

async function evaluateTab(tabId, url) {
  if (!url) return;

  await ensureFreshStatus();
  const { session_active } = await chrome.storage.session.get(["session_active"]);
  if (!session_active) return;

  const blockedSites = await getBlockedSites();
  const blocked = isBlocked(url, blockedSites);
  const prev = lastReportedByTab.get(tabId);

  if (!prev || prev.url !== url || prev.blocked !== blocked) {
    try {
      await reportSite(blocked, url);
    } catch (err) {
      console.warn("Focus Tracker: reportSite failed", err.message);
    }
    lastReportedByTab.set(tabId, { url, blocked });
  }

  if (blocked) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ["src/content.js"],
      });
    } catch (err) {
      console.warn(
        "Focus Tracker: executeScript failed for tab " + tabId + ":",
        err.message,
      );
    }
  }
}

function setupAlarm() {
  chrome.alarms.create(POLL_ALARM_NAME, {
    periodInMinutes: POLL_INTERVAL_MINUTES,
  });
}

chrome.runtime.onInstalled.addListener(() => {
  setupAlarm();
  refreshStatus();
});

chrome.runtime.onStartup.addListener(() => {
  setupAlarm();
  refreshStatus();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === POLL_ALARM_NAME) refreshStatus();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    evaluateTab(tabId, tab.url);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  lastReportedByTab.delete(tabId);
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "REFRESH_STATUS") {
    refreshStatus().then(() => sendResponse({ ok: true }));
    return true;
  }
  if (msg?.type === "BACKEND_URL_CHANGED") {
    refreshStatus();
    sendResponse({ ok: true });
    return false;
  }
  return false;
});
