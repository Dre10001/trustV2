// src/components/PassDevice.jsx
import React from "react";

function PassDevice({ goTo, gameState }) {
  const players = gameState?.players || [];
  const currentIndex =
    typeof gameState?.currentPlayerIndex === "number"
      ? gameState.currentPlayerIndex
      : 0;

  const currentPlayer = players[currentIndex] || { name: "Player" };

  const finalistsIds = Array.isArray(gameState?.finalists)
    ? gameState.finalists
    : [];

  const loyaltyChoices = Array.isArray(gameState?.loyaltyChoices)
    ? gameState.loyaltyChoices
    : [];

  const allianceAttempt =
    typeof gameState?.allianceAttempt === "number" &&
    gameState.allianceAttempt > 0
      ? gameState.allianceAttempt
      : 1;

  const lastPhase = gameState?.lastPhase || "init";
  const numPlayers = gameState?.settings?.numPlayers || players.length || 0;
  const currentRound =
    typeof gameState?.currentRound === "number"
      ? gameState.currentRound
      : 1;

  // 4-player metadata (harmless for 3- and 5-player games)
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

  const getPlayerName = (id) => {
    const p = players.find((pl) => pl.id === id);
    return p ? p.name : `Player ${id}`;
  };

  // Figure out where we are in the game flow
  const finalistsWithChoices = loyaltyChoices.filter((c) =>
    finalistsIds.includes(c.playerId)
  );

  const hasFinalists = finalistsIds.length === 2;
  const loyaltyInProgress = hasFinalists && finalistsWithChoices.length < 2;

  const shouldGoToLoyalty = (() => {
    if (lastPhase === "allianceResolved") return true;
    if (lastPhase === "loyalty") return true;
    if (loyaltyInProgress) return true;
    return false;
  })();

  const handleContinue = () => {
    if (shouldGoToLoyalty) {
      goTo("loyalty", {
        currentPlayerIndex: currentIndex,
        finalists: finalistsIds,
        loyaltyChoices,
        loyaltyStage,
        eliminatedRandomFirstRoundId,
        eliminatedInitialIds,
        eliminatedAllianceRoundId,
        loyaltyStage1Finalists,
        lastPhase: "loyalty",
      });
    } else {
      goTo("alliance", {
        currentPlayerIndex: currentIndex,
        allianceAttempt,
        lastPhase: "alliance",
      });
    }
  };

  // 4-player: after random elimination, on Round 2, show who was knocked out
  const showRandomElimNote4p =
    numPlayers === 4 &&
    currentRound === 2 &&
    eliminatedRandomFirstRoundId != null;

  const eliminatedRandomName4p = showRandomElimNote4p
    ? getPlayerName(eliminatedRandomFirstRoundId)
    : null;

  // 5-player: after random elimination, on Round 2, show which TWO players were knocked out
  const showRandomElimNote5p =
    numPlayers === 5 &&
    currentRound === 2 &&
    eliminatedInitialIds.length === 2;

  const eliminatedRandomNames5p = showRandomElimNote5p
    ? eliminatedInitialIds.map((id) => getPlayerName(id))
    : [];

  return (
    <div className="screen screen-pass">
      <h1 className="title">Pass the device</h1>

      <div className="card">
        {showRandomElimNote4p && (
          <>
            <p className="text">Random elimination:</p>
            <p className="highlight-name">{eliminatedRandomName4p}</p>
            <p className="text small">
              {eliminatedRandomName4p} was randomly eliminated and loses their
              primary buy-in, but they could still win the overall prize later
              in the game.
            </p>
            <hr className="divider" />
          </>
        )}

        {showRandomElimNote5p && (
          <>
            <p className="text">Random eliminations:</p>
            <p className="highlight-name">
              {eliminatedRandomNames5p[0]} and {eliminatedRandomNames5p[1]}
            </p>
            <p className="text small">
              These two players were randomly eliminated and lose their primary
              buy-ins. They are currently out of the game, but depending on what
              happens next, they may still end up with the prize.
            </p>
            <hr className="divider" />
          </>
        )}

        <p className="text">Please pass the device to:</p>
        <p className="highlight-name">{currentPlayer.name}</p>
        <p className="text small">
          No one else should look at the screen while they make their choice.
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={handleContinue}
        >
          I am {currentPlayer.name}
        </button>
      </div>
    </div>
  );
}

export default PassDevice;
