// Game States
export type GameState = 'lobby' | 'playing' | 'finished';

// Question phase for game flow tracking
export type QuestionPhase = 
  | 'answering'           // Players are submitting answers
  | 'voting'              // Players are voting (custom-answers only)
  | 'revealing'           // Showing correct answer/results
  | 'waiting'             // Waiting for master to continue
  | 'intermediate-scores'; // Showing intermediate scores

// Player
export interface Player {
  id: string;
  name?: string; // Optional until setName is called
  score: number;
  connected: boolean;
  hasAnswered?: boolean; // Track if player answered current question
}

// Stored question data on backend
export interface StoredQuestion {
  id: string;
  type: QuestionType;
  text: { de: string; en: string };
  answers?: Array<{ id: string; text: { de: string; en: string }; sound?: string[] }>;
  correctAnswerId?: string;
  correctAnswer?: { de: string; en: string };
  correctAnswers?: string[]; // For text-input (multiple acceptable answers)
  orderItems?: Array<{ id: string; text: { de: string; en: string }; sound?: string[] }>;
  correctOrder?: string[]; // For order questions
  media?: QuestionMedia;
}

// Lobby
export interface Lobby {
  id: string;
  gameState: GameState;
  players: Player[];
  currentQuestionIndex: number;
  currentQuestionId?: string; // Current question ID
  currentPhase?: QuestionPhase; // Current phase of the question
  totalQuestions?: number; // Total number of questions in this game
  questionIds: string[]; // IDs of questions for this game session (for persistence)
  questionSetId?: string; // ID of question set to load questions from (when game starts)
  questionCount?: number; // Number of questions to use from the set
  createdAt: string;
}

// API Request/Response Types
export interface CreateLobbyRequest {
  questionSetId?: string; // ID of question set to use (if not provided, uses questionIds)
  questionIds?: string[]; // IDs of questions for this game session (deprecated, use questionSetId)
  questionCount?: number; // Optional: limit number of questions to use
}

export interface CreateLobbyResponse {
  lobbyId: string;
  lobby?: Lobby;
  error?: string;
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
  currentQuestion?: QuestionData;
  error?: string;
}

export interface ReconnectMasterRequest {
  lobbyId: string;
}

export interface ReconnectMasterResponse {
  success: boolean;
  lobby?: Lobby;
  currentQuestion?: QuestionData;
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
  questionSetId?: string; // Question set to load questions from
  questionCount?: number; // Optional: limit number of questions
}

export interface StartGameResponse {
  success: boolean;
  currentQuestion?: QuestionData; // Backend sends full question data
}

// Question data sent to clients (includes both languages for client-side switching)
export interface QuestionData {
  questionId: string;
  questionIndex: number;
  totalQuestions: number;
  type: QuestionType;
  text: { de: string; en: string };
  answers?: Array<{ id: string; text: { de: string; en: string }; sound?: string[] }>; // For multiple-choice
  orderItems?: Array<{ id: string; text: { de: string; en: string }; sound?: string[] }>; // For order questions
  media?: QuestionMedia;
}

export interface SetAnswerRequest {
  lobbyId: string;
  playerId: string;
  answerId: string; // Validated against current question on backend
}

export interface SetAnswerResponse {
  success: boolean;
}

export interface QuestionResultRequest {
  lobbyId: string;
  // No questionId needed - backend knows current question
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
  text: string | { de: string; en: string };
  sound?: string[]; // Optional sound files to play on hover
}

// Question Types
export type QuestionType = 'multiple-choice' | 'custom-answers' | 'text-input' | 'order';

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
  // Backend manages question progression
}

export interface NextQuestionResponse {
  success: boolean;
  currentQuestion?: QuestionData; // Next question data
  gameFinished?: boolean; // True if no more questions
  showIntermediateScores?: boolean; // True if should show intermediate scores
}

export interface RestartQuestionRequest {
  lobbyId: string;
  // Backend restarts the current question
}

export interface RestartQuestionResponse {
  success: boolean;
  currentQuestion?: QuestionData; // Current question data (restarted)
}

export interface ContinueFromIntermediateScoresRequest {
  lobbyId: string;
}

export interface ContinueFromIntermediateScoresResponse {
  success: boolean;
  currentQuestion?: QuestionData; // Next question data
}

