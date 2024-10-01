const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express()
const server = http.createServer(app)

let numPlayers = 0;
let players = [];
let sentCards = null;

let currPlayer = null;

let lastAsk = null;

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true
}));

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
})

let onGoingGame = false;

let cards = [
    "2:H", "3:H", "4:H", "5:H", "6:H", "7:H", "8:H", "9:H", "10:H", "J:H", "Q:H", "K:H", "A:H",
    "2:D", "3:D", "4:D", "5:D", "6:D", "7:D", "8:D", "9:D", "10:D", "J:D", "Q:D", "K:D", "A:D",
    "2:C", "3:C", "4:C", "5:C", "6:C", "7:C", "8:C", "9:C", "10:C", "J:C", "Q:C", "K:C", "A:C",
    "2:S", "3:S", "4:S", "5:S", "6:S", "7:S", "8:S", "9:S", "10:S", "J:S", "Q:S", "K:S", "A:S"
];

const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
}

function distributeCards(cards, numPlayers) {

    const distributedCards = Array.from({ length: numPlayers }, () => []); 
    let cardIndex = 0;

    while (cardIndex < cards.length) {
        for (let i = 0; i < numPlayers; i++) {
            if (cardIndex < cards.length) {
                distributedCards[i].push(cards[cardIndex]);
                cardIndex++;
            }
        }
    }

    for (let i = 0; i < distributedCards.length; i++) {
        distributedCards[i].sort((a, b) => {
            const [rankA, suitA] = a.split(':');
            const [rankB, suitB] = b.split(':');
            if (suitA === suitB) {
                return rankA.localeCompare(rankB);
            }
            return suitA.localeCompare(suitB);
        });
        
        distributedCards[i].reverse(); 
    }

    for (let i = 0; i < distributedCards.length; i++) {
        console.log(distributedCards[i]);
    }

    sentCards = distributedCards;
    return distributedCards;
}

io.on('connection', (socket) => {
    if(!onGoingGame) {
        numPlayers += 1;
        players.push(socket.id);
        io.emit('change-players', numPlayers);
    }

    socket.on('handleSubmit', (playerInput, playerInput2, cardInput, lastAsk) => {
        let index = sentCards[playerInput - 1].indexOf(cardInput);
        if(index !== -1) {
            sentCards[playerInput - 1].splice(index, 1);
            sentCards[playerInput2 - 1].push(cardInput);
            io.to(players[playerInput2 - 1]).emit('changeCards', sentCards[playerInput2 - 1]);
            io.to(players[playerInput - 1]).emit('changeCards', sentCards[playerInput - 1]);
        }
        else {
            currPlayer = playerInput;
            console.log(playerInput)
            io.emit('choosingCurrPlayer', playerInput);
        }
        io.emit('lastAsk', `Player ${playerInput2} asked for ${cardInput} from Player ${playerInput}`)
    })

    socket.on('disconnect', () => {
        numPlayers -= 1;
        players.splice(players.indexOf(socket.id), 1);
        io.emit('change-players', numPlayers);
    })

    socket.on('start-game', () => {
        shuffleArray(cards);
        onGoingGame = true;
        let distributedCards = distributeCards(cards, numPlayers);
        for(let i = 0; i < players.length; i++) {
            io.to(players[i]).emit('starting-game-cards', distributedCards[i]);
        }

        io.emit("onGoingGame", true);

        for(let i = 1; i <= players.length; i++) {
            io.to(players[i - 1]).emit('givenNum', i);
        }

        const randomIndex = Math.floor(Math.random() * players.length);

        currPlayer = randomIndex + 1

        io.emit("choosingCurrPlayer", randomIndex + 1);

    })
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 8080; 
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running and listening on 0.0.0.0:${PORT}`);
});

