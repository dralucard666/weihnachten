import {
  Lobby,
  Player,
  GameState,
  CustomAnswer,
  PlayerAnswerInfo,
} from "../../../shared/types";
import { v4 as uuidv4 } from "uuid";
import { PersistenceService } from "./PersistenceService";

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
  private playerAnswers: Map<string, Map<string, PlayerAnswer>> = new Map(); // lobbyId -> Map<playerId, answer>
  private customAnswers: Map<string, Map<string, PlayerCustomAnswer>> =
    new Map(); // lobbyId -> Map<playerId, customAnswer>
  private playerVotes: Map<string, Map<string, PlayerVote>> = new Map(); // lobbyId -> Map<playerId, vote>
  private shuffledAnswers: Map<string, CustomAnswer[]> = new Map(); // lobbyId -> shuffled answers cache
  private textInputAnswers: Map<string, Map<string, PlayerTextInput>> =
    new Map(); // lobbyId -> Map<playerId, textInput>
  private orderAnswers: Map<string, Map<string, PlayerOrder>> = new Map(); // lobbyId -> Map<playerId, order>
  private persistenceService: PersistenceService;

  constructor() {
    this.persistenceService = new PersistenceService();
  }

  createLobby(): Lobby {
    const lobbyId = uuidv4();
    const lobby: Lobby = {
      id: lobbyId,
      gameState: "lobby",
      players: [],
      currentQuestionIndex: 0,
      createdAt: new Date().toISOString(),
    };

    this.lobbies.set(lobbyId, lobby);
    this.initializeLobbyAnswerMaps(lobbyId);

    return lobby;
  }

  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.get(lobbyId);
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

  startGame(lobbyId: string, questionId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby || lobby.gameState !== "lobby") {
      return false;
    }

    lobby.gameState = "playing";
    lobby.currentQuestionIndex = 0;
    lobby.currentQuestionId = questionId;
    this.clearAllAnswers(lobbyId);

    return true;
  }

  setAnswer(
    lobbyId: string,
    playerId: string,
    questionId: string,
    answerId: string
  ): boolean {
    if (!this.validateQuestionContext(lobbyId, questionId)) {
      return false;
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

  processQuestionResult(
    lobbyId: string,
    questionId: string,
    correctAnswerId: string
  ): Player[] {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby || lobby.currentQuestionId !== questionId) {
      return [];
    }

    const answers = this.playerAnswers.get(lobbyId);
    if (!answers) {
      return [];
    }

    for (const player of lobby.players) {
      const answer = answers.get(player.id);
      if (answer && answer.answerId === correctAnswerId) {
        player.score += 1;
      }
    }

    this.resetPlayerAnswerFlags(lobby);
    return lobby.players;
  }

  getPlayerAnswers(
    lobbyId: string,
    answersList?: Array<{ id: string; text: string }>
  ): PlayerAnswerInfo[] {
    const answers = this.playerAnswers.get(lobbyId);

    if (!answers) {
      return [];
    }

    const playerAnswers: PlayerAnswerInfo[] = [];

    for (const [playerId, answer] of answers.entries()) {
      const answerText = answersList?.find(
        (a) => a.id === answer.answerId
      )?.text;
      playerAnswers.push({
        playerId,
        answerId: answer.answerId,
        answerText,
      });
    }

    return playerAnswers;
  }

  nextQuestion(lobbyId: string, questionId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby || lobby.gameState !== "playing") {
      return false;
    }

    lobby.currentQuestionIndex += 1;
    lobby.currentQuestionId = questionId;

    this.clearAllAnswers(lobbyId);
    this.resetPlayerAnswerFlags(lobby);
    this.saveState();

    return true;
  }

  // Custom Answers Mode Methods
  submitCustomAnswer(
    lobbyId: string,
    playerId: string,
    questionId: string,
    answerText: string
  ): boolean {
    if (!this.validateQuestionContext(lobbyId, questionId)) {
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

  getAllCustomAnswers(
    lobbyId: string,
    correctAnswerId: string,
    correctAnswerText: string
  ): CustomAnswer[] {
    const answers = this.customAnswers.get(lobbyId);
    if (!answers) {
      return [];
    }

    const customAnswers: CustomAnswer[] = [
      ...Array.from(answers.entries()).map(([playerId, answer]) => ({
        id: answer.answerId,
        text: answer.answerText,
        playerId,
      })),
      { id: correctAnswerId, text: correctAnswerText },
    ];

    this.shuffleArray(customAnswers);
    this.shuffledAnswers.set(lobbyId, customAnswers);

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
    questionId: string,
    answerId: string
  ): boolean {
    if (!this.validateQuestionContext(lobbyId, questionId)) {
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

  processCustomAnswerResult(
    lobbyId: string,
    questionId: string,
    correctAnswerId: string
  ): Player[] {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby || lobby.currentQuestionId !== questionId) {
      return [];
    }

    const votes = this.playerVotes.get(lobbyId);
    const customAnswers = this.customAnswers.get(lobbyId);

    if (!votes || !customAnswers) {
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
      const answerText = allAnswers?.find(
        (a) => a.id === vote.votedAnswerId
      )?.text;
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
    questionId: string,
    answerText: string
  ): boolean {
    if (!this.validateQuestionContext(lobbyId, questionId)) {
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

  getTextInputPlayerAnswers(
    lobbyId: string,
    questionId: string
  ): PlayerAnswerInfo[] {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby || lobby.currentQuestionId !== questionId) {
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

  processTextInputResult(
    lobbyId: string,
    questionId: string,
    correctAnswers: string[]
  ): {
    players: Player[];
    correctPlayerIds: string[];
    playerAnswers: PlayerAnswerInfo[];
  } {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby || lobby.currentQuestionId !== questionId) {
      return { players: [], correctPlayerIds: [], playerAnswers: [] };
    }

    const answers = this.textInputAnswers.get(lobbyId);
    if (!answers) {
      return { players: [], correctPlayerIds: [], playerAnswers: [] };
    }

    const normalizedCorrectAnswers = correctAnswers.map((a) =>
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

    this.resetPlayerAnswerFlags(lobby);
    return { players: lobby.players, correctPlayerIds, playerAnswers };
  }

  // Order Question Methods
  submitOrder(
    lobbyId: string,
    playerId: string,
    questionId: string,
    orderedItemIds: string[]
  ): boolean {
    if (!this.validateQuestionContext(lobbyId, questionId)) {
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

  processOrderResult(
    lobbyId: string,
    questionId: string,
    correctOrder: string[]
  ): {
    players: Player[];
    playerOrders: PlayerAnswerInfo[];
    playerScores: { [playerId: string]: number };
  } {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby || lobby.currentQuestionId !== questionId) {
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
        const score = correctOrder.every(
          (id, i) => id === order.orderedItemIds[i]
        )
          ? 1
          : 0;
        player.score += score;
        playerScores[player.id] = score;

        playerOrders.push({
          playerId: player.id,
          answerId: order.orderedItemIds.join(","),
          answerText: `${score}/${correctOrder.length} correct`,
        });
      }
    }

    this.resetPlayerAnswerFlags(lobby);
    return { players: lobby.players, playerOrders, playerScores };
  }

  endGame(lobbyId: string): Player[] {
    const lobby = this.lobbies.get(lobbyId);

    if (!lobby) {
      return [];
    }

    lobby.gameState = "finished";

    // Remove lobby from persistence when game ends
    this.removeLobbyFromPersistence(lobbyId);

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

  // Persistence methods
  private saveState(): void {
    this.persistenceService.saveState(this.lobbies).catch((error) => {
      console.error("Failed to persist state:", error);
    });
  }

  private removeLobbyFromPersistence(lobbyId: string): void {
    this.persistenceService.removeLobby(lobbyId).catch((error) => {
      console.error("Failed to remove lobby from persistence:", error);
    });
  }

  async loadLobbyFromPersistence(lobbyId: string): Promise<Lobby | undefined> {
    const lobby = await this.persistenceService.getLobby(lobbyId);

    if (lobby) {
      this.lobbies.set(lobbyId, lobby);
      this.initializeLobbyAnswerMaps(lobbyId);
      console.log(`Lobby ${lobbyId} restored from persistence`);
    }

    return lobby;
  }

  // Private helper methods
  private initializeLobbyAnswerMaps(lobbyId: string): void {
    this.playerAnswers.set(lobbyId, new Map());
    this.customAnswers.set(lobbyId, new Map());
    this.playerVotes.set(lobbyId, new Map());
    this.textInputAnswers.set(lobbyId, new Map());
    this.orderAnswers.set(lobbyId, new Map());
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
    this.playerAnswers.delete(lobbyId);
    this.customAnswers.delete(lobbyId);
    this.playerVotes.delete(lobbyId);
    this.shuffledAnswers.delete(lobbyId);
    this.textInputAnswers.delete(lobbyId);
    this.orderAnswers.delete(lobbyId);
  }

  private findPlayer(lobbyId: string, playerId: string): Player | undefined {
    const lobby = this.lobbies.get(lobbyId);
    return lobby?.players.find((p) => p.id === playerId);
  }

  private validateQuestionContext(
    lobbyId: string,
    questionId: string
  ): boolean {
    const lobby = this.lobbies.get(lobbyId);
    return (
      lobby !== undefined &&
      lobby.gameState === "playing" &&
      lobby.currentQuestionId === questionId
    );
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
