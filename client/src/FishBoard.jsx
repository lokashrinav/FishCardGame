import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const getCardImageUrl = (card) => {
  if (card === "Joker:B") return "/png/black_joker.png";
  if (card === "Joker:R") return "/png/red_joker.png";
  let [rank, suit] = card.split(':');
  const rankMap = { "J": "jack", "Q": "queen", "K": "king", "A": "ace" };
  rank = rankMap[rank] || rank;
  const suitMap = { "H": "hearts", "D": "diamonds", "C": "clubs", "S": "spades" };
  suit = suitMap[suit];
  return `/png/${rank}_of_${suit}.png`;
};

const FishBoard = () => {
  const cards = [
    "2:H", "3:H", "4:H", "5:H", "6:H", "7:H", "8:H", "9:H", "10:H", "J:H", "Q:H", "K:H", "A:H",
    "2:D", "3:D", "4:D", "5:D", "6:D", "7:D", "8:D", "9:D", "10:D", "J:D", "Q:D", "K:D", "A:D",
    "2:C", "3:C", "4:C", "5:C", "6:C", "7:C", "8:C", "9:C", "10:C", "J:C", "Q:C", "K:C", "A:C",
    "2:S", "3:S", "4:S", "5:S", "6:S", "7:S", "8:S", "9:S", "10:S", "J:S", "Q:S", "K:S", "A:S",
    "Joker:B", "Joker:R"
  ];

  const [socket, setSocket] = useState(null);
  const [numPlayers, setNumPlayers] = useState(0);
  const [onGoingGame, setOnGoingGame] = useState(false);
  const [currCards, setCurrCards] = useState(null);
  const [num, setNum] = useState(null);
  const [currPlayer, setCurrPlayer] = useState(null);
  const [playerInput, setPlayerValue] = useState('');
  const [cardInput, setCardValue] = useState('');
  const [lastAsk, setLastAsk] = useState(null);
  const [warning, setWarning] = useState(null);
  const [callingSet, setCallingSet] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [score, setScore] = useState([0, 0]);
  const [winner, setWinner] = useState(null);

  const startGame = () => {
    if (numPlayers > 2 && numPlayers <= 18) {
      setOnGoingGame(true);
      socket.emit('start-game');
    }
  };

  const handleFinal = () => {
    let s = inputValue.split(" ");
    socket.emit('check-set', s, num);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (cards.indexOf(cardInput) === -1) {
      setWarning("Insert proper card format");
    } else if (playerInput % 2 === num % 2) {
      setWarning("You can't ask a teammate (same parity)");
    } else if (currCards.indexOf(cardInput) !== -1) {
      setWarning("You can't ask for a card you already have");
    } else if (num === Number(playerInput)) {
      setWarning("You can't ask yourself");
    } else {
      setWarning(null);
      socket.emit("handleSubmit", playerInput, num, cardInput);
      setPlayerValue('');
      setCardValue('');
    }
  };

  useEffect(() => {
    const newSocket = io("http://localhost:8080", { transports: ["websocket"] });
    setSocket(newSocket);
    newSocket.on('updateScore', (index) => {
      setScore((prevScore) => {
        const newScore = [...prevScore];
        newScore[index] += 1;
        return newScore;
      });
      if (score[0] === 5 || score[1] === 5) {
        newSocket.emit('winner', index);
      }
    });
    newSocket.on('change-players', (data) => {
      setNumPlayers(data);
    });
    newSocket.on('winner', (data) => {
      setWinner(data);
    });
    newSocket.on('lastAsk', (data) => {
      setLastAsk(data);
    });
    newSocket.on('givenNum', (data) => {
      setNum(data);
    });
    newSocket.on('starting-game-cards', (data) => {
      setCurrCards(data);
    });
    newSocket.on('onGoingGame', (data) => {
      setOnGoingGame(data);
    });
    newSocket.on('choosingCurrPlayer', (data) => {
      setCurrPlayer(data);
    });
    newSocket.on('changeCards', (data) => {
      setCurrCards(data);
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <main className="game-container">
      <header>
        <h1>Fish Card Game</h1>
        {winner && <div className="winner">Congratulations, {winner} wins!</div>}
        <div className="info">
          {onGoingGame ? (
            <>
              <p>You are Player {num}</p>
              <p>Players: {numPlayers}</p>
              <p>Even Score: {score[0]}, Odd Score: {score[1]}</p>
            </>
          ) : (
            <p>{numPlayers} Players Queued</p>
          )}
        </div>
      </header>
      <section className="cards-section">
        {onGoingGame && currCards && currCards.length > 0 && (
          <div className="cards-grid">
            {currCards.map((card, idx) => (
              <div key={idx} className="card">
                <img src={getCardImageUrl(card)} alt={card} className="card-image" />
              </div>
            ))}
          </div>
        )}
      </section>
      {lastAsk && <div className="last-ask">{lastAsk}</div>}
      <section className="controls">
        {!onGoingGame && (
          <button className="btn start-btn" onClick={startGame}>
            Start Game
          </button>
        )}
        {onGoingGame && Number(currPlayer) === num && (
          <form onSubmit={handleSubmit} className="ask-form">
            <input
              type="text"
              value={playerInput}
              onChange={(e) => setPlayerValue(e.target.value)}
              placeholder="Enter Opponent Number"
              className="input-field"
              required
            />
            <input
              type="text"
              value={cardInput}
              onChange={(e) => setCardValue(e.target.value)}
              placeholder="Card (e.g., 5:H)"
              className="input-field"
              required
            />
            <button type="submit" className="btn submit-btn">
              Submit Ask
            </button>
          </form>
        )}
        {onGoingGame && !callingSet && (
          <button className="btn set-btn" onClick={() => setCallingSet(true)}>
            Call Set
          </button>
        )}
        {callingSet && (
          <div className="set-call">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter your set"
              className="input-field"
            />
            <button onClick={handleFinal} className="btn submit-btn">
              Submit Set
            </button>
            <button onClick={() => setCallingSet(false)} className="btn cancel-btn">
              Cancel
            </button>
          </div>
        )}
        {warning && <div className="warning">{warning}</div>}
      </section>
      <footer className="instructions">
        <h2>How to Play</h2>
        <ul>
          <li>This only works with an even number of players. Players with the same number parity are teammates.</li>
          <li>The starting player is chosen randomly. When it's your turn, input the opponent’s number and the card in the format <code>5:H</code>.</li>
          <li>Suit abbreviations: H = Hearts, S = Spades, C = Clubs, D = Diamonds; Jokers as <code>Joker:R</code> (red) or <code>Joker:B</code> (black).</li>
        </ul>
      </footer>
    </main>
  );
};

export default FishBoard;
