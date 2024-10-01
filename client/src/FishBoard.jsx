import React, {useState, useEffect} from 'react'
import { io } from 'socket.io-client';
import './App.css'

const FishBoard = () => {

    let cards = [
        "2:H", "3:H", "4:H", "5:H", "6:H", "7:H", "8:H", "9:H", "10:H", "J:H", "Q:H", "K:H", "A:H",
        "2:D", "3:D", "4:D", "5:D", "6:D", "7:D", "8:D", "9:D", "10:D", "J:D", "Q:D", "K:D", "A:D",
        "2:C", "3:C", "4:C", "5:C", "6:C", "7:C", "8:C", "9:C", "10:C", "J:C", "Q:C", "K:C", "A:C",
        "2:S", "3:S", "4:S", "5:S", "6:S", "7:S", "8:S", "9:S", "10:S", "J:S", "Q:S", "K:S", "A:S", "Joker:B", "Joker:R"
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
    }

    const handleFinal = () => {
        let s = inputValue.split(" ");
        socket.emit('check-set', s, num);
    }

    const handleInputChange = (event) => {
        setInputValue(event.target.value); 
      };

    const handleSubmit = (event) => {
        event.preventDefault(); 
        if(cards.indexOf(cardInput) === -1) {
            setWarning("Insert proper card format")
        }
        else if(playerInput % 2 == num % 2) {
            setWarning("You can't ask Teammate. Same Parity Means Teamate")
        }
        else if(currCards.indexOf(cardInput) !== -1) {
            setWarning("You can't ask for a card you have")
        }
        else if(num === playerInput) {
            setWarning("You can't ask yourself")
        }
        else {
            setWarning(null);
            socket.emit("handleSubmit", playerInput, num, cardInput);
            setPlayerValue('');
            setCardValue('');
        }
    }

    const getFilteredPlayerNumbers = () => {
        return Array.from({ length: numPlayers })
          .map((_, idx) => idx + 1) 
          .filter(playerNum => playerNum !== num);
      };
    
      useEffect(() => {
    

        const newSocket = io("http://localhost:8080", {
            transports: ["websocket"],
          });      
        setSocket(newSocket);

        newSocket.on('updateScore', (index) => {
            setScore((prevScore) => {
              const newScore = [...prevScore]; 
              newScore[index] += 1; 
              return newScore;
            });
            if(score[0] == 5 || score[1] == 5) {
                socket.emit('winner', index);
            }
        });

        newSocket.on('change-players', (data) => {
            setNumPlayers(data)
        })


        newSocket.on('winner', (data) => {
            setWinner(data)
        })

        newSocket.on('lastAsk', (data) => {
            setLastAsk(data);
        })

        newSocket.on('givenNum', (data) => {
            setNum(data)
        })

        newSocket.on('starting-game-cards', (data) => {
            setCurrCards(data);
        })

        newSocket.on('onGoingGame', (data) => {
            setOnGoingGame(data);
        })

        newSocket.on('choosingCurrPlayer', (data) => {
            setCurrPlayer(data);
        })

        newSocket.on('changeCards', (data) => {
            setCurrCards(data);
        })

        return () => {
            newSocket.disconnect();
        };
      }, []);

      return (
        <div className='full'>
          <div className="numPlayers">Scroll Down for More Information</div>
          {winner && <div className="numPlayers">Congratulations for Winning, {winner}!</div>}
          {onGoingGame && <div className="numPlayers">There are {numPlayers} Players</div>}
          <div className="numPlayers">{`Even Score: ${score[0]}, Odd Score ${score[1]}`}</div>
          {!onGoingGame && <div className="numPlayers"> {`${numPlayers} Players Queued`}</div>}
          {onGoingGame && <div className="numPlayers"> {`You are Player ${num}`}</div>}
          <div className="box" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-evenly', padding: '20px', border: '1px solid black' }}>
            {onGoingGame && currCards && currCards.length > 0 && (
                <div className="cards-box" style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
                {currCards.map((card, idx) => (
                    <div
                    key={idx}
                    style={{
                        width: '70px',
                        height: '100px',
                        border: '1px solid black',
                        backgroundColor: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        color: 'black',
                        maxWidth: '100%'
                    }}
                    >
                    {card}
                    </div>
                ))}
                </div>
            )}
          </div>

          {lastAsk && <div className="numPlayers">{lastAsk}</div>}

          {!onGoingGame && <button className="startGame" onClick={startGame}>Start Game</button>}

          {onGoingGame && (Number(currPlayer) === num) && <input type='text' 
            value={playerInput}
            onChange={(e) => setPlayerValue(e.target.value)} placeholder="Who?"></input>}

          {onGoingGame && (Number(currPlayer) === num) && <input type='text' 
            value={cardInput}
            onChange={(e) => setCardValue(e.target.value)} 
            placeholder="Which Card? Insert in Format - Number:First Letter of Suit"></input>}

          {onGoingGame && (Number(currPlayer) === num) && 
            <button onClick={handleSubmit}>Submit</button>}

          {onGoingGame && !callingSet && <button onClick={() => {setCallingSet(true)}}>Call Set</button>}

          {callingSet && (
                <input 
                type='text' 
                value={inputValue} 
                onChange={handleInputChange}
                />
            )}

          {callingSet && <button onClick={handleFinal}>Submit Final Set</button>}

          {callingSet && <button onClick={() => {setCallingSet(false)}}>Cancel</button>}

          {warning && <div className="parity">{`Warning: ${warning}`}</div>}

          <div className="parity">For Entering a Set, if you have let's say 3 teammates aside from yourself, you will put their numbers in the specificied format, in this case you are 7, ex: 1=3:H,4:H 3=5:H 5= 7=6:H,7:H</div>

          <div className="parity">In the above example, no extra spaces, only between teammate number=, and only commas between different cards</div>

          <div className="parity">Only Works With An Even Number of Players</div>
          
          <div className="parity">Players with Same Player Numbers Parity are Teammates</div>

          <div className="parity">Starting Player is Chosen Randomly. When it's your turn, make sure to input Player Number and Specific Card in the following format: </div>
            
          <div className="parity">5:H where 5 refers to Number and H refers to Heart, no spaces</div>

          <div className="parity">H = Hearts, S = Spades, C = Clubs/Clover, D = Diamond</div>

          <div className="parity">Jokers are referred to as Joker:R for red joker and Joker:B for black joker</div>

        </div>
      );
    };

    export default FishBoard;
