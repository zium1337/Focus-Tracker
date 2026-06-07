import { getBackendUrl, getBlockedSites, DEFAULT_BACKEND_URL } from "../lib/config.js";

const statusEl = document.getElementById("status");
const urlInput = document.getElementById("backend-url");
const saveUrlBtn = document.getElementById("save-url");
const sitesTextarea = document.getElementById("blocked-sites");
const saveSitesBtn = document.getElementById("save-sites");

async function loadConfig() {
  urlInput.value = await getBackendUrl();
  const sites = await getBlockedSites();
  sitesTextarea.value = sites.join("\n");
}

function renderStatus(state) {
  if (!state.backend_online) {
    statusEl.textContent = "Backend offline";
    statusEl.className = "status offline";
  } else if (state.session_active) {
    statusEl.textContent = "Sesja aktywna";
    statusEl.className = "status active";
  } else {
    statusEl.textContent = "Sesja nieaktywna";
    statusEl.className = "status inactive";
  }
}

async function refresh() {
  statusEl.textContent = "Odświeżanie...";
  statusEl.className = "status";
  try {
    await chrome.runtime.sendMessage({ type: "REFRESH_STATUS" });
  } catch {
    // ignore
  }
  const state = await chrome.storage.session.get([
    "session_active",
    "backend_online",
  ]);
  renderStatus(state);
}

saveUrlBtn.addEventListener("click", async () => {
  const newUrl = urlInput.value.trim() || DEFAULT_BACKEND_URL;
  await chrome.storage.local.set({ backend_url: newUrl });
  try {
    await chrome.runtime.sendMessage({ type: "BACKEND_URL_CHANGED" });
  } catch {
    // ignore
  }
  await refresh();
});

saveSitesBtn.addEventListener("click", async () => {
  const sites = sitesTextarea.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  await chrome.storage.local.set({ blocked_sites: sites });
  sitesTextarea.value = sites.join("\n");
  saveSitesBtn.textContent = "Zapisano ✓";
  setTimeout(() => {
    saveSitesBtn.textContent = "Zapisz listę";
  }, 1500);
});

loadConfig();
refresh();
