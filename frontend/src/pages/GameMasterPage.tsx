import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameMaster } from '../hooks/useGameMaster';
import GameLobbyView from '../components/GameLobbyView';
import GamePlayingView from '../components/host/GamePlayingView';
import GameFinishedView from '../components/host/GameFinishedView';
import type { Answer, QuestionType, QuestionMedia, OrderItem } from '../../../shared/types';
import { useI18n } from '../i18n/useI18n';
import { socketService } from '../services/socket';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers?: Answer[];
  correctAnswerId?: string;
  correctAnswer?: string;
  correctAnswers?: string[]; // For text-input type
  orderItems?: OrderItem[]; // For order type
  correctOrder?: string[]; // For order type
  media?: QuestionMedia;
}

export default function GameMasterPage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const { language } = useI18n();
  const { t } = useI18n();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Fetch questions from backend
  useEffect(() => {
    const fetchQuestions = async () => {
      setQuestionsLoading(true);
      setQuestionsError(null);
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://192.168.178.22:3001';
        const response = await fetch(`${backendUrl}/api/questions/${language}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const questionsData = await response.json();
        const processedQuestions = questionsData.map((q: Omit<Question, 'id'>, index: number) => ({
          ...q,
          id: index.toString(),
          correctAnswerId: q.correctAnswerId || `correct-${index}`
        }));
        
        setQuestions(processedQuestions);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setQuestionsError('Failed to load questions from server');
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, [language]);

  const {
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
    handleShowVotingResults,
    handleNextQuestion,
    handleReloadQuestion,
  } = useGameMaster(lobbyId, questions);

  // When language changes during an active game, update the question data
  useEffect(() => {
    if (lobby?.gameState === 'playing' && currentQuestion) {
      const socket = socketService.getSocket();
      if (socket) {
        // Emit updated question data to players (answers/options in new language)
        console.log('emitting updated question data due to language change');
        socket.emit('nextQuestion', {
          lobbyId: lobby.id,
          questionId: currentQuestion.id,
          questionType: currentQuestion.type,
          answers: currentQuestion.answers,
          orderItems: currentQuestion.orderItems,
        });
      }
    }
    // Only trigger when language changes, not when lobby or currentQuestion objects are recreated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);


  if (loading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">
          {loading ? t.common.creatingLobby : 'Loading questions...'}
        </div>
      </div>
    );
  }

  if (error || questionsError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t.common.error}</h2>
          <p className="text-gray-700">{error || questionsError}</p>
        </div>
      </div>
    );
  }

  if (!lobby) {
    return null;
  }

  // Render based on game state
  if (lobby.gameState === 'lobby') {
    return <GameLobbyView lobby={lobby} onStartGame={handleStartGame} />;
  }

  if (lobby.gameState === 'playing' && currentQuestion) {
    return (
      <GamePlayingView
        lobby={lobby}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        playersWhoAnswered={playersWhoAnswered}
        allPlayersAnswered={allPlayersAnswered}
        showCorrectAnswer={showCorrectAnswer}
        customAnswers={customAnswers}
        isVotingPhase={isVotingPhase}
        allVotesReceived={allVotesReceived}
        playerAnswers={playerAnswers}
        correctPlayerIds={correctPlayerIds}
        playerScores={playerScores}
        onShowAnswer={handleShowAnswer}
        onShowVotingResults={handleShowVotingResults}
        onNextQuestion={handleNextQuestion}
        onReloadQuestion={handleReloadQuestion}
      />
    );
  }

  if (lobby.gameState === 'playing' && !currentQuestion) {
    // Fallback for when reconnecting but question index is out of bounds
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">Game In Progress</h2>
          <p className="text-gray-700 mb-4">
            Connected to lobby but question data is not available.
          </p>
          <p className="text-sm text-gray-600">
            Lobby ID: {lobby.id}<br />
            Question Index: {currentQuestionIndex}<br />
            Total Questions: {questions.length}
          </p>
        </div>
      </div>
    );
  }

  if (lobby.gameState === 'finished') {
    return <GameFinishedView lobby={lobby} />;
  }

  return null;
}
