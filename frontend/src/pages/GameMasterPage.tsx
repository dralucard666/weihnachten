import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGameMaster } from "../hooks/useGameMaster";
import GameLobbyView from "../components/GameLobbyView";
import GamePlayingView from "../components/host/GamePlayingView";
import GameFinishedView from "../components/host/GameFinishedView";
import type { QuestionType, QuestionMedia } from "../../../shared/types";
import { useI18n } from "../i18n/useI18n";

// Bilingual question structure from backend
export interface BilingualQuestion {
  id: string;
  type: QuestionType;
  text: { de: string; en: string };
  answers?: Array<{
    id: string;
    text: { de: string; en: string };
    sound?: string[];
  }>;
  correctAnswerId?: string;
  correctAnswer?: { de: string; en: string };
  correctAnswers?: string[];
  orderItems?: Array<{
    id: string;
    text: { de: string; en: string };
    sound?: string[];
  }>;
  correctOrder?: string[];
  media?: QuestionMedia;
}

export default function GameMasterPage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const { t, language } = useI18n();
  const [questions, setQuestions] = useState<BilingualQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState<string | null>(null);

  // Fetch questions from backend once
  useEffect(() => {
    const fetchQuestions = async () => {
      setQuestionsLoading(true);
      setQuestionsError(null);
      try {
        const backendUrl =
          import.meta.env.VITE_BACKEND_URL || "http://192.168.178.22:3001";
        const response = await fetch(`${backendUrl}/api/questions`);

        if (!response.ok) {
          throw new Error("Failed to fetch questions");
        }

        const questionsData = await response.json();
        setQuestions(questionsData);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setQuestionsError("Failed to load questions from server");
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Memoize questionIds to prevent infinite re-renders
  const questionIds = useMemo(
    () => questions.map((q, index) => q.id || `q-${index}`),
    [questions]
  );

  const {
    lobby,
    loading,
    error,
    currentQuestion,
    allPlayersAnswered,
    playersWhoAnswered,
    customAnswers,
    isVotingPhase,
    allVotesReceived,
    playerAnswers,
    correctPlayerIds,
    playerScores,
    correctAnswerId,
    correctAnswer,
    correctAnswers,
    correctOrder,
    handleStartGame,
    handleShowAnswer,
    handleShowVotingResults,
    handleNextQuestion,
  } = useGameMaster(lobbyId, questionIds);

  // Adapt QuestionData to Question format for components (extract current language)
  const adaptedQuestion = currentQuestion
    ? {
        id: currentQuestion.questionId,
        text:
          typeof currentQuestion.text === "string"
            ? currentQuestion.text
            : currentQuestion.text[language],
        type: currentQuestion.type,
        answers: currentQuestion.answers?.map((a) => ({
          id: a.id,
          text: typeof a.text === "string" ? a.text : a.text[language],
          sound: a.sound,
        })),
        orderItems: currentQuestion.orderItems?.map((item) => ({
          id: item.id,
          text: typeof item.text === "string" ? item.text : item.text[language],
          sound: item.sound,
        })),
        media: currentQuestion.media,
        // Include correct answer data for host view (from result events)
        correctAnswerId,
        correctAnswer,
        correctAnswers,
        correctOrder,
      }
    : undefined;

  if (loading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">
          {loading ? t.common.creatingLobby : t.common.loadingQuestions}
        </div>
      </div>
    );
  }

  if (error || questionsError) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            {t.common.error}
          </h2>
          <p className="text-gray-700">{error || questionsError}</p>
        </div>
      </div>
    );
  }

  if (!lobby) {
    return null;
  }

  // Render based on game state
  if (lobby.gameState === "lobby") {
    return <GameLobbyView lobby={lobby} onStartGame={handleStartGame} />;
  }

  if (lobby.gameState === "playing" && adaptedQuestion) {
    return (
      <GamePlayingView
        lobby={lobby}
        currentQuestion={adaptedQuestion}
        currentQuestionIndex={currentQuestion!.questionIndex}
        totalQuestions={lobby.totalQuestions!}
        playersWhoAnswered={playersWhoAnswered}
        allPlayersAnswered={allPlayersAnswered}
        showCorrectAnswer={lobby.currentPhase === "revealing"}
        customAnswers={customAnswers}
        isVotingPhase={isVotingPhase}
        allVotesReceived={allVotesReceived}
        playerAnswers={playerAnswers}
        correctPlayerIds={correctPlayerIds}
        playerScores={playerScores}
        onShowAnswer={handleShowAnswer}
        onShowVotingResults={handleShowVotingResults}
        onNextQuestion={handleNextQuestion}
      />
    );
  }

  if (lobby.gameState === "playing" && !adaptedQuestion) {
    // Fallback for when reconnecting but question data is not available
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-yellow-600 mb-4">
            {t.common.gameInProgress}
          </h2>
          <p className="text-gray-700 mb-4">
            {t.common.connectedButNoData}
          </p>
          <p className="text-sm text-gray-600">
            {t.common.lobbyIdLabel}: {lobby.id}
            <br />
            {t.common.questionIndex}: {lobby.currentQuestionIndex}
            <br />
            {t.common.totalQuestions}: {lobby.totalQuestions}
          </p>
        </div>
      </div>
    );
  }

  if (lobby.gameState === "finished") {
    return <GameFinishedView lobby={lobby} />;
  }

  return null;
}
