const BACKEND_BASE_URL = "http://127.0.0.1:8000";

export async function startSessionApi(timerMinutes, blockedSites = []) {
  const response = await fetch(`${BACKEND_BASE_URL}/start-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      timer_minutes: timerMinutes,
      blocked_sites: blockedSites,
    }),
  });
  if (!response.ok) throw new Error(`start-session error: ${response.status}`);
  return response.json();
}

export async function stopSessionApi() {
  const response = await fetch(`${BACKEND_BASE_URL}/stop-session`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(`stop-session error: ${response.status}`);
  return response.json();
}

export async function getStatusApi() {
  const response = await fetch(`${BACKEND_BASE_URL}/status`);
  if (!response.ok) throw new Error(`status error: ${response.status}`);
  return response.json();
}
