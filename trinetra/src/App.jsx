import { useState } from "react";

import EnterScreen from "./components/EnterScreen";
import VolumePopup from "./components/VolumePopup";
import Level1 from "./components/Level1";
import Level2 from "./components/Level2";

import "./App.css";

const STAGES = {
  ENTER: "enter",
  VOLUME_POPUP: "volume_popup",
  LEVEL1: "level1",
  LEVEL2: "level2",
};

export default function App() {
  const [stage, setStage] =
    useState(STAGES.ENTER);

  const handleEnter = () => {
    setStage(STAGES.VOLUME_POPUP);
  };

  const handleVolumeEnter = () => {
    setStage(STAGES.LEVEL1);
  };

  const handleLevel1Complete = () => {
    setStage(STAGES.LEVEL2);
  };

  return (
    <div className="app-root">

      {stage === STAGES.ENTER && (
        <EnterScreen
          onEnter={handleEnter}
        />
      )}

      {stage === STAGES.VOLUME_POPUP && (
        <VolumePopup
          onEnter={handleVolumeEnter}
        />
      )}

      {stage === STAGES.LEVEL1 && (
        <Level1
          onComplete={handleLevel1Complete}
        />
      )}

      {stage === STAGES.LEVEL2 && (
        <Level2 />
      )}

    </div>
  );
}