import { useState } from "react";
import "./VolumePopup.css";

export default function VolumePopup({ onEnter }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 700);
  };

  return (
    <div className={`popup-overlay ${exiting ? "overlay-out" : ""}`}>
      {/* Background image — replace placeholder.png with your desired popup bg */}
      <img src="/src/assets/placeholder.png" alt="" className="popup-bg-img" />
      <div className="popup-bg-tint" />

      <div className={`popup-card ${exiting ? "card-out" : ""}`}>
        <div className="popup-top-border" />

        <div className="popup-icon">
          <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 22H18L30 10V50L18 38H10V22Z" fill="#8b0000" stroke="#cc0000" strokeWidth="1.5"/>
            <path d="M36 18C39 21 41 25 41 30C41 35 39 39 36 42" stroke="#cc0000" strokeWidth="2" strokeLinecap="round"/>
            <path d="M42 12C47 17 50 23 50 30C50 37 47 43 42 48" stroke="#cc0000" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
          </svg>
        </div>

        <h2 className="popup-title">BEFORE YOU ENTER</h2>

        <div className="popup-divider" />

        <div className="popup-messages">
          <div className="popup-line">
            <span className="line-icon">◈</span>
            <span>Turn your volume to <strong>maximum</strong></span>
          </div>
          <div className="popup-line">
            <span className="line-icon">◈</span>
            <span>Headphones <strong>strongly recommended</strong></span>
          </div>
          <div className="popup-line">
            <span className="line-icon">◈</span>
            <span>Immersive audio throughout the experience</span>
          </div>
        </div>

        <div className="popup-divider" />

        <p className="popup-sub">The experience begins the moment you enter.</p>

        <button className="popup-enter-btn" onClick={handleEnter}>
          <span className="peb-bg" />
          <span className="peb-text">ENTER</span>
        </button>

        <div className="popup-bottom-border" />
      </div>
    </div>
  );
}
