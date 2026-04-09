import "./FullscreenGuard.css";

export default function FullscreenGuard({ onReenter }) {
  return (
    <div className="fs-guard">
      <div className="fs-noise" />
      <div className="fs-content">
        <div className="fs-glitch-text" data-text="⚠">⚠</div>
        <h2 className="fs-title">FULLSCREEN REQUIRED</h2>
        <div className="fs-divider" />
        <p className="fs-desc">
          You have exited fullscreen.<br />
          The experience cannot continue.
        </p>
        <button className="fs-btn" onClick={onReenter}>
          <span className="fs-btn-text">RETURN TO FULLSCREEN</span>
        </button>
      </div>
    </div>
  );
}
