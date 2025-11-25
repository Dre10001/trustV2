// src/components/Rules.jsx
import React from "react";

function Rules({ goTo }) {
  const handleBack = () => {
    // This will reset the setup state when returning.
    // If you ever want to preserve entered names, we can refactor App.goTo later.
    goTo("setup", {});
  };

  return (
    <div className="screen screen-rules">
      <h1 className="title">How to Play TRUST</h1>

      <div className="card rules-card">
        <p className="text">
          TRUST is a psychological strategy game for 3–5{" "}
          <strong>players or teams</strong>. Everyone puts in two stakes
          (primary and secondary). Together these form the prize pot. Players
          survive eliminations, form alliances, and then choose Loyalty or
          Betrayal in the final rounds.
        </p>

        <h2 className="section-title">Set-up</h2>
        <ul className="list">
          <li className="list-item">
            Play with <strong>3–5 players</strong>, or split into{" "}
            <strong>teams</strong> and treat each team as a single player.
          </li>
          <li className="list-item">
            Each player/team contributes two stakes:
            <ul className="list nested-list">
              <li className="list-item small">
                <strong>Primary buy-in</strong> – lost if you are eliminated
                early.
              </li>
              <li className="list-item small">
                <strong>Secondary buy-in</strong> – lost if you are punished in
                a final Betrayal scenario.
              </li>
            </ul>
          </li>
          <li className="list-item">
            All stakes go into <strong>one shared prize pool</strong>.
          </li>
          <li className="list-item">
            Decide who is holding the device. It will be{" "}
            <strong>passed around secretly</strong>.
          </li>
        </ul>

        <h2 className="section-title">Core rules</h2>
        <ul className="list">
          <li className="list-item">
            <strong>Hidden decisions:</strong> Only the active player/team can
            see the screen when making a choice.
          </li>
          <li className="list-item">
            <strong>Random option:</strong> In alliance rounds, you can choose
            another player/team or select <strong>Random</strong>. Random will
            secretly pick an eligible target for you.
          </li>
          <li className="list-item">
            <strong>Post-game reveal (optional):</strong> After the game, you
            may choose to show everyone:
            <ul className="list nested-list">
              <li className="list-item small">Who chose which alliances</li>
              <li className="list-item small">
                Who chose Loyalty or Betrayal
              </li>
              <li className="list-item small">
                All eliminations, returns, and final outcomes
              </li>
            </ul>
          </li>
        </ul>

        <h2 className="section-title">3-player mode</h2>
        <ol className="list numbered-list">
          <li className="list-item">
            <strong>Round 1 – Alliance selection</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                Each player secretly picks one other player to ally with (or
                Random).
              </li>
              <li className="list-item small">
                If exactly two players choose each other, they form an alliance
                and go to the final. The third player is eliminated and loses
                their primary buy-in.
              </li>
              <li className="list-item small">
                If there is no mutual alliance after up to three attempts, the
                prize goes to the player who was eliminated.
              </li>
            </ul>
          </li>
          <li className="list-item">
            <strong>Round 2 – Loyalty vs Betrayal</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                Both choose <strong>Loyalty</strong> → they split the prize.
              </li>
              <li className="list-item small">
                One chooses <strong>Betrayal</strong>, the other Loyalty → the
                betrayer takes the full prize; the loyal player loses their
                secondary buy-in.
              </li>
              <li className="list-item small">
                Both choose <strong>Betrayal</strong> → both lose their
                secondary buy-ins; the player eliminated in Round 1 wins the
                entire prize.
              </li>
            </ul>
          </li>
        </ol>

        <h2 className="section-title">4-player mode</h2>
        <ol className="list numbered-list">
          <li className="list-item">
            <strong>Round 1 – Random elimination</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                One player/team is randomly eliminated and loses their primary
                buy-in.
              </li>
            </ul>
          </li>
          <li className="list-item">
            <strong>Round 2 – Alliance selection (3 players)</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                The remaining three try to form a mutual alliance (up to three
                attempts).
              </li>
              <li className="list-item small">
                If an alliance forms, two advance; the remaining player is
                eliminated (loses primary buy-in).
              </li>
              <li className="list-item small">
                If no alliance after three attempts, the prize goes to the
                player randomly eliminated in Round 1.
              </li>
            </ul>
          </li>
          <li className="list-item">
            <strong>Round 3 – Loyalty vs Betrayal (Part 1)</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                Both loyal → split the prize.
              </li>
              <li className="list-item small">
                One betrays → betrayer takes the prize; the loyal finalist loses
                their secondary buy-in.
              </li>
              <li className="list-item small">
                Both betray → both finalists lose secondary buy-ins and are
                eliminated; the previously eliminated players return.
              </li>
            </ul>
          </li>
          <li className="list-item">
            <strong>Round 4 – Loyalty vs Betrayal (Part 2)</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                Both loyal → split the prize.
              </li>
              <li className="list-item small">
                One betrays → betrayer takes the prize; the loyal player loses
                their secondary buy-in.
              </li>
              <li className="list-item small">
                Both betray → winner is chosen at random from the original
                finalists from Part 1.
              </li>
            </ul>
          </li>
        </ol>

        <h2 className="section-title">5-player mode</h2>
        <ol className="list numbered-list">
          <li className="list-item">
            <strong>Round 1 – Random elimination</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                Two players/teams are randomly eliminated and lose their primary
                buy-ins.
              </li>
            </ul>
          </li>
          <li className="list-item">
            <strong>Round 2 – Alliance selection (3 players)</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                The remaining three try to form a mutual alliance (up to three
                attempts).
              </li>
              <li className="list-item small">
                If an alliance forms, two advance; the remaining player is
                eliminated (loses primary buy-in).
              </li>
              <li className="list-item small">
                If no alliance after three attempts, the prize is awarded to the
                two players randomly eliminated in Round 1.
              </li>
            </ul>
          </li>
          <li className="list-item">
            <strong>Round 3 – Loyalty vs Betrayal (Part 1)</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                Both loyal → split the prize.
              </li>
              <li className="list-item small">
                One betrays → betrayer takes the prize; the loyal finalist loses
                their secondary buy-in.
              </li>
              <li className="list-item small">
                Both betray → all three previously eliminated players return;
                both finalists lose secondary buy-ins and are eliminated.
              </li>
            </ul>
          </li>
          <li className="list-item">
            <strong>Round 3 (Part 2) – New alliance round (3 players)</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                The three returning players run a fresh alliance round (same 3
                attempts rule).
              </li>
              <li className="list-item small">
                If an alliance forms, two finalists advance; the remaining
                player is eliminated.
              </li>
            </ul>
          </li>
          <li className="list-item">
            <strong>Round 4 – Loyalty vs Betrayal (Part 2)</strong>
            <ul className="list nested-list">
              <li className="list-item small">
                Both loyal → split the prize.
              </li>
              <li className="list-item small">
                One betrays → betrayer takes the prize; the loyal player loses
                their secondary buy-in.
              </li>
              <li className="list-item small">
                Both betray → the player eliminated in the previous alliance
                round becomes the winner.
              </li>
            </ul>
          </li>
        </ol>

        <h2 className="section-title">Endgame</h2>
        <ul className="list">
          <li className="list-item">
            The winner (or winners) receive the full prize pool as agreed at the
            start.
          </li>
          <li className="list-item">
            Groups may optionally reveal all hidden decisions (alliances,
            Loyalty/Betrayal choices, random selections, eliminations and
            returns).
          </li>
        </ul>

        <button
          type="button"
          className="primary-button rules-back-button"
          onClick={handleBack}
        >
          Back to setup
        </button>
      </div>
    </div>
  );
}

export default Rules;
