import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';
import type { Lobby, Answer, QuestionData } from '../../../shared/types';

const STORAGE_KEYS = {
  LOBBY_ID: 'quiz_lobby_id',
  PLAYER_ID: 'quiz_player_id',
  PLAYER_NAME: 'quiz_player_name',
};

export function usePlayer(lobbyId: string | undefined) {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
  });
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || '';
  });
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [customAnswerText, setCustomAnswerText] = useState<string>('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [votingAnswers, setVotingAnswers] = useState<Answer[]>([]);
  const [isVotingPhase, setIsVotingPhase] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);
  const [autoReconnectAttempted, setAutoReconnectAttempted] = useState(false);

  useEffect(() => {
    if (!lobbyId) return;

    const socket = socketService.connect();

    socket.on('lobbyUpdated', (updatedLobby) => {
      setLobby(updatedLobby);
    });

    socket.on('questionStarted', (data: QuestionData) => {
      setCurrentQuestion(data);
      setSelectedAnswer(null);
      setCustomAnswerText('');
      setHasSubmitted(false);
      setIsVotingPhase(false);
      setVotingAnswers([]);
      setSubmittedOrder([]);
      console.log('Question started:', data.questionIndex + 1, 'Type:', data.type);
    });

    socket.on('showAnswersForVoting', (data: { questionId: string; answers: Answer[] }) => {
      setVotingAnswers(data.answers);
      setIsVotingPhase(true);
      setSelectedAnswer(null);
      setHasSubmitted(false);
      console.log('Voting phase started with', data.answers.length, 'answers');
    });

    return () => {
      socket.off('lobbyUpdated');
      socket.off('questionStarted');
      socket.off('showAnswersForVoting');
    };
  }, [lobbyId]);

  const handleJoinLobby = (name: string) => {
    if (!name.trim() || !lobbyId) return;

    setLoading(true);
    setError(null);

    const socket = socketService.getSocket();
    if (!socket) {
      setError('Not connected to server');
      setLoading(false);
      return;
    }

    socket.emit('joinLobby', { lobbyId }, (response) => {
      if (response.success) {
        setPlayerId(response.playerId);
        setLobby(response.lobby);
        
        // Store in localStorage
        localStorage.setItem(STORAGE_KEYS.LOBBY_ID, lobbyId);
        localStorage.setItem(STORAGE_KEYS.PLAYER_ID, response.playerId);
        
        // Now set the name
        socket.emit('setName', {
          lobbyId,
          playerId: response.playerId,
          playerName: name.trim(),
        }, (nameResponse) => {
          setLoading(false);
          if (nameResponse.success) {
            setPlayerName(name.trim());
            localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name.trim());
            setJoined(true);
          } else {
            setError('Failed to set name');
          }
        });
      } else {
        setLoading(false);
        setError('Failed to join lobby. Please check the lobby code.');
      }
    });
  };

  const handleSubmitAnswer = (answerId: string) => {
    if (!playerId || !lobbyId || !currentQuestion || hasSubmitted) return;

    setSelectedAnswer(answerId);
    setHasSubmitted(true);

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit(
      'setAnswer',
      {
        lobbyId,
        playerId,
        answerId,
      },
      (response) => {
        console.log('Answer submitted:', response);
      }
    );
  };

  const handleSubmitCustomAnswer = (answerText: string) => {
    if (!playerId || !lobbyId || !currentQuestion || hasSubmitted) return;

    setCustomAnswerText(answerText);
    setHasSubmitted(true);

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit(
      'submitCustomAnswer',
      {
        lobbyId,
        playerId,
        answerText: answerText.trim(),
      },
      (response) => {
        console.log('Custom answer submitted:', response);
        if (!response.success) {
          setHasSubmitted(false);
          setError('Failed to submit answer');
        }
      }
    );
  };

  const handleVoteForAnswer = (answerId: string) => {
    if (!playerId || !lobbyId || !currentQuestion || hasSubmitted) return;

    setSelectedAnswer(answerId);
    setHasSubmitted(true);

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit(
      'voteForAnswer',
      {
        lobbyId,
        playerId,
        answerId,
      },
      (response) => {
        console.log('Vote submitted:', response);
        if (!response.success) {
          setHasSubmitted(false);
          setSelectedAnswer(null);
          setError('Cannot vote for your own answer');
        }
      }
    );
  };

  const handleSubmitTextInput = (answerText: string) => {
    if (!playerId || !lobbyId || !currentQuestion || hasSubmitted) return;

    setCustomAnswerText(answerText);
    setHasSubmitted(true);

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit(
      'submitTextInput',
      {
        lobbyId,
        playerId,
        answerText: answerText.trim(),
      },
      (response) => {
        console.log('Text input submitted:', response);
        if (!response.success) {
          setHasSubmitted(false);
          setError('Failed to submit answer');
        }
      }
    );
  };

  const handleSubmitOrder = (orderedItemIds: string[]) => {
    if (!playerId || !lobbyId || !currentQuestion || hasSubmitted) return;

    setSubmittedOrder(orderedItemIds);
    setHasSubmitted(true);

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit(
      'submitOrder',
      {
        lobbyId,
        playerId,
        orderedItemIds,
      },
      (response) => {
        console.log('Order submitted:', response);
        if (!response.success) {
          setHasSubmitted(false);
          setSubmittedOrder([]);
          setError('Failed to submit order');
        }
      }
    );
  };

  const clearStoredSession = () => {
    localStorage.removeItem(STORAGE_KEYS.LOBBY_ID);
    localStorage.removeItem(STORAGE_KEYS.PLAYER_ID);
    localStorage.removeItem(STORAGE_KEYS.PLAYER_NAME);
  };

  const getStoredSession = () => {
    const storedLobbyId = localStorage.getItem(STORAGE_KEYS.LOBBY_ID);
    const storedPlayerId = localStorage.getItem(STORAGE_KEYS.PLAYER_ID);
    const storedPlayerName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
    
    if (storedLobbyId && storedPlayerId) {
      return {
        lobbyId: storedLobbyId,
        playerId: storedPlayerId,
        playerName: storedPlayerName || undefined,
      };
    }
    return null;
  };

  const handleReconnect = (reconnectLobbyId: string, reconnectPlayerId: string) => {
    setLoading(true);
    setError(null);
    setAutoReconnectAttempted(true);

    const socket = socketService.getSocket();
    if (!socket) {
      setError('Not connected to server');
      setLoading(false);
      return;
    }

    socket.emit('reconnectPlayer', { lobbyId: reconnectLobbyId, playerId: reconnectPlayerId }, (response) => {
      setLoading(false);
      if (response.success && response.lobby) {
        setPlayerId(reconnectPlayerId);
        setLobby(response.lobby);
        if (response.currentQuestion) {
          setCurrentQuestion(response.currentQuestion);
        }
        setJoined(true);
        
        // Refresh stored session in case name changed
        const storedName = localStorage.getItem(STORAGE_KEYS.PLAYER_NAME);
        if (storedName) {
          setPlayerName(storedName);
        }
        
        // Restore player state based on server data
        const currentPlayer = response.lobby.players.find(p => p.id === reconnectPlayerId);
        if (currentPlayer && currentPlayer.hasAnswered) {
          setHasSubmitted(true);
          console.log('Player has already submitted an answer');
        }
        
        // Check if we're in voting phase and restore voting answers
        if (response.lobby.currentPhase === 'voting' && response.currentQuestion?.type === 'custom-answers') {
          setIsVotingPhase(true);
          if (response.votingAnswers && response.votingAnswers.length > 0) {
            setVotingAnswers(response.votingAnswers);
            console.log(`Reconnected during voting phase with ${response.votingAnswers.length} answers`);
          } else {
            console.log('Reconnected during voting phase');
          }
        }
        
        console.log('Successfully reconnected to lobby');
      } else {
        setError(response.error || 'Failed to reconnect. The lobby may no longer exist.');
        // Clear invalid session
        clearStoredSession();
      }
    });
  };

  // Auto-reconnect if we have stored session for this lobby
  useEffect(() => {
    if (!lobbyId || joined || loading || autoReconnectAttempted) return;

    const storedSession = getStoredSession();
    if (storedSession && storedSession.lobbyId === lobbyId && storedSession.playerId) {
      console.log('Auto-reconnecting to stored session...');
      handleReconnect(storedSession.lobbyId, storedSession.playerId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId, joined, loading, autoReconnectAttempted]);

  return {
    lobby,
    playerId,
    playerName,
    currentQuestion,
    selectedAnswer,
    customAnswerText,
    hasSubmitted,
    votingAnswers,
    isVotingPhase,
    loading,
    error,
    joined,
    handleJoinLobby,
    handleSubmitAnswer,
    handleSubmitCustomAnswer,
    handleSubmitTextInput,
    handleSubmitOrder,
    handleVoteForAnswer,
    handleReconnect,
    setPlayerName,
    clearStoredSession,
    getStoredSession,
    submittedOrder,
  };
}
