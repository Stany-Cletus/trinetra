import { useState, useEffect } from "react";
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
      <img src="/src/assets/placeholder.png" alt="" className="level1-bg" />
      {/* Placeholder: replace with your Level 1 background image */}
      <div className="level1-overlay" />

      {/* Logo always rendered, transitions position */}
      {substage === SUBSTAGE.LANDING && (
        <div className={`l1-logo-wrap ${logoAnimDone ? "logo-topleft" : "logo-center"}`}>
          <img src="/src/assets/Trinetra_logo.png" alt="Trinetra" className="l1-logo-img" />
          {/* Placeholder: replace with Trinetra_logo.png */}
        </div>
      )}

      {/* Landing buttons */}
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

function EndingScreen({ onNext }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`l1-ending ${visible ? "l1-ending-visible" : ""}`}>
      <div className="l1-ending-inner">
        <p className="l1-ending-text">LEVEL 1 COMPLETE</p>
        <p className="l1-ending-sub">Preparing next threat...</p>
        <div className="l1-ending-spinner"></div>
        {onNext && (
          <button className="l1-ending-next-btn" onClick={onNext}>
            CONTINUE TO LEVEL 2 →
          </button>
        )}
      </div>
    </div>
  );
}

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

function BufferScreen({ onDone }) {
  const [phase, setPhase] = useState("buffering"); // buffering | connect

  useEffect(() => {
    const t = setTimeout(() => setPhase("connect"), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="buffer-screen">
      {phase === "buffering" ? (
        <div className="buffer-inner">
          <div className="buffer-ring">
            <div className="buffer-ring-inner" />
          </div>
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
