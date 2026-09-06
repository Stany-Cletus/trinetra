import { useEffect, useRef, useState } from "react";
import "./VideoPlayer.css";

export default function VideoPlayer({ src, onEnd }) {
  const videoRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const timer = setTimeout(() => setShowSkip(true), 1200);
    video.play().catch(() => setShowSkip(true));
    const handleEnd = () => onEnd();
    const handleError = () => setFailed(true);
    video.addEventListener("ended", handleEnd);
    video.addEventListener("error", handleError);
    return () => { clearTimeout(timer); video.removeEventListener("ended", handleEnd); video.removeEventListener("error", handleError); };
  }, [src, onEnd]);

  return (
    <div className="video-container">
      <video ref={videoRef} src={src} className="video-element" playsInline preload="metadata" controls={false} />
      {(showSkip || failed) && <button className="video-skip-btn" onClick={onEnd}>{failed ? "CONTINUE ▶" : "SKIP VIDEO ▶"}</button>}
    </div>
  );
}
