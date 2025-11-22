import { Server, Socket } from 'socket.io';
import { 
  ServerToClientEvents, 
  ClientToServerEvents,
  CreateLobbyResponse,
  JoinLobbyRequest,
  JoinLobbyResponse,
  ReconnectPlayerRequest,
  ReconnectPlayerResponse,
  ReconnectMasterRequest,
  ReconnectMasterResponse,
  SetNameRequest,
  SetNameResponse,
  StartGameRequest,
  SetAnswerRequest,
  SetAnswerResponse,
  QuestionResultRequest,
  NextQuestionRequest,
  SubmitCustomAnswerRequest,
  SubmitCustomAnswerResponse,
  GetCustomAnswersRequest,
  TriggerAnswerVotingRequest,
  VoteForAnswerRequest,
  VoteForAnswerResponse,
  CustomAnswerResultRequest,
  SubmitTextInputRequest,
  SubmitTextInputResponse,
  GetTextInputPlayerAnswersRequest,
  GetTextInputPlayerAnswersResponse,
  TextInputResultRequest,
  SubmitOrderRequest,
  SubmitOrderResponse,
  OrderResultRequest
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

    // Reconnect Player
    socket.on('reconnectPlayer', (data: ReconnectPlayerRequest, callback) => {
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      
      if (!lobby) {
        callback({ success: false, error: 'Lobby not found' });
        return;
      }

      const player = lobby.players.find(p => p.id === data.playerId);
      
      if (!player) {
        callback({ success: false, error: 'Player not found in lobby' });
        return;
      }

      // Update socket mapping with new socket ID
      this.playerSockets.set(data.playerId, socket.id);
      
      // Join the lobby room
      socket.join(data.lobbyId);
      
      // Mark player as connected
      this.lobbyManager.setPlayerConnected(data.lobbyId, data.playerId, true);
      
      const response: ReconnectPlayerResponse = {
        success: true,
        lobby
      };
      
      callback(response);
      
      // Notify others that player reconnected
      socket.to(data.lobbyId).emit('lobbyUpdated', lobby);
      
      console.log(`Player ${data.playerId} reconnected to lobby ${data.lobbyId}`);
    });

    // Reconnect Master
    socket.on('reconnectMaster', async (data: ReconnectMasterRequest, callback) => {
      let lobby = this.lobbyManager.getLobby(data.lobbyId);
      
      if (!lobby) {
        // Try to load from persistence
        lobby = await this.lobbyManager.loadLobbyFromPersistence(data.lobbyId);
        
        if (!lobby) {
          callback({ success: false, error: 'Lobby not found' });
          return;
        }
      }

      // Join the lobby room
      socket.join(data.lobbyId);
      
      const response: ReconnectMasterResponse = {
        success: true,
        lobby
      };
      
      callback(response);
      
      console.log(`Game master reconnected to lobby ${data.lobbyId}`);
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
            questionType: data.questionType,
            answers: data.answers,
            orderItems: data.orderItems,
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
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      
      if (!lobby) {
        return;
      }

      // Get player answers before processing
      const playerAnswers = this.lobbyManager.getPlayerAnswers(data.lobbyId);
      
      const updatedPlayers = this.lobbyManager.processQuestionResult(
        data.lobbyId,
        data.questionId,
        data.correctAnswerId
      );
      
      if (updatedPlayers.length > 0) {
        // Send question result data to master
        this.io.to(data.lobbyId).emit('questionResultReady', {
          correctAnswerId: data.correctAnswerId,
          playerAnswers,
        });
        
        this.io.to(data.lobbyId).emit('scoresUpdated', updatedPlayers);
        console.log(`Question ${data.questionId} results processed for lobby ${data.lobbyId}`);
      }
    });

    // Next Question
    socket.on('nextQuestion', (data: NextQuestionRequest) => {
      const success = this.lobbyManager.nextQuestion(data.lobbyId, data.questionId);
      
      console.log('next question triggered')
      if (success) {
        const lobby = this.lobbyManager.getLobby(data.lobbyId);
        if (lobby) {
          this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
          this.io.to(data.lobbyId).emit('questionStarted', {
            questionId: data.questionId,
            questionIndex: lobby.currentQuestionIndex,
            questionType: data.questionType,
            answers: data.answers,
            orderItems: data.orderItems,
          });
        }
        console.log(`Next question ${data.questionId} in lobby ${data.lobbyId}`);
      }
    });

    // Submit Custom Answer
    socket.on('submitCustomAnswer', (data: SubmitCustomAnswerRequest, callback) => {
      const success = this.lobbyManager.submitCustomAnswer(
        data.lobbyId,
        data.playerId,
        data.questionId,
        data.answerText
      );
      
      callback({ success });
      
      if (success) {
        // Notify game master that player submitted an answer
        socket.to(data.lobbyId).emit('playerAnswered', data.playerId);
        
        // Check if everyone submitted their custom answer
        if (this.lobbyManager.hasEveryoneSubmittedCustomAnswer(data.lobbyId)) {
          this.io.to(data.lobbyId).emit('everybodyAnswered');
          console.log(`All custom answers submitted for lobby ${data.lobbyId}`);
        }
        
        console.log(`Player ${data.playerId} submitted custom answer for question ${data.questionId}`);
      }
    });

    // Get Custom Answers (called by master with correct answer details)
    socket.on('getCustomAnswers', (data: GetCustomAnswersRequest) => {
      const allAnswers = this.lobbyManager.getAllCustomAnswers(
        data.lobbyId,
        data.correctAnswerId,
        data.correctAnswerText
      );
      
      // Send all mixed answers to the master only
      socket.emit('customAnswersReady', {
        questionId: data.questionId,
        answers: allAnswers
      });
      
      console.log(`Custom answers prepared for master in lobby ${data.lobbyId}`);
    });

    // Trigger Answer Voting (called by master to show answers to all players)
    socket.on('triggerAnswerVoting', (data: TriggerAnswerVotingRequest) => {
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      
      if (!lobby) {
        return;
      }

      // Get the cached shuffled answers (without playerId for players)
      const allAnswers = this.lobbyManager.getShuffledAnswers(data.lobbyId);
      
      if (allAnswers.length === 0) {
        console.error(`No shuffled answers found for lobby ${data.lobbyId}`);
        return;
      }
      
      // Remove playerId from answers before sending to players
      const answersForPlayers = allAnswers.map(answer => ({
        id: answer.id,
        text: answer.text
      }));
      
      // Reset hasAnswered flags for voting phase
      for (const player of lobby.players) {
        player.hasAnswered = false;
      }
      
      // Send to all players
      this.io.to(data.lobbyId).emit('showAnswersForVoting', {
        questionId: data.questionId,
        answers: answersForPlayers
      });
      
      console.log(`Answer voting triggered for lobby ${data.lobbyId}`);
    });

    // Vote For Answer
    socket.on('voteForAnswer', (data: VoteForAnswerRequest, callback) => {
      const success = this.lobbyManager.voteForAnswer(
        data.lobbyId,
        data.playerId,
        data.questionId,
        data.answerId
      );
      
      callback({ success });
      
      if (success) {
        // Notify game master that player voted
        socket.to(data.lobbyId).emit('playerAnswered', data.playerId);
        
        // Check if everyone voted
        if (this.lobbyManager.hasEveryoneVoted(data.lobbyId)) {
          this.io.to(data.lobbyId).emit('allVotesReceived');
        }
        
        console.log(`Player ${data.playerId} voted for answer ${data.answerId}`);
      }
    });

    // Custom Answer Result
    socket.on('customAnswerResult', (data: CustomAnswerResultRequest) => {
      // Get player votes before processing
      const playerVotes = this.lobbyManager.getPlayerVotes(data.lobbyId);
      
      // Get the full shuffled answers WITH playerIds for results display
      const answersWithAttribution = this.lobbyManager.getShuffledAnswersWithAttribution(data.lobbyId);
      
      const updatedPlayers = this.lobbyManager.processCustomAnswerResult(
        data.lobbyId,
        data.questionId,
        data.correctAnswerId
      );
      
      if (updatedPlayers.length > 0) {
        // Send the full answer list with attribution to everyone
        this.io.to(data.lobbyId).emit('customAnswersReady', {
          questionId: data.questionId,
          answers: answersWithAttribution
        });
        
        // Send custom answer result data to master
        this.io.to(data.lobbyId).emit('customAnswerResultReady', {
          correctAnswerId: data.correctAnswerId,
          playerVotes,
        });
        
        this.io.to(data.lobbyId).emit('scoresUpdated', updatedPlayers);
        console.log(`Custom answer results processed for lobby ${data.lobbyId}`);
      }
    });

    // Submit Text Input
    socket.on('submitTextInput', (data: SubmitTextInputRequest, callback) => {
      const success = this.lobbyManager.submitTextInput(
        data.lobbyId,
        data.playerId,
        data.questionId,
        data.answerText
      );
      
      callback({ success });
      
      if (success) {
        // Notify game master that player submitted
        socket.to(data.lobbyId).emit('playerAnswered', data.playerId);
        
        // Check if everyone submitted
        if (this.lobbyManager.hasEveryoneSubmittedTextInput(data.lobbyId)) {
          this.io.to(data.lobbyId).emit('everybodyAnswered');
        }
        
        console.log(`Player ${data.playerId} submitted text input for question ${data.questionId}`);
      }
    });

    // Get Text Input Player Answers (without scoring)
    socket.on('getTextInputPlayerAnswers', (data: GetTextInputPlayerAnswersRequest, callback: (response: GetTextInputPlayerAnswersResponse) => void) => {
      const playerAnswers = this.lobbyManager.getTextInputPlayerAnswers(
        data.lobbyId,
        data.questionId
      );
      
      callback({ playerAnswers });
      console.log(`Retrieved ${playerAnswers.length} text input answers for lobby ${data.lobbyId}`);
    });

    // Text Input Result
    socket.on('textInputResult', (data: TextInputResultRequest) => {
      const result = this.lobbyManager.processTextInputResult(
        data.lobbyId,
        data.questionId,
        data.correctAnswers
      );
      
      if (result.players.length > 0) {
        // Send text input result data
        this.io.to(data.lobbyId).emit('textInputResultReady', {
          correctAnswers: data.correctAnswers,
          playerAnswers: result.playerAnswers,
          correctPlayerIds: result.correctPlayerIds
        });
        
        this.io.to(data.lobbyId).emit('scoresUpdated', result.players);
        console.log(`Text input results processed for lobby ${data.lobbyId}`);
      }
    });

    // Submit Order
    socket.on('submitOrder', (data: SubmitOrderRequest, callback) => {
      const success = this.lobbyManager.submitOrder(
        data.lobbyId,
        data.playerId,
        data.questionId,
        data.orderedItemIds
      );
      
      callback({ success });
      
      if (success) {
        // Notify game master that player submitted
        socket.to(data.lobbyId).emit('playerAnswered', data.playerId);
        
        // Check if everyone submitted
        if (this.lobbyManager.hasEveryoneSubmittedOrder(data.lobbyId)) {
          this.io.to(data.lobbyId).emit('everybodyAnswered');
        }
        
        console.log(`Player ${data.playerId} submitted order for question ${data.questionId}`);
      }
    });

    // Order Result
    socket.on('orderResult', (data: OrderResultRequest) => {
      const result = this.lobbyManager.processOrderResult(
        data.lobbyId,
        data.questionId,
        data.correctOrder
      );
      
      if (result.players.length > 0) {
        // Send order result data
        this.io.to(data.lobbyId).emit('orderResultReady', {
          correctOrder: data.correctOrder,
          playerOrders: result.playerOrders,
          playerScores: result.playerScores
        });
        
        this.io.to(data.lobbyId).emit('scoresUpdated', result.players);
        console.log(`Order results processed for lobby ${data.lobbyId}`);
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
