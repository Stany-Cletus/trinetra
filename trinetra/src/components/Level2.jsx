import { useState, useEffect } from "react";
import Level2Game from "./Level2Game";
import "./Level2.css";

const SUBSTAGE = {
  LANDING: "landing",
  GAME: "game",
  ENDING: "ending",
};

export default function Level2() {
  const [substage, setSubstage] = useState(SUBSTAGE.LANDING);
  const [gameResult, setGameResult] = useState(null);
  const [logoAnimDone, setLogoAnimDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLogoAnimDone(true), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="level2-root">
      <img src="/src/assets/placeholder.png" alt="" className="level2-bg" />
      <div className="level2-overlay" />

      {substage === SUBSTAGE.LANDING && (
        <div className={`l2-logo-wrap ${logoAnimDone ? "logo-topleft" : "logo-center"}`}>
          <img src="/src/assets/Trinetra_logo.png" alt="Trinetra" className="l2-logo-img" />
        </div>
      )}

      {substage === SUBSTAGE.LANDING && logoAnimDone && (
        <div className="l2-landing-content">
          <div className="l2-landing-eyebrow">LEVEL 02</div>
          <h2 className="l2-landing-title">
            GHOST IN<br />THE FEED
          </h2>
          <p className="l2-landing-flavor">"Not every friendly message is a friend."</p>
          <button className="l2-enter-btn" onClick={() => setSubstage(SUBSTAGE.GAME)}>
            <span className="l2-btn-glow" />
            <span className="l2-btn-text">ENTER</span>
            <span className="l2-btn-arrow">▶</span>
          </button>
        </div>
      )}

      {substage === SUBSTAGE.GAME && (
        <Level2Game
          onComplete={(result) => {
            setGameResult(result);
            setSubstage(SUBSTAGE.ENDING);
          }}
        />
      )}

      {substage === SUBSTAGE.ENDING && gameResult && (
        <EndingScreen result={gameResult} />
      )}
    </div>
  );
}

function EndingScreen({ result }) {
  const [visible, setVisible] = useState(false);
  const isSuccess = result.outcome === "success";
  const entries = result.journal || [];

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className={`l2-ending-overlay ${visible ? "l2-ending-visible" : ""}`}>
      <div className={`l2-ending-card ${isSuccess ? "l2-end-success" : "l2-end-fail"}`}>
        <div className="l2-end-topbar" />

        <div className="l2-end-main">
          <div className="l2-end-status-icon">{isSuccess ? "✓" : "✗"}</div>
          <h1 className="l2-end-title">
            {isSuccess ? "MISSION COMPLETE" : "ACCOUNT COMPROMISED"}
          </h1>
          <p className="l2-end-subtitle">
            {isSuccess
              ? "You stayed sharp. Talked to the right person. Walked away clean."
              : "You entered your UPI PIN on a fake page. The transfer was instant and irreversible."}
          </p>

          {entries.length > 0 && (
            <div className="l2-journal-wrap">
              <div className="l2-journal-label">
                <span className="l2-journal-book">📖</span>
                WHAT YOUR JOURNAL RECORDED
              </div>
              <div className="l2-journal-entries">
                {entries.map((e, i) => (
                  <div key={i} className={`l2-je l2-je-${e.type}`}>
                    <div className="l2-je-tag">
                      {e.type === "mistake" ? "⚠ FELL FOR IT" : "✓ CAUGHT IT"}
                    </div>
                    <div className="l2-je-title">{e.title}</div>
                    <div className="l2-je-lesson">{e.lesson}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entries.length === 0 && (
            <p className="l2-end-lesson">
              {isSuccess
                ? "Clean run. No traps triggered. Your UPI PIN stayed yours."
                : "Remember: real payment requests never come through chat messages. UPI PINs are only ever entered in your own banking app — never on a webpage someone links you to."}
            </p>
          )}

          <div className="l2-end-footer">TRINETRA · LEVEL 02 · GHOST IN THE FEED</div>
        </div>
      </div>
    </div>
  );
}
