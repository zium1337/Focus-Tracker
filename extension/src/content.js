const OVERLAY_ID = "focus-tracker-overlay";

const OVERLAY_STYLE = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  .wrap {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.95);
    font-family: "Cascadia Code", "Cascadia Mono", "Consolas", ui-monospace, monospace;
    animation: ftFade 700ms ease forwards;
    --mint-bright: #b6f0c2;
    --text: #cfe8d6;
    --muted: rgba(180, 214, 190, 0.5);
  }

  .grain {
    position: absolute; inset: 0; pointer-events: none; opacity: 0.4; mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .content { position: relative; text-align: center; padding: 2rem; }

  .kaomoji {
    margin-top: 1.7rem; font-size: 30px; color: var(--mint-bright); letter-spacing: 0.05em;
    opacity: 0; animation: ftRise 700ms ease 320ms forwards;
  }

  .desc {
    margin: 1.5rem auto 0; max-width: 460px;
    font-size: 14.5px; line-height: 1.75; color: var(--muted);
    opacity: 0; animation: ftRise 700ms ease 440ms forwards;
  }
  .desc .hl { color: var(--text); }

  @keyframes ftFade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes ftRise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

  @media (prefers-reduced-motion: reduce) {
    .wrap, .kaomoji, .desc { animation-duration: 1ms; }
  }
`;

const OVERLAY_MARKUP = `
  <div class="wrap">
    <div class="grain"></div>
    <div class="content">
      <div class="kaomoji">(╥﹏╥)</div>
      <p class="desc">Strona <span class="hl"></span> jest teraz zablokowana.<br/>Wróć, kiedy zakończysz sesję.</p>
    </div>
  </div>
`;

function createOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  if (!document.documentElement) return;
  const host = document.createElement("div");
  host.id = OVERLAY_ID;
  host.style.cssText =
    "position:fixed!important;inset:0!important;z-index:2147483647!important;" +
    "margin:0!important;border:0!important;display:block!important;";

  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = "<style>" + OVERLAY_STYLE + "</style>" + OVERLAY_MARKUP;

  const hostSlot = shadow.querySelector(".hl");
  if (hostSlot) hostSlot.textContent = location.hostname;

  document.documentElement.appendChild(host);
}

function removeOverlay() {
  const overlay = document.getElementById(OVERLAY_ID);
  if (overlay) overlay.remove();
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "REMOVE_OVERLAY") removeOverlay();
});

createOverlay();
