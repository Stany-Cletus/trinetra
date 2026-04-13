import { useEffect, useState } from "react";
import "./Level2Game.css";

const PHASES = {
  PHASE1: "phase1",      // Call from "Bank Official" - Vishing
  PHASE2: "phase2",      // Email from "Support Team" - Phishing
  PHASE3: "phase3",      // Scare tactic - Malware alert
  SAFE_REPORT: "report", // Player reports the scam
  COMPROMISED: "fail",   // Player shared PIN
};

export default function Level2Game({ onComplete }) {
  const [phase, setPhase] = useState(PHASES.PHASE1);
  const [timeRemaining, setTimeRemaining] = useState(90); // 90 seconds for phase
  const [stressLevel, setStressLevel] = useState(0); // 0-100
  const [phaseIndex, setPhaseIndex] = useState(1); // 1, 2, or 3

  // Timer logic
  useEffect(() => {
    if (phase === PHASES.COMPROMISED || phase === PHASES.SAFE_REPORT) {
      return; // Stop timer on end
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto-progress to next phase
          handlePhaseComplete("ignored");
          return 90;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Increase stress as time decreases
  useEffect(() => {
    const stressed = Math.floor((1 - timeRemaining / 90) * 100);
    setStressLevel(Math.min(99, stressed));
  }, [timeRemaining]);

  const handlePhaseComplete = (action) => {
    if (action === "sharedPin") {
      // Player revealed PIN - FAIL
      setPhase(PHASES.COMPROMISED);
      setTimeout(() => {
        onComplete("failure");
      }, 2000);
    } else if (action === "reported") {
      // Player reported - SUCCESS
      setPhase(PHASES.SAFE_REPORT);
      setTimeout(() => {
        onComplete("success");
      }, 2000);
    } else if (action === "ignored" || action === "rejected") {
      // Move to next phase
      if (phaseIndex < 3) {
        setPhaseIndex(phaseIndex + 1);
        setTimeRemaining(90);
        setPhase(phaseIndex === 1 ? PHASES.PHASE2 : PHASES.PHASE3);
      } else {
        // All phases survived - automatically report must happen
        handlePhaseComplete("reported");
      }
    }
  };

  return (
    <div className="l2-game-root">
      <div className="l2-game-bg" />
      <div className="l2-game-ui-frame">
        {/* Top status bar */}
        <div className="l2-top-bar">
          <div className="l2-status-left">
            <div className="l2-status-item">
              <span className="l2-label">PHASE</span>
              <span className="l2-value">{phaseIndex}/3</span>
            </div>
            <div className="l2-status-item">
              <span className="l2-label">THREATS</span>
              <span className="l2-value threat-{phaseIndex}">●●{phaseIndex < 3 ? "○" : ""}</span>
            </div>
          </div>

          <div className="l2-timer-display">
            <div className={`l2-timer ${timeRemaining < 20 ? "l2-timer-urgent" : ""}`}>
              {String(timeRemaining).padStart(2, "0")}s
            </div>
          </div>

          <div className="l2-status-right">
            <div className="l2-stress-meter">
              <div className="l2-stress-label">STRESS</div>
              <div className="l2-stress-bar">
                <div
                  className="l2-stress-fill"
                  style={{
                    width: `${stressLevel}%`,
                    background:
                      stressLevel < 33
                        ? "linear-gradient(90deg, #00ff00, #88ff00)"
                        : stressLevel < 66
                        ? "linear-gradient(90deg, #ffaa00, #ff6600)"
                        : "linear-gradient(90deg, #ff4444, #cc0000)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Phone/Message interface */}
        {phase === PHASES.PHASE1 && (
          <Phase1VishingCall onRespond={handlePhaseComplete} stressLevel={stressLevel} />
        )}
        {phase === PHASES.PHASE2 && (
          <Phase2PhishingEmail onRespond={handlePhaseComplete} stressLevel={stressLevel} />
        )}
        {phase === PHASES.PHASE3 && (
          <Phase3ScarePopup onRespond={handlePhaseComplete} stressLevel={stressLevel} />
        )}

        {phase === PHASES.COMPROMISED && (
          <CompromisedScreen />
        )}
        {phase === PHASES.SAFE_REPORT && (
          <SafeReportScreen />
        )}
      </div>

      {/* Scanline effect */}
      <div className="l2-scanlines" />
    </div>
  );
}

function Phase1VishingCall({ onRespond, stressLevel }) {
  const [callActive, setCallActive] = useState(true);
  const [transcript, setTranscript] = useState("");
  const [transcriptIndex, setTranscriptIndex] = useState(0);

  const fullMessage = `Good morning, this is Rajesh Kumar from Bank of India Security Team. We have detected some suspicious transactions on your account and need to verify your identity immediately. I need your UPI PIN to secure your account right now. Can you provide that?`;

  useEffect(() => {
    if (transcriptIndex < fullMessage.length) {
      const timer = setTimeout(() => {
        setTranscript(fullMessage.slice(0, transcriptIndex + 1));
        setTranscriptIndex(transcriptIndex + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [transcriptIndex]);

  return (
    <div className="l2-phase-container">
      <div className="l2-phone-frame">
        <div className="l2-phone-header">
          <span className="l2-phone-time">14:35</span>
          <div className="l2-phone-icons">📶 📡 🔋</div>
        </div>

        <div className="l2-call-interface">
          <div className={`l2-call-status ${callActive ? "l2-call-active" : "l2-call-ended"}`}>
            {callActive ? "INCOMING CALL" : "CALL ENDED"}
          </div>

          <div className="l2-caller-info">
            <div className="l2-caller-avatar">👨‍💼</div>
            <div className="l2-caller-details">
              <div className="l2-caller-name">Bank Security Team</div>
              <div className="l2-caller-number">+91 98765 43210</div>
              {callActive && <div className="l2-caller-status">Connected</div>}
            </div>
          </div>

          <div className="l2-transcript-box">
            <p className="l2-transcript-text">{transcript}</p>
            {transcriptIndex >= fullMessage.length && <span className="l2-cursor">█</span>}
          </div>

          <div className={`l2-stress-indicator ${stressLevel > 60 ? "l2-stress-high" : ""}`}>
            <span>⚠ Pressure detected</span>
          </div>
        </div>

        <div className="l2-call-buttons">
          <button
            className="l2-btn l2-btn-danger"
            onClick={() => {
              setCallActive(false);
              setTimeout(() => onRespond("sharedPin"), 800);
            }}
            title="DO NOT CLICK - This shares your PIN!"
          >
            SHARE PIN
          </button>
          <button
            className="l2-btn l2-btn-warn"
            onClick={() => {
              setCallActive(false);
              onRespond("rejected");
            }}
          >
            HANG UP & VERIFY
          </button>
          <button
            className="l2-btn l2-btn-report"
            onClick={() => {
              setCallActive(false);
              setTimeout(() => onRespond("reported"), 600);
            }}
          >
            REPORT AS SCAM
          </button>
        </div>
      </div>

      <div className="l2-phase-context">
        <h3>Phase 1: VISHING (Voice Phishing)</h3>
        <p>
          An attacker uses a phone call pretending to be a bank official. They create 
          urgency by mentioning suspicious activity and legitimate-sounding security protocol 
          (asking for PIN). Real banks <strong>NEVER ask for PIN over phone</strong>.
        </p>
      </div>
    </div>
  );
}

function Phase2PhishingEmail({ onRespond, stressLevel }) {
  const [emailExpanded, setEmailExpanded] = useState(true);

  return (
    <div className="l2-phase-container">
      <div className="l2-email-frame">
        <div className="l2-email-header">
          <div className="l2-email-from">
            <strong>From:</strong> support@secure-bank-verify.com
          </div>
          <div className="l2-email-subject">
            <strong>Subject:</strong> URGENT: Account Verification Required - Limited Time
          </div>
        </div>

        <div className="l2-email-body">
          <p>Dear Valued Customer,</p>
          <p>
            We have detected unusual activity on your account. To prevent unauthorized access, 
            you must verify your identity within 2 hours.
          </p>

          <div className="l2-email-cta">
            <p style={{ marginBottom: "12px" }}>
              <strong>Click below to verify your account:</strong>
            </p>
            <button className="l2-btn l2-btn-email-link">
              VERIFY ACCOUNT NOW →
            </button>
            <p style={{ fontSize: "12px", marginTop: "8px", color: "#999" }}>
              (This will ask for your UPI PIN)
            </p>
          </div>

          <p style={{ marginTop: "16px" }}>
            We will also call you shortly to confirm your details. Please have your OTP and 
            PIN ready.
          </p>

          <p style={{ marginTop: "16px", fontSize: "12px", color: "#666" }}>
            Bank of India | Protecting Your Finances
          </p>
        </div>

        <div className={`l2-email-warning ${stressLevel > 50 ? "l2-warning-highlight" : ""}`}>
          <span>⚠</span>
          <span>Phishing email detected</span>
        </div>
      </div>

      <div className="l2-phase-context">
        <h3>Phase 2: PHISHING (Email Scam)</h3>
        <p>
          An email impersonating your bank uses urgency and fear to make you verify your identity 
          on a fake website. Banks use official domains (.co.in) and refer you to their app, 
          <strong> never external links</strong>.
        </p>
      </div>

      <div className="l2-action-buttons">
        <button
          className="l2-btn l2-btn-danger"
          onClick={() => {
            setTimeout(() => onRespond("sharedPin"), 1200);
          }}
          title="DO NOT CLICK - This will compromise your account!"
        >
          CLICK VERIFICATION LINK
        </button>
        <button
          className="l2-btn l2-btn-warn"
          onClick={() => onRespond("rejected")}
        >
          DELETE EMAIL
        </button>
        <button
          className="l2-btn l2-btn-report"
          onClick={() => {
            setTimeout(() => onRespond("reported"), 600);
          }}
        >
          REPORT AS PHISHING
        </button>
      </div>
    </div>
  );
}

function Phase3ScarePopup({ onRespond, stressLevel }) {
  return (
    <div className="l2-phase-container">
      <div className="l2-scare-popup">
        <div className="l2-popup-header l2-popup-danger">
          ⚠ CRITICAL SECURITY ALERT
        </div>

        <div className="l2-popup-content">
          <p className="l2-popup-title">MALWARE DETECTED ON YOUR DEVICE</p>

          <div className="l2-popup-message">
            <p>
              🚨 Our security team has detected malicious software attempting to steal your 
              banking credentials.
            </p>
            <p style={{ marginTop: "12px" }}>
              Your account will be permanently locked in <strong>300 seconds</strong> unless 
              you verify immediately.
            </p>
          </div>

          <div className="l2-device-scan-fake">
            <div className="l2-scan-line" />
            <p className="l2-scan-status">Scanning device...</p>
            <div className="l2-scan-threats">
              <div>⚠ Threat 1: BankSteal.exe</div>
              <div>⚠ Threat 2: CredentialHarvester</div>
              <div>⚠ Threat 3: MalwarePIN.dll</div>
            </div>
          </div>

          <div className={`l2-stress-indicator ${stressLevel > 75 ? "l2-stress-critical" : ""}`}>
            <span>🩸 Critical stress response triggered</span>
          </div>
        </div>

        <div className="l2-action-buttons" style={{ marginTop: "16px" }}>
          <button
            className="l2-btn l2-btn-danger l2-btn-large"
            onClick={() => {
              setTimeout(() => onRespond("sharedPin"), 1500);
            }}
            title="DO NOT CLICK - This is a fake alert!"
          >
            VERIFY CREDENTIALS NOW (Click here!)
          </button>
          <button
            className="l2-btn l2-btn-warn"
            onClick={() => onRespond("rejected")}
          >
            CLOSE POPUP
          </button>
          <button
            className="l2-btn l2-btn-report"
            onClick={() => {
              setTimeout(() => onRespond("reported"), 600);
            }}
          >
            REPORT MALWARE
          </button>
        </div>

        <p style={{ fontSize: "12px", marginTop: "12px", color: "#999" }}>
          This popup feels real and urgent. But legitimate banks don't use random popups to ask 
          for credentials.
        </p>
      </div>

      <div className="l2-phase-context">
        <h3>Phase 3: SCAREWARE (Tech Support Scam)</h3>
        <p>
          A fake malware warning creates panic and artificial urgency. Victims are manipulated 
          into "verifying" their credentials to "fix" the fake threat. Real antivirus doesn't 
          <strong> ask for sensitive credentials in popups</strong>.
        </p>
      </div>
    </div>
  );
}

function CompromisedScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className={`l2-outcome-overlay ${visible ? "l2-outcome-visible" : ""}`}>
      <div className="l2-outcome-screen l2-outcome-failure">
        <h1 className="l2-outcome-title">ACCOUNT COMPROMISED</h1>
        <div className="l2-outcome-content">
          <p className="l2-outcome-text">
            You disclosed your UPI PIN. Unauthorized access has been granted.
          </p>
          <div className="l2-outcome-details">
            <div className="l2-detail-line">Fraudulent Transaction: ₹47,500 transferred</div>
            <div className="l2-detail-line">Account Status: LOCKED</div>
            <div className="l2-detail-line">Identity Theft Risk: HIGH</div>
          </div>
          <p className="l2-outcome-lesson">
            You just experienced a real-world UPI scam. Real victims face similar consequences 
            within seconds of revealing their PIN.
          </p>
        </div>
      </div>
    </div>
  );
}

function SafeReportScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className={`l2-outcome-overlay ${visible ? "l2-outcome-visible" : ""}`}>
      <div className="l2-outcome-screen l2-outcome-success">
        <h1 className="l2-outcome-title">SCAM REPORTED & BLOCKED</h1>
        <div className="l2-outcome-content">
          <p className="l2-outcome-text">
            You successfully identified and reported the scam. Your account remains secure.
          </p>
          <div className="l2-outcome-details">
            <div className="l2-detail-line">✓ Fraudulent transactions: 0</div>
            <div className="l2-detail-line">✓ Account Status: SECURE</div>
            <div className="l2-detail-line">✓ Funds Protected: ₹100% Safe</div>
          </div>
          <p className="l2-outcome-lesson">
            By recognizing the manipulation tactics and reporting the scam, you protected 
            yourself as real-world victims should.
          </p>
        </div>
      </div>
    </div>
  );
}
