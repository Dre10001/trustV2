// src/components/OutcomeReveal.jsx
import React, { useMemo } from "react";

function OutcomeReveal({ goTo, gameState }) {
  const players = gameState?.players || [];
  const numPlayers = gameState?.settings?.numPlayers || players.length || 0;
  const lastPhase = gameState?.lastPhase || "alliance";

  const allianceChoices = Array.isArray(gameState?.allianceChoices)
    ? gameState.allianceChoices
    : [];

  const loyaltyChoices = Array.isArray(gameState?.loyaltyChoices)
    ? gameState.loyaltyChoices
    : [];

  const allianceAttempt =
    typeof gameState?.allianceAttempt === "number" &&
    gameState.allianceAttempt > 0
      ? gameState.allianceAttempt
      : 1;

  const maxAllianceAttempts = 3;

  const finalistsIds = Array.isArray(gameState?.finalists)
    ? gameState.finalists
    : [];

  const currentRound =
    typeof gameState?.currentRound === "number"
      ? gameState.currentRound
      : 1;

  // 3p only: first-round eliminated player
  const eliminatedFirstRoundId = gameState?.eliminatedFirstRound || null;

  // 4p + 5p metadata
  const eliminatedRandomFirstRoundId =
    gameState?.eliminatedRandomFirstRoundId ?? null;

  const eliminatedInitialIds = Array.isArray(gameState?.eliminatedInitialIds)
    ? gameState.eliminatedInitialIds
    : [];

  const eliminatedAllianceRoundId =
    gameState?.eliminatedAllianceRoundId ?? null;

  const loyaltyStage =
    typeof gameState?.loyaltyStage === "number"
      ? gameState.loyaltyStage
      : 1;

  const loyaltyStage1FinalistsIds = Array.isArray(
    gameState?.loyaltyStage1Finalists
  )
    ? gameState.loyaltyStage1Finalists
    : [];

  const activePlayers = useMemo(
    () => players.filter((p) => !p.eliminated),
    [players]
  );

  // --- ALLIANCE REVEAL ---

  if (lastPhase === "alliance") {
    const choiceByPlayerId = new Map();
    allianceChoices.forEach((c) => {
      choiceByPlayerId.set(c.playerId, c.targetId);
    });

    let finalists = [];
    let eliminated = null;

    const ids = activePlayers.map((p) => p.id);

    // Find mutual alliance among active players
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = ids[i];
        const b = ids[j];
        const aTarget = choiceByPlayerId.get(a);
        const bTarget = choiceByPlayerId.get(b);

        if (aTarget === b && bTarget === a) {
          finalists = [
            activePlayers.find((p) => p.id === a),
            activePlayers.find((p) => p.id === b),
          ].filter(Boolean);
        }
      }
    }

    // No mutual alliance found
    if (finalists.length !== 2) {
      const currentAttempt = allianceAttempt || 1;
      const isFinalAttempt = currentAttempt >= maxAllianceAttempts;

      // More attempts left -> re-run alliance
      if (!isFinalAttempt) {
        const nextAttempt = currentAttempt + 1;

        const handleRetry = () => {
          const firstActiveIndex = players.findIndex((p) => !p.eliminated);
          const nextIndex = firstActiveIndex >= 0 ? firstActiveIndex : 0;

          goTo("pass", {
            allianceAttempt: nextAttempt,
            allianceChoices: [],
            finalists: [],
            eliminatedFirstRound: null,
            currentPlayerIndex: nextIndex,
            lastPhase: "alliance",
          });
        };

        return (
          <div className="screen screen-reveal">
            <h1 className="title">Alliance Result</h1>
            <div className="card">
              <p className="text">No mutual alliance was formed this time.</p>
              <p className="text small">
                You have attempted to form an alliance {currentAttempt} of{" "}
                {maxAllianceAttempts} times. The round will be re-run so that
                players can choose again.
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={handleRetry}
              >
                Start alliance attempt {currentAttempt + 1}
              </button>
            </div>
          </div>
        );
      }

      // Final attempt failed
      // Branch by mode: 4-player, 5-player, then default/random

      // 4-player mode: prize goes to the Round 1 random elimination
      if (numPlayers === 4 && eliminatedRandomFirstRoundId != null) {
        const eliminatedWinner = players.find(
          (p) => p.id === eliminatedRandomFirstRoundId
        );

        const winners = eliminatedWinner ? [eliminatedWinner.id] : [];

        const updatedPlayers = players.map((p) => {
          if (!eliminatedWinner) return p;
          if (p.id === eliminatedWinner.id) {
            return { ...p };
          }
          return {
            ...p,
            eliminated: true,
            lostPrimary: true,
            lostSecondary: true,
          };
        });

        const description = eliminatedWinner
          ? `No mutual alliance was formed after ${maxAllianceAttempts} attempts. ${eliminatedWinner.name}, the player randomly eliminated in Round 1, receives the full prize pot.`
          : `No mutual alliance was formed after ${maxAllianceAttempts} attempts, and the Round 1 elimination could not be determined.`;

        const newLogEntry = {
          type: "noAlliancePrizeToEliminated4p",
          allianceChoices,
          winners,
          attempts: maxAllianceAttempts,
          eliminatedRandomFirstRoundId,
          timestamp: Date.now(),
        };

        const updatedLog = Array.isArray(gameState.log)
          ? [...gameState.log, newLogEntry]
          : [newLogEntry];

        const handleContinue = () => {
          goTo("winner", {
            players: updatedPlayers,
            winners,
            log: updatedLog,
            randomOutcome: {
              type: "noAlliancePrizeToEliminated4p",
              attempts: maxAllianceAttempts,
              description,
            },
          });
        };

        return (
          <div className="screen screen-reveal">
            <h1 className="title">Alliance Result</h1>
            <div className="card">
              <p className="text">
                No mutual alliance was formed after three attempts.
              </p>
              <p className="text small">
                {eliminatedWinner
                  ? `${eliminatedWinner.name}, the player randomly eliminated in Round 1, receives the full prize pot.`
                  : "The intended winner (the Round 1 eliminated player) could not be determined from the current state."}
              </p>
              <button
                type="button"
                className="primary-button"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        );
      }

      // 5-player mode, Round 2 alliance: prize goes to the initially eliminated players
      if (
        numPlayers === 5 &&
        currentRound === 2 &&
        eliminatedInitialIds.length > 0
      ) {
        const winnerPlayers = eliminatedInitialIds
          .map((id) => players.find((p) => p.id === id))
          .filter(Boolean);

        const winners = winnerPlayers.map((p) => p.id);

        const updatedPlayers = players.map((p) => {
          if (winners.includes(p.id)) {
            // Already eliminated with primary lost; no extra penalty needed.
            return { ...p };
          }
          return {
            ...p,
            eliminated: true,
            lostPrimary: true,
            lostSecondary: true,
          };
        });

        const names = winnerPlayers.map((p) => p.name).join(" and ");

        const description =
          winners.length > 0
            ? `No mutual alliance was formed after ${maxAllianceAttempts} attempts. The prize is awarded to the players who were randomly eliminated in Round 1: ${names}.`
            : `No mutual alliance was formed after ${maxAllianceAttempts} attempts, and the initially eliminated players could not be determined.`;

        const newLogEntry = {
          type: "noAlliancePrizeToEliminated5p",
          allianceChoices,
          winners,
          attempts: maxAllianceAttempts,
          eliminatedInitialIds,
          timestamp: Date.now(),
        };

        const updatedLog = Array.isArray(gameState.log)
          ? [...gameState.log, newLogEntry]
          : [newLogEntry];

        const handleContinue = () => {
          goTo("winner", {
            players: updatedPlayers,
            winners,
            log: updatedLog,
            randomOutcome: {
              type: "noAlliancePrizeToEliminated5p",
              attempts: maxAllianceAttempts,
              description,
            },
          });
        };

        return (
          <div className="screen screen-reveal">
            <h1 className="title">Alliance Result</h1>
            <div className="card">
              <p className="text">
                No mutual alliance was formed after three attempts.
              </p>
              <p className="text small">{description}</p>
              <button
                type="button"
                className="primary-button"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        );
      }

      // Default / 3-player mode (and late 5p alliance): random winner among active players
      const activePlayersNow = activePlayers.length ? activePlayers : players;
      const randomIndex = activePlayersNow.length
        ? Math.floor(Math.random() * activePlayersNow.length)
        : -1;
      const randomWinner =
        randomIndex >= 0 ? activePlayersNow[randomIndex] : null;

      const winners = randomWinner ? [randomWinner.id] : [];

      const updatedPlayers = players.map((p) => {
        if (!randomWinner) return p;
        if (p.id === randomWinner.id) {
          return { ...p };
        }
        return {
          ...p,
          eliminated: true,
          lostPrimary: true,
          lostSecondary: true,
        };
      });

      const description = randomWinner
        ? `No mutual alliance was formed after ${maxAllianceAttempts} attempts. ${randomWinner.name} is chosen at random to receive the full primary and secondary prize pot.`
        : `No mutual alliance was formed after ${maxAllianceAttempts} attempts, and no eligible winner could be determined.`;

      const newLogEntry = {
        type: "noAllianceRandomWinner",
        allianceChoices,
        winners,
        attempts: maxAllianceAttempts,
        timestamp: Date.now(),
      };

      const updatedLog = Array.isArray(gameState.log)
        ? [...gameState.log, newLogEntry]
        : [newLogEntry];

      const handleContinue = () => {
        goTo("winner", {
          players: updatedPlayers,
          winners,
          log: updatedLog,
          randomOutcome: {
            type: "noAllianceRandomWinner",
            attempts: maxAllianceAttempts,
            description,
          },
        });
      };

      return (
        <div className="screen screen-reveal">
          <h1 className="title">Alliance Result</h1>
          <div className="card">
            <p className="text">
              No mutual alliance was formed after three attempts.
            </p>
            <p className="text small">
              {randomWinner
                ? `${randomWinner.name} has been selected at random to receive the full primary and secondary prize pot.`
                : "A winner could not be determined from the current state."}
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }

    // Mutual alliance found: determine eliminated player
    const finalistIdsSet = new Set(finalists.map((f) => f.id));
    const eliminatedActive = activePlayers.find(
      (p) => !finalistIdsSet.has(p.id)
    );

    eliminated = eliminatedActive || null;

    // Prepare updated players and log, but only apply on "Continue"
    let updatedPlayers = players.map((p) => {
      if (eliminated && p.id === eliminated.id) {
        return {
          ...p,
          eliminated: true,
          lostPrimary: true,
        };
      }
      return p;
    });

    // 4-player: track alliance-round elimination separately and maintain list
    let updatedEliminatedInitialIds = eliminatedInitialIds;
    let updatedEliminatedAllianceRoundId = eliminatedAllianceRoundId;

    if (numPlayers === 4 && eliminated) {
      updatedEliminatedAllianceRoundId = eliminated.id;
      const set = new Set(updatedEliminatedInitialIds);
      set.add(eliminatedRandomFirstRoundId);
      set.add(eliminated.id);
      updatedEliminatedInitialIds = Array.from(set).filter(
        (id) => id != null
      );
    }

    // 5-player: Round 2 alliance adds the newly eliminated player to the
    // "initially eliminated" pool so we track all three eliminated players.
    if (numPlayers === 5 && currentRound === 2 && eliminated) {
      const set = new Set(updatedEliminatedInitialIds);
      set.add(eliminated.id);
      updatedEliminatedInitialIds = Array.from(set);
    }

    const newLogEntry = {
      type: "alliance",
      finalists: finalists.map((f) => f.id),
      eliminated: eliminated ? eliminated.id : null,
      allianceChoices: allianceChoices,
      timestamp: Date.now(),
    };

    const updatedLog = Array.isArray(gameState.log)
      ? [...gameState.log, newLogEntry]
      : [newLogEntry];

    const handleContinue = () => {
      const firstFinalist = finalists[0];
      const nextIndex = updatedPlayers.findIndex(
        (p) => p.id === firstFinalist.id
      );

      // 3-player: store eliminatedFirstRound and move to single loyalty round
      if (numPlayers === 3) {
        goTo("pass", {
          players: updatedPlayers,
          finalists: finalists.map((f) => f.id),
          eliminatedFirstRound: eliminated ? eliminated.id : null,
          log: updatedLog,
          currentPlayerIndex: nextIndex,
          lastPhase: "allianceResolved",
          currentRound: 2,
        });
        return;
      }

      // 4-player: we are now entering Loyalty Stage 1 between the two finalists
      if (numPlayers === 4) {
        goTo("pass", {
          players: updatedPlayers,
          finalists: finalists.map((f) => f.id),
          log: updatedLog,
          currentPlayerIndex: nextIndex,
          lastPhase: "allianceResolved",
          currentRound: 3,
          loyaltyStage: 1,
          eliminatedRandomFirstRoundId,
          eliminatedInitialIds: updatedEliminatedInitialIds,
          eliminatedAllianceRoundId: updatedEliminatedAllianceRoundId,
        });
        return;
      }

      // 5-player:
      // If we're resolving the first post-random alliance (Round 2),
      // move into Loyalty Part 1 (Round 3).
      if (numPlayers === 5 && currentRound === 2) {
        goTo("pass", {
          players: updatedPlayers,
          finalists: finalists.map((f) => f.id),
          log: updatedLog,
          currentPlayerIndex: nextIndex,
          lastPhase: "allianceResolved",
          currentRound: 3,
          eliminatedInitialIds: updatedEliminatedInitialIds,
          eliminatedAllianceRoundId: null,
        });
        return;
      }

      // 5-player: if we're resolving the second alliance (Round 3 Part 2),
      // the eliminated player from this alliance is the special Round 3 Part 2
      // elimination for the final loyalty round in Round 4.
      if (numPlayers === 5 && currentRound >= 3) {
        const newElimId = eliminated ? eliminated.id : null;

        goTo("pass", {
          players: updatedPlayers,
          finalists: finalists.map((f) => f.id),
          log: updatedLog,
          currentPlayerIndex: nextIndex,
          lastPhase: "allianceResolved",
          currentRound: 4,
          eliminatedInitialIds: updatedEliminatedInitialIds,
          eliminatedAllianceRoundId: newElimId,
        });
        return;
      }

      // Fallback
      goTo("setup", {});
    };

    return (
      <div className="screen screen-reveal">
        <h1 className="title">Alliance Result</h1>

        <div className="card">
          <p className="text">A mutual alliance has been formed.</p>

          <p className="text">Finalists:</p>
          <ul className="list">
            {finalists.map((f) => (
              <li key={f.id} className="list-item">
                {f.name}
              </li>
            ))}
          </ul>

          {eliminated && (
            <>
              <p className="text">Eliminated player:</p>
              <p className="highlight-name">{eliminated.name}</p>
              <p className="text small">
                {eliminated.name} loses their primary buy-in and is out of this
                alliance round.
              </p>
            </>
          )}

          <button
            type="button"
            className="primary-button"
            onClick={handleContinue}
          >
            Continue to Loyalty / Betrayal
          </button>
        </div>
      </div>
    );
  }

  // --- LOYALTY / BETRAYAL REVEAL ---

  const finalists = players.filter((p) => finalistsIds.includes(p.id));

  if (lastPhase === "loyalty") {
    if (finalists.length !== 2) {
      return (
        <div className="screen screen-reveal">
          <h1 className="title">Final Outcome</h1>
          <div className="card">
            <p className="text">
              Finalists could not be resolved correctly. Something went wrong
              with the game state.
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

    const [f1, f2] = finalists;

    const c1 = loyaltyChoices.find((c) => c.playerId === f1.id);
    const c2 = loyaltyChoices.find((c) => c.playerId === f2.id);

    if (!c1 || !c2) {
      return (
        <div className="screen screen-reveal">
          <h1 className="title">Final Outcome</h1>
          <div className="card">
            <p className="text">
              Not all finalists have submitted their choices yet.
            </p>
            <button
              type="button"
              className="primary-button"
              onClick={() =>
                goTo("pass", {
                  finalists: finalistsIds,
                  loyaltyChoices,
                  loyaltyStage,
                })
              }
            >
              Continue
            </button>
          </div>
        </div>
      );
    }

    const bothLoyal = c1.choice === "loyal" && c2.choice === "loyal";
    const f1Betray = c1.choice === "betray";
    const f2Betray = c2.choice === "betray";
    const bothBetray = f1Betray && f2Betray;

    // --- 3-PLAYER LOYALTY LOGIC (unchanged) ---
    if (numPlayers === 3) {
      let winners = [];
      let description = "";
      let updatedPlayers = [...players];

      if (bothLoyal) {
        winners = [f1.id, f2.id];
        description = `${f1.name} and ${f2.name} both chose Loyalty. They split the prize.`;
      } else if (f1Betray && !f2Betray) {
        winners = [f1.id];
        description = `${f1.name} chose Betrayal and ${f2.name} chose Loyalty. ${f1.name} takes the full prize.`;

        updatedPlayers = players.map((p) => {
          if (p.id === f2.id) {
            return { ...p, lostSecondary: true };
          }
          return p;
        });
      } else if (f2Betray && !f1Betray) {
        winners = [f2.id];
        description = `${f2.name} chose Betrayal and ${f1.name} chose Loyalty. ${f2.name} takes the full prize.`;

        updatedPlayers = players.map((p) => {
          if (p.id === f1.id) {
            return { ...p, lostSecondary: true };
          }
          return p;
        });
      } else if (bothBetray) {
        updatedPlayers = players.map((p) => {
          if (p.id === f1.id || p.id === f2.id) {
            return { ...p, lostSecondary: true };
          }
          return p;
        });

        const eliminatedWinner = players.find(
          (p) => p.id === eliminatedFirstRoundId
        );

        if (eliminatedWinner) {
          winners = [eliminatedWinner.id];
          description = `${f1.name} and ${f2.name} both chose Betrayal. They both lose their secondary buy-ins. ${eliminatedWinner.name}, the eliminated player, wins the prize.`;
        } else {
          description =
            `${f1.name} and ${f2.name} both chose Betrayal. ` +
            `They both lose their secondary buy-ins. The intended winner is the player eliminated in Round 1, ` +
            `but that player could not be determined from the current state.`;
        }
      }

      const newLogEntry = {
        type: "loyalty",
        finalists: finalistsIds,
        choices: loyaltyChoices,
        winners,
        timestamp: Date.now(),
      };

      const updatedLog = Array.isArray(gameState.log)
        ? [...gameState.log, newLogEntry]
        : [newLogEntry];

      const handleContinue = () => {
        goTo("winner", {
          players: updatedPlayers,
          winners,
          log: updatedLog,
          loyaltyResult: {
            finalists: finalistsIds,
            choices: loyaltyChoices,
            description,
          },
        });
      };

      return (
        <div className="screen screen-reveal">
          <h1 className="title">Final Outcome</h1>

          <div className="card">
            <p className="text">Finalist decisions:</p>
            <ul className="list">
              <li className="list-item">
                {f1.name}:{" "}
                <strong>
                  {c1.choice === "loyal" ? "Loyalty" : "Betrayal"}
                </strong>
              </li>
              <li className="list-item">
                {f2.name}:{" "}
                <strong>
                  {c2.choice === "loyal" ? "Loyalty" : "Betrayal"}
                </strong>
              </li>
            </ul>

            <p className="text">{description}</p>

            {winners.length > 0 && (
              <>
                <p className="text">
                  Winner{winners.length > 1 ? "s" : ""}:
                </p>
                <ul className="list">
                  {winners.map((id) => {
                    const w = players.find((p) => p.id === id);
                    if (!w) return null;
                    return (
                      <li key={w.id} className="list-item">
                        {w.name}
                      </li>
                    );
                  })}
                </ul>
              </>
            )}

            <button
              type="button"
              className="primary-button"
              onClick={handleContinue}
            >
              Continue
            </button>
          </div>
        </div>
      );
    }

    // --- 4-PLAYER LOYALTY LOGIC (Stage 1 and Stage 2) ---
    if (numPlayers === 4) {
      // Stage 1: alliance finalists
      if (loyaltyStage === 1) {
        let winners = [];
        let description = "";
        let updatedPlayers = [...players];

        if (bothLoyal) {
          winners = [f1.id, f2.id];
          description = `${f1.name} and ${f2.name} both chose Loyalty. They split the prize.`;
        } else if (f1Betray && !f2Betray) {
          winners = [f1.id];
          description = `${f1.name} chose Betrayal and ${f2.name} chose Loyalty. ${f1.name} takes the full prize.`;

          updatedPlayers = players.map((p) => {
            if (p.id === f2.id) {
              return { ...p, lostSecondary: true };
            }
            return p;
          });
        } else if (f2Betray && !f1Betray) {
          winners = [f2.id];
          description = `${f2.name} chose Betrayal and ${f1.name} chose Loyalty. ${f2.name} takes the full prize.`;

          updatedPlayers = players.map((p) => {
            if (p.id === f1.id) {
              return { ...p, lostSecondary: true };
            }
            return p;
          });
        } else if (bothBetray) {
          const returningIds = [
            eliminatedRandomFirstRoundId,
            eliminatedAllianceRoundId,
          ].filter((id) => id != null);

          updatedPlayers = players.map((p) => {
            // Finalists lose secondary and are out
            if (p.id === f1.id || p.id === f2.id) {
              return { ...p, lostSecondary: true, eliminated: true };
            }
            // Previously eliminated players return
            if (returningIds.includes(p.id)) {
              return { ...p, eliminated: false };
            }
            return p;
          });

          const newFinalistsIds = returningIds;

          const newLogEntry = {
            type: "loyalty",
            stage: 1,
            finalists: finalistsIds,
            choices: loyaltyChoices,
            winners: [],
            outcome: "bothBetrayFinalistsReturnedPlayers",
            timestamp: Date.now(),
          };

          const updatedLog = Array.isArray(gameState.log)
            ? [...gameState.log, newLogEntry]
            : [newLogEntry];

          const firstReturningId = newFinalistsIds[0];
          const nextIndex = updatedPlayers.findIndex(
            (p) => p.id === firstReturningId
          );

          const handleContinueStage2 = () => {
            goTo("pass", {
              players: updatedPlayers,
              finalists: newFinalistsIds,
              log: updatedLog,
              loyaltyChoices: [],
              loyaltyStage: 2,
              loyaltyStage1Finalists: [f1.id, f2.id],
              currentPlayerIndex: nextIndex >= 0 ? nextIndex : 0,
              currentRound: 4,
            });
          };

          const returningNames = newFinalistsIds
            .map((id) => players.find((p) => p.id === id))
            .filter(Boolean)
            .map((p) => p.name);

          return (
            <div className="screen screen-reveal">
              <h1 className="title">Loyalty / Betrayal Result</h1>
              <div className="card">
                <p className="text">Finalist decisions:</p>
                <ul className="list">
                  <li className="list-item">
                    {f1.name}:{" "}
                    <strong>
                      {c1.choice === "loyal" ? "Loyalty" : "Betrayal"}
                    </strong>
                  </li>
                  <li className="list-item">
                    {f2.name}:{" "}
                    <strong>
                      {c2.choice === "loyal" ? "Loyalty" : "Betrayal"}
                    </strong>
                  </li>
                </ul>

                <p className="text">
                  Both finalists chose Betrayal. They lose their secondary
                  buy-ins and are eliminated from contention.
                </p>
                <p className="text small">
                  The two previously eliminated players now return for a final
                  Loyalty / Betrayal round:
                  {returningNames.length > 0 && (
                    <>
                      {" "}
                      {returningNames.join(" and ")}.
                    </>
                  )}
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleContinueStage2}
                >
                  Continue to Returning Players&apos; Round
                </button>
              </div>
            </div>
          );
        }

        const newLogEntry = {
          type: "loyalty",
          stage: 1,
          finalists: finalistsIds,
          choices: loyaltyChoices,
          winners,
          timestamp: Date.now(),
        };

        const updatedLog = Array.isArray(gameState.log)
          ? [...gameState.log, newLogEntry]
          : [newLogEntry];

        const handleContinue = () => {
          goTo("winner", {
            players: updatedPlayers,
            winners,
            log: updatedLog,
            loyaltyResult: {
              finalists: finalistsIds,
              choices: loyaltyChoices,
              description,
              stage: 1,
            },
          });
        };

        return (
          <div className="screen screen-reveal">
            <h1 className="title">Final Outcome</h1>

            <div className="card">
              <p className="text">Finalist decisions:</p>
              <ul className="list">
                <li className="list-item">
                  {f1.name}:{" "}
                  <strong>
                    {c1.choice === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </li>
                <li className="list-item">
                  {f2.name}:{" "}
                  <strong>
                    {c2.choice === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </li>
              </ul>

              <p className="text">{description}</p>

              {winners.length > 0 && (
                <>
                  <p className="text">
                    Winner{winners.length > 1 ? "s" : ""}:
                  </p>
                  <ul className="list">
                    {winners.map((id) => {
                      const w = players.find((p) => p.id === id);
                      if (!w) return null;
                      return (
                        <li key={w.id} className="list-item">
                          {w.name}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        );
      }

      // Stage 2: returning players
      if (loyaltyStage === 2) {
        let winners = [];
        let description = "";
        let updatedPlayers = [...players];

        if (bothLoyal) {
          winners = [f1.id, f2.id];
          description = `${f1.name} and ${f2.name} both chose Loyalty. They split the prize.`;
        } else if (f1Betray && !f2Betray) {
          winners = [f1.id];
          description = `${f1.name} chose Betrayal and ${f2.name} chose Loyalty. ${f1.name} takes the full prize.`;

          updatedPlayers = players.map((p) => {
            if (p.id === f2.id) {
              return { ...p, lostSecondary: true, eliminated: true };
            }
            return p;
          });
        } else if (f2Betray && !f1Betray) {
          winners = [f2.id];
          description = `${f2.name} chose Betrayal and ${f1.name} chose Loyalty. ${f2.name} takes the full prize.`;

          updatedPlayers = players.map((p) => {
            if (p.id === f1.id) {
              return { ...p, lostSecondary: true, eliminated: true };
            }
            return p;
          });
        } else if (bothBetray) {
          const poolIds = loyaltyStage1FinalistsIds.length
            ? loyaltyStage1FinalistsIds
            : finalistsIds;

          const pool = poolIds
            .map((id) => players.find((p) => p.id === id))
            .filter(Boolean);

          const randIndex = pool.length
            ? Math.floor(Math.random() * pool.length)
            : -1;
          const randomWinner = randIndex >= 0 ? pool[randIndex] : null;

          winners = randomWinner ? [randomWinner.id] : [];

          updatedPlayers = players.map((p) => {
            if (p.id === f1.id || p.id === f2.id) {
              return { ...p, lostSecondary: true, eliminated: true };
            }
            return p;
          });

          if (randomWinner) {
            description = `${f1.name} and ${f2.name} both chose Betrayal. They both lose their secondary buy-ins. A winner is chosen at random from the original finalists: ${randomWinner.name} wins the prize.`;
          } else {
            description = `${f1.name} and ${f2.name} both chose Betrayal. They both lose their secondary buy-ins. The intended winner (a random choice from the original finalists) could not be determined from the current state.`;
          }
        }

        const newLogEntry = {
          type: "loyalty",
          stage: 2,
          finalists: finalistsIds,
          choices: loyaltyChoices,
          winners,
          fromFinalistPool: loyaltyStage1FinalistsIds,
          timestamp: Date.now(),
        };

        const updatedLog = Array.isArray(gameState.log)
          ? [...gameState.log, newLogEntry]
          : [newLogEntry];

        const handleContinue = () => {
          goTo("winner", {
            players: updatedPlayers,
            winners,
            log: updatedLog,
            loyaltyResult: {
              finalists: finalistsIds,
              choices: loyaltyChoices,
              description,
              stage: 2,
            },
            randomOutcome:
              bothBetray && winners.length === 1
                ? {
                    type: "loyaltyStage2RandomFinalist",
                    description,
                  }
                : undefined,
          });
        };

        return (
          <div className="screen screen-reveal">
            <h1 className="title">Final Outcome</h1>

            <div className="card">
              <p className="text">Returning players&apos; decisions:</p>
              <ul className="list">
                <li className="list-item">
                  {f1.name}:{" "}
                  <strong>
                    {c1.choice === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </li>
                <li className="list-item">
                  {f2.name}:{" "}
                  <strong>
                    {c2.choice === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </li>
              </ul>

              <p className="text">{description}</p>

              {winners.length > 0 && (
                <>
                  <p className="text">
                    Winner{winners.length > 1 ? "s" : ""}:
                  </p>
                  <ul className="list">
                    {winners.map((id) => {
                      const w = players.find((p) => p.id === id);
                      if (!w) return null;
                      return (
                        <li key={w.id} className="list-item">
                          {w.name}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        );
      }

      // Unknown loyaltyStage for 4p
      return (
        <div className="screen screen-reveal">
          <h1 className="title">Outcome</h1>
          <div className="card">
            <p className="text">
              The game reached a loyalty outcome, but the stage could not be
              determined.
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

    // --- 5-PLAYER LOYALTY LOGIC (Part 1 and Part 2) ---
    if (numPlayers === 5) {
      // Part 1: after Round 2 alliance (currentRound === 3)
      if (currentRound === 3) {
        // both betray in Part 1 triggers the "everyone returns" branch
        if (bothBetray) {
          const returningIds = eliminatedInitialIds.slice(); // three eliminated players
          const updatedPlayers = players.map((p) => {
            // Finalists lose secondary and are eliminated
            if (p.id === f1.id || p.id === f2.id) {
              return { ...p, lostSecondary: true, eliminated: true };
            }
            // All previously eliminated players return
            if (returningIds.includes(p.id)) {
              return { ...p, eliminated: false };
            }
            return p;
          });

          const newLogEntry = {
            type: "loyalty5p",
            stage: 1,
            finalists: finalistsIds,
            choices: loyaltyChoices,
            winners: [],
            outcome: "bothBetrayAllEliminatedReturn",
            returningIds,
            timestamp: Date.now(),
          };

          const updatedLog = Array.isArray(gameState.log)
            ? [...gameState.log, newLogEntry]
            : [newLogEntry];

          const firstReturningId = returningIds[0];
          const nextIndex = updatedPlayers.findIndex(
            (p) => p.id === firstReturningId
          );

          const returningNames = returningIds
            .map((id) => players.find((p) => p.id === id))
            .filter(Boolean)
            .map((p) => p.name)
            .join(", ");

          const handleContinueToAlliance2 = () => {
            goTo("pass", {
              players: updatedPlayers,
              finalists: [],
              allianceChoices: [],
              loyaltyChoices: [],
              allianceAttempt: 1,
              log: updatedLog,
              currentPlayerIndex: nextIndex >= 0 ? nextIndex : 0,
              currentRound: 3, // Round 3 Part 2: new 3-player alliance
              lastPhase: "alliance",
              eliminatedInitialIds, // keep tracking the original eliminated pool
              eliminatedAllianceRoundId: null,
            });
          };

          return (
            <div className="screen screen-reveal">
              <h1 className="title">Loyalty / Betrayal Result</h1>
              <div className="card">
                <p className="text">Finalist decisions:</p>
                <ul className="list">
                  <li className="list-item">
                    {f1.name}:{" "}
                    <strong>
                      {c1.choice === "loyal" ? "Loyalty" : "Betrayal"}
                    </strong>
                  </li>
                  <li className="list-item">
                    {f2.name}:{" "}
                    <strong>
                      {c2.choice === "loyal" ? "Loyalty" : "Betrayal"}
                    </strong>
                  </li>
                </ul>

                <p className="text">
                  Both finalists chose Betrayal. They lose their secondary
                  buy-ins and are eliminated.
                </p>
                <p className="text small">
                  All three previously eliminated players now return to the
                  game: {returningNames}. They will play a new 3-player
                  alliance round.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={handleContinueToAlliance2}
                >
                  Continue to new alliance round
                </button>
              </div>
            </div>
          );
        }

        // Non-nuclear outcomes for Part 1 (both loyal / single betray)
        let winners = [];
        let description = "";
        let updatedPlayers = [...players];

        if (bothLoyal) {
          winners = [f1.id, f2.id];
          description = `${f1.name} and ${f2.name} both chose Loyalty. They split the prize.`;
        } else if (f1Betray && !f2Betray) {
          winners = [f1.id];
          description = `${f1.name} chose Betrayal and ${f2.name} chose Loyalty. ${f1.name} takes the full prize.`;

          updatedPlayers = players.map((p) => {
            if (p.id === f2.id) {
              return { ...p, lostSecondary: true };
            }
            return p;
          });
        } else if (f2Betray && !f1Betray) {
          winners = [f2.id];
          description = `${f2.name} chose Betrayal and ${f1.name} chose Loyalty. ${f2.name} takes the full prize.`;

          updatedPlayers = players.map((p) => {
            if (p.id === f1.id) {
              return { ...p, lostSecondary: true };
            }
            return p;
          });
        }

        const newLogEntry = {
          type: "loyalty5p",
          stage: 1,
          finalists: finalistsIds,
          choices: loyaltyChoices,
          winners,
          timestamp: Date.now(),
        };

        const updatedLog = Array.isArray(gameState.log)
          ? [...gameState.log, newLogEntry]
          : [newLogEntry];

        const handleContinue = () => {
          goTo("winner", {
            players: updatedPlayers,
            winners,
            log: updatedLog,
            loyaltyResult: {
              finalists: finalistsIds,
              choices: loyaltyChoices,
              description,
              stage: 1,
            },
          });
        };

        return (
          <div className="screen screen-reveal">
            <h1 className="title">Final Outcome</h1>

            <div className="card">
              <p className="text">Finalist decisions:</p>
              <ul className="list">
                <li className="list-item">
                  {f1.name}:{" "}
                  <strong>
                    {c1.choice === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </li>
                <li className="list-item">
                  {f2.name}:{" "}
                  <strong>
                    {c2.choice === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </li>
              </ul>

              <p className="text">{description}</p>

              {winners.length > 0 && (
                <>
                  <p className="text">
                    Winner{winners.length > 1 ? "s" : ""}:
                  </p>
                  <ul className="list">
                    {winners.map((id) => {
                      const w = players.find((p) => p.id === id);
                      if (!w) return null;
                      return (
                        <li key={w.id} className="list-item">
                          {w.name}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        );
      }

      // Part 2: after Round 3 Part 2 alliance (currentRound === 4)
      if (currentRound === 4) {
        let winners = [];
        let description = "";
        let updatedPlayers = [...players];

        if (bothLoyal) {
          winners = [f1.id, f2.id];
          description = `${f1.name} and ${f2.name} both chose Loyalty. They split the prize.`;
        } else if (f1Betray && !f2Betray) {
          winners = [f1.id];
          description = `${f1.name} chose Betrayal and ${f2.name} chose Loyalty. ${f1.name} takes the full prize.`;

          updatedPlayers = players.map((p) => {
            if (p.id === f2.id) {
              return { ...p, lostSecondary: true };
            }
            return p;
          });
        } else if (f2Betray && !f1Betray) {
          winners = [f2.id];
          description = `${f2.name} chose Betrayal and ${f1.name} chose Loyalty. ${f2.name} takes the full prize.`;

          updatedPlayers = players.map((p) => {
            if (p.id === f1.id) {
              return { ...p, lostSecondary: true };
            }
            return p;
          });
        } else if (bothBetray) {
          // Special rule: if both betray in Part 2, the player eliminated
          // in the preceding alliance round (Round 3 Part 2) becomes the winner.
          const specialWinner = players.find(
            (p) => p.id === eliminatedAllianceRoundId
          );

          if (specialWinner) {
            winners = [specialWinner.id];
            description = `${f1.name} and ${f2.name} both chose Betrayal in the final loyalty round. The player eliminated in the previous alliance round, ${specialWinner.name}, wins the prize.`;
          } else {
            description = `${f1.name} and ${f2.name} both chose Betrayal in the final loyalty round. The intended winner (the player eliminated in the previous alliance round) could not be determined from the current state.`;
          }

          updatedPlayers = players.map((p) => {
            if (p.id === f1.id || p.id === f2.id) {
              return { ...p, lostSecondary: true, eliminated: true };
            }
            return p;
          });
        }

        const newLogEntry = {
          type: "loyalty5p",
          stage: 2,
          finalists: finalistsIds,
          choices: loyaltyChoices,
          winners,
          eliminatedAllianceRoundId,
          timestamp: Date.now(),
        };

        const updatedLog = Array.isArray(gameState.log)
          ? [...gameState.log, newLogEntry]
          : [newLogEntry];

        const handleContinue = () => {
          goTo("winner", {
            players: updatedPlayers,
            winners,
            log: updatedLog,
            loyaltyResult: {
              finalists: finalistsIds,
              choices: loyaltyChoices,
              description,
              stage: 2,
            },
          });
        };

        return (
          <div className="screen screen-reveal">
            <h1 className="title">Final Outcome</h1>

            <div className="card">
              <p className="text">Finalist decisions:</p>
              <ul className="list">
                <li className="list-item">
                  {f1.name}:{" "}
                  <strong>
                    {c1.choice === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </li>
                <li className="list-item">
                  {f2.name}:{" "}
                  <strong>
                    {c2.choice === "loyal" ? "Loyalty" : "Betrayal"}
                  </strong>
                </li>
              </ul>

              <p className="text">{description}</p>

              {winners.length > 0 && (
                <>
                  <p className="text">
                    Winner{winners.length > 1 ? "s" : ""}:
                  </p>
                  <ul className="list">
                    {winners.map((id) => {
                      const w = players.find((p) => p.id === id);
                      if (!w) return null;
                      return (
                        <li key={w.id} className="list-item">
                          {w.name}
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}

              <button
                type="button"
                className="primary-button"
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        );
      }

      // Unknown 5p round
      return (
        <div className="screen screen-reveal">
          <h1 className="title">Outcome</h1>
          <div className="card">
            <p className="text">
              The game reached a loyalty outcome in 5-player mode, but the round
              could not be determined.
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

    // Unknown numPlayers for loyalty
    return (
      <div className="screen screen-reveal">
        <h1 className="title">Outcome</h1>
        <div className="card">
          <p className="text">
            The game reached a loyalty outcome, but this player count is not
            fully supported yet.
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

  // Fallback if lastPhase is unknown
  return (
    <div className="screen screen-reveal">
      <h1 className="title">Outcome</h1>
      <div className="card">
        <p className="text">
          The game reached an outcome state, but the previous phase could not be
          determined.
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

export default OutcomeReveal;
