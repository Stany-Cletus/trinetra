import { useState, useEffect, useRef } from "react";
import "./WifiSequence.css";

const WIFI_NETWORKS = [
  { id: "iitt_free",  ssid: "Free Wifi",         secured: false, signal: 4, note: "Free" },
  { id: "iitt_pass",  ssid: "Encrypted Wifi",         secured: true,  signal: 3, note: "Password protected" },
  { id: "darknet",    ssid: "DarkNet_5G",   secured: true,  signal: 2, note: "Password protected" },
  { id: "shadowlink", ssid: "ShadowLink",   secured: true,  signal: 1, note: "Password protected" },
];

function NarratorBox({ lines, onDone, autoDone }) {
  const [shown, setShown] = useState(0);
  const [typed, setTyped] = useState("");
  const [doneTyping, setDoneTyping] = useState(false);

  useEffect(() => {
    if (shown >= lines.length) {
      setDoneTyping(true);
      if (autoDone) setTimeout(onDone, 600);
      return;
    }
    setTyped("");
    setDoneTyping(false);
    const text = lines[shown];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => setShown(s => s + 1), 600);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [shown]);

  return (
    <div className="narrator-box">
      <div className="narrator-header">
        <span className="narrator-icon">◈</span>
        <span className="narrator-label">SYSTEM NARRATOR</span>
      </div>
      <div className="narrator-text">{typed}<span className="narrator-cursor">█</span></div>
      {doneTyping && !autoDone && (
        <button className="narrator-btn" onClick={onDone}>Continue</button>
      )}
    </div>
  );
}

function WifiSignalIcon({ bars, secured }) {
  return (
    <div className="wsig">
      {[1, 2, 3, 4].map(b => (
        <div key={b} className={`wsig-bar ${b <= bars ? "active" : ""}`} style={{ height: `${b * 4 + 4}px` }} />
      ))}
      {secured && <span className="wsig-lock">🔒</span>}
    </div>
  );
}

