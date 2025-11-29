import { Server, Socket } from 'socket.io';
import { 
  ServerToClientEvents, 
  ClientToServerEvents,
  CreateLobbyRequest,
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
  StartGameResponse,
  SetAnswerRequest,
  SetAnswerResponse,
  QuestionResultRequest,
  NextQuestionRequest,
  NextQuestionResponse,
  RestartQuestionRequest,
  RestartQuestionResponse,
  SubmitCustomAnswerRequest,
  SubmitCustomAnswerResponse,
  TriggerAnswerVotingRequest,
  VoteForAnswerRequest,
  VoteForAnswerResponse,
  CustomAnswerResultRequest,
  SubmitTextInputRequest,
  SubmitTextInputResponse,
  TextInputResultRequest,
  SubmitOrderRequest,
  SubmitOrderResponse,
  OrderResultRequest,
  StoredQuestion,
} from '../../../shared/types';
import { LobbyManager } from './LobbyManager';
import path from 'path';

export class SocketHandler {
  private lobbyManager: LobbyManager;
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private playerSockets: Map<string, string> = new Map(); // playerId -> socketId
  private allQuestions: StoredQuestion[] = [];

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents>) {
    this.io = io;
    this.lobbyManager = new LobbyManager();
    this.loadQuestions();
  }

  // Expose methods for API endpoints
  getLobbyManager(): LobbyManager {
    return this.lobbyManager;
  }

  getAllQuestions(): StoredQuestion[] {
    return this.allQuestions;
  }

  private loadQuestions(): void {
    try {
      const questionsPath = path.join(__dirname, '../data', 'questions.json');
      const rawQuestions = require(questionsPath);
      
      // Add IDs to questions if they don't have them
      this.allQuestions = rawQuestions.map((q: StoredQuestion, index: number) => ({
        ...q,
        id: q.id || `q-${index}`
      }));
      
      console.log(`Loaded ${this.allQuestions.length} questions`);
    } catch (error) {
      console.error('Error loading questions:', error);
      this.allQuestions = [];
    }
  }

  handleConnection(socket: Socket<ClientToServerEvents, ServerToClientEvents>): void {
    console.log(`Client connected: ${socket.id}`);

    // Create Lobby
    socket.on('createLobby', async (data: CreateLobbyRequest, callback) => {
      // For now, just create an empty lobby with metadata
      // Questions will be loaded when the game starts
      const lobby = this.lobbyManager.createLobby([]);
      
      // Store the question set configuration in the lobby for later use
      if (data.questionSetId) {
        lobby.questionSetId = data.questionSetId;
        lobby.questionCount = data.questionCount;
      }
      
      socket.join(lobby.id);
      
      const response: CreateLobbyResponse = {
        lobbyId: lobby.id,
        lobby
      };
      
      callback(response);
      console.log(`Lobby created: ${lobby.id} with questionSetId: ${data.questionSetId}, questionCount: ${data.questionCount}`);
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
      
      // Include current question if game is playing
      let currentQuestion;
      if (lobby.gameState === 'playing' && lobby.currentQuestionIndex !== undefined) {
        const question = this.lobbyManager.getCurrentQuestion(data.lobbyId);
        if (question) {
          currentQuestion = this.lobbyManager.getQuestionDataForLanguage(
            question,
            lobby.currentQuestionIndex,
            lobby.totalQuestions!,
            'en' // Language doesn't matter since we send bilingual data
          );
        }
      }
      
      const response: ReconnectPlayerResponse = {
        success: true,
        lobby,
        currentQuestion
      };
      
      callback(response);
      
      // Notify others that player reconnected
      socket.to(data.lobbyId).emit('lobbyUpdated', lobby);
      
      console.log(`Player ${data.playerId} reconnected to lobby ${data.lobbyId}`);
    });

    // Reconnect Master
    socket.on('reconnectMaster', async (data: ReconnectMasterRequest, callback) => {
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      
      if (!lobby) {
        callback({ success: false, error: 'Lobby not found' });
        return;
      }

      // Join the lobby room
      socket.join(data.lobbyId);
      
      // Include current question if game is playing
      let currentQuestion;
      if (lobby.gameState === 'playing' && lobby.currentQuestionIndex !== undefined) {
        const question = this.lobbyManager.getCurrentQuestion(data.lobbyId);
        if (question) {
          currentQuestion = this.lobbyManager.getQuestionDataForLanguage(
            question,
            lobby.currentQuestionIndex,
            lobby.totalQuestions!,
            'en' // Language doesn't matter since we send bilingual data
          );
        }
      }
      
      const response: ReconnectMasterResponse = {
        success: true,
        lobby,
        currentQuestion
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
    socket.on('startGame', async (data: StartGameRequest, callback) => {
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      
      if (!lobby) {
        callback({ success: false });
        return;
      }
      
      // Store question configuration in lobby if provided
      if (data.questionSetId) {
        lobby.questionSetId = data.questionSetId;
        lobby.questionCount = data.questionCount;
      }
      
      // If lobby has questionSetId, load questions from database now
      if (lobby.questionSetId) {
        try {
          const { QuestionSetService } = await import('../database/QuestionSetService');
          const questionSetService = new QuestionSetService();
          let questions = await questionSetService.getQuestionsInSet(lobby.questionSetId);
          
          // If questionCount is specified, shuffle and limit
          if (lobby.questionCount && lobby.questionCount > 0 && lobby.questionCount < questions.length) {
            const shuffled = [...questions].sort(() => Math.random() - 0.5);
            questions = shuffled.slice(0, lobby.questionCount);
          }
          
          // Update the lobby with the loaded questions
          this.lobbyManager.updateLobbyQuestions(data.lobbyId, questions);
          console.log(`Loaded ${questions.length} questions for lobby ${data.lobbyId} from question set ${lobby.questionSetId}`);
        } catch (error) {
          console.error('Error loading questions for game start:', error);
          callback({ success: false });
          return;
        }
      } else if (data.questionCount) {
        // Legacy: If questionCount is provided in the request, update the lobby questions
        const currentQuestions = this.lobbyManager.getLobbyQuestions(data.lobbyId);
        if (currentQuestions && data.questionCount < currentQuestions.length) {
          // Shuffle and limit questions
          const shuffled = [...currentQuestions].sort(() => Math.random() - 0.5);
          const limitedQuestions = shuffled.slice(0, data.questionCount);
          this.lobbyManager.updateLobbyQuestions(data.lobbyId, limitedQuestions);
        }
      }
      
      const success = this.lobbyManager.startGame(data.lobbyId);
      
      if (success) {
        const updatedLobby = this.lobbyManager.getLobby(data.lobbyId);
        const currentQuestion = this.lobbyManager.getCurrentQuestion(data.lobbyId);
        
        if (updatedLobby && currentQuestion) {
          // Get question data for language (default to 'en', can be parameterized later)
          const questionData = this.lobbyManager.getQuestionDataForLanguage(
            currentQuestion,
            updatedLobby.currentQuestionIndex,
            updatedLobby.totalQuestions!,
            'en' // TODO: Support multiple languages
          );
          
          this.io.to(data.lobbyId).emit('lobbyUpdated', updatedLobby);
          this.io.to(data.lobbyId).emit('questionStarted', questionData);
          
          callback({ success: true, currentQuestion: questionData });
          console.log(`Game started in lobby ${data.lobbyId}`);
        } else {
          callback({ success: false });
        }
      } else {
        callback({ success: false });
      }
    });

    // Set Answer
    socket.on('setAnswer', (data: SetAnswerRequest, callback) => {
      const success = this.lobbyManager.setAnswer(
        data.lobbyId,
        data.playerId,
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
        
        console.log(`Player ${data.playerId} answered`);
      }
    });

    // Question Result
    socket.on('questionResult', (data: QuestionResultRequest) => {
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      const currentQuestion = this.lobbyManager.getCurrentQuestion(data.lobbyId);
      
      if (!lobby || !currentQuestion) {
        return;
      }

      // Get player answers before processing
      const playerAnswers = this.lobbyManager.getPlayerAnswers(data.lobbyId);
      
      const updatedPlayers = this.lobbyManager.processQuestionResult(data.lobbyId);
      
      if (updatedPlayers.length > 0 && currentQuestion.correctAnswerId) {
        // Update lobby state (phase is now 'revealing')
        this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
        
        // Send question result data to everyone
        this.io.to(data.lobbyId).emit('questionResultReady', {
          correctAnswerId: currentQuestion.correctAnswerId,
          playerAnswers,
        });
        
        this.io.to(data.lobbyId).emit('scoresUpdated', updatedPlayers);
        console.log(`Question results processed for lobby ${data.lobbyId}`);
      }
    });

    // Next Question
    socket.on('nextQuestion', (data: NextQuestionRequest, callback) => {
      const success = this.lobbyManager.nextQuestion(data.lobbyId);
      
      if (success) {
        const lobby = this.lobbyManager.getLobby(data.lobbyId);
        const currentQuestion = this.lobbyManager.getCurrentQuestion(data.lobbyId);
        
        if (lobby && currentQuestion) {
          const questionData = this.lobbyManager.getQuestionDataForLanguage(
            currentQuestion,
            lobby.currentQuestionIndex,
            lobby.totalQuestions!,
            'en' // TODO: Support multiple languages
          );
          
          this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
          this.io.to(data.lobbyId).emit('questionStarted', questionData);
          
          callback({ success: true, currentQuestion: questionData });
          console.log(`Next question in lobby ${data.lobbyId}`);
        } else {
          callback({ success: false });
        }
      } else {
        // No more questions - game should end
        callback({ success: true, gameFinished: true });
      }
    });

    // Restart Current Question
    socket.on('restartQuestion', (data: RestartQuestionRequest, callback) => {
      const success = this.lobbyManager.restartCurrentQuestion(data.lobbyId);
      
      if (success) {
        const lobby = this.lobbyManager.getLobby(data.lobbyId);
        const currentQuestion = this.lobbyManager.getCurrentQuestion(data.lobbyId);
        
        if (lobby && currentQuestion) {
          const questionData = this.lobbyManager.getQuestionDataForLanguage(
            currentQuestion,
            lobby.currentQuestionIndex,
            lobby.totalQuestions!,
            'en' // TODO: Support multiple languages
          );
          
          this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
          this.io.to(data.lobbyId).emit('questionStarted', questionData);
          
          callback({ success: true, currentQuestion: questionData });
          console.log(`Question restarted in lobby ${data.lobbyId}`);
        } else {
          callback({ success: false });
        }
      } else {
        callback({ success: false });
      }
    });

    // Submit Custom Answer
    socket.on('submitCustomAnswer', (data: SubmitCustomAnswerRequest, callback) => {
      const success = this.lobbyManager.submitCustomAnswer(
        data.lobbyId,
        data.playerId,
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
        
        console.log(`Player ${data.playerId} submitted custom answer`);
      }
    });

    // Prepare Custom Answer Voting (called by master to prepare voting phase)
    socket.on('prepareCustomAnswerVoting', (data: { lobbyId: string }, callback?: (response: { success: boolean }) => void) => {
      const allAnswers = this.lobbyManager.prepareCustomAnswerVoting(data.lobbyId);
      const currentQuestion = this.lobbyManager.getCurrentQuestion(data.lobbyId);
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      
      if (currentQuestion && allAnswers.length > 0 && lobby) {
        // Send all mixed answers to the master only
        socket.emit('customAnswersReady', {
          questionId: currentQuestion.id,
          answers: allAnswers
        });
        
        // Update lobby state
        this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
        
        console.log(`Custom answers prepared for master in lobby ${data.lobbyId}`);
        
        // Acknowledge if callback provided
        if (callback) {
          callback({ success: true });
        }
      } else if (callback) {
        callback({ success: false });
      }
    });

    // Trigger Answer Voting (called by master to show answers to all players)
    socket.on('triggerAnswerVoting', (data: TriggerAnswerVotingRequest) => {
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      const currentQuestion = this.lobbyManager.getCurrentQuestion(data.lobbyId);
      
      if (!lobby || !currentQuestion) {
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
      
      // Update lobby state
      this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
      
      // Send to all players
      this.io.to(data.lobbyId).emit('showAnswersForVoting', {
        questionId: currentQuestion.id,
        answers: answersForPlayers
      });
      
      console.log(`Answer voting triggered for lobby ${data.lobbyId}, sent ${answersForPlayers.length} answers`);
    });

    // Vote For Answer
    socket.on('voteForAnswer', (data: VoteForAnswerRequest, callback) => {
      const success = this.lobbyManager.voteForAnswer(
        data.lobbyId,
        data.playerId,
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
      const currentQuestion = this.lobbyManager.getCurrentQuestion(data.lobbyId);
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      
      // Get player votes before processing
      const playerVotes = this.lobbyManager.getPlayerVotes(data.lobbyId);
      
      // Get the full shuffled answers WITH playerIds for results display
      const answersWithAttribution = this.lobbyManager.getShuffledAnswersWithAttribution(data.lobbyId);
      
      const updatedPlayers = this.lobbyManager.processCustomAnswerResult(data.lobbyId);
      
      if (updatedPlayers.length > 0 && currentQuestion && lobby) {
        // Update lobby state (phase is now 'revealing')
        this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
        
        // Send the full answer list with attribution to everyone
        this.io.to(data.lobbyId).emit('customAnswersReady', {
          questionId: currentQuestion.id,
          answers: answersWithAttribution
        });
        
        // Find correct answer ID from shuffled answers
        const correctAnswerId = answersWithAttribution.find(a => !a.playerId)?.id || '';
        
        // Send custom answer result data
        this.io.to(data.lobbyId).emit('customAnswerResultReady', {
          correctAnswerId,
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
        
        console.log(`Player ${data.playerId} submitted text input`);
      }
    });

    // Text Input Result
    socket.on('textInputResult', (data: TextInputResultRequest) => {
      const currentQuestion = this.lobbyManager.getCurrentQuestion(data.lobbyId);
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      const result = this.lobbyManager.processTextInputResult(data.lobbyId);
      
      if (result.players.length > 0 && currentQuestion && currentQuestion.correctAnswers && lobby) {
        // Update lobby state (phase is now 'revealing')
        this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
        
        // Send text input result data
        this.io.to(data.lobbyId).emit('textInputResultReady', {
          correctAnswers: currentQuestion.correctAnswers,
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
        
        console.log(`Player ${data.playerId} submitted order`);
      }
    });

    // Order Result
    socket.on('orderResult', (data: OrderResultRequest) => {
      const currentQuestion = this.lobbyManager.getCurrentQuestion(data.lobbyId);
      const lobby = this.lobbyManager.getLobby(data.lobbyId);
      const result = this.lobbyManager.processOrderResult(data.lobbyId);
      
      if (result.players.length > 0 && currentQuestion && currentQuestion.correctOrder && lobby) {
        // Update lobby state (phase is now 'revealing')
        this.io.to(data.lobbyId).emit('lobbyUpdated', lobby);
        
        // Send order result data
        this.io.to(data.lobbyId).emit('orderResultReady', {
          correctOrder: currentQuestion.correctOrder,
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
