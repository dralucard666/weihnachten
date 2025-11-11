import { Lobby, Player, GameState } from '../../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { PersistenceService } from './PersistenceService';

interface PlayerAnswer {
  playerId: string;
  answerId: string;
}

export class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private playerAnswers: Map<string, Map<string, PlayerAnswer>> = new Map(); // lobbyId -> Map<playerId, answer>
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

  nextQuestion(lobbyId: string, questionId: string): boolean {
    const lobby = this.lobbies.get(lobbyId);
    
    if (!lobby || lobby.gameState !== 'playing') {
      return false;
    }

    lobby.currentQuestionIndex += 1;
    lobby.currentQuestionId = questionId;
    
    // Clear answers for new question
    this.playerAnswers.set(lobbyId, new Map());
    
    // Reset hasAnswered flags
    for (const player of lobby.players) {
      player.hasAnswered = false;
    }
    
    // Save state after moving to next question
    this.saveState();
    
    return true;
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
      
      // Initialize empty answer map for this lobby
      if (!this.playerAnswers.has(lobbyId)) {
        this.playerAnswers.set(lobbyId, new Map());
      }
      
      console.log(`Lobby ${lobbyId} restored from persistence`);
    }
    
    return lobby;
  }
}
