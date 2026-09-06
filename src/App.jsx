import { useState, useEffect, useRef } from "react";
import EnterScreen from "./components/EnterScreen";
import VolumePopup from "./components/VolumePopup";
import VideoPlayer from "./components/VideoPlayer";
import Level1 from "./components/Level1";
import Level2 from "./components/Level2";
import ScenarioLevel from "./components/ScenarioLevel";
import { GameProvider } from "./context/GameContext";
import "./App.css";

const STAGES = {
  ENTER: "enter",
  VOLUME_POPUP: "volume_popup",
  VIDEO_ENTRY: "video_entry",
  VIDEO_TRANSITION: "video_transition",
  LEVEL1: "level1",
  LEVEL2: "level2",
  LEVEL3: "level3",
  LEVEL4: "level4",
  LEVEL5: "level5",
  FINAL: "final",
};

export default function App() {
  const [stage, setStage] = useState(STAGES.ENTER);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenLost, setFullscreenLost] = useState(false);
  const [gameRunKey, setGameRunKey] = useState(0);
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
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // useEffect(() => {
  //   const handleFSChange = () => {
  //     const fs = !!document.fullscreenElement;
  //     setIsFullscreen(fs);
  //     if (!fs && hasEnteredRef.current) {
  //       setFullscreenLost(true);
  //     }
  //   };
  //   document.addEventListener("fullscreenchange", handleFSChange);
  //   return () => document.removeEventListener("fullscreenchange", handleFSChange);
  // }, []);

  const requestFullscreen = () => {
    document.documentElement.requestFullscreen().then(() => {
      setIsFullscreen(true);
      setFullscreenLost(false);
      hasEnteredRef.current = true;
    });
  };

  // const handleEnterFullscreen = () => {
  //   requestFullscreen();
  //   setTimeout(() => setStage(STAGES.VOLUME_POPUP), 600);
  // };
  const handleEnterFullscreen = async () => {
      let entered = false;

      try {
        await document.documentElement.requestFullscreen();
        entered = true;
      } catch (e) {
        entered = false;
      }

      // wait 1 second max
      setTimeout(() => {
        setStage(STAGES.VOLUME_POPUP);
      }, entered ? 600 : 1000);
    };

  const handleVolumeEnter = () => {
    setStage(STAGES.VIDEO_ENTRY);
  };

  const handleEntryVideoEnd = () => {
    setStage(STAGES.VIDEO_TRANSITION);
  };

  const handleTransitionVideoEnd = () => {
    setStage(STAGES.LEVEL1);
  };

  const restartTrinetra = () => {
    // Re-mount the game provider so all progress/choices are cleared too.
    setGameRunKey(k => k + 1);
    setStage(STAGES.ENTER);
  };

  // if (isMobile) return <MobileBlock />;

  // if (fullscreenLost && hasEnteredRef.current) {
  //   return (
  //     <FullscreenGuard onReenter={requestFullscreen} />
  //   );
  // }

  return (
    <GameProvider key={gameRunKey}>
      <div className="app-root" >
      {stage === STAGES.ENTER && (
        <EnterScreen onEnter={handleEnterFullscreen} />
      )}
      {stage === STAGES.VOLUME_POPUP && (
        <VolumePopup onEnter={handleVolumeEnter} />
      )}
      {stage === STAGES.VIDEO_ENTRY && (
        <VideoPlayer
          src="/assets/Entry.mp4"
          onEnd={handleEntryVideoEnd}
        />
      )}
      {stage === STAGES.VIDEO_TRANSITION && (
        <VideoPlayer
          src="/assets/Trinetra.mp4"
          onEnd={handleTransitionVideoEnd}
        />
      )}
      {stage === STAGES.LEVEL1 && (
        <Level1 onComplete={() => setStage(STAGES.LEVEL2)} onRestart={restartTrinetra} />
      )}
      {stage === STAGES.LEVEL2 && <Level2 onComplete={() => setStage(STAGES.LEVEL3)} />}
      {stage === STAGES.LEVEL3 && <ScenarioLevel level={3} onComplete={() => setStage(STAGES.LEVEL4)} />}
      {stage === STAGES.LEVEL4 && <ScenarioLevel level={4} onComplete={() => setStage(STAGES.LEVEL5)} />}
      {stage === STAGES.LEVEL5 && <ScenarioLevel level={5} onComplete={() => setStage(STAGES.FINAL)} />}
      {stage === STAGES.FINAL && <FinalScreen />}
      </div>
    </GameProvider>
  );
}

function FinalScreen() {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t); }, []);
  return (
    <div className={`l2-ending-overlay l2-ending-visible ${show ? "" : ""}`}>
      <div className="l2-ending-card l2-end-success">
        <div className="l2-end-topbar" />
        <div className="l2-end-main">
          <div className="l2-end-status-icon">✓</div>
          <h1 className="l2-end-title">TRINETRA COMPLETE</h1>
          <p className="l2-end-subtitle">You practised cybersecurity skills, made decisions in realistic situations, and saw how those choices can affect other people.</p>
          <p className="l2-end-lesson">Remember: verify before you trust, ask before you share, protect credentials, check media before forwarding, and collect only the data you need.</p>
        </div>
      </div>
    </div>
  );
}
