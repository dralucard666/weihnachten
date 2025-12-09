import {
  Lobby,
  Player,
  GameState,
  QuestionPhase,
  StoredQuestion,
  QuestionData,
  CustomAnswer,
  PlayerAnswerInfo,
} from "../../../shared/types";
import { v4 as uuidv4 } from "uuid";

// Answer storage interfaces
interface PlayerAnswer {
  playerId: string;
  answerId: string;
}

interface PlayerCustomAnswer {
  playerId: string;
  answerText: string;
  answerId: string;
}

interface PlayerVote {
  playerId: string;
  votedAnswerId: string;
}

interface PlayerTextInput {
  playerId: string;
  answerText: string;
}

interface PlayerOrder {
  playerId: string;
  orderedItemIds: string[];
}

export class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private lobbyQuestions: Map<string, StoredQuestion[]> = new Map(); // lobbyId -> array of questions
  private playerAnswers: Map<string, Map<string, PlayerAnswer>> = new Map(); // lobbyId -> Map<playerId, answer>
  private customAnswers: Map<string, Map<string, PlayerCustomAnswer>> =
    new Map(); // lobbyId -> Map<playerId, customAnswer>
  private playerVotes: Map<string, Map<string, PlayerVote>> = new Map(); // lobbyId -> Map<playerId, vote>
  private shuffledAnswers: Map<string, CustomAnswer[]> = new Map(); // lobbyId -> shuffled answers cache
  private textInputAnswers: Map<string, Map<string, PlayerTextInput>> =
    new Map(); // lobbyId -> Map<playerId, textInput>
  private orderAnswers: Map<string, Map<string, PlayerOrder>> = new Map(); // lobbyId -> Map<playerId, order>
  // Store shuffled answer/order mappings per lobby and question
  private questionAnswerMappings: Map<string, Map<string, { answers?: any[]; orderItems?: any[] }>> = new Map(); // lobbyId -> Map<questionId, mappings>

  constructor() {
  }

  createLobby(questions: StoredQuestion[]): Lobby {
    const lobbyId = uuidv4();
    
    // Shuffle questions for this lobby
    const shuffledQuestions = [...questions];
    this.shuffleArray(shuffledQuestions);
    
    const lobby: Lobby = {
      id: lobbyId,
      gameState: "lobby",
      players: [],
      currentQuestionIndex: 0,
      totalQuestions: shuffledQuestions.length,
      questionIds: shuffledQuestions.map(q => q.id),
      createdAt: new Date().toISOString(),
    };

    this.lobbies.set(lobbyId, lobby);
    this.lobbyQuestions.set(lobbyId, shuffledQuestions);
    this.initializeLobbyAnswerMaps(lobbyId);

    return lobby;
  }

  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.get(lobbyId);
  }

  getCurrentQuestion(lobbyId: string): StoredQuestion | undefined {
    const lobby = this.lobbies.get(lobbyId);
    const questions = this.lobbyQuestions.get(lobbyId);
    
    if (!lobby || !questions) {
      return undefined;
    }
    
    return questions[lobby.currentQuestionIndex];
  }

  getLobbyQuestions(lobbyId: string): StoredQuestion[] | undefined {
    return this.lobbyQuestions.get(lobbyId);
  }

  updateLobbyQuestions(lobbyId: string, questions: StoredQuestion[]): void {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return;
    }
    
    this.lobbyQuestions.set(lobbyId, questions);
    lobby.questionIds = questions.map(q => q.id);
    lobby.totalQuestions = questions.length;
  }

  // Convert StoredQuestion to QuestionData (includes both languages for client-side switching)
  getQuestionDataForLanguage(
    question: StoredQuestion,
    questionIndex: number,
    totalQuestions: number,
    language: 'de' | 'en', // Kept for backwards compatibility but not used anymore
    lobbyId?: string // Optional lobby ID for shuffled answer support
  ): QuestionData {
    if (!lobbyId) {
      // Fallback to non-shuffled if lobby not provided
      return {
        questionId: question.id,
        questionIndex,
        totalQuestions,
        type: question.type,
        text: question.text,
        answers: question.answers?.map(a => ({
          id: a.id,
          text: a.text,
          sound: a.sound,
        })),
        orderItems: question.orderItems?.map(item => ({
          id: item.id,
          text: item.text,
          sound: item.sound,
        })),
        media: question.media,
      };
    }

    // Get or create mappings for this lobby
    let lobbyMappings = this.questionAnswerMappings.get(lobbyId);
    if (!lobbyMappings) {
      lobbyMappings = new Map();
      this.questionAnswerMappings.set(lobbyId, lobbyMappings);
    }

    // Get or create mapping for this specific question
    let questionMapping = lobbyMappings.get(question.id);
    
    if (!questionMapping) {
      // First time seeing this question in this lobby - create shuffled mappings
      questionMapping = {};
      
      // Shuffle answers for multiple-choice questions
      if (question.type === 'multiple-choice' && question.answers) {
        const shuffledAnswers = [...question.answers];
        this.shuffleArray(shuffledAnswers);
        questionMapping.answers = shuffledAnswers;
      }
      
      // Shuffle order items for order questions
      if (question.type === 'order' && question.orderItems) {
        const shuffledItems = [...question.orderItems];
        this.shuffleArray(shuffledItems);
        questionMapping.orderItems = shuffledItems;
      }
      
      lobbyMappings.set(question.id, questionMapping);
    }

    return {
      questionId: question.id,
      questionIndex,
      totalQuestions,
      type: question.type,
      text: question.text, // Send both languages
      answers: questionMapping.answers?.map(a => ({
        id: a.id,
        text: a.text, // Send both languages
        sound: a.sound,
      })) || question.answers?.map(a => ({
        id: a.id,
        text: a.text,
        sound: a.sound,
      })),
      orderItems: questionMapping.orderItems?.map(item => ({
        id: item.id,
        text: item.text, // Send both languages
        sound: item.sound,
      })) || question.orderItems?.map(item => ({
        id: item.id,
        text: item.text,
        sound: item.sound,
      })),
      media: question.media,
    };
  }

  joinLobby(lobbyId: string): {
    success: boolean;
    playerId?: string;
    lobby?: Lobby;
  } {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby || lobby.gameState !== "lobby") {
      return { success: false };
    }

    const playerId = uuidv4();
    const player: Player = {
      id: playerId,
      score: 0,
      connected: true,
    };

    lobby.players.push(player);

    return { success: true, playerId, lobby };
  }

  setPlayerName(
    lobbyId: string,
    playerId: string,
    playerName: string
  ): boolean {
    const player = this.findPlayer(lobbyId, playerId);
    if (!player) {
      return false;
    }

    player.name = playerName;
    return true;
  }

  startGame(lobbyId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const questions = this.lobbyQuestions.get(lobbyId);

    if (!lobby || lobby.gameState !== "lobby" || !questions || questions.length === 0) {
      return false;
    }

    lobby.gameState = "playing";
    lobby.currentQuestionIndex = 0;
    lobby.currentQuestionId = questions[0].id;
    lobby.currentPhase = "answering";
    this.clearAllAnswers(lobbyId);

    return true;
  }

  restartCurrentQuestion(lobbyId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);

    if (!lobby || lobby.gameState !== "playing" || !currentQuestion) {
      return false;
    }

    // Reset to answering phase
    lobby.currentPhase = "answering";
    
    // Clear all answers for current question
    this.clearAllAnswers(lobbyId);
    
    // Reset hasAnswered flag for all players
    this.resetPlayerAnswerFlags(lobby);

    return true;
  }

  setAnswer(
    lobbyId: string,
    playerId: string,
    answerId: string
  ): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);
    
    if (!lobby || lobby.gameState !== "playing" || !currentQuestion) {
      return false;
    }
    
    // Validate that we're in answering phase
    if (lobby.currentPhase !== "answering") {
      return false;
    }
    
    // Validate answer exists for multiple-choice
    if (currentQuestion.type === "multiple-choice") {
      const validAnswer = currentQuestion.answers?.some(a => a.id === answerId);
      if (!validAnswer) {
        return false;
      }
    }

    const player = this.findPlayer(lobbyId, playerId);
    if (!player) {
      return false;
    }

    const answers = this.playerAnswers.get(lobbyId);
    if (!answers) {
      return false;
    }

    answers.set(playerId, { playerId, answerId });
    player.hasAnswered = true;

    return true;
  }

  hasEveryoneAnswered(lobbyId: string): boolean {
    return this.hasEveryoneSubmitted(lobbyId, this.playerAnswers);
  }

  processQuestionResult(lobbyId: string): Player[] {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);

    if (!lobby || !currentQuestion) {
      return [];
    }

    const answers = this.playerAnswers.get(lobbyId);
    if (!answers || !currentQuestion.correctAnswerId) {
      return [];
    }

    for (const player of lobby.players) {
      const answer = answers.get(player.id);
      if (answer && answer.answerId === currentQuestion.correctAnswerId) {
        player.score += 1;
      }
    }

    lobby.currentPhase = "revealing";
    this.resetPlayerAnswerFlags(lobby);
    return lobby.players;
  }

  getPlayerAnswers(lobbyId: string): PlayerAnswerInfo[] {
    const answers = this.playerAnswers.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);

    if (!answers) {
      return [];
    }

    const playerAnswers: PlayerAnswerInfo[] = [];

    for (const [playerId, answer] of answers.entries()) {
      const answerObj = currentQuestion?.answers?.find(
        (a) => a.id === answer.answerId
      );
      // Extract EN text from potentially bilingual answer
      const answerText = answerObj ? (typeof answerObj.text === 'string' ? answerObj.text : answerObj.text.en) : undefined;
      playerAnswers.push({
        playerId,
        answerId: answer.answerId,
        answerText,
      });
    }

    return playerAnswers;
  }

  nextQuestion(lobbyId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const questions = this.lobbyQuestions.get(lobbyId);

    if (!lobby || lobby.gameState !== "playing" || !questions) {
      return false;
    }

    const nextIndex = lobby.currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      return false; // No more questions
    }

    lobby.currentQuestionIndex = nextIndex;
    lobby.currentQuestionId = questions[nextIndex].id;

    // Check if we should show intermediate scores
    if (this.shouldShowIntermediateScores(lobby, nextIndex)) {
      lobby.currentPhase = "intermediate-scores";
    } else {
      lobby.currentPhase = "answering";
    }

    this.clearAllAnswers(lobbyId);
    this.resetPlayerAnswerFlags(lobby);

    return true;
  }

  // Check if intermediate scores should be shown at this point
  private shouldShowIntermediateScores(lobby: Lobby, currentIndex: number): boolean {
    const total = lobby.totalQuestions || 0;
    
    if (total < 10) {
      // Show once at halfway point
      return currentIndex === Math.floor(total / 2);
    } else if (total < 15) {
      // Show twice at 1/3 and 2/3
      const breakpoint1 = Math.floor(total / 3);
      const breakpoint2 = Math.floor((2 * total) / 3);
      return currentIndex === breakpoint1 || currentIndex === breakpoint2;
    } else {
      // Show 3 times at 1/4, 1/2, and 3/4
      const breakpoint1 = Math.floor(total / 4);
      const breakpoint2 = Math.floor(total / 2);
      const breakpoint3 = Math.floor((3 * total) / 4);
      return currentIndex === breakpoint1 || currentIndex === breakpoint2 || currentIndex === breakpoint3;
    }
  }

  // Continue from intermediate scores to next question
  continueFromIntermediateScores(lobbyId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby || lobby.gameState !== "playing" || lobby.currentPhase !== "intermediate-scores") {
      return false;
    }

    lobby.currentPhase = "answering";
    return true;
  }

  // Custom Answers Mode Methods
  submitCustomAnswer(
    lobbyId: string,
    playerId: string,
    answerText: string
  ): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);
    
    if (!lobby || lobby.gameState !== "playing" || !currentQuestion) {
      return false;
    }
    
    // Validate phase and question type
    if (lobby.currentPhase !== "answering" || currentQuestion.type !== "custom-answers") {
      return false;
    }

    const player = this.findPlayer(lobbyId, playerId);
    if (!player) {
      return false;
    }

    const answers = this.customAnswers.get(lobbyId);
    if (!answers) {
      return false;
    }

    const answerId = uuidv4();
    answers.set(playerId, { playerId, answerText, answerId });
    player.hasAnswered = true;

    return true;
  }

  hasEveryoneSubmittedCustomAnswer(lobbyId: string): boolean {
    return this.hasEveryoneSubmitted(lobbyId, this.customAnswers);
  }

  prepareCustomAnswerVoting(lobbyId: string): CustomAnswer[] {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);
    const answers = this.customAnswers.get(lobbyId);
    
    if (!lobby || !currentQuestion || !answers || !currentQuestion.correctAnswer) {
      return [];
    }

    const correctAnswerId = uuidv4();
    const customAnswers: CustomAnswer[] = [
      ...Array.from(answers.entries()).map(([playerId, answer]) => ({
        id: answer.answerId,
        text: answer.answerText,
        playerId,
      })),
      { 
        id: correctAnswerId, 
        text: currentQuestion.correctAnswer, // Send both languages
      },
    ];

    this.shuffleArray(customAnswers);
    this.shuffledAnswers.set(lobbyId, customAnswers);
    
    // Transition to voting phase
    lobby.currentPhase = "voting";
    this.resetPlayerAnswerFlags(lobby);

    // Return answers without playerId to hide attribution
    return customAnswers.map(({ id, text }) => ({ id, text }));
  }

  getShuffledAnswers(lobbyId: string): CustomAnswer[] {
    return this.shuffledAnswers.get(lobbyId) || [];
  }

  getShuffledAnswersWithAttribution(lobbyId: string): CustomAnswer[] {
    // Return the cached shuffled answers WITH playerId for results display
    return this.shuffledAnswers.get(lobbyId) || [];
  }

  voteForAnswer(
    lobbyId: string,
    playerId: string,
    answerId: string
  ): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);
    
    if (!lobby || lobby.gameState !== "playing" || !currentQuestion) {
      return false;
    }
    
    // Validate phase
    if (lobby.currentPhase !== "voting") {
      return false;
    }

    const player = this.findPlayer(lobbyId, playerId);
    if (!player) {
      return false;
    }

    // Prevent voting for own answer
    if (this.isVotingForOwnAnswer(lobbyId, playerId, answerId)) {
      return false;
    }

    const votes = this.playerVotes.get(lobbyId);
    if (!votes) {
      return false;
    }

    votes.set(playerId, { playerId, votedAnswerId: answerId });
    player.hasAnswered = true;

    return true;
  }

  hasEveryoneVoted(lobbyId: string): boolean {
    return this.hasEveryoneSubmitted(lobbyId, this.playerVotes);
  }

  processCustomAnswerResult(lobbyId: string): Player[] {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);

    if (!lobby || !currentQuestion) {
      return [];
    }

    const votes = this.playerVotes.get(lobbyId);
    const customAnswers = this.customAnswers.get(lobbyId);
    const shuffledAnswers = this.shuffledAnswers.get(lobbyId);

    if (!votes || !customAnswers || !shuffledAnswers) {
      return [];
    }

    // Find correct answer ID from shuffled answers
    const correctAnswerId = shuffledAnswers.find(a => !a.playerId)?.id;
    if (!correctAnswerId) {
      return [];
    }

    const voteCounts = this.countVotes(votes);

    for (const player of lobby.players) {
      const vote = votes.get(player.id);

      // Points for correct vote
      if (vote && vote.votedAnswerId === correctAnswerId) {
        player.score += 1;
      }

      // Points for receiving votes
      const playerAnswer = customAnswers.get(player.id);
      if (playerAnswer) {
        player.score += voteCounts.get(playerAnswer.answerId) || 0;
      }
    }

    lobby.currentPhase = "revealing";
    this.resetPlayerAnswerFlags(lobby);
    return lobby.players;
  }

  getPlayerVotes(lobbyId: string): PlayerAnswerInfo[] {
    const votes = this.playerVotes.get(lobbyId);
    const allAnswers = this.shuffledAnswers.get(lobbyId);

    if (!votes) {
      return [];
    }

    const playerVotes: PlayerAnswerInfo[] = [];

    for (const [playerId, vote] of votes.entries()) {
      const answerObj = allAnswers?.find(
        (a) => a.id === vote.votedAnswerId
      );
      // Extract string text from potentially bilingual answer
      const answerText = answerObj ? (typeof answerObj.text === 'string' ? answerObj.text : answerObj.text.en) : undefined;
      playerVotes.push({
        playerId,
        answerId: vote.votedAnswerId,
        answerText,
      });
    }

    return playerVotes;
  }

  // Text Input Methods
  submitTextInput(
    lobbyId: string,
    playerId: string,
    answerText: string
  ): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);
    
    if (!lobby || lobby.gameState !== "playing" || !currentQuestion) {
      return false;
    }
    
    // Validate phase and question type
    if (lobby.currentPhase !== "answering" || currentQuestion.type !== "text-input") {
      return false;
    }

    const player = this.findPlayer(lobbyId, playerId);
    if (!player) {
      return false;
    }

    const answers = this.textInputAnswers.get(lobbyId);
    if (!answers) {
      return false;
    }

    answers.set(playerId, { playerId, answerText: answerText.trim() });
    player.hasAnswered = true;

    return true;
  }

  hasEveryoneSubmittedTextInput(lobbyId: string): boolean {
    return this.hasEveryoneSubmitted(lobbyId, this.textInputAnswers);
  }

  getTextInputPlayerAnswers(lobbyId: string): PlayerAnswerInfo[] {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby) {
      return [];
    }

    const answers = this.textInputAnswers.get(lobbyId);

    if (!answers) {
      return [];
    }

    const playerAnswers: PlayerAnswerInfo[] = [];

    for (const player of lobby.players) {
      const answer = answers.get(player.id);

      if (answer) {
        playerAnswers.push({
          playerId: player.id,
          answerId: "",
          answerText: answer.answerText,
        });
      }
    }

    return playerAnswers;
  }

  processTextInputResult(lobbyId: string): {
    players: Player[];
    correctPlayerIds: string[];
    playerAnswers: PlayerAnswerInfo[];
  } {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);

    if (!lobby || !currentQuestion || !currentQuestion.correctAnswers) {
      return { players: [], correctPlayerIds: [], playerAnswers: [] };
    }

    const answers = this.textInputAnswers.get(lobbyId);
    if (!answers) {
      return { players: [], correctPlayerIds: [], playerAnswers: [] };
    }

    const normalizedCorrectAnswers = currentQuestion.correctAnswers.map((a) =>
      a.toLowerCase().trim()
    );
    const correctPlayerIds: string[] = [];
    const playerAnswers: PlayerAnswerInfo[] = [];

    for (const player of lobby.players) {
      const answer = answers.get(player.id);

      if (answer) {
        const isCorrect = normalizedCorrectAnswers.includes(
          answer.answerText.toLowerCase().trim()
        );

        if (isCorrect) {
          player.score += 1;
          correctPlayerIds.push(player.id);
        }

        playerAnswers.push({
          playerId: player.id,
          answerId: "",
          answerText: answer.answerText,
        });
      }
    }

    lobby.currentPhase = "revealing";
    this.resetPlayerAnswerFlags(lobby);
    return { players: lobby.players, correctPlayerIds, playerAnswers };
  }

  // Order Question Methods
  submitOrder(
    lobbyId: string,
    playerId: string,
    orderedItemIds: string[]
  ): boolean {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);
    
    if (!lobby || lobby.gameState !== "playing" || !currentQuestion) {
      return false;
    }
    
    // Validate phase and question type
    if (lobby.currentPhase !== "answering" || currentQuestion.type !== "order") {
      return false;
    }

    const player = this.findPlayer(lobbyId, playerId);
    if (!player) {
      return false;
    }

    const orders = this.orderAnswers.get(lobbyId);
    if (!orders) {
      return false;
    }

    orders.set(playerId, { playerId, orderedItemIds });
    player.hasAnswered = true;

    return true;
  }

  hasEveryoneSubmittedOrder(lobbyId: string): boolean {
    return this.hasEveryoneSubmitted(lobbyId, this.orderAnswers);
  }

  processOrderResult(lobbyId: string): {
    players: Player[];
    playerOrders: PlayerAnswerInfo[];
    playerScores: { [playerId: string]: number };
  } {
    const lobby = this.lobbies.get(lobbyId);
    const currentQuestion = this.getCurrentQuestion(lobbyId);

    if (!lobby || !currentQuestion || !currentQuestion.correctOrder) {
      return { players: [], playerOrders: [], playerScores: {} };
    }

    const orders = this.orderAnswers.get(lobbyId);
    if (!orders) {
      return { players: [], playerOrders: [], playerScores: {} };
    }

    const playerOrders: PlayerAnswerInfo[] = [];
    const playerScores: { [playerId: string]: number } = {};

    for (const player of lobby.players) {
      const order = orders.get(player.id);

      if (order) {
        const score = currentQuestion.correctOrder.every(
          (id, i) => id === order.orderedItemIds[i]
        )
          ? 1
          : 0;
        player.score += score;
        playerScores[player.id] = score;

        playerOrders.push({
          playerId: player.id,
          answerId: order.orderedItemIds.join(","),
          answerText: `${score}/${currentQuestion.correctOrder.length} correct`,
        });
      }
    }

    lobby.currentPhase = "revealing";
    this.resetPlayerAnswerFlags(lobby);
    return { players: lobby.players, playerOrders, playerScores };
  }

  endGame(lobbyId: string): Player[] {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby) {
      return [];
    }

    lobby.gameState = "finished";

    return lobby.players.sort((a, b) => b.score - a.score);
  }

  removePlayer(lobbyId: string, playerId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return;
    }

    const playerIndex = lobby.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
      lobby.players.splice(playerIndex, 1);
    }

    this.playerAnswers.get(lobbyId)?.delete(playerId);

    if (lobby.players.length === 0) {
      this.cleanupLobby(lobbyId);
    }
  }

  setPlayerConnected(
    lobbyId: string,
    playerId: string,
    connected: boolean
  ): void {
    const player = this.findPlayer(lobbyId, playerId);
    if (player) {
      player.connected = connected;
    }
  }

  // Private helper methods
  private initializeLobbyAnswerMaps(lobbyId: string): void {
    this.playerAnswers.set(lobbyId, new Map());
    this.customAnswers.set(lobbyId, new Map());
    this.playerVotes.set(lobbyId, new Map());
    this.textInputAnswers.set(lobbyId, new Map());
    this.orderAnswers.set(lobbyId, new Map());
    this.questionAnswerMappings.set(lobbyId, new Map());
  }

  private clearAllAnswers(lobbyId: string): void {
    this.playerAnswers.set(lobbyId, new Map());
    this.customAnswers.set(lobbyId, new Map());
    this.playerVotes.set(lobbyId, new Map());
    this.shuffledAnswers.delete(lobbyId);
    this.textInputAnswers.set(lobbyId, new Map());
    this.orderAnswers.set(lobbyId, new Map());
  }

  private cleanupLobby(lobbyId: string): void {
    this.lobbies.delete(lobbyId);
    this.lobbyQuestions.delete(lobbyId);
    this.playerAnswers.delete(lobbyId);
    this.customAnswers.delete(lobbyId);
    this.playerVotes.delete(lobbyId);
    this.shuffledAnswers.delete(lobbyId);
    this.textInputAnswers.delete(lobbyId);
    this.orderAnswers.delete(lobbyId);
    this.questionAnswerMappings.delete(lobbyId);
  }

  private findPlayer(lobbyId: string, playerId: string): Player | undefined {
    const lobby = this.lobbies.get(lobbyId);
    return lobby?.players.find((p) => p.id === playerId);
  }

  private resetPlayerAnswerFlags(lobby: Lobby): void {
    for (const player of lobby.players) {
      player.hasAnswered = false;
    }
  }

  private hasEveryoneSubmitted<T>(
    lobbyId: string,
    answerMap: Map<string, Map<string, T>>
  ): boolean {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) {
      return false;
    }

    const playersWithNames = lobby.players.filter((p) => p.name);
    const answers = answerMap.get(lobbyId);

    if (!answers || playersWithNames.length === 0) {
      return false;
    }

    return playersWithNames.every((player) => answers.has(player.id));
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  private isVotingForOwnAnswer(
    lobbyId: string,
    playerId: string,
    answerId: string
  ): boolean {
    const customAnswers = this.customAnswers.get(lobbyId);
    if (!customAnswers) {
      return false;
    }
    const playerAnswer = customAnswers.get(playerId);
    return playerAnswer?.answerId === answerId;
  }

  private countVotes(votes: Map<string, PlayerVote>): Map<string, number> {
    const voteCounts = new Map<string, number>();
    for (const vote of votes.values()) {
      const count = voteCounts.get(vote.votedAnswerId) || 0;
      voteCounts.set(vote.votedAnswerId, count + 1);
    }
    return voteCounts;
  }
}
