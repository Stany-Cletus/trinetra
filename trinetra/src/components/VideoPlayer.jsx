import { useEffect, useRef } from "react";
import "./VideoPlayer.css";

export default function VideoPlayer({ src, onEnd }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});

    const handleEnd = () => {
      onEnd();
    };

    video.addEventListener("ended", handleEnd);
    return () => video.removeEventListener("ended", handleEnd);
  }, [src, onEnd]);

  return (
    <div className="video-container">
      <video
        ref={videoRef}
        src={src}
        className="video-element"
        playsInline
        preload="auto"
      />
    </div>
  );
}
