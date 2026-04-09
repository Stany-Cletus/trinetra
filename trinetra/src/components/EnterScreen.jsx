import { useState } from "react";
import "./EnterScreen.css";

export default function EnterScreen({ onEnter }) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    setClicked(true);
    setTimeout(onEnter, 900);
  };

  return (
    <div className={`enter-screen ${clicked ? "fade-out" : ""}`}>
      {/* Animated background noise/particles */}
      <div className="enter-bg">
        <div className="blood-vignette" />
        <div className="fog-layer" />
        {[...Array(20)].map((_, i) => (
          <div key={i} className="spark" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }} />
        ))}
      </div>

      <div className="enter-content">
        {/* Trinetra Logo */}
        <div className="logo-wrap">
          <img src="/src/assets/Trinetra_logo.png" alt="Trinetra Logo" className="logo-img" />
          {/* Placeholder: Replace with Trinetra_logo.png */}
          <div className="logo-glow" />
        </div>

        <button
          className={`enter-btn ${clicked ? "btn-dissolve" : ""}`}
          onClick={handleClick}
          disabled={clicked}
        >
          <span className="btn-border top" />
          <span className="btn-border right" />
          <span className="btn-border bottom" />
          <span className="btn-border left" />
          <span className="btn-text">ENTER FULL SCREEN</span>
          <span className="btn-flicker" />
        </button>

        <p className="enter-warning">
          ⚠ &nbsp; Recommended: Headphones &nbsp; | &nbsp; Full Screen Required
        </p>
      </div>
    </div>
  );
}
