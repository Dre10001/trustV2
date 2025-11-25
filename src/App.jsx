// src/App.jsx
import React, { useState } from "react";

import PlayerSetup from "./components/PlayerSetup.jsx";
import PassDevice from "./components/PassDevice.jsx";
import AllianceSelection from "./components/AllianceSelection.jsx";
import LoyaltyBetrayal from "./components/LoyaltyBetrayal.jsx";
import OutcomeReveal from "./components/OutcomeReveal.jsx";
import GameLog from "./components/GameLog.jsx";
import WinnerScreen from "./components/WinnerScreen.jsx";
import Rules from "./components/Rules.jsx";

// -----------------------------------------------------------------------------
// Full clean initial state — everything that must be wiped before each new game
// -----------------------------------------------------------------------------
const initialGameState = {
  players: [],
  settings: null,

  // Round-specific decisions (MUST reset between games)
  allianceChoices: [],
  loyaltyChoices: [],

  // Structural round results
  finalists: [],
  eliminatedFirstRound: null,
  winners: [],

  // Meta
  log: [],
  currentPlayerIndex: 0,
  lastPhase: "init",

  // New: track how many times we've tried to form an alliance this round
  allianceAttempt: 0,
};

function App() {
  const [screen, setScreen] = useState("setup");
  const [gameState, setGameState] = useState(initialGameState);

  // ---------------------------------------------------------------------------
  // Core navigation function
  // - If navigating to "setup", wipe everything and start fresh
  // - Otherwise, merge updates normally
  // ---------------------------------------------------------------------------
  const goTo = (nextScreen, data = {}) => {
    if (nextScreen === "setup") {
      // Hard reset ensures second + third + later games behave correctly
      setGameState({
        ...initialGameState,
        ...data,
      });
    } else {
      // Normal update during game flow
      setGameState((prev) => ({
        ...prev,
        ...data,
      }));
    }

    setScreen(nextScreen);
  };

  return (
    <>
      {screen === "setup" && <PlayerSetup goTo={goTo} />}

      {screen === "rules" && <Rules goTo={goTo} />}

      {screen === "pass" && (
        <PassDevice goTo={goTo} gameState={gameState} />
      )}

      {screen === "alliance" && (
        <AllianceSelection goTo={goTo} gameState={gameState} />
      )}

      {screen === "loyalty" && (
        <LoyaltyBetrayal goTo={goTo} gameState={gameState} />
      )}

      {screen === "reveal" && (
        <OutcomeReveal goTo={goTo} gameState={gameState} />
      )}

      {screen === "winner" && (
        <WinnerScreen goTo={goTo} gameState={gameState} />
      )}

      {screen === "log" && (
        <GameLog goTo={goTo} gameState={gameState} />
      )}
    </>
  );
}

export default App;
