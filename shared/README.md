# Shared Types Documentation

This file contains all shared TypeScript types used across the frontend and backend.

## Game States

```typescript
type GameState = 'lobby' | 'playing' | 'question' | 'answering' | 'results' | 'finished';
```

- **lobby**: Waiting for players to join
- **playing**: Game has started
- **question**: Displaying a question
- **answering**: Players are submitting answers
- **results**: Showing question results
- **finished**: Game completed

## Core Entities

### Player
```typescript
interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
}
```

### Question
```typescript
interface Question {
  id: string;
  text: string;
  answers: Answer[];
  timeLimit?: number; // in seconds
}
```

### Answer
```typescript
interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}
```

### Lobby
```typescript
interface Lobby {
  id: string;
  gameState: GameState;
  players: Player[];
  currentQuestionIndex: number;
  questions: Question[];
  createdAt: string;
}
```

## API Endpoints (REST)

### Create Lobby
- **Request**: `CreateLobbyRequest` (empty object)
- **Response**: `CreateLobbyResponse { lobbyId, lobby }`

### Join Lobby
- **Request**: `JoinLobbyRequest { lobbyId, playerName }`
- **Response**: `JoinLobbyResponse { success, playerId, lobby }`

### Start Game
- **Request**: `StartGameRequest { lobbyId }`

### Submit Answer
- **Request**: `SubmitAnswerRequest { lobbyId, playerId, questionId, answerId }`
- **Response**: `SubmitAnswerResponse { success, isCorrect }`

## Socket.IO Events

### Server → Client Events

- `lobbyUpdated(lobby)`: Lobby state changed
- `gameStateChanged(gameState)`: Game state changed
- `playerJoined(player)`: New player joined
- `playerLeft(playerId)`: Player disconnected
- `questionStarted(question, questionIndex)`: New question started
- `answerSubmitted(playerId)`: Player submitted answer
- `questionEnded(results)`: Question completed with results
- `gameFinished(finalScores)`: Game ended with final scores

### Client → Server Events

- `createLobby(callback)`: Create new lobby
- `joinLobby(data, callback)`: Join existing lobby
- `startGame(data)`: Start the game
- `submitAnswer(data, callback)`: Submit answer to question
- `nextQuestion(lobbyId)`: Move to next question
- `endGame(lobbyId)`: End the game

## Question Results

```typescript
interface QuestionResults {
  questionId: string;
  correctAnswerId: string;
  playerAnswers: {
    playerId: string;
    playerName: string;
    answerId: string;
    isCorrect: boolean;
    timeToAnswer: number; // in milliseconds
  }[];
  updatedScores: Player[];
}
```

## Usage

Import types in frontend:
```typescript
import type { Lobby, Player, Question } from '../../../shared/types';
```

Import types in backend:
```typescript
import type { Lobby, Player, Question } from '../shared/types';
```
