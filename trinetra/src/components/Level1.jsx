import { useState, useEffect, useRef } from "react";
import Level1Game from "./Level1Game";
import WifiSequence from "./WifiSequence";
import "./Level1.css";

const SUBSTAGE = {
  LANDING: "landing",
  CAPTCHA_INTRO: "captcha_intro",
  GAME: "game",
  BUFFER: "buffer",
  WIFI: "wifi",
  ENDING: "ending",
};

export default function Level1({ onComplete }) {
  const [substage, setSubstage] = useState(SUBSTAGE.LANDING);
  const [logoAnimDone, setLogoAnimDone] = useState(false);
  const [gameCoins, setGameCoins] = useState(0);
  const [collectedLetters, setCollectedLetters] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => setLogoAnimDone(true), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="level1-root">
      <img src="/assets/placeholder.png" alt="" className="level1-bg" />
      {/* Placeholder: replace with your Level 1 background image */}
      <div className="level1-overlay" />

      {/* Logo: only on landing */}
      {substage === SUBSTAGE.LANDING && (
        <div className={`l1-logo-wrap ${logoAnimDone ? "logo-topleft" : "logo-center"}`}>
          <img src="/assets/Trinetra_logo.png" alt="Trinetra" className="l1-logo-img" />
        </div>
      )}

      {/* Landing button */}
      {substage === SUBSTAGE.LANDING && logoAnimDone && (
        <div className="l1-landing-content">
          <button className="l1-enter-btn" onClick={() => setSubstage(SUBSTAGE.CAPTCHA_INTRO)}>
            <span className="l1-btn-glow" />
            <span className="l1-btn-text">ENTER THE WORLD</span>
            <span className="l1-btn-arrow">▶</span>
          </button>
        </div>
      )}

      {substage === SUBSTAGE.CAPTCHA_INTRO && (
        <CaptchaIntro onStart={() => setSubstage(SUBSTAGE.GAME)} />
      )}

      {substage === SUBSTAGE.GAME && (
        <Level1Game
          onComplete={({ coins, letters }) => {
            setGameCoins(coins);
            setCollectedLetters(letters);
            setSubstage(SUBSTAGE.BUFFER);
          }}
          onSkip={() => setSubstage(SUBSTAGE.BUFFER)}
        />
      )}

      {substage === SUBSTAGE.BUFFER && (
        <BufferScreen onDone={() => setSubstage(SUBSTAGE.WIFI)} />
      )}

      {substage === SUBSTAGE.WIFI && (
        <WifiSequence
          coins={gameCoins}
          password={collectedLetters.join("")}
          onDone={() => setSubstage(SUBSTAGE.ENDING)}
        />
      )}

      {substage === SUBSTAGE.ENDING && (
        <EndingScreen onNext={onComplete} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ENDING SCREEN
// Phases: breach → threat (NO path) | erasing → erased → narrator → done (YES path)
// ─────────────────────────────────────────────────────────────────────────────

const NARRATOR_LINES_ERASED = [
  "Data erased. For now.",
  "But here's what you need to understand.",
  "That wasn't a random hacker. That was the network itself.",
  "The moment you connected to free Wi-Fi, you handed over the keys.",
  "Your IP. Your location. Your device fingerprint. All of it — in seconds.",
  "The coins you paid? Think of them as a lesson fee.",
  "A cheap one, compared to what the real world charges.",
  "Now. You're in. You're connected to Datacord.",
  "It's a platform. A community. People talk here.",
  "Go make some friends.",
  "Just... choose them wisely.",
];

const NARRATOR_LINES_THREAT = [
  "Interesting choice.",
  "You think silence protects you?",
  "Your IP has already been logged. Your location triangulated.",
  "We know your device. We know the sites you visit.",
  "We know which tabs you leave open.",
  "Every second you wait, another packet is copied.",
  "Pay the 100 coins. Or don't — and see how deep this goes.",
];

const NARRATOR_LINES_BREACH = [
  "Interesting. You chose the free route.",
  "Your data is already uploaded. Every packet. Every handshake. Your session, your device, your precise location — all of it, sitting on my server.",
  "Pay 100 coins and I'll scrub it clean. Or don't — and see what happens next.",
];

function EndingScreen({ onNext }) {
  const [phase, setPhase] = useState("breach");
  const [visible, setVisible] = useState(false);
  const [userIP, setUserIP] = useState("Fetching...");
  const [location, setLocation] = useState("Locating...");
  const [threatLine, setThreatLine] = useState(0);
  const [narratorLine, setNarratorLine] = useState(0);
  const [breachLine, setBreachLine] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [eraseProgress, setEraseProgress] = useState(0);

  // Fetch real IP + location for immersion
  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then(r => r.json())
      .then(d => setUserIP(d.ip))
      .catch(() => setUserIP("103.21.xx.xx"));

    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => setLocation(`${d.city}, ${d.country_name}`))
      .catch(() => setLocation("Tirupati, India"));

    setTimeout(() => setVisible(true), 400);
  }, []);

  // Typewriter effect for narrator, threat, and breach lines
  useEffect(() => {
    if (phase !== "narrator" && phase !== "threat" && phase !== "breach") return;
    let text = "";
    if (phase === "narrator") text = NARRATOR_LINES_ERASED[narratorLine] || "";
    else if (phase === "threat") text = NARRATOR_LINES_THREAT[threatLine] || "";
    else if (phase === "breach") text = NARRATOR_LINES_BREACH[breachLine] || "";
    setTypedText("");
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setTypedText(text.slice(0, i));
      if (i >= text.length) clearInterval(iv);
    }, 26);
    return () => clearInterval(iv);
  }, [phase, narratorLine, threatLine, breachLine]);

  // Erase progress bar animation
  useEffect(() => {
    if (phase !== "erasing") return;
    setEraseProgress(0);
    const iv = setInterval(() => {
      setEraseProgress(p => {
        if (p >= 100) {
          clearInterval(iv);
          setTimeout(() => setPhase("erased"), 500);
          return 100;
        }
        return p + 1.6;
      });
    }, 35);
    return () => clearInterval(iv);
  }, [phase]);

  const advanceNarrator = () => {
    const next = narratorLine + 1;
    if (next >= NARRATOR_LINES_ERASED.length) setPhase("done");
    else setNarratorLine(next);
  };

  const advanceBreach = () => {
    const next = breachLine + 1;
    if (next >= NARRATOR_LINES_BREACH.length) {
      // All breach lines typed — show the action buttons (handled in render via breachLine)
    } else {
      setBreachLine(next);
    }
  };

  const advanceThreat = () => {
    const next = threatLine + 1;
    if (next >= NARRATOR_LINES_THREAT.length) {
      // Loop back to payment prompt after all threats
      setThreatLine(0);
      setBreachLine(NARRATOR_LINES_BREACH.length - 1); // skip straight to action buttons
      setPhase("breach");
    } else {
      setThreatLine(next);
    }
  };

  if (!visible) return <div className="l1-ending" />;

  // ── BREACH ────────────────────────────────────────────────────────────────
  if (phase === "breach") {
    return (
      <div className="l1-ending l1-ending-visible">
        <div className="l1-breach-layout">

          <div className="l1-breach-left">
            <div className="l1-breach-badge">⚠ SYSTEM BREACH DETECTED</div>
            <h2 className="l1-breach-title">YOUR DATA HAS BEEN HARVESTED</h2>
            <div className="l1-breach-data">
              <DataRow label="IP ADDRESS"  value={userIP}                              blink />
              <DataRow label="NETWORK"     value="Free Wifi — unencrypted"           blink />
              <DataRow label="LOCATION"    value={location}                            blink />
              <DataRow label="PLATFORM"    value={navigator.platform || "Unknown"}           />
              <DataRow label="BROWSER"     value={(navigator.userAgent.split(")")[0].split("(")[1] || "Unknown").slice(0, 40)} />
              <DataRow label="TIMESTAMP"   value={new Date().toLocaleString()}               />
            </div>
            <p className="l1-breach-caption">
              All of this was captured the moment you joined the free network.
              No password required. No warning given. Just open air — and open access.
            </p>
          </div>

          <div className="l1-breach-right">
            <div className="l1-hacker-wrap">
              <img src="/assets/hacker.png" alt="" className="l1-hacker-img" />
              {/* Placeholder: swap background.png for a dedicated hacker/antagonist image */}
              <div className="l1-hacker-scan" />
            </div>

            <div className="l1-breach-narrator">
              <div className="l1-narrator-tag">◈ SYSTEM NARRATOR</div>
              <p className="l1-narrator-typed">
                {typedText}<span className="l1-cursor">█</span>
              </p>

              {/* Show NEXT until all lines done, then show action buttons */}
              {breachLine < NARRATOR_LINES_BREACH.length - 1 ? (
                <button
                  className="l1-action-btn l1-action-continue"
                  onClick={advanceBreach}
                >
                  NEXT ▶
                </button>
              ) : (
                <div className="l1-breach-actions">
                  <button
                    className="l1-action-btn l1-action-no"
                    onClick={() => { setThreatLine(0); setPhase("threat"); }}
                  >
                    REFUSE
                  </button>
                  <button
                    className="l1-action-btn l1-action-yes"
                    onClick={() => setPhase("erasing")}
                  >
                    PAY 100 COINS
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── THREAT ────────────────────────────────────────────────────────────────
  if (phase === "threat") {
    const isLast = threatLine >= NARRATOR_LINES_THREAT.length - 1;
    return (
      <div className="l1-ending l1-ending-visible">
        <div className="l1-threat-layout">
          <div className="l1-threat-glitch" data-text="ACCESS DENIED">ACCESS DENIED</div>
          <div className="l1-threat-box">
            <div className="l1-narrator-tag">◈ SYSTEM NARRATOR</div>
            <p className="l1-threat-typed">
              {typedText}<span className="l1-cursor">█</span>
            </p>
            <button
              className="l1-action-btn l1-action-continue"
              onClick={advanceThreat}
            >
              {isLast ? "...Fine. I'll pay." : "NEXT ▶"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── ERASING ───────────────────────────────────────────────────────────────
  if (phase === "erasing") {
    const steps = [
      { at: 0,  label: "Initiating secure wipe protocol..." },
      { at: 18, label: "Purging IP address logs..." },
      { at: 36, label: "Overwriting location data..." },
      { at: 54, label: "Scrubbing device fingerprint..." },
      { at: 72, label: "Clearing session tokens..." },
      { at: 90, label: "Verifying integrity..." },
      { at: 98, label: "Finalising..." },
    ];
    const step = [...steps].reverse().find(s => eraseProgress >= s.at);
    return (
      <div className="l1-ending l1-ending-visible">
        <div className="l1-erase-layout">
          <div className="l1-erase-icon">🗑</div>
          <h2 className="l1-erase-title">ERASING YOUR DATA</h2>
          <div className="l1-erase-bar-track">
            <div className="l1-erase-bar" style={{ width: `${Math.min(eraseProgress, 100)}%` }} />
          </div>
          <p className="l1-erase-step">{step?.label}</p>
          <p className="l1-erase-pct">{Math.min(Math.round(eraseProgress), 100)}%</p>
        </div>
      </div>
    );
  }

  // ── ERASED ────────────────────────────────────────────────────────────────
  if (phase === "erased") {
    return (
      <div className="l1-ending l1-ending-visible">
        <div className="l1-erased-layout">
          <div className="l1-erased-check">✓</div>
          <h2 className="l1-erased-title">DATA ERASED</h2>
          <p className="l1-erased-subtitle">All harvested records have been purged from the server.</p>
          <div className="l1-erased-rows">
            <ErasedRow label="IP Address"          status="PURGED"    />
            <ErasedRow label="Location"            status="PURGED"    />
            <ErasedRow label="Device Fingerprint"  status="PURGED"    />
            <ErasedRow label="Session Tokens"      status="PURGED"    />
            <ErasedRow label="Browser Metadata"    status="ENCRYPTED" gold />
          </div>
          <p className="l1-erased-note">
            Your trace has been cleared. <em>For now.</em><br />
            Next time, you may not be so lucky — or so well-funded.
          </p>
          <button
            className="l1-action-btn l1-action-continue"
            onClick={() => { setNarratorLine(0); setPhase("narrator"); }}
          >
            CONTINUE ▶
          </button>
        </div>
      </div>
    );
  }

  // ── NARRATOR ──────────────────────────────────────────────────────────────
  if (phase === "narrator") {
    const isLast = narratorLine >= NARRATOR_LINES_ERASED.length - 1;
    return (
      <div className="l1-ending l1-ending-visible">
        <div className="l1-narrator-layout">
          <div className="l1-narrator-ambient" />
          <div className="l1-narrator-card">
            <div className="l1-narrator-tag">◈ SYSTEM NARRATOR</div>
            <p className="l1-narrator-typed">
              {typedText}<span className="l1-cursor">█</span>
            </p>
            <div className="l1-narrator-progress">
              {NARRATOR_LINES_ERASED.map((_, i) => (
                <span key={i} className={`l1-np-dot ${i <= narratorLine ? "active" : ""}`} />
              ))}
            </div>
            <button className="l1-action-btn l1-action-continue" onClick={advanceNarrator}>
              {isLast ? "ENTER DATACORD ▶" : "NEXT ▶"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── DONE: transition into Level 2 ─────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="l1-ending l1-ending-visible">
        <div className="l1-done-layout">
          <img src="/assets/Trinetra_logo.png" alt="Trinetra" className="l1-done-logo" />
          <p className="l1-done-level">LEVEL 01 — COMPLETE</p>
          <h2 className="l1-done-title">WELCOME TO DATACORD</h2>
          <p className="l1-done-sub">
            A network where everyone knows your name.<br />
            And some of them really should not.
          </p>
          <button className="l1-action-btn l1-action-enter" onClick={onNext}>
            BEGIN LEVEL 02 ▶
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DataRow({ label, value, blink }) {
  return (
    <div className={`l1-data-row ${blink ? "l1-data-blink" : ""}`}>
      <span className="l1-data-label">{label}</span>
      <span className="l1-data-value">{value}</span>
    </div>
  );
}

function ErasedRow({ label, status, gold }) {
  return (
    <div className="l1-erased-row">
      <span className="l1-erased-label">{label}</span>
      <span className={`l1-erased-status ${gold ? "gold" : ""}`}>{status}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CAPTCHA INTRO
// ─────────────────────────────────────────────────────────────────────────────
function CaptchaIntro({ onStart }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className={`captcha-overlay ${visible ? "captcha-visible" : ""}`}>
      <div className="captcha-card">
        <div className="captcha-top-bar">
          <div className="captcha-dots">
            <span className="cdot cdot-r" /><span className="cdot cdot-y" /><span className="cdot cdot-g" />
          </div>
          <span className="captcha-titlebar">security.trinetra.sys — identity_verification</span>
        </div>
        <div className="captcha-body">
          <div className="captcha-shield">🔒</div>
          <h2 className="captcha-heading">IDENTITY VERIFICATION</h2>
          <p className="captcha-sub">Solve this captcha to prove you are not an alien entity</p>
          <div className="captcha-divider" />
          <div className="captcha-stats">
            <div className="cstat">
              <span className="cstat-label">PROTOCOL</span>
              <span className="cstat-val">MAZE-7 / TRINETRA-AUTH</span>
            </div>
            <div className="cstat">
              <span className="cstat-label">DIFFICULTY</span>
              <span className="cstat-val danger">EXTREME</span>
            </div>
            <div className="cstat">
              <span className="cstat-label">REWARD</span>
              <span className="cstat-val gold">100 COINS</span>
            </div>
          </div>
          <div className="captcha-warn">
            <span>⚠</span>
            <span>Failure to complete will result in permanent access termination</span>
          </div>
          <button className="captcha-start-btn" onClick={onStart}>
            BEGIN VERIFICATION
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BUFFER SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function BufferScreen({ onDone }) {
  const [phase, setPhase] = useState("buffering");

  useEffect(() => {
    const t = setTimeout(() => setPhase("connect"), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="buffer-screen">
      {phase === "buffering" ? (
        <div className="buffer-inner">
          <div className="buffer-ring"><div className="buffer-ring-inner" /></div>
          <p className="buffer-label">Syncing to network...</p>
          <div className="buffer-dots"><span /><span /><span /></div>
        </div>
      ) : (
        <div className="buffer-connect-inner">
          <div className="wifi-signal-icon">
            <div className="ws-dot" />
            <div className="ws-arc ws-arc1" />
            <div className="ws-arc ws-arc2" />
            <div className="ws-arc ws-arc3" />
          </div>
          <p className="buffer-no-net">No internet connection detected</p>
          <p className="buffer-no-net-sub">You need Wi-Fi to continue your journey</p>
          <button className="buffer-wifi-btn" onClick={onDone}>
            <span>📶</span> Connect to Wi-Fi
          </button>
        </div>
      )}
    </div>
  );
}