import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import type { Lobby, Player, Answer } from '../../../shared/types';

interface Question {
  id: string;
  text: string;
  answers: Answer[];
  correctAnswerId: string;
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
      setLoading(false);
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

    socket.on('scoresUpdated', (players: Player[]) => {
      console.log('Scores updated:', players);
      setLobby((prev) => prev ? { ...prev, players } : null);
    });

    return () => {
      socket.off('lobbyUpdated');
      socket.off('playerJoined');
      socket.off('playerLeft');
      socket.off('playerAnswered');
      socket.off('everybodyAnswered');
      socket.off('scoresUpdated');
    };
  }, [lobbyId, navigate]);

  const handleStartGame = () => {
    if (!lobby || !currentQuestion) return;
    
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('startGame', {
        lobbyId: lobby.id,
        questionId: currentQuestion.id,
        answers: currentQuestion.answers,
      });
      setCurrentQuestionIndex(0);
      setPlayersWhoAnswered(new Set());
      setAllPlayersAnswered(false);
      setShowCorrectAnswer(false);
    }
  };

  const handleShowAnswer = () => {
    if (!lobby || !currentQuestion) return;
    
    const socket = socketService.getSocket();
    if (socket) {
      socket.emit('questionResult', {
        lobbyId: lobby.id,
        questionId: currentQuestion.id,
        correctAnswerId: currentQuestion.correctAnswerId,
      });
      setShowCorrectAnswer(true);
    }
  };

  const handleNextQuestion = () => {
    if (!lobby) return;
    
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= questions.length) {
      const socket = socketService.getSocket();
      if (socket) {
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
        answers: nextQuestion.answers,
      });
      setCurrentQuestionIndex(nextIndex);
      setPlayersWhoAnswered(new Set());
      setAllPlayersAnswered(false);
      setShowCorrectAnswer(false);
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
    handleStartGame,
    handleShowAnswer,
    handleNextQuestion,
  };
}
