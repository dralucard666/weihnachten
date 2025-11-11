import { useEffect, useState } from 'react';
import { socketService } from '../services/socket';
import type { Lobby, Answer } from '../../../shared/types';

interface CurrentQuestion {
  questionId: string;
  questionIndex: number;
  answers: Answer[];
}

export function usePlayer(lobbyId: string | undefined) {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!lobbyId) return;

    const socket = socketService.connect();

    socket.on('lobbyUpdated', (updatedLobby) => {
      setLobby(updatedLobby);
    });

    socket.on('questionStarted', (data: { questionId: string; questionIndex: number; answers: Answer[] }) => {
      setCurrentQuestion({
        questionId: data.questionId,
        questionIndex: data.questionIndex,
        answers: data.answers,
      });
      setSelectedAnswer(null);
      setHasSubmitted(false);
      console.log('Question started:', data.questionIndex + 1);
    });

    return () => {
      socket.off('lobbyUpdated');
      socket.off('questionStarted');
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
        
        // Now set the name
        socket.emit('setName', {
          lobbyId,
          playerId: response.playerId,
          playerName: name.trim(),
        }, (nameResponse) => {
          setLoading(false);
          if (nameResponse.success) {
            setPlayerName(name.trim());
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
        questionId: currentQuestion.questionId,
        answerId,
      },
      (response) => {
        console.log('Answer submitted:', response);
      }
    );
  };

  return {
    lobby,
    playerId,
    playerName,
    currentQuestion,
    selectedAnswer,
    hasSubmitted,
    loading,
    error,
    joined,
    handleJoinLobby,
    handleSubmitAnswer,
    setPlayerName,
  };
}
