// src/components/WinnerScreen.jsx
import React from "react";

function WinnerScreen({ goTo, gameState }) {
  const players = gameState?.players || [];
  const winnerIds = Array.isArray(gameState?.winners)
    ? gameState.winners
    : [];

  const winners = winnerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean);

  const loyaltyResult = gameState?.loyaltyResult || null;
  const randomOutcome = gameState?.randomOutcome || null;

  const handleViewLog = () => {
    goTo("log", {});
  };

  const handlePlayAgain = () => {
    goTo("setup", {});
  };

  if (!winners.length) {
    return (
      <div className="screen screen-winner">
        <h1 className="title">Game Over</h1>
        <div className="card">
          <p className="text">
            No winner could be determined from the current game state.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={handlePlayAgain}
          >
            Back to start
          </button>
        </div>
      </div>
    );
  }

  // Optional label if we know which loyalty stage this summary came from
  const loyaltyStageLabel = (() => {
    if (!loyaltyResult || typeof loyaltyResult.stage !== "number") return null;
    if (loyaltyResult.stage === 1) return "Final round (alliance finalists):";
    if (loyaltyResult.stage === 2) return "Final round (returning players):";
    return "Final round summary:";
  })();

  return (
    <div className="screen screen-winner">
      <h1 className="title">Winner{winners.length > 1 ? "s" : ""}</h1>

      <div className="card">
        <ul className="list">
          {winners.map((w) => (
            <li key={w.id} className="list-item">
              {w.name}
            </li>
          ))}
        </ul>

        {loyaltyResult && (
          <>
            <p className="text">
              {loyaltyStageLabel || "Final round summary:"}
            </p>
            <p className="text small">{loyaltyResult.description}</p>
          </>
        )}

        {randomOutcome && (
          <>
            <p className="text">Outcome summary:</p>
            <p className="text small">{randomOutcome.description}</p>
          </>
        )}

        <div className="button-row">
          <button
            type="button"
            className="secondary-button"
            onClick={handleViewLog}
          >
            View game log
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={handlePlayAgain}
          >
            Play again
          </button>
        </div>
      </div>
    </div>
  );
}

export default WinnerScreen;
