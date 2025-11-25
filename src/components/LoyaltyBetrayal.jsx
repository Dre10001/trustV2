// src/components/LoyaltyBetrayal.jsx
import React, { useState, useMemo } from "react";

function LoyaltyBetrayal({ goTo, gameState }) {
  const players = gameState?.players || [];
  const finalistsIds = Array.isArray(gameState?.finalists)
    ? gameState.finalists
    : [];

  const loyaltyChoices = Array.isArray(gameState?.loyaltyChoices)
    ? gameState.loyaltyChoices
    : [];

  // 4-player metadata that must be preserved
  const loyaltyStage =
    typeof gameState?.loyaltyStage === "number"
      ? gameState.loyaltyStage
      : 1;

  const eliminatedRandomFirstRoundId =
    gameState?.eliminatedRandomFirstRoundId ?? null;

  const eliminatedInitialIds = Array.isArray(gameState?.eliminatedInitialIds)
    ? gameState.eliminatedInitialIds
    : [];

  const eliminatedAllianceRoundId =
    gameState?.eliminatedAllianceRoundId ?? null;

  const loyaltyStage1Finalists = Array.isArray(
    gameState?.loyaltyStage1Finalists
  )
    ? gameState.loyaltyStage1Finalists
    : [];

  // Resolve finalist player objects
  const finalists = useMemo(
    () => players.filter((p) => finalistsIds.includes(p.id)),
    [players, finalistsIds]
  );

  // Find which finalist still needs to choose
  const pendingFinalist = useMemo(() => {
    return finalists.find(
      (p) => !loyaltyChoices.some((c) => c.playerId === p.id)
    );
  }, [finalists, loyaltyChoices]);

  const [choice, setChoice] = useState(null);
  const [error, setError] = useState("");

  if (!finalists.length) {
    return (
      <div className="screen screen-loyalty">
        <h1 className="title">Loyalty or Betrayal</h1>
        <div className="card">
          <p className="text">
            No finalists found. Something went wrong with the game state.
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

  if (!pendingFinalist) {
    // Both finalists have already made their decisions; move to reveal.
    goTo("reveal", {
      loyaltyChoices,
      finalists: finalistsIds,
      lastPhase: "loyalty",
      loyaltyStage,
      eliminatedRandomFirstRoundId,
      eliminatedInitialIds,
      eliminatedAllianceRoundId,
      loyaltyStage1Finalists,
    });
    return null;
  }

  const handleConfirm = () => {
    if (!choice) {
      setError("Please select Loyalty or Betrayal.");
      return;
    }

    const updatedChoices = [
      ...loyaltyChoices.filter((c) => c.playerId !== pendingFinalist.id),
      {
        playerId: pendingFinalist.id,
        choice, // "loyal" or "betray"
      },
    ];

    // Check if the other finalist still needs to choose
    const stillPending = finalists.find(
      (p) => !updatedChoices.some((c) => c.playerId === p.id)
    );

    if (stillPending) {
      // Another finalist must now make their decision
      const nextIndex = players.findIndex((p) => p.id === stillPending.id);
      goTo("pass", {
        loyaltyChoices: updatedChoices,
        currentPlayerIndex: nextIndex,
        finalists: finalistsIds,
        loyaltyStage,
        eliminatedRandomFirstRoundId,
        eliminatedInitialIds,
        eliminatedAllianceRoundId,
        loyaltyStage1Finalists,
        lastPhase: "loyalty",
      });
    } else {
      // Both decisions are in → go to outcome reveal
      goTo("reveal", {
        loyaltyChoices: updatedChoices,
        finalists: finalistsIds,
        lastPhase: "loyalty",
        loyaltyStage,
        eliminatedRandomFirstRoundId,
        eliminatedInitialIds,
        eliminatedAllianceRoundId,
        loyaltyStage1Finalists,
      });
    }
  };

  return (
    <div className="screen screen-loyalty">
      <h1 className="title">Loyalty or Betrayal</h1>

      <div className="card">
        <p className="text">{pendingFinalist.name}, choose your move.</p>

        <div className="button-column">
          <button
            type="button"
            className={`choice-button ${
              choice === "loyal" ? "choice-button-active" : ""
            }`}
            onClick={() => {
              setChoice("loyal");
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
              setError("");
            }}
          >
            Betrayal
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

export default LoyaltyBetrayal;
