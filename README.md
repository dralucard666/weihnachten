# Quiz App

A real-time multiplayer quiz application with a game master and player roles.

## Project Structure

```
weihnachten/
├── frontend/          # React + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + Socket.IO (to be implemented)
└── shared/            # Shared TypeScript types
```

## Features

### Game Master
- Create quiz lobbies with unique codes
- Display QR codes for easy player joining
- See connected players in real-time
- Control game flow (start game, navigate questions)
- Display questions and results on main screen
- View leaderboard and final scores

### Players
- Join games by scanning QR code
- Enter custom player name
- Wait in lobby with other players
- Submit answers to questions in real-time
- View personal scores and rankings

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, React Router, Socket.IO Client
- **Backend**: Node.js, Express, Socket.IO, TypeScript (to be implemented)
- **Communication**: Real-time bidirectional communication via WebSockets (Socket.IO)

## Getting Started

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

The frontend will run on `http://localhost:5173`

### Backend (Coming Soon)

The backend will handle:
- Lobby creation and management
- Real-time player connections
- Question management
- Answer validation
- Score calculation
- Game state management

## Architecture

The application uses a **monorepo structure** with:

1. **Shared Types** (`/shared`): Common TypeScript interfaces used by both frontend and backend
2. **Frontend** (`/frontend`): React SPA with three main views:
   - Start page (role selection)
   - Game Master view (lobby + game control)
   - Player view (join + answer submission)
3. **Backend** (`/backend`): REST API + Socket.IO server for real-time communication

## Game Flow

1. **Lobby Creation**: Game master clicks "Game Master" → backend creates lobby → QR code displayed
2. **Player Joining**: Players scan QR code → enter name → join lobby
3. **Lobby Wait**: All participants see connected players in real-time
4. **Game Start**: Game master starts game → backend changes state to "playing"
5. **Questions**: 
   - Game master screen shows question + answers
   - Players see answer buttons on their devices
   - Players submit answers
6. **Results**: Show correct answer, scores, and leaderboard
7. **Next Question**: Repeat steps 5-6
8. **Game End**: Final scores and rankings displayed

## Development Workflow

1. Start with frontend development (✅ Complete)
2. Implement backend API and Socket.IO server (Next)
3. Add question database/management
4. Connect frontend to backend
5. Test full flow
6. Add features (timers, categories, media questions, etc.)

## Next Steps

- [ ] Set up backend with Express and Socket.IO
- [ ] Implement lobby creation and management
- [ ] Add question database
- [ ] Implement game logic and scoring
- [ ] Connect frontend to backend
- [ ] Add error handling and edge cases
- [ ] Implement game master game controls (next question, show results, etc.)
- [ ] Add player disconnection handling
- [ ] Deploy application

## License

MIT
