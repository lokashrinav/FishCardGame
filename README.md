# MultiPlayer Fish Game  

A real-time multiplayer card game built with React and Socket.IO. Players connect to a server, join a lobby, and play a team-based Fish card game (Go Fish–style) where even-numbered players compete against odd-numbered players.

---

## Features  
- **Real-Time Multiplayer**: Powered by Socket.IO for seamless communication.  
- **Dynamic Player Circle**: Rotating UI positions players so the current turn is always at the bottom.  
- **Card Visualization**: Renders card faces/backs using image assets.  
- **Team Play**: Teams are split by player parity (even vs. odd).  
- **Set Calling**: Players can call sets to score points for their team.  

---

## Requirements  
- Node.js (v14+ recommended)  
- npm or Yarn  
- Modern web browser  

---

## Installation  

1. Clone the repository:  
   ```bash  
   git clone https://github.com/lokashrinav/multiplayer-fish-game.git  
   ```  
2. Navigate to the project directory:  
   ```bash  
   cd multiplayer-fish-game  
   ```  
3. Install dependencies:  
   ```bash  
   npm install  # or yarn install  
   ```  

---

## Running the Application  

### Server Setup  
1. Navigate to the server directory (if applicable):  
   ```bash  
   cd server  
   ```  
2. Start the server:  
   ```bash  
   npm run server  # or yarn server  
   ```  

### Client Setup  
1. Navigate to the client directory (if applicable):  
   ```bash  
   cd client  
   ```  
2. Start the React app:  
   ```bash  
   npm start  # or yarn start  
   ```  
3. Open `http://localhost:3000` in your browser.  

---

## Usage  
1. **Join a Lobby**: Automatically connected upon loading the client.  
2. **Start Game**: Host starts once 4–18 players join.  
3. **Gameplay**:  
   - Check your cards in your hand grid.  
   - On your turn: Request a card from an opponent or call a set to score points.  
4. **Winning**: First team to 5 sets wins!  

---

## Project Structure  

```plaintext
multiplayer-fish-game/
├── server/
│   ├── index.js        # Socket.IO server logic
│   └── ...            
├── src/
│   ├── App.js          # Main React component
│   ├── FishBoard.js    # Game board logic
│   ├── PlayersCircle.js# Dynamic player UI
│   └── ...
├── public/
│   ├── png/            # Card image assets
│   └── ...
└── ...
```

---

## Contributing  
1. Fork the repository.  
2. Create a feature branch: `git checkout -b feature-name`.  
3. Commit changes: `git commit -m 'Add feature'`.  
4. Push to branch: `git push origin feature-name`.  
5. Open a Pull Request!  

---

## License  
Free to use and modify. Attribution to the original repository is appreciated!  