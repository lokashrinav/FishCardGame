import React from 'react';
import './PlayersCircle.css';

const PlayersCircle = ({ numPlayers, localPlayer }) => {
  const players = Array.from({ length: numPlayers }, (_, i) => i);
  const rotated = [
    ...players.slice(localPlayer - 1),
    ...players.slice(0, localPlayer - 1)
  ];
  const angleStep = 360 / numPlayers;
  const radius = 200;

  return (
    <div className="players-circle">
      {rotated.map((p, i) => {
        const angle = 90 + i * angleStep;
        return (
          <div
            key={p}
            className="player"
            style={{
              transform: `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`
            }}
          >
            <div className="player-number">Player {p + 1}</div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayersCircle;
