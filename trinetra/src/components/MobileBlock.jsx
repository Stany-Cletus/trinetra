import "./MobileBlock.css";

export default function MobileBlock() {
  return (
    <div className="mobile-block">
      <div className="mb-content">
        <div className="mb-icon">☠</div>
        <h1 className="mb-title">ACCESS DENIED</h1>
        <div className="mb-line" />
        <p className="mb-text">
          This experience requires a<br />
          <strong>laptop or desktop</strong> device.
        </p>
        <p className="mb-sub">Return on a proper machine.</p>
      </div>
    </div>
  );
}
