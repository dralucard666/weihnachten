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
  questionType: QuestionType; // Type of first question
  answers?: Answer[]; // Answer possibilities for players (only for multiple-choice)
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

export interface PlayerAnswerInfo {
  playerId: string;
  answerId: string;
  answerText?: string;
}

export interface QuestionResultData {
  correctAnswerId: string;
  playerAnswers: PlayerAnswerInfo[];
}

export interface Answer {
  id: string;
  text: string;
}

// Question Types
export type QuestionType = 'multiple-choice' | 'custom-answers';

// Media configuration for questions
export type MediaType = 'video' | 'images';

export interface MediaConfig {
  type: MediaType;
  sources: string[]; // Paths relative to assets folder
  autoplay?: boolean; // Whether to start automatically
  loop?: boolean; // For videos, whether to loop
  allowReplay?: boolean; // Allow replaying the media
  allowMinimize?: boolean; // Allow minimizing the media display
  allowMaximize?: boolean; // Allow maximizing/fullscreen
  slideshow?: boolean; // For images, whether to show as slideshow
  slideshowInterval?: number; // Milliseconds between slides (if slideshow)
}

export interface QuestionMedia {
  beforeQuestion?: MediaConfig; // Media to show before displaying the question
  beforeAnswer?: MediaConfig; // Media to show before revealing the answer
}

export interface NextQuestionRequest {
  lobbyId: string;
  questionId: string; // Next question ID
  questionType: QuestionType; // Type of question
  answers?: Answer[]; // Answer possibilities for players (only for multiple-choice)
}

// Custom Answers Game Mode
export interface SubmitCustomAnswerRequest {
  lobbyId: string;
  playerId: string;
  questionId: string;
  answerText: string;
}

export interface SubmitCustomAnswerResponse {
  success: boolean;
}

export interface CustomAnswer extends Answer {
  playerId?: string; // undefined for the correct answer
}

export interface ShowAnswersToMasterData {
  questionId: string;
  answers: CustomAnswer[]; // All player answers + correct answer mixed
}

export interface GetCustomAnswersRequest {
  lobbyId: string;
  questionId: string;
  correctAnswerId: string;
  correctAnswerText: string;
}

export interface TriggerAnswerVotingRequest {
  lobbyId: string;
  questionId: string;
}

export interface VoteForAnswerRequest {
  lobbyId: string;
  playerId: string;
  questionId: string;
  answerId: string; // ID of the answer they're voting for
}

export interface VoteForAnswerResponse {
  success: boolean;
}

export interface CustomAnswerResultRequest {
  lobbyId: string;
  questionId: string;
  correctAnswerId: string;
}

export interface CustomAnswerResultData {
  correctAnswerId: string;
  playerVotes: PlayerAnswerInfo[];
}

// Socket.IO Event Types
export interface ServerToClientEvents {
  // Emitted to all in lobby
  lobbyUpdated: (lobby: Lobby) => void;
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  
  // Emitted when game starts or next question
  questionStarted: (data: { questionId: string, questionIndex: number, questionType: QuestionType, answers?: Answer[] }) => void;
  
  // Emitted to game master only
  playerAnswered: (playerId: string) => void;
  everybodyAnswered: () => void;
  
  // Custom answers mode - emitted to game master when all custom answers submitted
  customAnswersReady: (data: ShowAnswersToMasterData) => void;
  
  // Custom answers mode - emitted to players to show all answers for voting
  showAnswersForVoting: (data: { questionId: string, answers: Answer[] }) => void;
  
  // Custom answers mode - emitted to game master when all votes are in
  allVotesReceived: () => void;
  
  // Emitted after questionResult processed - includes what each player picked
  questionResultReady: (data: QuestionResultData) => void;
  customAnswerResultReady: (data: CustomAnswerResultData) => void;
  
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
  
  // Custom answers mode events
  submitCustomAnswer: (data: SubmitCustomAnswerRequest, callback: (response: SubmitCustomAnswerResponse) => void) => void;
  getCustomAnswers: (data: GetCustomAnswersRequest) => void;
  triggerAnswerVoting: (data: TriggerAnswerVotingRequest) => void;
  voteForAnswer: (data: VoteForAnswerRequest, callback: (response: VoteForAnswerResponse) => void) => void;
  customAnswerResult: (data: CustomAnswerResultRequest) => void;
  
  endGame: (lobbyId: string) => void;
}
