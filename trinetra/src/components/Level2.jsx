import { useState, useEffect } from "react";
import Level2Game from "./Level2Game";
import "./Level2.css";

const SUBSTAGE = {
  LANDING: "landing",
  BRIEFING: "briefing",
  GAME: "game",
  ENDING: "ending",
};

export default function Level2() {
  const [substage, setSubstage] = useState(SUBSTAGE.LANDING);
  const [gameResult, setGameResult] = useState(null); // "success" or "failure"
  const [logoAnimDone, setLogoAnimDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLogoAnimDone(true), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="level2-root">
      <img src="/src/assets/placeholder.png" alt="" className="level2-bg" />
      <div className="level2-overlay" />

      {/* Logo animation */}
      {substage === SUBSTAGE.LANDING && (
        <div className={`l2-logo-wrap ${logoAnimDone ? "logo-topleft" : "logo-center"}`}>
          <img src="/src/assets/Trinetra_logo.png" alt="Trinetra" className="l2-logo-img" />
        </div>
      )}

      {/* Landing buttons */}
      {substage === SUBSTAGE.LANDING && logoAnimDone && (
        <div className="l2-landing-content">
          <button className="l2-enter-btn" onClick={() => setSubstage(SUBSTAGE.BRIEFING)}>
            <span className="l2-btn-glow" />
            <span className="l2-btn-text">ENTER LEVEL 2</span>
            <span className="l2-btn-arrow">▶</span>
          </button>
        </div>
      )}

      {/* Briefing / Tutorial */}
      {substage === SUBSTAGE.BRIEFING && (
        <BriefingScreen onStart={() => setSubstage(SUBSTAGE.GAME)} />
      )}

      {/* Main game */}
      {substage === SUBSTAGE.GAME && (
        <Level2Game
          onComplete={(result) => {
            setGameResult(result);
            setSubstage(SUBSTAGE.ENDING);
          }}
        />
      )}

      {/* Ending screen */}
      {substage === SUBSTAGE.ENDING && gameResult && (
        <EndingScreen result={gameResult} />
      )}
    </div>
  );
}

function BriefingScreen({ onStart }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`l2-briefing-overlay ${visible ? "l2-briefing-visible" : ""}`}>
      <div className="l2-briefing-card">
        <div className="l2-briefing-top-bar">
          <div className="l2-briefing-dots">
            <span className="l2-bdot l2-bdot-r" />
            <span className="l2-bdot l2-bdot-y" />
            <span className="l2-bdot l2-bdot-g" />
          </div>
          <span className="l2-briefing-title">security.trinetra.sys — threat_simulation</span>
        </div>

        <div className="l2-briefing-body">
          <div className="l2-briefing-icon">⚠️</div>
          <h2 className="l2-briefing-heading">UPI PIN SECURITY THREAT</h2>
          
          <div className="l2-briefing-content">
            <p className="l2-briefing-sub">
              You are about to receive a simulated attack from a sophisticated scammer.
            </p>
            
            <div className="l2-briefing-section">
              <h3>THE THREAT</h3>
              <p>
                Criminals use psychological manipulation tactics to extract your UPI PIN. 
                They may pose as bank officials, customer service representatives, or use 
                fake emergencies to pressure you into revealing this sensitive information.
              </p>
            </div>

            <div className="l2-briefing-section">
              <h3>YOUR MISSION</h3>
              <p>
                The attacker will attempt multiple social engineering tactics to get your PIN. 
                Your job is to <strong>RESIST and REPORT</strong> the scam.
              </p>
              <p style={{ marginTop: "8px", color: "#ff6666" }}>
                <strong>Remember: Never share your OTP, CVV, or PIN with ANYONE.</strong>
              </p>
            </div>

            <div className="l2-briefing-section">
              <h3>WINNING CONDITIONS</h3>
              <ul className="l2-briefing-list">
                <li>✓ Resist all 3 manipulation attempts</li>
                <li>✓ Report the scam to authorities</li>
                <li>✓ Your account remains secure</li>
              </ul>
            </div>

            <div className="l2-briefing-danger">
              <span>⚠</span>
              <span>If you share your PIN in any attempt, your account will be compromised and you will FAIL this level.</span>
            </div>
          </div>

          <button className="l2-briefing-start-btn" onClick={onStart}>
            START THREAT SIMULATION
          </button>
        </div>
      </div>
    </div>
  );
}

