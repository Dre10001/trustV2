// src/components/GameLog.jsx
import React from "react";

function formatTime(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function GameLog({ goTo, gameState }) {
  const log = Array.isArray(gameState?.log) ? gameState.log : [];
  const players = gameState?.players || [];

  const getPlayerName = (id) => {
    const p = players.find((pl) => pl.id === id);
    return p ? p.name : `Player ${id}`;
  };

  const handleBack = () => {
    goTo("winner", {});
  };

  return (
    <div className="screen screen-log">
      <h1 className="title">Game Log</h1>
      <div className="card">
        <ul className="log-list">
          {log.map((entry, index) => {
            // 4-player: Round 1 random elimination
            if (entry.type === "randomElimination4p") {
              const name = getPlayerName(entry.eliminatedPlayerId);
              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">Random Elimination</span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      {name} was randomly eliminated and loses their primary
                      buy-in.
                    </p>
                    <p className="log-text small">
                      They can still come back to win the overall prize later in
                      the game.
                    </p>
                  </div>
                </li>
              );
            }

            // 5-player: Round 1 random eliminations (two players)
            if (entry.type === "randomElimination5p") {
              const ids = Array.isArray(entry.eliminatedPlayerIds)
                ? entry.eliminatedPlayerIds
                : [];
              const names = ids.map(getPlayerName);

              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">Random Eliminations</span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      The following players were randomly eliminated and lose
                      their primary buy-ins:
                    </p>
                    <p className="log-text">
                      <strong>{names.join(" and ")}</strong>.
                    </p>
                    <p className="log-text small">
                      Depending on what happens later, they may still end up
                      with the prize.
                    </p>
                  </div>
                </li>
              );
            }

            // Alliance formed normally (3p, 4p, or 5p)
            if (entry.type === "alliance") {
              const finalists = (entry.finalists || []).map(getPlayerName);
              const eliminatedName = entry.eliminated
                ? getPlayerName(entry.eliminated)
                : null;

              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">Alliance Round</span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      A mutual alliance was formed between{" "}
                      <strong>{finalists.join(" and ")}</strong>.
                    </p>
                    {eliminatedName && (
                      <p className="log-text small">
                        {eliminatedName} was left out of the alliance and is
                        eliminated from this round (loses primary buy-in).
                      </p>
                    )}
                  </div>
                </li>
              );
            }

            // 3p: No alliance after 3 attempts → random winner from actives
            if (entry.type === "noAllianceRandomWinner") {
              const attempts = entry.attempts || 3;
              const winners = (entry.winners || []).map(getPlayerName);
              const allianceChoices = Array.isArray(entry.allianceChoices)
                ? entry.allianceChoices
                : [];

              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">
                      Alliance Round – No Mutual Alliance
                    </span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      No mutual alliance was formed after {attempts} attempts.
                    </p>

                    {allianceChoices.length > 0 && (
                      <>
                        <p className="log-text small">
                          Final attempt choices:
                        </p>
                        {allianceChoices.map((c, i) => {
                          const chooser = getPlayerName(c.playerId);
                          const target = c.targetId
                            ? getPlayerName(c.targetId)
                            : "no one";
                          return (
                            <p key={i} className="log-text small">
                              {chooser} chose {target}.
                            </p>
                          );
                        })}
                      </>
                    )}

                    {winners.length > 0 && (
                      <p className="log-text">
                        A random winner was selected to receive the full primary
                        and secondary prize pot:{" "}
                        <strong>{winners.join(", ")}</strong>.
                      </p>
                    )}
                  </div>
                </li>
              );
            }

            // 4p: No alliance after 3 attempts → pot goes to Round 1 eliminated
            if (entry.type === "noAlliancePrizeToEliminated4p") {
              const attempts = entry.attempts || 3;
              const winners = (entry.winners || []).map(getPlayerName);
              const allianceChoices = Array.isArray(entry.allianceChoices)
                ? entry.allianceChoices
                : [];

              const round1Id = entry.eliminatedRandomFirstRoundId;
              const round1Name = round1Id ? getPlayerName(round1Id) : null;

              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">
                      Alliance Round – No Mutual Alliance
                    </span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      No mutual alliance was formed after {attempts} attempts.
                    </p>

                    {allianceChoices.length > 0 && (
                      <>
                        <p className="log-text small">
                          Final attempt choices:
                        </p>
                        {allianceChoices.map((c, i) => {
                          const chooser = getPlayerName(c.playerId);
                          const target = c.targetId
                            ? getPlayerName(c.targetId)
                            : "no one";
                          return (
                            <p key={i} className="log-text small">
                              {chooser} chose {target}.
                            </p>
                          );
                        })}
                      </>
                    )}

                    {round1Name && winners.length > 0 && (
                      <p className="log-text">
                        As no alliance was formed, the full prize pot goes to{" "}
                        <strong>{round1Name}</strong>, the player who was
                        randomly eliminated in Round 1.
                      </p>
                    )}
                  </div>
                </li>
              );
            }

            // 5p: No alliance after 3 attempts in Round 2 → pot goes to Round 1 eliminations
            if (entry.type === "noAlliancePrizeToEliminated5p") {
              const attempts = entry.attempts || 3;
              const winners = (entry.winners || []).map(getPlayerName);
              const allianceChoices = Array.isArray(entry.allianceChoices)
                ? entry.allianceChoices
                : [];

              const eliminatedIds = Array.isArray(entry.eliminatedInitialIds)
                ? entry.eliminatedInitialIds
                : [];
              const initialNames = eliminatedIds.map(getPlayerName);

              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">
                      Alliance Round – No Mutual Alliance
                    </span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      No mutual alliance was formed after {attempts} attempts.
                    </p>

                    {allianceChoices.length > 0 && (
                      <>
                        <p className="log-text small">
                          Final attempt choices:
                        </p>
                        {allianceChoices.map((c, i) => {
                          const chooser = getPlayerName(c.playerId);
                          const target = c.targetId
                            ? getPlayerName(c.targetId)
                            : "no one";
                          return (
                            <p key={i} className="log-text small">
                              {chooser} chose {target}.
                            </p>
                          );
                        })}
                      </>
                    )}

                    {initialNames.length > 0 && winners.length > 0 && (
                      <p className="log-text">
                        Because no alliance was formed, the prize goes to the
                        players who were randomly eliminated in Round 1:{" "}
                        <strong>{initialNames.join(" and ")}</strong>.
                      </p>
                    )}
                  </div>
                </li>
              );
            }

            // 5p: No alliance after 3 attempts in a later round → random winner
            if (entry.type === "noAllianceRandomWinnerLater5p") {
              const attempts = entry.attempts || 3;
              const winners = (entry.winners || []).map(getPlayerName);
              const allianceChoices = Array.isArray(entry.allianceChoices)
                ? entry.allianceChoices
                : [];

              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">
                      Alliance Round – No Mutual Alliance
                    </span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      No mutual alliance was formed after {attempts} attempts.
                    </p>

                    {allianceChoices.length > 0 && (
                      <>
                        <p className="log-text small">
                          Final attempt choices:
                        </p>
                        {allianceChoices.map((c, i) => {
                          const chooser = getPlayerName(c.playerId);
                          const target = c.targetId
                            ? getPlayerName(c.targetId)
                            : "no one";
                          return (
                            <p key={i} className="log-text small">
                              {chooser} chose {target}.
                            </p>
                          );
                        })}
                      </>
                    )}

                    {winners.length > 0 && (
                      <p className="log-text">
                        A random winner was selected to receive the full primary
                        and secondary prize pot:{" "}
                        <strong>{winners.join(", ")}</strong>.
                      </p>
                    )}
                  </div>
                </li>
              );
            }

            // 4p loyalty / betrayal rounds
            if (entry.type === "loyalty4p") {
              const winners = (entry.winners || []).map(getPlayerName);
              const finalists = (entry.finalists || []).map(getPlayerName);
              const stage = entry.stage || 1;
              const outcome = entry.outcome || "";

              const fromInitialPool = Array.isArray(entry.fromInitialPoolIds)
                ? entry.fromInitialPoolIds.map(getPlayerName)
                : [];
              const fromFinalistPool = Array.isArray(
                entry.fromFinalistPoolIds
              )
                ? entry.fromFinalistPoolIds.map(getPlayerName)
                : [];

              const specialWinner = entry.specialElimWinnerId
                ? getPlayerName(entry.specialElimWinnerId)
                : null;
              const isSpecialElimWinner =
                typeof entry.specialElimWinnerId === "number";

              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">Loyalty / Betrayal Round</span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      Finalists:{" "}
                      <strong>{finalists.join(" and ")}</strong>.
                    </p>

                    {winners.length > 0 && (
                      <p className="log-text">
                        Winner{winners.length > 1 ? "s" : ""}:{" "}
                        <strong>{winners.join(", ")}</strong>.
                      </p>
                    )}

                    {stage === 1 &&
                      outcome === "bothBetrayFinalistsReturnedPlayers" && (
                        <p className="log-text small">
                          Both finalists chose Betrayal. They lose their
                          secondary buy-ins and are eliminated, and the two
                          previously eliminated players return for a final
                          Loyalty / Betrayal round.
                        </p>
                      )}

                    {stage === 2 &&
                      fromFinalistPool.length > 0 &&
                      winners.length === 1 && (
                        <p className="log-text small">
                          Because both returning players chose Betrayal, the
                          winner was chosen at random from the original
                          finalists.
                        </p>
                      )}

                    {isSpecialElimWinner && specialWinner && (
                      <p className="log-text small">
                        Because both finalists chose Betrayal in the final
                        loyalty round, the prize goes to{" "}
                        <strong>{specialWinner}</strong>, the player who was
                        eliminated in the previous alliance round.
                      </p>
                    )}
                  </div>
                </li>
              );
            }

            // 5p loyalty / betrayal rounds
            if (entry.type === "loyalty5p") {
              const winners = (entry.winners || []).map(getPlayerName);
              const finalists = (entry.finalists || []).map(getPlayerName);
              const stage = entry.stage || 1;
              const outcome = entry.outcome || "";

              const returningIds = Array.isArray(entry.returningIds)
                ? entry.returningIds
                : [];
              const returningNames = returningIds.map(getPlayerName);

              const specialElimWinnerId = entry.specialElimWinnerId;
              const isSpecialElimWinner =
                typeof specialElimWinnerId === "number";
              const specialWinnerName = isSpecialElimWinner
                ? getPlayerName(specialElimWinnerId)
                : null;

              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">Loyalty / Betrayal Round</span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      Finalists:{" "}
                      <strong>{finalists.join(" and ")}</strong>.
                    </p>

                    {winners.length > 0 && (
                      <p className="log-text">
                        Winner{winners.length > 1 ? "s" : ""}:{" "}
                        <strong>{winners.join(", ")}</strong>.
                      </p>
                    )}

                    {stage === 1 &&
                      outcome === "bothBetrayAllEliminatedReturn" && (
                        <p className="log-text small">
                          Both finalists chose Betrayal. They lose their
                          secondary buy-ins and are eliminated. All three
                          previously eliminated players return to the game for a
                          new 3-player alliance round{" "}
                          {returningNames.length > 0 && (
                            <>
                              (
                              <strong>
                                {returningNames.join(", ")}
                              </strong>
                              ).
                            </>
                          )}
                        </p>
                      )}

                    {isSpecialElimWinner && specialWinnerName && (
                      <p className="log-text small">
                        Because both finalists chose Betrayal in the final
                        loyalty round, the prize goes to{" "}
                        <strong>{specialWinnerName}</strong>, the player who was
                        eliminated in the previous alliance round.
                      </p>
                    )}
                  </div>
                </li>
              );
            }

            // 2-player trust mode: per-round summary
            if (entry.type === "twoPlayerRound") {
              const round = entry.round || 1;
              const potBefore =
                typeof entry.potBefore === "number" ? entry.potBefore : 0;
              const potAfter =
                typeof entry.potAfter === "number"
                  ? entry.potAfter
                  : potBefore;
              const outcome = entry.outcome || "";
              const choices = Array.isArray(entry.choices)
                ? entry.choices
                : [];

              const playerIds = [entry.player1Id, entry.player2Id].filter(
                (id) => id !== undefined && id !== null
              );

              const describePlayer = (playerId) => {
                const name = getPlayerName(playerId);
                const c = choices.find((x) => x.playerId === playerId);
                if (!c) {
                  return `${name}: no recorded choice.`;
                }
                const choiceLabel =
                  c.choice === "betray" ? "Betrayal" : "Loyalty";
                const predictionLabel = c.prediction
                  ? c.prediction === "betray"
                    ? "predicted Betrayal"
                    : "predicted Loyalty"
                  : "no prediction";
                return `${name}: ${choiceLabel} (${predictionLabel})`;
              };

              return (
                <li key={index} className="log-item">
                  <div className="log-header">
                    <span className="log-type">2-Player Round {round}</span>
                    <span className="log-time">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="log-body">
                    <p className="log-text">
                      Pot: {potBefore} → {potAfter}
                    </p>
                    {playerIds.map((id) => (
                      <p key={id} className="log-text small">
                        {describePlayer(id)}
                      </p>
                    ))}
                    {outcome && (
                      <p className="log-text small">
                        Outcome: {outcome.replace(/_/g, " ")}
                      </p>
                    )}
                  </div>
                </li>
              );
            }

            // Fallback: show raw entry
            return (
              <li key={index} className="log-item">
                <div className="log-header">
                  <span className="log-type">Event</span>
                  <span className="log-time">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
                <div className="log-body">
                  <p className="log-text small">
                    An internal game event occurred:
                  </p>
                  <pre className="log-text small">
                    {JSON.stringify(entry, null, 2)}
                  </pre>
                </div>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="primary-button"
          onClick={handleBack}
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default GameLog;
