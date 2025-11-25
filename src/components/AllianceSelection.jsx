// src/components/AllianceSelection.jsx
import React, { useState, useMemo } from "react";

function AllianceSelection({ goTo, gameState }) {
  const players = gameState?.players || [];
  const currentPlayerIndex =
    typeof gameState?.currentPlayerIndex === "number"
      ? gameState.currentPlayerIndex
      : 0;

  const currentPlayer = players[currentPlayerIndex];

  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [useRandom, setUseRandom] = useState(false);
  const [error, setError] = useState("");

  const activePlayers = useMemo(
    () => players.filter((p) => !p.eliminated),
    [players]
  );

  // Eligible alliance targets: active players other than the current one
  const eligibleTargets = useMemo(() => {
    if (!currentPlayer) return [];
    return activePlayers.filter((p) => p.id !== currentPlayer.id);
  }, [activePlayers, currentPlayer]);

  if (!currentPlayer) {
    return (
      <div className="screen screen-alliance">
        <h1 className="title">Alliance Selection</h1>
        <div className="card">
          <p className="text">
            No active player found. Something went wrong with the game state.
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

  const handleTargetClick = (targetId) => {
    setUseRandom(false);
    setSelectedTargetId(targetId);
    setError("");
  };

  const handleRandomClick = () => {
    setUseRandom(true);
    setSelectedTargetId(null);
    setError("");
  };

  const handleConfirm = () => {
    if (!useRandom && !selectedTargetId) {
      setError("Please select a player or choose Random.");
      return;
    }

    // Resolve target (if Random, pick one of the eligible targets)
    let finalTargetId = selectedTargetId;
    let wasRandom = false;

    if (useRandom) {
      if (eligibleTargets.length === 0) {
        setError("No eligible players to choose from.");
        return;
      }
      const randomIndex = Math.floor(
        Math.random() * eligibleTargets.length
      );
      finalTargetId = eligibleTargets[randomIndex].id;
      wasRandom = true;
    }

    const existingChoices = Array.isArray(gameState.allianceChoices)
      ? gameState.allianceChoices
      : [];

    // Update or insert this player's choice
    const updatedChoices = (() => {
      const withoutCurrent = existingChoices.filter(
        (c) => c.playerId !== currentPlayer.id
      );
      return [
        ...withoutCurrent,
        {
          playerId: currentPlayer.id,
          targetId: finalTargetId,
          wasRandom,
        },
      ];
    })();

    // Determine next player who still needs to choose
    const decidedIds = updatedChoices.map((c) => c.playerId);
    const remainingPlayer = activePlayers.find(
      (p) => !decidedIds.includes(p.id)
    );

    if (remainingPlayer) {
      // More players still need to make alliance choices
      const nextIndex = players.findIndex(
        (p) => p.id === remainingPlayer.id
      );

      goTo("pass", {
        allianceChoices: updatedChoices,
        currentPlayerIndex: nextIndex,
      });
    } else {
      // All alliance decisions are in; move to reveal
      goTo("reveal", {
        allianceChoices: updatedChoices,
        lastPhase: "alliance",
      });
    }
  };

  return (
    <div className="screen screen-alliance">
      <h1 className="title">Alliance Selection</h1>

      <div className="card">
        <p className="text">
          {currentPlayer.name}, choose who you want to ally with.
        </p>

        <div className="button-column">
          {eligibleTargets.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`choice-button ${
                !useRandom && selectedTargetId === p.id
                  ? "choice-button-active"
                  : ""
              }`}
              onClick={() => handleTargetClick(p.id)}
            >
              {p.name}
            </button>
          ))}

          <button
            type="button"
            className={`choice-button choice-random ${
              useRandom ? "choice-button-active" : ""
            }`}
            onClick={handleRandomClick}
          >
            Random
          </button>
        </div>

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

export default AllianceSelection;