export default function WifiSequence({ coins, password, onDone }) {
  const [phase, setPhase] = useState("taskbar"); // taskbar | wifi_panel | connecting | narrate_free | narrate_pass_hint | password_prompt | pay_confirm | narrate_paid | done
  const [selectedNet, setSelectedNet] = useState(null);
  const [wifiPanelOpen, setWifiPanelOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [payStep, setPayStep] = useState(0); // 0,1,2 confirmation steps
  const [connected, setConnected] = useState(null);
  const [narratorLines, setNarratorLines] = useState([]);
  const [narratorDone, setNarratorDone] = useState(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // After taskbar appears, show wifi panel on click
  const handleWifiClick = () => {
    setWifiPanelOpen(v => !v);
  };

  const handleNetworkClick = (net) => {
    setSelectedNet(net);
    setWifiPanelOpen(false);
    if (!net.secured) {
      // Free wifi — connect directly, then narrate
      setPhase("connecting_free");
      setTimeout(() => {
        setConnected(net);
        setPhase("narrate_free");
        setNarratorLines([
          "Connected to Free Wifi...",
          "Network authenticated. Welcome.",
          "...",
          "One moment.",
        ]);
        setNarratorDone(() => () => {
          onDone();
        });
      }, 1800);
    } else {
      // Secured — show password prompt with narrator hint
      setPhase("narrate_pass_hint");
      setNarratorLines([
        `"${net.ssid}" requires a password.`,
        "Hmm... where have you seen a password before?",
        "Think carefully. You collected something along the way...",
        "Those letters you found in the maze — try using them.",
      ]);
      setNarratorDone(() => () => setPhase("password_prompt"));
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput.toUpperCase() === password.toUpperCase()) {
      setPasswordError("");
      setPhase("pay_confirm");
      setPayStep(0);
    } else {
      setPasswordError("Incorrect password. Try again.");
      setPasswordInput("");
    }
  };

  const PAY_CONFIRMS = [
    `Are you sure you want to pay 20 coins to connect? (${coins - 0} coins remaining)`,
    "Other networks don't require payment. Are you really sure?",
    "This is your final chance to reconsider. Proceed with payment?",
    "You may need a lot of money later on. Are you absolutely sure you want to spend 20 coins on this?",
    "Your money will not be refunded. Confirm payment and connect to the network?",

  ];

  const handlePayConfirm = () => {
    if (payStep < 2) {
      setPayStep(p => p + 1);
    } else {
      // Paid all 3 — narrate lesson
      setPhase("narrate_paid");
      setNarratorLines([
        "Payment confirmed. Connecting...",
        "...",
        "Good job.",
        "If you had connected to the Free Wi-Fi, your device details, session tokens, and identity could have been silently harvested.",
        "Evil twin attacks exploit exactly this — a rogue access point masquerading as a trusted network.",
        "Note it in your Journal: always verify before connecting. Free Wi-Fi is rarely truly free.",
        "Proceeding to the next stage.",
      ]);
      setNarratorDone(() => () => onDone());
    }
  };

  const handlePayCancel = () => {
    // Go back to wifi panel
    setSelectedNet(null);
    setPayStep(0);
    setPhase("taskbar");
    setWifiPanelOpen(true);
  };

  const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = time.toLocaleDateString([], { month: "short", day: "numeric" });

  return (
    <div className="wifi-seq-root">
      {/* Fake desktop wallpaper */}
      <img src="/assets/placeholder.png" alt="" className="ws-wallpaper" />
      {/* Placeholder: replace with a dark desktop wallpaper */}
      <div className="ws-wallpaper-tint" />

      {/* Desktop content based on phase */}
      {(phase === "narrate_free" || phase === "narrate_pass_hint" || phase === "narrate_paid") && (
        <div className="ws-narrator-wrap">
          <NarratorBox
            lines={narratorLines}
            onDone={narratorDone}
            autoDone={false}
          />
        </div>
      )}

      {phase === "connecting_free" && (
        <div className="ws-connecting">
          <div className="ws-conn-spinner" />
          <p>Connecting to Free Wifi...</p>
        </div>
      )}

      {phase === "password_prompt" && (
        <div className="ws-password-modal">
          <div className="ws-pass-card" onKeyDown={e => e.stopPropagation()} onKeyUp={e => e.stopPropagation()}>
            <div className="ws-pass-title">Enter Network Password</div>
            <div className="ws-pass-ssid">{selectedNet?.ssid}</div>
            <input
              className="ws-pass-input"
              type="text"
              placeholder="Password"
              value={passwordInput}
              onChange={e => { setPasswordInput(e.target.value); setPasswordError(""); }}
              onKeyDown={e => { e.stopPropagation(); if (e.key === "Enter") handlePasswordSubmit(); }}
              autoFocus
            />
            {passwordError && <div className="ws-pass-error">{passwordError}</div>}
            <div className="ws-pass-actions">
              <button className="ws-pass-cancel" onClick={() => { setPhase("taskbar"); setWifiPanelOpen(true); }}>Cancel</button>
              <button className="ws-pass-submit" onClick={handlePasswordSubmit}>Connect</button>
            </div>
          </div>
        </div>
      )}

      {phase === "pay_confirm" && (
        <div className="ws-pay-modal">
          <div className="ws-pay-card">
            <div className="ws-pay-icon">⬡</div>
            <div className="ws-pay-title">Payment Required</div>
            <p className="ws-pay-desc">{PAY_CONFIRMS[payStep]}</p>
            <div className="ws-pay-amount">20 COINS</div>
            <div className="ws-pay-actions">
              <button className="ws-pay-cancel" onClick={handlePayCancel}>Use Free Wi-Fi Instead</button>
              <button className="ws-pay-confirm" onClick={handlePayConfirm}>
                {payStep < 2 ? "Yes, Pay" : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wi-Fi Panel */}
      {wifiPanelOpen && (
        <div className="ws-wifi-panel">
          <div className="ws-wifi-panel-header">
            <span>Wi-Fi</span>
            <button className="ws-wifi-toggle">ON</button>
          </div>
          <div className="ws-wifi-list">
            {WIFI_NETWORKS.map(net => (
              <div
                key={net.id}
                className="ws-wifi-item"
                onClick={() => handleNetworkClick(net)}
              >
                <WifiSignalIcon bars={net.signal} secured={net.secured} />
                <div className="ws-wifi-info">
                  <span className="ws-wifi-ssid">{net.ssid}</span>
                  <span className="ws-wifi-note">{net.note}</span>
                </div>
                <button className="ws-wifi-connect-btn">Connect</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Windows 11 Taskbar */}
      <div className="ws-taskbar">
        {/* Left — weather */}
        <div className="ws-tb-left">
          <div className="ws-weather">
            <span className="ws-weather-icon">⛅</span>
            <div className="ws-weather-info">
              <span className="ws-weather-temp">28°C</span>
              <span className="ws-weather-loc">Chennai</span>
            </div>
          </div>
        </div>

        {/* Center — Windows button, search, Chrome */}
        <div className="ws-tb-center">
          <button className="ws-win-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="0" y="0" width="7" height="7" fill="#f25022"/>
              <rect x="9" y="0" width="7" height="7" fill="#7fba00"/>
              <rect x="0" y="9" width="7" height="7" fill="#00a4ef"/>
              <rect x="9" y="9" width="7" height="7" fill="#ffb900"/>
            </svg>
          </button>

          <div className="ws-search-bar">
            <span className="ws-search-icon">🔍</span>
            <span className="ws-search-placeholder">Search</span>
          </div>

          {/* Chrome (open/active) */}
          <div className="ws-chrome ws-taskbar-app active">
            <svg width="18" height="18" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#4285f4"/>
              <circle cx="12" cy="12" r="4" fill="white"/>
              <path d="M12 2a10 10 0 0 1 8.66 5H12V2z" fill="#ea4335"/>
              <path d="M3.34 7 7.73 14.5A10 10 0 0 1 2 12H3.34z" fill="#34a853"/>
              <path d="M20.66 7H15.27L11.5 13.5 20.66 7z" fill="#fbbc05"/>
              <path d="M3.34 17 7.73 9.5H2.34A10 10 0 0 0 3.34 17z" fill="#34a853" opacity="0.5"/>
            </svg>
            <div className="ws-app-indicator" />
          </div>
        </div>

        {/* Right — wifi, time */}
        <div className="ws-tb-right">
          <div className="ws-tb-icons">
            {/* Wifi icon */}
            <button className="ws-wifi-icon-btn" onClick={handleWifiClick} title="Wi-Fi">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 18h.01" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M8.5 14.5a5 5 0 0 1 7 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <path d="M5 11a9 9 0 0 1 14 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <path d="M1.5 7.5a14 14 0 0 1 21 0" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              </svg>
            </button>
          </div>

          <div className="ws-clock">
            <span className="ws-time">{timeStr}</span>
            <span className="ws-date">{dateStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 
