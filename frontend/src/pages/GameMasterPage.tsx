import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameMaster } from '../hooks/useGameMaster';
import GameLobbyView from '../components/GameLobbyView';
import GamePlayingView from '../components/GamePlayingView';
import GameFinishedView from '../components/GameFinishedView';
import type { Answer, QuestionType, QuestionMedia } from '../../../shared/types';
import questionsData from '../data/questions.json';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers?: Answer[];
  correctAnswerId?: string;
  correctAnswer?: string;
  correctAnswers?: string[]; // For text-input type
  media?: QuestionMedia;
}

export default function GameMasterPage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const [questions] = useState<Question[]>(questionsData as Question[]);

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
    handleStartGame,
    handleShowAnswer,
    handleTriggerVoting,
    handleShowVotingResults,
    handleNextQuestion,
    handleReloadQuestion,
  } = useGameMaster(lobbyId, questions);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Creating lobby...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
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
        onShowAnswer={handleShowAnswer}
        onTriggerVoting={handleTriggerVoting}
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
