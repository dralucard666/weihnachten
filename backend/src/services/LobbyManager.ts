import { Lobby, Player, GameState, CustomAnswer, PlayerAnswerInfo } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { PersistenceService } from './PersistenceService';

interface PlayerAnswer {
  playerId: string;
  answerId: string;
}

interface PlayerCustomAnswer {
  playerId: string;
  answerText: string;
  answerId: string; // Generated ID for this custom answer
}

interface PlayerVote {
  playerId: string;
  votedAnswerId: string;
}

interface PlayerTextInput {
  playerId: string;
  answerText: string;
}

export class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private playerAnswers: Map<string, Map<string, PlayerAnswer>> = new Map(); // lobbyId -> Map<playerId, answer>
  private customAnswers: Map<string, Map<string, PlayerCustomAnswer>> = new Map(); // lobbyId -> Map<playerId, customAnswer>
  private playerVotes: Map<string, Map<string, PlayerVote>> = new Map(); // lobbyId -> Map<playerId, vote>
  private shuffledAnswers: Map<string, CustomAnswer[]> = new Map(); // lobbyId -> shuffled answers cache
  private textInputAnswers: Map<string, Map<string, PlayerTextInput>> = new Map(); // lobbyId -> Map<playerId, textInput>
  private persistenceService: PersistenceService;

  constructor() {
    this.persistenceService = new PersistenceService();
  }

  createLobby(): Lobby {
    const lobbyId = uuidv4();
    const lobby: Lobby = {
      id: lobbyId,
      gameState: 'lobby',
      players: [],
      currentQuestionIndex: 0,
      createdAt: new Date().toISOString(),
    };
    
    this.lobbies.set(lobbyId, lobby);
    this.playerAnswers.set(lobbyId, new Map());
    this.customAnswers.set(lobbyId, new Map());
    this.playerVotes.set(lobbyId, new Map());
    this.textInputAnswers.set(lobbyId, new Map());
    
    return lobby;
  }

  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.get(lobbyId);
  }

  joinLobby(lobbyId: string): { success: boolean; playerId?: string; lobby?: Lobby } {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return { success: false };
    }

    if (lobby.gameState !== 'lobby') {
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

  setPlayerName(lobbyId: string, playerId: string, playerName: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return false;
    }

    const player = lobby.players.find(p => p.id === playerId);
    
    if (!player) {
      return false;
    }

    player.name = playerName;
    return true;
  }

  startGame(lobbyId: string, questionId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby || lobby.gameState !== 'lobby') {
      return false;
    }

    lobby.gameState = 'playing';
    lobby.currentQuestionIndex = 0;
    lobby.currentQuestionId = questionId;
    
    // Clear any previous answers
    this.playerAnswers.set(lobbyId, new Map());
    
    return true;
  }

  setAnswer(lobbyId: string, playerId: string, questionId: string, answerId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby || lobby.gameState !== 'playing') {
      return false;
    }

    if (lobby.currentQuestionId !== questionId) {
      return false;
    }

    const player = lobby.players.find(p => p.id === playerId);
    
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
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return false;
    }

    const playersWithNames = lobby.players.filter(p => p.name);
    const answers = this.playerAnswers.get(lobbyId);
    
    if (!answers || playersWithNames.length === 0) {
      return false;
    }

    return playersWithNames.every(player => answers.has(player.id));
  }

  processQuestionResult(lobbyId: string, questionId: string, correctAnswerId: string): Player[] {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby || lobby.currentQuestionId !== questionId) {
      return [];
    }

    const answers = this.playerAnswers.get(lobbyId);
    
    if (!answers) {
      return [];
    }

    // Update scores for correct answers
    for (const player of lobby.players) {
      const answer = answers.get(player.id);
      
      if (answer && answer.answerId === correctAnswerId) {
        player.score += 1;
      }
      
      // Reset hasAnswered flag
      player.hasAnswered = false;
    }

    return lobby.players;
  }

  getPlayerAnswers(lobbyId: string, answersList?: Array<{ id: string; text: string }>): PlayerAnswerInfo[] {
    const answers = this.playerAnswers.get(lobbyId);
    
    if (!answers) {
      return [];
    }

    const playerAnswers: PlayerAnswerInfo[] = [];
    
    for (const [playerId, answer] of answers.entries()) {
      const answerText = answersList?.find(a => a.id === answer.answerId)?.text;
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
    
    if (!lobby || lobby.gameState !== 'playing') {
      return false;
    }

    lobby.currentQuestionIndex += 1;
    lobby.currentQuestionId = questionId;
    
    // Clear answers for new question
    this.playerAnswers.set(lobbyId, new Map());
    this.customAnswers.set(lobbyId, new Map());
    this.playerVotes.set(lobbyId, new Map());
    this.shuffledAnswers.delete(lobbyId);
    this.textInputAnswers.set(lobbyId, new Map());
    
    // Reset hasAnswered flags
    for (const player of lobby.players) {
      player.hasAnswered = false;
    }
    
    // Save state after moving to next question
    this.saveState();
    
    return true;
  }

  // Custom Answers Mode Methods
  submitCustomAnswer(lobbyId: string, playerId: string, questionId: string, answerText: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby || lobby.gameState !== 'playing') {
      return false;
    }

    if (lobby.currentQuestionId !== questionId) {
      return false;
    }

    const player = lobby.players.find(p => p.id === playerId);
    
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
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return false;
    }

    const playersWithNames = lobby.players.filter(p => p.name);
    const answers = this.customAnswers.get(lobbyId);
    
    if (!answers || playersWithNames.length === 0) {
      return false;
    }

    return playersWithNames.every(player => answers.has(player.id));
  }

  getAllCustomAnswers(lobbyId: string, correctAnswerId: string, correctAnswerText: string): CustomAnswer[] {
    const answers = this.customAnswers.get(lobbyId);
    
    if (!answers) {
      return [];
    }

    const customAnswers: CustomAnswer[] = [];
    
    // Add all player answers (WITH playerId for internal tracking, but hidden from clients initially)
    for (const [playerId, answer] of answers.entries()) {
      customAnswers.push({
        id: answer.answerId,
        text: answer.answerText,
        playerId: playerId
      });
    }
    
    // Add the correct answer (without playerId)
    customAnswers.push({
      id: correctAnswerId,
      text: correctAnswerText
    });
    
    // Shuffle the answers
    for (let i = customAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [customAnswers[i], customAnswers[j]] = [customAnswers[j], customAnswers[i]];
    }
    
    // Cache the shuffled answers WITH playerIds for later scoring
    this.shuffledAnswers.set(lobbyId, customAnswers);
    
    // Return answers WITHOUT playerId to hide who submitted what
    return customAnswers.map(answer => ({
      id: answer.id,
      text: answer.text
      // playerId intentionally omitted
    }));
  }

  getShuffledAnswers(lobbyId: string): CustomAnswer[] {
    return this.shuffledAnswers.get(lobbyId) || [];
  }

  getShuffledAnswersWithAttribution(lobbyId: string): CustomAnswer[] {
    // Return the cached shuffled answers WITH playerId for results display
    return this.shuffledAnswers.get(lobbyId) || [];
  }

  voteForAnswer(lobbyId: string, playerId: string, questionId: string, answerId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby || lobby.gameState !== 'playing') {
      return false;
    }

    if (lobby.currentQuestionId !== questionId) {
      return false;
    }

    const player = lobby.players.find(p => p.id === playerId);
    
    if (!player) {
      return false;
    }

    // Check if player is voting for their own answer
    const customAnswers = this.customAnswers.get(lobbyId);
    if (customAnswers) {
      const playerAnswer = customAnswers.get(playerId);
      if (playerAnswer && playerAnswer.answerId === answerId) {
        return false; // Can't vote for own answer
      }
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
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return false;
    }

    const playersWithNames = lobby.players.filter(p => p.name);
    const votes = this.playerVotes.get(lobbyId);
    
    if (!votes || playersWithNames.length === 0) {
      return false;
    }

    return playersWithNames.every(player => votes.has(player.id));
  }

  processCustomAnswerResult(lobbyId: string, questionId: string, correctAnswerId: string): Player[] {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby || lobby.currentQuestionId !== questionId) {
      return [];
    }

    const votes = this.playerVotes.get(lobbyId);
    const customAnswers = this.customAnswers.get(lobbyId);
    
    if (!votes || !customAnswers) {
      return [];
    }

    // Count votes for each answer
    const voteCounts = new Map<string, number>();
    for (const vote of votes.values()) {
      const count = voteCounts.get(vote.votedAnswerId) || 0;
      voteCounts.set(vote.votedAnswerId, count + 1);
    }

    // Update scores
    for (const player of lobby.players) {
      const vote = votes.get(player.id);
      
      // Points for voting for the correct answer
      if (vote && vote.votedAnswerId === correctAnswerId) {
        player.score += 1;
      }
      
      // Points for other players voting for this player's answer
      const playerAnswer = customAnswers.get(player.id);
      if (playerAnswer) {
        const votesForThisAnswer = voteCounts.get(playerAnswer.answerId) || 0;
        player.score += votesForThisAnswer;
      }
      
      // Reset hasAnswered flag
      player.hasAnswered = false;
    }

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
      const answerText = allAnswers?.find(a => a.id === vote.votedAnswerId)?.text;
      playerVotes.push({
        playerId,
        answerId: vote.votedAnswerId,
        answerText,
      });
    }
    
    return playerVotes;
  }

  // Text Input Methods
  submitTextInput(lobbyId: string, playerId: string, questionId: string, answerText: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby || lobby.gameState !== 'playing') {
      return false;
    }

    if (lobby.currentQuestionId !== questionId) {
      return false;
    }

    const player = lobby.players.find(p => p.id === playerId);
    
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
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return false;
    }

    const playersWithNames = lobby.players.filter(p => p.name);
    const answers = this.textInputAnswers.get(lobbyId);
    
    if (!answers || playersWithNames.length === 0) {
      return false;
    }

    return playersWithNames.every(player => answers.has(player.id));
  }

  getTextInputPlayerAnswers(lobbyId: string, questionId: string): PlayerAnswerInfo[] {
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
          answerId: '',
          answerText: answer.answerText
        });
      }
    }

    return playerAnswers;
  }

  processTextInputResult(lobbyId: string, questionId: string, correctAnswers: string[]): { players: Player[], correctPlayerIds: string[], playerAnswers: PlayerAnswerInfo[] } {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby || lobby.currentQuestionId !== questionId) {
      return { players: [], correctPlayerIds: [], playerAnswers: [] };
    }

    const answers = this.textInputAnswers.get(lobbyId);
    
    if (!answers) {
      return { players: [], correctPlayerIds: [], playerAnswers: [] };
    }

    // Normalize correct answers (lowercase, trimmed)
    const normalizedCorrectAnswers = correctAnswers.map(a => a.toLowerCase().trim());
    const correctPlayerIds: string[] = [];
    const playerAnswers: PlayerAnswerInfo[] = [];

    // Update scores for correct answers
    for (const player of lobby.players) {
      const answer = answers.get(player.id);
      
      if (answer) {
        const normalizedPlayerAnswer = answer.answerText.toLowerCase().trim();
        const isCorrect = normalizedCorrectAnswers.includes(normalizedPlayerAnswer);
        
        if (isCorrect) {
          player.score += 1;
          correctPlayerIds.push(player.id);
        }
        
        playerAnswers.push({
          playerId: player.id,
          answerId: '', // Not used for text input
          answerText: answer.answerText
        });
      }
      
      // Reset hasAnswered flag
      player.hasAnswered = false;
    }

    return { players: lobby.players, correctPlayerIds, playerAnswers };
  }

  endGame(lobbyId: string): Player[] {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return [];
    }

    lobby.gameState = 'finished';
    
    // Remove lobby from persistence when game ends
    this.removeLobbyFromPersistence(lobbyId);
    
    return lobby.players.sort((a, b) => b.score - a.score);
  }

  removePlayer(lobbyId: string, playerId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return;
    }

    const playerIndex = lobby.players.findIndex(p => p.id === playerId);
    
    if (playerIndex !== -1) {
      lobby.players.splice(playerIndex, 1);
    }

    // Remove their answer if any
    const answers = this.playerAnswers.get(lobbyId);
    
    if (answers) {
      answers.delete(playerId);
    }

    // Clean up empty lobbies
    if (lobby.players.length === 0) {
      this.lobbies.delete(lobbyId);
      this.playerAnswers.delete(lobbyId);
      this.customAnswers.delete(lobbyId);
      this.playerVotes.delete(lobbyId);
      this.shuffledAnswers.delete(lobbyId);
      this.textInputAnswers.delete(lobbyId);
    }
  }

  setPlayerConnected(lobbyId: string, playerId: string, connected: boolean): void {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby) {
      return;
    }

    const player = lobby.players.find(p => p.id === playerId);
    
    if (player) {
      player.connected = connected;
    }
  }

  // Persistence methods
  private saveState(): void {
    this.persistenceService.saveState(this.lobbies).catch(error => {
      console.error('Failed to persist state:', error);
    });
  }

  private removeLobbyFromPersistence(lobbyId: string): void {
    this.persistenceService.removeLobby(lobbyId).catch(error => {
      console.error('Failed to remove lobby from persistence:', error);
    });
  }

  async loadLobbyFromPersistence(lobbyId: string): Promise<Lobby | undefined> {
    const lobby = await this.persistenceService.getLobby(lobbyId);
    
    if (lobby) {
      // Restore lobby to memory
      this.lobbies.set(lobbyId, lobby);
      
      // Initialize empty answer maps for this lobby
      if (!this.playerAnswers.has(lobbyId)) {
        this.playerAnswers.set(lobbyId, new Map());
      }
      if (!this.customAnswers.has(lobbyId)) {
        this.customAnswers.set(lobbyId, new Map());
      }
      if (!this.playerVotes.has(lobbyId)) {
        this.playerVotes.set(lobbyId, new Map());
      }
      if (!this.textInputAnswers.has(lobbyId)) {
        this.textInputAnswers.set(lobbyId, new Map());
      }
      
      console.log(`Lobby ${lobbyId} restored from persistence`);
    }
    
    return lobby;
  }
}
