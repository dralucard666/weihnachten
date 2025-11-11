// Game States
export type GameState = 'lobby' | 'playing' | 'finished';

// Player
export interface Player {
  id: string;
  name?: string; // Optional until setName is called
  score: number;
  connected: boolean;
  hasAnswered?: boolean; // Track if player answered current question
}

// Lobby
export interface Lobby {
  id: string;
  gameState: GameState;
  players: Player[];
  currentQuestionIndex: number;
  currentQuestionId?: string; // Track current question ID only
  createdAt: string;
}

// API Request/Response Types
export interface CreateLobbyRequest {
  // Empty for now, could include game settings later
}

export interface CreateLobbyResponse {
  lobbyId: string;
  lobby: Lobby;
}

export interface JoinLobbyRequest {
  lobbyId: string;
}

export interface JoinLobbyResponse {
  success: boolean;
  playerId: string;
  lobby: Lobby;
}

export interface ReconnectPlayerRequest {
  lobbyId: string;
  playerId: string;
}

export interface ReconnectPlayerResponse {
  success: boolean;
  lobby?: Lobby;
  error?: string;
}

export interface ReconnectMasterRequest {
  lobbyId: string;
}

export interface ReconnectMasterResponse {
  success: boolean;
  lobby?: Lobby;
  error?: string;
}

export interface SetNameRequest {
  lobbyId: string;
  playerId: string;
  playerName: string;
}

export interface SetNameResponse {
  success: boolean;
}

export interface StartGameRequest {
  lobbyId: string;
  questionId: string; // First question ID
  answers: Answer[]; // Answer possibilities for players
}

export interface SetAnswerRequest {
  lobbyId: string;
  playerId: string;
  questionId: string;
  answerId: string;
}

export interface SetAnswerResponse {
  success: boolean;
}

export interface QuestionResultRequest {
  lobbyId: string;
  questionId: string;
  correctAnswerId: string;
}

export interface Answer {
  id: string;
  text: string;
}

export interface NextQuestionRequest {
  lobbyId: string;
  questionId: string; // Next question ID
  answers: Answer[]; // Answer possibilities for players
}

// Socket.IO Event Types
export interface ServerToClientEvents {
  // Emitted to all in lobby
  lobbyUpdated: (lobby: Lobby) => void;
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  
  // Emitted when game starts or next question
  questionStarted: (data: { questionId: string, questionIndex: number, answers: Answer[] }) => void;
  
  // Emitted to game master only
  playerAnswered: (playerId: string) => void;
  everybodyAnswered: () => void;
  
  // Emitted after questionResult processed
  scoresUpdated: (players: Player[]) => void;
  
  gameFinished: (finalScores: Player[]) => void;
}

export interface ClientToServerEvents {
  createLobby: (callback: (response: CreateLobbyResponse) => void) => void;
  joinLobby: (data: JoinLobbyRequest, callback: (response: JoinLobbyResponse) => void) => void;
  reconnectPlayer: (data: ReconnectPlayerRequest, callback: (response: ReconnectPlayerResponse) => void) => void;
  reconnectMaster: (data: ReconnectMasterRequest, callback: (response: ReconnectMasterResponse) => void) => void;
  setName: (data: SetNameRequest, callback: (response: SetNameResponse) => void) => void;
  startGame: (data: StartGameRequest) => void;
  setAnswer: (data: SetAnswerRequest, callback: (response: SetAnswerResponse) => void) => void;
  questionResult: (data: QuestionResultRequest) => void;
  nextQuestion: (data: NextQuestionRequest) => void;
  endGame: (lobbyId: string) => void;
}
