import { Server, Socket } from 'socket.io';
import { 
  ServerToClientEvents, 
  ClientToServerEvents,
  CreateLobbyResponse,
  JoinLobbyRequest,
  JoinLobbyResponse,
  SetNameRequest,
  SetNameResponse,
  StartGameRequest,
  SetAnswerRequest,
  SetAnswerResponse,
  QuestionResultRequest,
  NextQuestionRequest
} from '../../../shared/types';
import { LobbyManager } from './LobbyManager';

export class SocketHandler {
  private lobbyManager: LobbyManager;
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
    this.lobbyManager = new LobbyManager();
  }

  handleConnection(socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
    console.log(`Client connected: ${socket.id}`);

    // Create Lobby
    socket.on('createLobby', (callback) => {
      const lobby = this.lobbyManager.createLobby();
      socket.join(lobby.id);
      
      const response: CreateLobbyResponse = {
        lobbyId: lobby.id,
        lobby
      };
      
      callback(response);
      console.log(`Lobby created: ${lobby.id}`);
    });

    // Join Lobby
    socket.on('joinLobby', (data: JoinLobbyRequest, callback) => {
      const result = this.lobbyManager.joinLobby(data.lobbyId);
      
      if (!result.success || !result.playerId || !result.lobby) {
        callback({ success: false, playerId: '', lobby: result.lobby! });
        return;
      }

      socket.join(data.lobbyId);
      this.playerSockets.set(result.playerId, socket.id);
      
      const response: JoinLobbyResponse = {
        success: true,
        playerId: result.playerId,
        lobby: result.lobby
      };
      
      callback(response);
      
      // Notify others in the lobby
      const player = result.lobby.players.find(p => p.id === result.playerId);
      if (player) {
        socket.to(data.lobbyId).emit('playerJoined', player);
      }
      
      console.log(`Player ${result.playerId} joined lobby ${data.lobbyId}`);
    });

    // Set Name
    socket.on('setName', (data: SetNameRequest, callback) => {
      const success = this.lobbyManager.setPlayerName(data.lobbyId, data.playerId, data.playerName);
      
      callback({ success });
      
      if (success) {
        const lobby = this.lobbyManager.getLobby(data.lobbyId);
        if (lobby) {
          this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
        }
        console.log(`Player ${data.playerId} set name to ${data.playerName}`);
      }
    });

    // Start Game
    socket.on('startGame', (data: StartGameRequest) => {
      const success = this.lobbyManager.startGame(data.lobbyId, data.questionId);
      
      if (success) {
        const lobby = this.lobbyManager.getLobby(data.lobbyId);
        if (lobby) {
          this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
          this.io.to(data.lobbyId).emit('questionStarted', {
            questionId: data.questionId,
            questionIndex: 0,
            answers: data.answers
          });
        }
        console.log(`Game started in lobby ${data.lobbyId}`);
      }
    });

    // Set Answer
    socket.on('setAnswer', (data: SetAnswerRequest, callback) => {
      const success = this.lobbyManager.setAnswer(
        data.lobbyId,
        data.playerId,
        data.questionId,
        data.answerId
      );
      
      callback({ success });
      
      if (success) {
        // Notify game master that player answered
        socket.to(data.lobbyId).emit('playerAnswered', data.playerId);
        
        // Check if everyone answered
        if (this.lobbyManager.hasEveryoneAnswered(data.lobbyId)) {
          this.io.to(data.lobbyId).emit('everybodyAnswered');
        }
        
        console.log(`Player ${data.playerId} answered question ${data.questionId}`);
      }
    });

    // Question Result
    socket.on('questionResult', (data: QuestionResultRequest) => {
      const updatedPlayers = this.lobbyManager.processQuestionResult(
        data.lobbyId,
        data.questionId,
        data.correctAnswerId
      );
      
      if (updatedPlayers.length > 0) {
        this.io.to(data.lobbyId).emit('scoresUpdated', updatedPlayers);
        console.log(`Question ${data.questionId} results processed for lobby ${data.lobbyId}`);
      }
    });

    // Next Question
    socket.on('nextQuestion', (data: NextQuestionRequest) => {
      const success = this.lobbyManager.nextQuestion(data.lobbyId, data.questionId);
      
      if (success) {
        const lobby = this.lobbyManager.getLobby(data.lobbyId);
        if (lobby) {
          this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
          this.io.to(data.lobbyId).emit('questionStarted', {
            questionId: data.questionId,
            questionIndex: lobby.currentQuestionIndex,
            answers: data.answers
          });
        }
        console.log(`Next question ${data.questionId} in lobby ${data.lobbyId}`);
      }
    });

    // End Game
    socket.on('endGame', (lobbyId: string) => {
      const finalScores = this.lobbyManager.endGame(lobbyId);
      
      if (finalScores.length > 0) {
        const lobby = this.lobbyManager.getLobby(lobbyId);
        if (lobby) {
          this.io.to(lobbyId).emit('lobbyUpdated', lobby);
        }
        this.io.to(lobbyId).emit('gameFinished', finalScores);
        console.log(`Game ended in lobby ${lobbyId}`);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Find player by socket ID and mark as disconnected
      for (const [playerId, socketId] of this.playerSockets.entries()) {
        if (socketId === socket.id) {
          this.playerSockets.delete(playerId);
          // Could implement reconnection logic here
          break;
        }
      }
    });
  }
}
