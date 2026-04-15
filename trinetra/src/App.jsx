import { useState, useEffect, useRef } from "react";
import EnterScreen from "./components/EnterScreen";
import VolumePopup from "./components/VolumePopup";
import VideoPlayer from "./components/VideoPlayer";
import Level1 from "./components/Level1";
import Level2 from "./components/Level2";
import MobileBlock from "./components/MobileBlock";
import FullscreenGuard from "./components/FullscreenGuard";
import "./App.css";

const STAGES = {
  ENTER: "enter",
  VOLUME_POPUP: "volume_popup",
  VIDEO_ENTRY: "video_entry",
  VIDEO_TRANSITION: "video_transition",
  LEVEL1: "level1",
  LEVEL2: "level2",
};

export default function App() {
  const [stage, setStage] = useState(STAGES.ENTER);
  const [isMobile, setIsMobile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenLost, setFullscreenLost] = useState(false);
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
    setStage(STAGES.LEVEL1);
  };

  const handleEntryVideoEnd = () => {
    setStage(STAGES.LEVEL1);
  };

  const handleTransitionVideoEnd = () => {
    setStage(STAGES.LEVEL1);
  };

  // if (isMobile) return <MobileBlock />;

  // if (fullscreenLost && hasEnteredRef.current) {
  //   return (
  //     <FullscreenGuard onReenter={requestFullscreen} />
  //   );
  // }

  return (
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
        <Level1 onComplete={() => setStage(STAGES.LEVEL2)} />
      )}
      {stage === STAGES.LEVEL2 && <Level2 />}
    </div>
  );
}
