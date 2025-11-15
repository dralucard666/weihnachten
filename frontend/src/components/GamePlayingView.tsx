import { useState, useEffect } from "react";
import QuestionDisplay from "./QuestionDisplay";
import MediaDisplay from "./MediaDisplay";
import type {
  Lobby,
  Answer,
  QuestionType,
  CustomAnswer,
  PlayerAnswerInfo,
  QuestionMedia,
} from "../../../shared/types";

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers?: Answer[];
  correctAnswerId?: string;
  correctAnswer?: string;
  media?: QuestionMedia;
}

interface GamePlayingViewProps {
  lobby: Lobby;
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  playersWhoAnswered: Set<string>;
  allPlayersAnswered: boolean;
  showCorrectAnswer: boolean;
  customAnswers: CustomAnswer[];
  isVotingPhase: boolean;
  allVotesReceived: boolean;
  playerAnswers: PlayerAnswerInfo[];
  onShowAnswer: () => void;
  onTriggerVoting: () => void;
  onShowVotingResults: () => void;
  onNextQuestion: () => void;
  onReloadQuestion: () => void;
}

export default function GamePlayingView({
  lobby,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  playersWhoAnswered,
  allPlayersAnswered,
  showCorrectAnswer,
  customAnswers,
  isVotingPhase,
  allVotesReceived,
  playerAnswers,
  onShowAnswer,
  onTriggerVoting,
  onShowVotingResults,
  onNextQuestion,
  onReloadQuestion,
}: GamePlayingViewProps) {
  const playersWithNames = lobby.players.filter((p) => p.name);
  const isCustomAnswersMode = currentQuestion.type === "custom-answers";
  
  // Media display states
  const [showBeforeQuestionMedia, setShowBeforeQuestionMedia] = useState(
    !!currentQuestion.media?.beforeQuestion
  );
  const [showBeforeAnswerMedia, setShowBeforeAnswerMedia] = useState(false);

  // Reset media states when question changes
  useEffect(() => {
    setShowBeforeQuestionMedia(!!currentQuestion.media?.beforeQuestion);
    setShowBeforeAnswerMedia(false);
  }, [currentQuestion.id, currentQuestion.media?.beforeQuestion]);

  // Show before-answer media when correct answer is revealed
  const handleShowAnswerClick = () => {
    if (currentQuestion.media?.beforeAnswer) {
      setShowBeforeAnswerMedia(true);
    } else {
      onShowAnswer();
    }
  };

  const handleShowVotingResultsClick = () => {
    if (currentQuestion.media?.beforeAnswer) {
      setShowBeforeAnswerMedia(true);
    } else {
      onShowVotingResults();
    }
  };

  const handleBeforeAnswerMediaComplete = () => {
    setShowBeforeAnswerMedia(false);
    // Call the appropriate handler based on the current mode
    if (isVotingPhase) {
      onShowVotingResults();
    } else {
      onShowAnswer();
    }
  };

  const getPlayerAnswer = (playerId: string): string | undefined => {
    return playerAnswers.find((pa) => pa.playerId === playerId)?.answerText;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 p-6">
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col">
        {/* Header with Progress */}
        <div className="bg-black/40 backdrop-blur-md rounded-[20px] p-6 shadow-2xl mb-6 border-2 border-yellow-400/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🎯</span>
              <h1 className="text-3xl font-extrabold text-yellow-400">
                Quiz Master
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onReloadQuestion}
                className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition duration-200 flex items-center gap-2 border border-white/20"
                title="Reset current question state"
              >
                <span>🔄</span>
                <span className="hidden sm:inline">Reload</span>
              </button>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  Question {currentQuestionIndex + 1} / {totalQuestions}
                </div>
                <div className="text-sm text-yellow-300">
                  {isCustomAnswersMode && isVotingPhase && "🗳️ Voting Phase - "}
                  {playersWhoAnswered.size} / {playersWithNames.length}{" "}
                  {isVotingPhase ? "voted" : "answered"}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-800/50 rounded-full h-4 overflow-hidden border border-white/20">
            <div
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 h-full transition-all duration-1000 rounded-full shadow-lg"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / totalQuestions) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Before-Question Media Display */}
        {showBeforeQuestionMedia && currentQuestion.media?.beforeQuestion && (
          <div className="mb-6 flex justify-center">
            <MediaDisplay
              media={currentQuestion.media.beforeQuestion}
              onComplete={() => setShowBeforeQuestionMedia(false)}
              className="w-full max-w-5xl"
            />
          </div>
        )}

        {/* Before-Answer Media Display (shown when revealing answer) */}
        {showBeforeAnswerMedia && currentQuestion.media?.beforeAnswer && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
            <MediaDisplay
              media={currentQuestion.media.beforeAnswer}
              onComplete={handleBeforeAnswerMediaComplete}
              className="w-full max-w-6xl"
            />
          </div>
        )}

        {/* Question Display - Centered */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="w-full max-w-5xl">
            {isCustomAnswersMode && !isVotingPhase ? (
              <div className="bg-black/30 backdrop-blur-md rounded-[20px] p-8 shadow-2xl border-2 border-purple-400/30">
                <h2 className="text-4xl font-bold text-white mb-6 text-center">
                  {currentQuestion.text}
                </h2>
                <div className="text-center text-gray-300 text-lg mb-4">
                  <p>Players are writing their answers...</p>
                  <p className="text-sm mt-2 text-yellow-400">
                    📝 Custom Answer Mode: Players submit their own answers
                  </p>
                </div>
                {allPlayersAnswered && customAnswers.length > 0 && (
                  <div className="mt-6 bg-gray-800/50 p-6 rounded-xl border border-blue-400/30">
                    <h3 className="text-xl font-bold text-white mb-4 text-center">
                      ✨ Submitted Answers:
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                      {customAnswers.map((answer, idx) => (
                        <div
                          key={answer.id}
                          className="p-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border border-blue-400/30"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-blue-900">
                              {idx + 1}
                            </div>
                            <div className="text-white font-medium text-lg">
                              {answer.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-center text-yellow-300 text-sm">
                      ⚠️ One of these answers is correct. The order is
                      randomized.
                    </div>
                  </div>
                )}
              </div>
            ) : isCustomAnswersMode && isVotingPhase && !showCorrectAnswer ? (
              <div className="bg-black/30 backdrop-blur-md rounded-[20px] p-8 shadow-2xl border-2 border-orange-400/30">
                <h2 className="text-4xl font-bold text-white mb-6 text-center">
                  {currentQuestion.text}
                </h2>
                <div className="text-center text-gray-300 text-lg mb-4">
                  <p>Players are voting for the correct answer...</p>
                  <p className="text-sm mt-2 text-orange-400">
                    🗳️ Voting Phase: Players pick which answer they think is
                    correct
                  </p>
                </div>
                <div className="mt-6 bg-gray-800/50 p-6 rounded-xl border border-purple-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    All Answers:
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {customAnswers.map((answer, idx) => (
                      <div
                        key={answer.id}
                        className="p-4 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg border border-purple-400/30"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-purple-900">
                            {idx + 1}
                          </div>
                          <div className="text-white font-medium text-lg">
                            {answer.text}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : isCustomAnswersMode && isVotingPhase && showCorrectAnswer ? (
              <div className="bg-black/30 backdrop-blur-md rounded-[20px] p-8 shadow-2xl border-2 border-green-400/30">
                <h2 className="text-4xl font-bold text-white mb-6 text-center">
                  {currentQuestion.text}
                </h2>
                <div className="text-center text-green-300 text-lg mb-4">
                  <p className="text-3xl font-bold">🎉 Results!</p>
                </div>
                <div className="mt-6 bg-gray-800/50 p-6 rounded-xl border border-green-400/30">
                  <h3 className="text-xl font-bold text-white mb-4 text-center">
                    All Answers with Results:
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {customAnswers.map((answer, idx) => (
                      <div
                        key={answer.id}
                        className={`p-4 rounded-lg shadow-lg ${
                          !answer.playerId
                            ? "bg-gradient-to-r from-green-500 to-green-600 ring-4 ring-yellow-400 animate-pulse"
                            : "bg-gradient-to-r from-blue-600 to-blue-700 border border-blue-400/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                              !answer.playerId
                                ? "bg-yellow-400 text-green-900"
                                : "bg-yellow-400 text-blue-900"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium text-lg">
                              {answer.text}
                            </div>
                            {!answer.playerId && (
                              <div className="text-lg text-green-200 mt-1 font-bold flex items-center gap-2">
                                <span>✓</span>
                                <span>CORRECT ANSWER</span>
                              </div>
                            )}
                            {answer.playerId && (
                              <div className="text-xs text-blue-200 mt-1">
                                Player:{" "}
                                {lobby.players.find(
                                  (p) => p.id === answer.playerId
                                )?.name || "Unknown"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              currentQuestion.answers &&
              currentQuestion.correctAnswerId && (
                <QuestionDisplay
                  questionText={currentQuestion.text}
                  answers={currentQuestion.answers}
                  correctAnswerId={currentQuestion.correctAnswerId}
                  showCorrect={showCorrectAnswer}
                />
              )
            )}
          </div>
        </div>

        {/* Players Status - Bottom */}
        <div className="bg-black/40 backdrop-blur-md rounded-[20px] p-6 shadow-2xl mb-6 border-2 border-blue-400/30">
          <h2 className="text-xl font-bold text-white mb-4 text-center">
            👥 Player Status
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {playersWithNames.map((player) => {
              const hasAnswered = playersWhoAnswered.has(player.id);
              const playerAnswer = getPlayerAnswer(player.id);
              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-xl transition-all shadow-md ${
                    hasAnswered
                      ? "bg-gradient-to-br from-green-500 to-green-600 ring-2 ring-green-300"
                      : "bg-gradient-to-br from-gray-700 to-gray-800"
                  }`}
                >
                  <div className="font-semibold text-white text-sm truncate">
                    {player.name}
                  </div>
                  <div className="text-xs text-gray-200 mt-1">
                    {hasAnswered
                      ? isVotingPhase
                        ? "✓ Voted"
                        : "✓ Answered"
                      : "⏳ Waiting..."}
                  </div>
                  {showCorrectAnswer && playerAnswer && (
                    <div className="text-xs text-yellow-200 mt-1 border-t border-gray-500 pt-1 truncate">
                      {playerAnswer}
                    </div>
                  )}
                  <div className="text-sm font-bold text-yellow-400 mt-1">
                    {player.score} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          {isCustomAnswersMode && !isVotingPhase && !showCorrectAnswer ? (
            <>
              <button
                onClick={onShowAnswer}
                disabled={!allPlayersAnswered}
                className={`px-10 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
                  allPlayersAnswered
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed"
                }`}
              >
                <span>📋</span>
                <span>
                  {allPlayersAnswered
                    ? "Get Answers"
                    : "Waiting for All Players..."}
                </span>
              </button>
              {allPlayersAnswered && customAnswers.length > 0 && (
                <button
                  onClick={onTriggerVoting}
                  className="px-10 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                >
                  <span>🗳️</span>
                  <span>Start Voting</span>
                </button>
              )}
            </>
          ) : isCustomAnswersMode && isVotingPhase && !showCorrectAnswer ? (
            <button
              onClick={handleShowVotingResultsClick}
              disabled={!allVotesReceived}
              className={`px-10 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
                allVotesReceived
                  ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>📊</span>
              <span>
                {allVotesReceived ? "Show Results" : "Waiting for All Votes..."}
              </span>
            </button>
          ) : isCustomAnswersMode && showCorrectAnswer ? (
            <button
              onClick={onNextQuestion}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <span>
                {currentQuestionIndex + 1 >= totalQuestions ? "🏁" : "➡️"}
              </span>
              <span>
                {currentQuestionIndex + 1 >= totalQuestions
                  ? "Finish Game"
                  : "Next Question"}
              </span>
            </button>
          ) : !showCorrectAnswer ? (
            <button
              onClick={handleShowAnswerClick}
              disabled={!allPlayersAnswered}
              className={`px-10 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
                allPlayersAnswered
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              }`}
            >
              <span>💡</span>
              <span>
                {allPlayersAnswered
                  ? "Show Answer"
                  : "Waiting for All Players..."}
              </span>
            </button>
          ) : (
            <button
              onClick={onNextQuestion}
              className="px-10 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
            >
              <span>
                {currentQuestionIndex + 1 >= totalQuestions ? "🏁" : "➡️"}
              </span>
              <span>
                {currentQuestionIndex + 1 >= totalQuestions
                  ? "Finish Game"
                  : "Next Question"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