// Custom Answers Game Mode
export interface SubmitCustomAnswerRequest {
  lobbyId: string;
  playerId: string;
  answerText: string; // Backend validates against current question
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

export interface TriggerAnswerVotingRequest {
  lobbyId: string;
  // Backend knows current question and has shuffled answers ready
}

export interface VoteForAnswerRequest {
  lobbyId: string;
  playerId: string;
  answerId: string; // ID of the answer they're voting for
}

export interface VoteForAnswerResponse {
  success: boolean;
}

export interface CustomAnswerResultRequest {
  lobbyId: string;
  // Backend knows current question, correct answer, and all votes
}

export interface CustomAnswerResultData {
  correctAnswerId: string;
  playerVotes: PlayerAnswerInfo[];
}

// Text Input Question Type
export interface SubmitTextInputRequest {
  lobbyId: string;
  playerId: string;
  answerText: string; // Backend validates against current question
}

export interface SubmitTextInputResponse {
  success: boolean;
}

export interface TextInputResultRequest {
  lobbyId: string;
  // Backend knows current question and correct answers
}

export interface TextInputResultData {
  correctAnswers: string[];
  playerAnswers: PlayerAnswerInfo[];
  correctPlayerIds: string[]; // Players who got it right
}

// Order Question Type
export interface OrderItem {
  id: string;
  text: string;
  sound?: string[]; // Optional sound files to play on hover
}

export interface SubmitOrderRequest {
  lobbyId: string;
  playerId: string;
  orderedItemIds: string[]; // Array of item IDs in player's chosen order
}

export interface SubmitOrderResponse {
  success: boolean;
}

export interface OrderResultRequest {
  lobbyId: string;
  // Backend knows current question and correct order
}

export interface OrderResultData {
  correctOrder: string[];
  playerOrders: PlayerAnswerInfo[]; // answerId contains comma-separated order, answerText has score info
  playerScores: { [playerId: string]: number }; // Points earned by each player
}

// Socket.IO Event Types
export interface ServerToClientEvents {
  // Emitted to all in lobby
  lobbyUpdated: (lobby: Lobby) => void;
  playerJoined: (player: Player) => void;
  playerLeft: (playerId: string) => void;
  
  // Emitted when game starts or next question
  questionStarted: (data: QuestionData) => void;
  
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
  textInputResultReady: (data: TextInputResultData) => void;
  orderResultReady: (data: OrderResultData) => void;
  
  // Emitted after questionResult processed
  scoresUpdated: (players: Player[]) => void;
  
  gameFinished: (finalScores: Player[]) => void;
}

export interface ClientToServerEvents {
  createLobby: (data: CreateLobbyRequest, callback: (response: CreateLobbyResponse) => void) => void;
  joinLobby: (data: JoinLobbyRequest, callback: (response: JoinLobbyResponse) => void) => void;
  reconnectPlayer: (data: ReconnectPlayerRequest, callback: (response: ReconnectPlayerResponse) => void) => void;
  reconnectMaster: (data: ReconnectMasterRequest, callback: (response: ReconnectMasterResponse) => void) => void;
  setName: (data: SetNameRequest, callback: (response: SetNameResponse) => void) => void;
  startGame: (data: StartGameRequest, callback: (response: StartGameResponse) => void) => void;
  setAnswer: (data: SetAnswerRequest, callback: (response: SetAnswerResponse) => void) => void;
  questionResult: (data: QuestionResultRequest) => void;
  nextQuestion: (data: NextQuestionRequest, callback: (response: NextQuestionResponse) => void) => void;
  restartQuestion: (data: RestartQuestionRequest, callback: (response: RestartQuestionResponse) => void) => void;
  
  // Custom answers mode events
  submitCustomAnswer: (data: SubmitCustomAnswerRequest, callback: (response: SubmitCustomAnswerResponse) => void) => void;
  prepareCustomAnswerVoting: (data: { lobbyId: string }, callback: (response: { success: boolean }) => void) => void; // Master requests to prepare voting phase
  triggerAnswerVoting: (data: TriggerAnswerVotingRequest) => void;
  voteForAnswer: (data: VoteForAnswerRequest, callback: (response: VoteForAnswerResponse) => void) => void;
  customAnswerResult: (data: CustomAnswerResultRequest) => void;
  
  // Text input events
  submitTextInput: (data: SubmitTextInputRequest, callback: (response: SubmitTextInputResponse) => void) => void;
  textInputResult: (data: TextInputResultRequest) => void;
  
  // Order events
  submitOrder: (data: SubmitOrderRequest, callback: (response: SubmitOrderResponse) => void) => void;
  orderResult: (data: OrderResultRequest) => void;
  
  // Intermediate scores
  continueFromIntermediateScores: (data: ContinueFromIntermediateScoresRequest, callback: (response: ContinueFromIntermediateScoresResponse) => void) => void;
  
  endGame: (lobbyId: string) => void;
}
