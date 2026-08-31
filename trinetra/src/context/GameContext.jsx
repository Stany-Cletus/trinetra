import { createContext, useContext, useMemo, useState } from "react";

const GameContext = createContext(null);

const initialState = {
  currentLevel: 1,

  decisions: {},

  skillResults: {},

  worldState: {
    wifiRisk: false,
    photoShared: false,
    paymentCredentialShared: false,
    deepfakeForwarded: false,
    dataLeakReported: false,

    friendTrust: true,
    reputationProtected: true,
  },

  telemetry: [],
};

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(initialState);

  const recordDecision = (level, decision) => {
    setGameState((prev) => ({
      ...prev,

      decisions: {
        ...prev.decisions,
        [level]: decision,
      },
    }));
  };

  const recordSkillResult = (level, result) => {
    setGameState((prev) => ({
      ...prev,

      skillResults: {
        ...prev.skillResults,
        [level]: result,
      },
    }));
  };

  const updateWorldState = (changes) => {
    setGameState((prev) => ({
      ...prev,

      worldState: {
        ...prev.worldState,
        ...changes,
      },
    }));
  };

  const addTelemetry = (event) => {
    setGameState((prev) => ({
      ...prev,

      telemetry: [
        ...prev.telemetry,
        {
          ...event,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  };

  const setCurrentLevel = (level) => {
    setGameState((prev) => ({
      ...prev,
      currentLevel: level,
    }));
  };

  const resetGame = () => {
    setGameState(initialState);
  };

  const value = useMemo(
    () => ({
      gameState,
      recordDecision,
      recordSkillResult,
      updateWorldState,
      addTelemetry,
      setCurrentLevel,
      resetGame,
    }),
    [gameState]
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);

  if (!context) {
    throw new Error("useGame must be used inside GameProvider");
  }

  return context;
}