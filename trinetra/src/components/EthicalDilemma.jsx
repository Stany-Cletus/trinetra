import { useState } from "react";

import { LEVEL_DATA } from "../data/levelData";
import { useGame } from "../context/GameContext";

import "./EthicalDilemma.css";

export default function EthicalDilemma({ level, onComplete }) {
  const {
    recordDecision,
    updateWorldState,
    addTelemetry,
  } = useGame();

  const data = LEVEL_DATA[level];

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showPath, setShowPath] = useState(false);

  const handleChoice = (choice) => {
    if (selectedChoice) return;

    setSelectedChoice(choice);

    recordDecision(level, {
      choiceId: choice.id,
      choiceTitle: choice.title,
    });

    updateWorldState(choice.worldState);

    addTelemetry({
      level,
      phase: "ethical_dilemma",
      action: "choice",
      choice: choice.id,
    });
  };

  const handlePath = () => {
    setShowPath(true);

    addTelemetry({
      level,
      phase: "ethical_dilemma",
      action: "path_not_taken_viewed",
      choice: selectedChoice?.id,
    });
  };

  const handleContinue = () => {
    addTelemetry({
      level,
      phase: "ethical_dilemma",
      action: "completed",
      choice: selectedChoice?.id,
    });

    onComplete?.({
      level,
      choice: selectedChoice,
    });
  };

  if (!data) {
    return (
      <div className="dilemma-error">
        Level not found.
      </div>
    );
  }

  return (
    <main className="ethical-dilemma">

      <section className="dilemma-card">

        {/* TOP BAR */}

        <div className="dilemma-topbar">
          <span>
            LEVEL {level}
          </span>

          <span>
            {data.threat}
          </span>
        </div>

        {/* TITLE */}

        <div className="dilemma-heading">

          <span className="dilemma-eyebrow">
            CYBER CHOICE
          </span>

          <h1>
            {data.title}
          </h1>

        </div>

        {/* STORY */}

        {!selectedChoice && (
          <>
            <div className="story-card">

              <p>
                {data.dilemma.situation}
              </p>

            </div>

            <div className="tension-card">

              <span className="tension-icon">
                ⚠
              </span>

              <p>
                {data.dilemma.tension}
              </p>

            </div>

            <h2 className="question">
              {data.dilemma.question}
            </h2>

            {/* TOUCH FRIENDLY BUTTONS */}

            <div className="choices">

              {data.dilemma.choices.map(
                (choice, index) => (
                  <button
                    key={choice.id}
                    className="choice-button"
                    onClick={() =>
                      handleChoice(choice)
                    }
                  >

                    <span className="choice-number">
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <span className="choice-text">

                      <strong>
                        {choice.title}
                      </strong>

                      <span>
                        {choice.text}
                      </span>

                    </span>

                    <span className="choice-arrow">
                      ›
                    </span>

                  </button>
                )
              )}

            </div>
          </>
        )}

        {/* RESULT */}

        {selectedChoice && !showPath && (

          <div className="result">

            <span className="result-label">
              YOUR CHOICE
            </span>

            <h2>
              {selectedChoice.title}
            </h2>

            <div className="consequence">

              <span>
                CONSEQUENCE
              </span>

              <p>
                {selectedChoice.consequence}
              </p>

            </div>

            <button
              className="secondary-button"
              onClick={handlePath}
            >
              WHAT IF I CHOSE DIFFERENTLY?
            </button>

          </div>

        )}

        {/* PATH NOT TAKEN */}

        {selectedChoice && showPath && (

          <div className="result">

            <span className="result-label">
              PATH NOT TAKEN
            </span>

            <h2>
              Another possibility
            </h2>

            <div className="consequence">

              <p>
                {selectedChoice.pathNotTaken}
              </p>

            </div>

            <button
              className="continue-button"
              onClick={handleContinue}
            >
              CONTINUE
            </button>

          </div>

        )}

      </section>

    </main>
  );
}