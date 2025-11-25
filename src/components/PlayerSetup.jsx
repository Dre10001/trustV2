// src/components/PlayerSetup.jsx
import React, { useState, useEffect } from "react";

function PlayerSetup({ goTo }) {
  const [numPlayers, setNumPlayers] = useState(3);
  const [primaryBuyIn, setPrimaryBuyIn] = useState(1);
  const [secondaryBuyIn, setSecondaryBuyIn] = useState(1);
  const [players, setPlayers] = useState([
    { id: 1, name: "Player 1" },
    { id: 2, name: "Player 2" },
    { id: 3, name: "Player 3" },
  ]);

  // Keep players array in sync with numPlayers
  useEffect(() => {
    setPlayers((prev) => {
      const updated = [...prev];

      // If more players needed, add them
      while (updated.length < numPlayers) {
        const id = updated.length + 1;
        updated.push({ id, name: `Player ${id}` });
      }

      // If too many players, trim
      if (updated.length > numPlayers) {
        return updated.slice(0, numPlayers);
      }

      return updated;
    });
  }, [numPlayers]);

  const handleNameChange = (id, newName) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, name: newName } : p))
    );
  };

  const handleStart = (e) => {
    e.preventDefault();

    // Basic validation
    if (numPlayers < 3 || numPlayers > 5) return;

    // Convert buy-ins to numbers (you can later expose these as inputs)
    const cleanPrimary = Number(primaryBuyIn) || 0;
    const cleanSecondary = Number(secondaryBuyIn) || 0;

    // Normalise players
    let initialPlayers = players.map((p) => ({
      id: p.id,
      name: p.name.trim() || `Player ${p.id}`,
      eliminated: false,
      lostPrimary: false,
      lostSecondary: false,
    }));

    let log = [];
    let eliminatedRandomFirstRoundId = null;
    let eliminatedInitialIds = [];

    // Determine starting round and phase
    let startingRound = 1;
    let startingPhase = "pre-round";

    // 4-player mode: Round 1 random elimination (one player)
    if (numPlayers === 4) {
      if (initialPlayers.length !== 4) {
        // Defensive: ensure we actually have 4
        initialPlayers = [...initialPlayers];
        while (initialPlayers.length < 4) {
          const id = initialPlayers.length + 1;
          initialPlayers.push({
            id,
            name: `Player ${id}`,
            eliminated: false,
            lostPrimary: false,
            lostSecondary: false,
          });
        }
        if (initialPlayers.length > 4) {
          initialPlayers = initialPlayers.slice(0, 4);
        }
      }

      const randomIndex = Math.floor(Math.random() * initialPlayers.length);
      const eliminatedPlayer = initialPlayers[randomIndex];

      initialPlayers = initialPlayers.map((p) =>
        p.id === eliminatedPlayer.id
          ? { ...p, eliminated: true, lostPrimary: true }
          : p
      );

      eliminatedRandomFirstRoundId = eliminatedPlayer.id;
      eliminatedInitialIds = [eliminatedPlayer.id];

      log.push({
        type: "randomElimination4p",
        eliminatedPlayerId: eliminatedPlayer.id,
        timestamp: Date.now(),
      });

      startingRound = 2;
      startingPhase = "post-random-elimination";
    }

    // 5-player mode: Round 1 random elimination (two players)
    if (numPlayers === 5) {
      if (initialPlayers.length !== 5) {
        // Defensive: ensure we actually have 5
        initialPlayers = [...initialPlayers];
        while (initialPlayers.length < 5) {
          const id = initialPlayers.length + 1;
          initialPlayers.push({
            id,
            name: `Player ${id}`,
            eliminated: false,
            lostPrimary: false,
            lostSecondary: false,
          });
        }
        if (initialPlayers.length > 5) {
          initialPlayers = initialPlayers.slice(0, 5);
        }
      }

      // Pick two distinct random players to eliminate
      const indices = [0, 1, 2, 3, 4];
      const shuffled = indices
        .map((i) => ({ i, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map((x) => x.i);

      const firstIndex = shuffled[0];
      const secondIndex = shuffled[1];

      const eliminatedPlayerA = initialPlayers[firstIndex];
      const eliminatedPlayerB = initialPlayers[secondIndex];

      const eliminatedIds = [eliminatedPlayerA.id, eliminatedPlayerB.id];

      initialPlayers = initialPlayers.map((p) =>
        eliminatedIds.includes(p.id)
          ? { ...p, eliminated: true, lostPrimary: true }
          : p
      );

      eliminatedInitialIds = eliminatedIds;

      log.push({
        type: "randomElimination5p",
        eliminatedPlayerIds: eliminatedIds,
        timestamp: Date.now(),
      });

      startingRound = 2;
      startingPhase = "post-random-elimination";
    }

    // Starting player: first non-eliminated player
    const startingPlayerIndex = (() => {
      const idx = initialPlayers.findIndex((p) => !p.eliminated);
      return idx === -1 ? 0 : idx;
    })();

    // Initial game state for a NEW game
    const initialState = {
      settings: {
        numPlayers,
        primaryBuyIn: cleanPrimary,
        secondaryBuyIn: cleanSecondary,
      },
      players: initialPlayers,
      log,
      currentRound: startingRound,
      phase: startingPhase,
      currentPlayerIndex: startingPlayerIndex,
      finalists: [],
      eliminatedThisRound: [],
      allianceAttempt: 1, // first attempt at forming an alliance

      // 4- & 5-player initial elimination metadata
      eliminatedRandomFirstRoundId,
      eliminatedInitialIds,
    };

    goTo("pass", initialState);
  };

  return (
    <div className="screen screen-setup">
      <h1 className="title">TRUST</h1>
      <p className="subtitle">A Game of Alliances, Betrayal, and Loyalty</p>
      <p className="subtitle small">
        Play with individual players or teams. Each team counts as one player.
      </p>

      <form className="card" onSubmit={handleStart}>
        <div className="field-group">
          <label className="label">Number of players/Teams</label>
          <div className="pill-row">
            {[3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={`pill ${numPlayers === n ? "pill-active" : ""}`}
                onClick={() => setNumPlayers(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label className="label">Player/Team names</label>
          <div className="player-list">
            {players.map((p) => (
              <div key={p.id} className="player-row">
                <span className="player-label">{p.id}.</span>
                <input
                  type="text"
                  className="input"
                  value={p.name}
                  onChange={(e) => handleNameChange(p.id, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" className="primary-button">
          Start Game
        </button>

        <button
          type="button"
          className="secondary-button"
          onClick={() => goTo("rules", {})}
          style={{ marginTop: "0.75rem" }}
        >
          View rules
        </button>
      </form>
    </div>
  );
}

export default PlayerSetup;
