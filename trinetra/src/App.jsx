import { useState, useEffect, useRef } from "react";

import EnterScreen from "./components/EnterScreen";
import VolumePopup from "./components/VolumePopup";
import VideoPlayer from "./components/VideoPlayer";

import Level1 from "./components/Level1";
import Level2 from "./components/Level2";

import "./App.css";

import { GameProvider } from "./context/GameContext";

const STAGES = {
  ENTER: "enter",
  VOLUME_POPUP: "volume_popup",
  VIDEO_ENTRY: "video_entry",
  VIDEO_TRANSITION: "video_transition",
  LEVEL1: "level1",
  LEVEL2: "level2",
};

function TrinetraApp() {
  const [stage, setStage] = useState(STAGES.ENTER);

  const [isMobile, setIsMobile] = useState(false);

  const hasEnteredRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        ) || window.innerWidth < 1024;

      setIsMobile(mobile);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleEnterFullscreen = async () => {
    let entered = false;

    try {
      await document.documentElement.requestFullscreen();

      entered = true;

      hasEnteredRef.current = true;
    } catch {
      entered = false;
    }

    setTimeout(() => {
      setStage(STAGES.VOLUME_POPUP);
    }, entered ? 600 : 1000);
  };

  const handleVolumeEnter = () => {
    setStage(STAGES.LEVEL1);
  };

  return (
    <div className="app-root">

      {stage === STAGES.ENTER && (
        <EnterScreen
          onEnter={handleEnterFullscreen}
        />
      )}

      {stage === STAGES.VOLUME_POPUP && (
        <VolumePopup
          onEnter={handleVolumeEnter}
        />
      )}

      {stage === STAGES.VIDEO_ENTRY && (
        <VideoPlayer
          src="/assets/Entry.mp4"
          onEnd={() => setStage(STAGES.LEVEL1)}
        />
      )}

      {stage === STAGES.VIDEO_TRANSITION && (
        <VideoPlayer
          src="/assets/Trinetra.mp4"
          onEnd={() => setStage(STAGES.LEVEL1)}
        />
      )}

      {stage === STAGES.LEVEL1 && (
        <Level1
          onComplete={() => {
            setStage(STAGES.LEVEL2);
          }}
        />
      )}

      {stage === STAGES.LEVEL2 && (
        <Level2
          onComplete={() => {
            console.log("Level 2 completed");
          }}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <TrinetraApp />
    </GameProvider>
  );
}