function EndingScreen({ result }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const isSuccess = result === "success";

  return (
    <div className={`l2-ending-overlay ${visible ? "l2-ending-visible" : ""}`}>
      <div className={`l2-ending-card ${isSuccess ? "l2-ending-success" : "l2-ending-failure"}`}>
        <div className="l2-ending-icon">
          {isSuccess ? "✓" : "✗"}
        </div>

        <h1 className="l2-ending-title">
          {isSuccess ? "SECURITY AWARENESS ACHIEVED" : "ACCOUNT COMPROMISED"}
        </h1>

        <div className="l2-ending-content">
          {isSuccess ? (
            <>
              <p className="l2-ending-text">
                You successfully resisted all social engineering attempts and protected your UPI PIN.
              </p>
              
              <div className="l2-ending-stats">
                <div className="l2-stat">
                  <span className="l2-stat-label">Account Status:</span>
                  <span className="l2-stat-value success">SECURE</span>
                </div>
                <div className="l2-stat">
                  <span className="l2-stat-label">Fund Status:</span>
                  <span className="l2-stat-value success">PROTECTED</span>
                </div>
                <div className="l2-stat">
                  <span className="l2-stat-label">Lesson:</span>
                  <span className="l2-stat-value">Critical thinking saved you</span>
                </div>
              </div>

              <div className="l2-ending-message">
                <p>
                  You demonstrated that you understand one of the most critical rules of digital security: 
                  <strong> Your PIN is yours alone</strong>. No legitimate institution will ever ask for it.
                </p>
                <p style={{ marginTop: "12px" }}>
                  Real-world UPI scammers use urgency, authority, and empathy to manipulate victims. 
                  You resisted these tactics by staying calm and verifying information.
                </p>
              </div>
            </>
          ) : (
            <>
              <p className="l2-ending-text">
                You revealed your UPI PIN to the attacker. Your account has been compromised.
              </p>
              
              <div className="l2-ending-stats">
                <div className="l2-stat">
                  <span className="l2-stat-label">Account Status:</span>
                  <span className="l2-stat-value failure">COMPROMISED</span>
                </div>
                <div className="l2-stat">
                  <span className="l2-stat-label">Funds Transferred:</span>
                  <span className="l2-stat-value failure">₹47,500</span>
                </div>
                <div className="l2-stat">
                  <span className="l2-stat-label">Identity Theft Risk:</span>
                  <span className="l2-stat-value failure">CRITICAL</span>
                </div>
              </div>

              <div className="l2-ending-message">
                <p>
                  By sharing your UPI PIN, attackers gained full access to your account and transferred your funds 
                  before you could react. This is how <strong>94% of victims</strong> lose money to UPI scams.
                </p>
                <p style={{ marginTop: "12px" }}>
                  The attacker exploited psychological pressure and false authority to manipulate you. 
                  In the real world, this results in severe financial and emotional damage.
                </p>
                <p style={{ marginTop: "12px;", color: "#ff6666" }}>
                  <strong>Remember for next time: Your PIN is like your house key. Never give it to anyone, ever.</strong>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="l2-ending-footer">
          <p className="l2-ending-footer-text">
            {isSuccess 
              ? "LEVEL 2 COMPLETE — You are ready to move forward."
              : "LEVEL 2 FAILED — Try again to pass this security test."}
          </p>
        </div>
      </div>
    </div>
  );
}
