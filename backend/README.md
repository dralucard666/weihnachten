# Quiz Game Backend

Backend server for the quiz game with game master and players.

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Environment Variables

- `PORT` - Server port (default: 3001)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:5173)

## Endpoints

- `GET /health` - Health check endpoint

## Socket.IO Events

### Client to Server
- `createLobby` - Create a new lobby
- `joinLobby` - Join an existing lobby
- `setName` - Set player name
- `startGame` - Start the game (game master)
- `setAnswer` - Submit an answer
- `questionResult` - Send question results (game master)
- `nextQuestion` - Move to next question (game master)
- `endGame` - End the game (game master)

### Server to Client
- `lobbyUpdated` - Lobby state updated
- `playerJoined` - New player joined
- `playerLeft` - Player left
- `questionStarted` - New question started
- `playerAnswered` - Player submitted answer (to game master)
- `everybodyAnswered` - All players answered (to game master)
- `scoresUpdated` - Scores updated after question
- `gameFinished` - Game ended with final scores
