// src/components/TwoPlayerRound.jsx
import React, { useState, useMemo } from "react";

function TwoPlayerRound({ goTo, gameState }) {
  const players = gameState?.players || [];
  const settings = gameState?.settings || {};
  const mode = settings.mode || "multiPlayer";
  const numPlayers = settings.numPlayers || players.length || 0;

  const twoPlayerChoices = Array.isArray(gameState?.twoPlayerChoices)
    ? gameState.twoPlayerChoices
    : [];

  // Basic sanity checks
  if (mode !== "twoPlayer" || numPlayers !== 2 || players.length !== 2) {
    return (
      <div className="screen screen-loyalty">
        <h1 className="title">2-Player Round</h1>
        <div className="card">
          <p className="text">
            The current game state does not look like a 2-player trust game.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() => goTo("setup", {})}
          >
            Back to start
          </button>
        </div>
      </div>
    );
  }

  // Determine which player still needs to act this round
  const pendingPlayer = useMemo(() => {
    return players.find(
      (p) => !twoPlayerChoices.some((c) => c.playerId === p.id)
    );
  }, [players, twoPlayerChoices]);

  const [choice, setChoice] = useState(null); // "loyal" or "betray"
  const [prediction, setPrediction] = useState(null); // "loyal" or "betray"
  const [error, setError] = useState("");

  if (!pendingPlayer) {
    // Both players have already made their decisions; move to reveal.
    goTo("twoPlayerReveal", {
      twoPlayerChoices,
      lastPhase: "twoPlayerRound",
    });
    return null;
  }

  const handleConfirm = () => {
    if (!choice) {
      setError("Please select Loyalty or Betrayal.");
      return;
    }

    if (choice === "loyal" && !prediction) {
      setError("Please select a prediction for your opponent.");
      return;
    }

    const existingChoices = Array.isArray(twoPlayerChoices)
      ? twoPlayerChoices
      : [];

    const updatedChoices = [
      ...existingChoices.filter((c) => c.playerId !== pendingPlayer.id),
      {
        playerId: pendingPlayer.id,
        choice, // "loyal" or "betray"
        prediction: choice === "loyal" ? prediction : null, // only loyal players predict
      },
    ];

    // Check if the other player still needs to choose
    const stillPending = players.find(
      (p) => !updatedChoices.some((c) => c.playerId === p.id)
    );

    if (stillPending) {
      // Another player must now make their decision
      const nextIndex = players.findIndex((p) => p.id === stillPending.id);
      goTo("pass", {
        twoPlayerChoices: updatedChoices,
        currentPlayerIndex: nextIndex,
        lastPhase: "twoPlayerRound",
      });
    } else {
      // Both decisions are in → go to 2-player outcome reveal
      goTo("twoPlayerReveal", {
        twoPlayerChoices: updatedChoices,
        lastPhase: "twoPlayerRound",
      });
    }
  };

  return (
    <div className="screen screen-loyalty">
      <h1 className="title">Loyalty, Betrayal & Prediction</h1>

      <div className="card">
        <p className="text">
          {pendingPlayer.name}, choose your move and (if you stay loyal) predict
          your opponent&apos;s action.
        </p>

        <div className="button-column">
          <button
            type="button"
            className={`choice-button ${
              choice === "loyal" ? "choice-button-active" : ""
            }`}
            onClick={() => {
              setChoice("loyal");
              setPrediction(null);
              setError("");
            }}
          >
            Loyalty
          </button>
          <button
            type="button"
            className={`choice-button ${
              choice === "betray" ? "choice-button-active" : ""
            }`}
            onClick={() => {
              setChoice("betray");
              setPrediction(null);
              setError("");
            }}
          >
            Betrayal
          </button>
        </div>

        {choice === "loyal" && (
          <>
            <p className="text" style={{ marginTop: "1rem" }}>
              If you stay loyal, you must predict what your opponent will do:
            </p>
            <div className="button-column">
              <button
                type="button"
                className={`choice-button ${
                  prediction === "loyal" ? "choice-button-active" : ""
                }`}
                onClick={() => {
                  setPrediction("loyal");
                  setError("");
                }}
              >
                They will stay Loyal
              </button>
              <button
                type="button"
                className={`choice-button ${
                  prediction === "betray" ? "choice-button-active" : ""
                }`}
                onClick={() => {
                  setPrediction("betray");
                  setError("");
                }}
              >
                They will Betray
              </button>
            </div>
          </>
        )}

        {error && <p className="error-text">{error}</p>}

        <button
          type="button"
          className="primary-button"
          onClick={handleConfirm}
        >
          Confirm choice
        </button>
      </div>
    </div>
  );
}

export default TwoPlayerRound;
