import { createContext, useContext, useMemo, useState } from "react";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [language, setLanguage] = useState("en");
  const [choices, setChoices] = useState([]);

  const recordChoice = (entry) => {
    setChoices((prev) => [...prev, { ...entry, at: Date.now() }]);
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    choices,
    recordChoice,
  }), [language, choices]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const value = useContext(GameContext);
  if (!value) throw new Error("useGame must be used inside GameProvider");
  return value;
}
