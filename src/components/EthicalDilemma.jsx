import { useEffect, useState } from "react";
import { LEVEL_DATA } from "../data/levelData";
import { useGame } from "../context/GameContext";
import "./EthicalDilemma.css";

export default function EthicalDilemma({ level, onDone }) {
  const data = LEVEL_DATA[level];
  const { language, setLanguage, recordChoice } = useGame();
  const [selected, setSelected] = useState(null);
  const [showPath, setShowPath] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  if (!data) return null;
  const choice = data.choices.find((item) => item.id === selected);
  const alternate = selected ? data.choices.find((item) => item.id !== selected) : null;
  const hi = language === "hi";

  const finish = () => {
    recordChoice({ level, choice: selected, title: choice.title, outcome: choice.outcome });
    onDone?.({ level, choice: selected });
  };

  return (
    <div className={`ethical-overlay ${visible ? "ethical-visible" : ""}`}>
      <div className="ethical-noise" />
      <div className="ethical-card">
        <div className="ethical-topbar">
          <span>TRINETRA // ETHICAL DECISION MODULE</span>
          <button className="ethical-lang" onClick={() => setLanguage(hi ? "en" : "hi")}>
            {hi ? "EN" : "हिन्दी"}
          </button>
        </div>

        <div className="ethical-heading">
          <span className="ethical-level">LEVEL {data.number}</span>
          <h1>{hi ? "अब आपका फैसला" : "NOW MAKE THE DECISION"}</h1>
          <p>{data.concept}</p>
        </div>

        <div className="ethical-situation">
          <div className="ethical-label">◈ SITUATION / परिस्थिति</div>
          <p>{data.situation}</p>
          <strong>{hi ? "आप क्या करेंगे?" : data.prompt}</strong>
        </div>

        {!selected ? (
          <div className="ethical-options">
            {data.choices.map((item, index) => (
              <button key={item.id} className="ethical-option" onClick={() => setSelected(item.id)}>
                <span className="ethical-option-index">0{index + 1}</span>
                <span className="ethical-option-text">{item.title}</span>
                <span className="ethical-arrow">▶</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="ethical-result">
            <div className="ethical-choice-label">YOUR CHOICE</div>
            <h2>{choice.title}</h2>
            <p className="ethical-reason">{choice.reason}</p>
            <div className="ethical-consequence">
              <span>CONSEQUENCE</span>
              <p>{choice.outcome}</p>
            </div>
            <div className="ethical-reflection">
              <span>REFLECTION</span>
              <p>{choice.next}</p>
            </div>
            <button className="ethical-path-btn" onClick={() => setShowPath((v) => !v)}>
              {showPath ? "HIDE PATH NOT TAKEN" : "SHOW PATH NOT TAKEN"}
            </button>
            {showPath && alternate && (
              <div className="ethical-alternate">
                <div>◈ PATH NOT TAKEN</div>
                <strong>{alternate.title}</strong>
                <p>{alternate.outcome}</p>
              </div>
            )}
            <button className="ethical-continue" onClick={finish}>CONTINUE ▶</button>
          </div>
        )}

        <div className="ethical-footer">CYBERSECURITY SKILL → ETHICAL CHOICE → CONSEQUENCE → REFLECTION</div>
      </div>
    </div>
  );
}
