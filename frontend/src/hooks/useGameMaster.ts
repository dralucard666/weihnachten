import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import type { Lobby, Player, Answer, QuestionType, CustomAnswer, PlayerAnswerInfo, OrderItem } from '../../../shared/types';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers?: Answer[];
  correctAnswerId?: string;
  correctAnswer?: string; // For custom-answers type
  correctAnswers?: string[]; // For text-input type
  orderItems?: OrderItem[]; // For order type
  correctOrder?: string[]; // For order type
}

export function useGameMaster(lobbyId: string | undefined, questions: Question[]) {
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [playersWhoAnswered, setPlayersWhoAnswered] = useState<Set<string>>(new Set());
  const [customAnswers, setCustomAnswers] = useState<CustomAnswer[]>([]);
  const [isVotingPhase, setIsVotingPhase] = useState(false);
  const [allVotesReceived, setAllVotesReceived] = useState(false);
  const [playerAnswers, setPlayerAnswers] = useState<PlayerAnswerInfo[]>([]);
  const [correctPlayerIds, setCorrectPlayerIds] = useState<string[]>([]);
  const [playerScores, setPlayerScores] = useState<{ [playerId: string]: number }>({});

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    const socket = socketService.connect();

    if (!lobbyId) {
      socket.emit('createLobby', (response) => {
        if (response.lobby) {
          setLobby(response.lobby);
          setLoading(false);
          navigate(`/game-master/${response.lobbyId}`, { replace: true });
        } else {
          setError('Failed to create lobby');
          setLoading(false);
        }
      });
    } else {
      // Try to reconnect to existing lobby
      socket.emit('reconnectMaster', { lobbyId }, (response) => {
        if (response.success && response.lobby) {
          setLobby(response.lobby);
          // Restore question index from lobby state, but clamp it to valid range
          const restoredIndex = Math.min(response.lobby.currentQuestionIndex, questions.length - 1);
          setCurrentQuestionIndex(Math.max(0, restoredIndex));
          setLoading(false);
          console.log('Reconnected to lobby:', response.lobby);
          console.log('Current question index:', response.lobby.currentQuestionIndex, '-> clamped to:', restoredIndex);
          console.log('Game state:', response.lobby.gameState);
        } else {
          setError(response.error || 'Failed to reconnect to lobby');
          setLoading(false);
        }
      });
    }

    socket.on('lobbyUpdated', (updatedLobby) => {
      setLobby(updatedLobby);
    });

    socket.on('playerJoined', (player: Player) => {
      console.log('Player joined:', player.name);
    });

    socket.on('playerLeft', (playerId: string) => {
      console.log('Player left:', playerId);
      setPlayersWhoAnswered((prev) => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
    });

    socket.on('playerAnswered', (playerId: string) => {
      console.log('Player answered:', playerId);
      setPlayersWhoAnswered((prev) => new Set(prev).add(playerId));
    });

    socket.on('everybodyAnswered', () => {
      console.log('Everybody answered!');
      setAllPlayersAnswered(true);
    });

    socket.on('customAnswersReady', (data: { questionId: string; answers: CustomAnswer[] }) => {
      console.log('Custom answers ready:', data.answers.length);
      setCustomAnswers(data.answers);
      setAllPlayersAnswered(true);
    });

    socket.on('allVotesReceived', () => {
      console.log('All votes received!');
      setAllVotesReceived(true);
    });

    socket.on('questionResultReady', (data: { correctAnswerId: string; playerAnswers: PlayerAnswerInfo[] }) => {
      console.log('Question result ready with player answers:', data.playerAnswers);
      setPlayerAnswers(data.playerAnswers);
    });

    socket.on('customAnswerResultReady', (data: { correctAnswerId: string; playerVotes: PlayerAnswerInfo[] }) => {
      console.log('Custom answer result ready with player votes:', data.playerVotes);
      setPlayerAnswers(data.playerVotes);
    });

    socket.on('scoresUpdated', (players: Player[]) => {
      console.log('Scores updated:', players);
      setLobby((prev) => prev ? { ...prev, players } : null);
    });

    socket.on('textInputResultReady', (data: { correctAnswers: string[]; playerAnswers: PlayerAnswerInfo[]; correctPlayerIds: string[] }) => {
      console.log('Text input result ready:', data.playerAnswers);
      setPlayerAnswers(data.playerAnswers);
      setCorrectPlayerIds(data.correctPlayerIds);
    });

    socket.on('orderResultReady', (data: { correctOrder: string[]; playerOrders: PlayerAnswerInfo[]; playerScores: { [playerId: string]: number } }) => {
      console.log('Order result ready:', data.playerOrders);
      setPlayerAnswers(data.playerOrders);
      setPlayerScores(data.playerScores);
    });

    return () => {
      socket.off('lobbyUpdated');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('playerAnswered');
      socket.off('everybodyAnswered');
      socket.off('customAnswersReady');
      socket.off('allVotesReceived');
      socket.off('questionResultReady');
      socket.off('customAnswerResultReady');
      socket.off('scoresUpdated');
      socket.off('textInputResultReady');
      socket.off('orderResultReady');
    };
  }, [lobbyId, navigate, questions.length]);

  const handleStartGame = () => {
    if (!lobby || !currentQuestion) return;
    
    const socket = socketService.getSocket();
    if (socket) {
      // Store lobbyId in localStorage when game starts
      localStorage.setItem('gameMasterLobbyId', lobby.id);
      
      socket.emit('startGame', {
        lobbyId: lobby.id,
        questionId: currentQuestion.id,
        questionType: currentQuestion.type,
        answers: currentQuestion.answers,
        orderItems: currentQuestion.orderItems,
      });
      setCurrentQuestionIndex(0);
      setPlayersWhoAnswered(new Set());
      setAllPlayersAnswered(false);
      setShowCorrectAnswer(false);
      setCustomAnswers([]);
      setIsVotingPhase(false);
      setAllVotesReceived(false);
      setPlayerAnswers([]);
      setCorrectPlayerIds([]);
      setPlayerScores({});
    }
  };

  const handleShowAnswer = () => {
    if (!lobby || !currentQuestion) return;
    
    const socket = socketService.getSocket();
    if (socket) {
      // For custom answers mode, first get the answers, then trigger voting
      if (currentQuestion.type === 'custom-answers' && !isVotingPhase) {
        socket.emit('getCustomAnswers', {
          lobbyId: lobby.id,
          questionId: currentQuestion.id,
          correctAnswerId: currentQuestion.correctAnswerId!,
          correctAnswerText: currentQuestion.correctAnswer || '',
        });
        
        // Automatically trigger voting after a brief delay to ensure answers are received
        setTimeout(() => {
          socket.emit('triggerAnswerVoting', {
            lobbyId: lobby.id,
            questionId: currentQuestion.id,
          });
          setIsVotingPhase(true);
          setPlayersWhoAnswered(new Set());
          setAllPlayersAnswered(false);
          setAllVotesReceived(false);
        }, 100);
        return;
      }

      // For text-input questions
      if (currentQuestion.type === 'text-input' && currentQuestion.correctAnswers) {
        socket.emit('textInputResult', {
          lobbyId: lobby.id,
          questionId: currentQuestion.id,
          correctAnswers: currentQuestion.correctAnswers,
        });
        setShowCorrectAnswer(true);
        return;
      }

      // For order questions
      if (currentQuestion.type === 'order' && currentQuestion.correctOrder) {
        socket.emit('orderResult', {
          lobbyId: lobby.id,
          questionId: currentQuestion.id,
          correctOrder: currentQuestion.correctOrder,
        });
        setShowCorrectAnswer(true);
        return;
      }

      // For multiple-choice or after voting
      if (currentQuestion.correctAnswerId) {
        socket.emit('questionResult', {
          lobbyId: lobby.id,
          questionId: currentQuestion.id,
          correctAnswerId: currentQuestion.correctAnswerId,
        });
        setShowCorrectAnswer(true);
      }
    }
  };

  const handleTriggerVoting = () => {
    if (!lobby || !currentQuestion) return;
    
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('triggerAnswerVoting', {
        lobbyId: lobby.id,
        questionId: currentQuestion.id,
      });
      setIsVotingPhase(true);
      setPlayersWhoAnswered(new Set());
      setAllPlayersAnswered(false);
      setAllVotesReceived(false);
    }
  };

  const handleShowVotingResults = () => {
    if (!lobby || !currentQuestion) return;
    
    const socket = socketService.getSocket();
    if (socket) {
      // For custom answers voting
      if (currentQuestion.type === 'custom-answers') {
        socket.emit('customAnswerResult', {
          lobbyId: lobby.id,
          questionId: currentQuestion.id,
          correctAnswerId: currentQuestion.correctAnswerId!,
        });
        setShowCorrectAnswer(true);
      }
    }
  };

  const handleNextQuestion = () => {
    if (!lobby) return;
    
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      const socket = socketService.getSocket();
      if (socket) {
        // Remove lobbyId from localStorage when game ends
        localStorage.removeItem('gameMasterLobbyId');
        socket.emit('endGame', lobby.id);
      }
      return;
    }

    const nextQuestion = questions[nextIndex];
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('nextQuestion', {
        lobbyId: lobby.id,
        questionId: nextQuestion.id,
        questionType: nextQuestion.type,
        answers: nextQuestion.answers,
        orderItems: nextQuestion.orderItems,
      });
      setCurrentQuestionIndex(nextIndex);
      setPlayersWhoAnswered(new Set());
      setAllPlayersAnswered(false);
      setShowCorrectAnswer(false);
      setCustomAnswers([]);
      setIsVotingPhase(false);
      setAllVotesReceived(false);
      setPlayerAnswers([]);
      setCorrectPlayerIds([]);
      setPlayerScores({});
    }
  };

  const handleReloadQuestion = () => {
    if (!lobby || !currentQuestion) return;
    
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('nextQuestion', {
        lobbyId: lobby.id,
        questionId: currentQuestion.id,
        questionType: currentQuestion.type,
        answers: currentQuestion.answers,
        orderItems: currentQuestion.orderItems,
      });
      setPlayersWhoAnswered(new Set());
      setAllPlayersAnswered(false);
      setShowCorrectAnswer(false);
      setCustomAnswers([]);
      setIsVotingPhase(false);
      setAllVotesReceived(false);
      setPlayerAnswers([]);
      setCorrectPlayerIds([]);
      setPlayerScores({});
    }
  };

  return {
    lobby,
    loading,
    error,
    currentQuestion,
    currentQuestionIndex,
    allPlayersAnswered,
    showCorrectAnswer,
    playersWhoAnswered,
    customAnswers,
    isVotingPhase,
    allVotesReceived,
    playerAnswers,
    correctPlayerIds,
    playerScores,
    handleStartGame,
    handleShowAnswer,
    handleTriggerVoting,
    handleShowVotingResults,
    handleNextQuestion,
    handleReloadQuestion,
  };
}
