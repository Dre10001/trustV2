// src/components/TwoPlayerReveal.jsx
import React from "react";

function TwoPlayerReveal({ goTo, gameState }) {
  const players = gameState?.players || [];
  const settings = gameState?.settings || {};
  const mode = settings.mode || "multiPlayer";
  const numPlayers = settings.numPlayers || players.length || 0;

  const twoPlayerChoices = Array.isArray(gameState?.twoPlayerChoices)
    ? gameState.twoPlayerChoices
    : [];

  const pot =
    typeof gameState?.twoPlayerPot === "number" ? gameState.twoPlayerPot : 0;

  const round =
    typeof gameState?.twoPlayerRound === "number"
      ? gameState.twoPlayerRound
      : 1;

  const existingLog = Array.isArray(gameState?.log) ? gameState.log : [];

  if (mode !== "twoPlayer" || numPlayers !== 2 || players.length !== 2) {
    return (
      <div className="screen screen-reveal">
        <h1 className="title">2-Player Outcome</h1>
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

  if (twoPlayerChoices.length < 2) {
    return (
      <div className="screen screen-reveal">
        <h1 className="title">2-Player Outcome</h1>
        <div className="card">
          <p className="text">
            Both players have not yet made their decisions for this round.
          </p>
          <button
            type="button"
            className="primary-button"
            onClick={() =>
              goTo("pass", {
                currentPlayerIndex: 0,
                lastPhase: "twoPlayerRound",
              })
            }
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const [p1, p2] = players;
  const c1 = twoPlayerChoices.find((c) => c.playerId === p1.id);
  const c2 = twoPlayerChoices.find((c) => c.playerId === p2.id);

  if (!c1 || !c2) {
    return (
      <div className="screen screen-reveal">
        <h1 className="title">2-Player Outcome</h1>
        <div className="card">
          <p className="text">
            Could not resolve both players&apos; decisions for this round.
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

  const f1Choice = c1.choice;
  const f2Choice = c2.choice;

  const f1Betray = f1Choice === "betray";
  const f2Betray = f2Choice === "betray";
  const bothBetray = f1Betray && f2Betray;
  const bothLoyal = f1Choice === "loyal" && f2Choice === "loyal";
  const exactlyOneBetray = !bothLoyal && !bothBetray && (f1Betray || f2Betray);

  const prediction1 = c1.prediction; // "loyal", "betray", or null
  const prediction2 = c2.prediction;

  const baseChoicesForLog = [
    {
      playerId: p1.id,
      choice: f1Choice,
      prediction: prediction1,
    },
    {
      playerId: p2.id,
      choice: f2Choice,
      prediction: prediction2,
    },
  ];

  // Helper: build common log entry
  const buildLogEntry = (outcome, potBefore, potAfter) => ({
    type: "twoPlayerRound",
    round,
    player1Id: p1.id,
    player2Id: p2.id,
    choices: baseChoicesForLog,
    potBefore,
    potAfter,
    outcome,
    timestamp: Date.now(),
  });

  // ---------------------------------------------------------------------------
  // Case 1: Both Loyal
  // ---------------------------------------------------------------------------
  if (bothLoyal) {
    let description = "";
    let outcomeLabel = "";
    const potBefore = pot;
    const potAfter = potBefore + 2; // total incoming contribution is always 2 units

    if (prediction1 === "loyal" && prediction2 === "loyal") {
      // Both correctly predicted loyalty
      outcomeLabel = "bothLoyal_bothPredictedLoyal_correct";
      description = `${p1.name} and ${p2.name} both chose Loyalty and both correctly predicted each other would stay loyal. They each contribute 1 unit to the pot.`;
    } else if (
      prediction1 === "loyal" &&
      prediction2 === "betray"
    ) {
      // p1 correct, p2 wrong
      outcomeLabel = "bothLoyal_p1Correct_p2Wrong";
      description = `${p1.name} and ${p2.name} both chose Loyalty. ${p1.name} correctly trusted their opponent, while ${p2.name} wrongly expected betrayal. ${p2.name} contributes 2 units; ${p1.name} contributes 0.`;
    } else if (
      prediction1 === "betray" &&
      prediction2 === "loyal"
    ) {
      // p2 correct, p1 wrong
      outcomeLabel = "bothLoyal_p2Correct_p1Wrong";
      description = `${p1.name} and ${p2.name} both chose Loyalty. ${p2.name} correctly trusted their opponent, while ${p1.name} wrongly expected betrayal. ${p1.name} contributes 2 units; ${p2.name} contributes 0.`;
    } else {
      // Both predicted betrayal (both wrong)
      outcomeLabel = "bothLoyal_bothPredictedBetray_wrong";
      description = `${p1.name} and ${p2.name} both chose Loyalty but both wrongly predicted the other would betray. They each contribute 1 unit to the pot.`;
    }

    const handleContinueNextRound = () => {
      const logEntry = buildLogEntry(outcomeLabel, potBefore, potAfter);
      const updatedLog = [...existingLog, logEntry];

      goTo("pass", {
        players,
        log: updatedLog,
        twoPlayerPot: potAfter,
        twoPlayerRound: round + 1,
        twoPlayerChoices: [],
        currentPlayerIndex: 0,
        lastPhase: "twoPlayerRound",
      });
    };

    return (
      <div className="screen screen-reveal">
        <h1 className="title">Round {round} Outcome</h1>

        <div className="card">
          <p className="text">Final decisions this round:</p>
          <ul className="list">
            <li className="list-item">
              {p1.name}:{" "}
              <strong>{f1Choice === "loyal" ? "Loyalty" : "Betrayal"}</strong>{" "}
              {f1Choice === "loyal" && prediction1 && (
                <>
                  – predicted{" "}
                  <strong>
                    {prediction1 === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </>
              )}
            </li>
            <li className="list-item">
              {p2.name}:{" "}
              <strong>{f2Choice === "loyal" ? "Loyalty" : "Betrayal"}</strong>{" "}
              {f2Choice === "loyal" && prediction2 && (
                <>
                  – predicted{" "}
                  <strong>
                    {prediction2 === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </>
              )}
            </li>
          </ul>

          <p className="text">{description}</p>
          <p className="text">
            Pot: <strong>{pot}</strong> → <strong>{potAfter}</strong>
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={handleContinueNextRound}
          >
            Continue to next round
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Case 2: Exactly one betrays
  // ---------------------------------------------------------------------------
  if (exactlyOneBetray) {
    const betrayer = f1Betray ? p1 : p2;
    const loyal = f1Betray ? p2 : p1;
    const loyalChoice = f1Betray ? c2 : c1;

    const loyalPrediction = loyalChoice.prediction;

    const potBefore = pot;

    if (loyalPrediction === "loyal") {
      // Loyal misreads → betrayal succeeds → game over, betrayer takes pot
      const winners = [betrayer.id];
      const outcomeLabel = "loyalVsBetray_betrayalSuccess";
      const description = `${betrayer.name} chose Betrayal while ${loyal.name} stayed Loyal and incorrectly predicted Loyalty. ${betrayer.name} successfully betrays and takes the entire pot.`;

      const handleContinueToWinner = () => {
        const logEntry = buildLogEntry(outcomeLabel, potBefore, potBefore);
        const updatedLog = [...existingLog, logEntry];

        const outcomeSummary = {
          description: `In round ${round}, ${betrayer.name} successfully betrayed ${loyal.name} and took the full pot of ${potBefore} units.`,
        };

        goTo("winner", {
          players,
          winners,
          log: updatedLog,
          randomOutcome: outcomeSummary,
        });
      };

      return (
        <div className="screen screen-reveal">
          <h1 className="title">Round {round} Outcome</h1>

          <div className="card">
            <p className="text">Final decisions this round:</p>
            <ul className="list">
              <li className="list-item">
                {betrayer.name}: <strong>Betrayal</strong>
              </li>
              <li className="list-item">
                {loyal.name}:{" "}
                <strong>Loyalty</strong> – predicted{" "}
                <strong>Loyalty</strong>
              </li>
            </ul>

            <p className="text">{description}</p>
            <p className="text">
              Pot remains at <strong>{potBefore}</strong> units.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={handleContinueToWinner}
            >
              End game
            </button>
          </div>
        </div>
      );
    }

    // Loyal predicts betrayal correctly → betrayal cancelled, betrayer pays double
    const potAfter = potBefore + 2;
    const outcomeLabel = "loyalVsBetray_betrayalCancelled";
    const description = `${betrayer.name} attempted Betrayal, but ${loyal.name} stayed Loyal and correctly predicted the betrayal. The betrayal is cancelled. ${betrayer.name} pays 2 units into the pot; ${loyal.name} pays 0.`;

    const handleContinueNextRound = () => {
      const logEntry = buildLogEntry(outcomeLabel, potBefore, potAfter);
      const updatedLog = [...existingLog, logEntry];

      goTo("pass", {
        players,
        log: updatedLog,
        twoPlayerPot: potAfter,
        twoPlayerRound: round + 1,
        twoPlayerChoices: [],
        currentPlayerIndex: 0,
        lastPhase: "twoPlayerRound",
      });
    };

    return (
      <div className="screen screen-reveal">
        <h1 className="title">Round {round} Outcome</h1>

        <div className="card">
          <p className="text">Final decisions this round:</p>
          <ul className="list">
            <li className="list-item">
              {betrayer.name}: <strong>Betrayal</strong>
            </li>
            <li className="list-item">
              {loyal.name}:{" "}
                <strong>Loyalty</strong> – predicted{" "}
              <strong>Betrayal</strong>
            </li>
          </ul>

          <p className="text">{description}</p>
          <p className="text">
            Pot: <strong>{potBefore}</strong> → <strong>{potAfter}</strong>
          </p>

          <button
            type="button"
            className="primary-button"
            onClick={handleContinueNextRound}
          >
            Continue to next round
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Case 3: Both betray
  // ---------------------------------------------------------------------------
  if (bothBetray) {
    const potBefore = pot;
    const potAfter = potBefore; // no growth

    const outcomeLabelContinue = "bothBetray_continue";
    const outcomeLabelSplit = "bothBetray_split";

    const handleContinueGame = () => {
      const logEntry = buildLogEntry(outcomeLabelContinue, potBefore, potAfter);
      const updatedLog = [...existingLog, logEntry];

      goTo("pass", {
        players,
        log: updatedLog,
        twoPlayerPot: potAfter,
        twoPlayerRound: round + 1,
        twoPlayerChoices: [],
        currentPlayerIndex: 0,
        lastPhase: "twoPlayerRound",
      });
    };

    const handleEndAndSplit = () => {
      const logEntry = buildLogEntry(outcomeLabelSplit, potBefore, potAfter);
      const updatedLog = [...existingLog, logEntry];

      const winners = [p1.id, p2.id];
      const outcomeSummary = {
        description: `In round ${round}, both ${p1.name} and ${p2.name} chose Betrayal. They ended the game and split the pot of ${potBefore} units between them.`,
      };

      goTo("winner", {
        players,
        winners,
        log: updatedLog,
        randomOutcome: outcomeSummary,
      });
    };

    return (
      <div className="screen screen-reveal">
        <h1 className="title">Round {round} Outcome</h1>

        <div className="card">
          <p className="text">Final decisions this round:</p>
          <ul className="list">
            <li className="list-item">
              {p1.name}: <strong>Betrayal</strong>
            </li>
            <li className="list-item">
              {p2.name}: <strong>Betrayal</strong>
            </li>
          </ul>

          <p className="text">
            Both players chose Betrayal. The pot does not grow this round and
            remains at <strong>{potBefore}</strong> units.
          </p>

          <p className="text">
            You must now jointly decide whether to continue playing or end the
            game and split the pot.
          </p>

          <div className="button-row">
            <button
              type="button"
              className="secondary-button"
              onClick={handleContinueGame}
            >
              Continue playing
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleEndAndSplit}
            >
              End game & split pot
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (should not be hit)
  return (
    <div className="screen screen-reveal">
      <h1 className="title">2-Player Outcome</h1>
      <div className="card">
        <p className="text">
          The round ended in an unexpected state. Please restart the game.
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

export default TwoPlayerReveal;
