import type { CustomAnswer } from "../../../../shared/types";

interface HostControlButtonsProps {
  isCustomAnswersMode: boolean;
  isTextInputMode: boolean;
  isVotingPhase: boolean;
  showCorrectAnswer: boolean;
  allPlayersAnswered: boolean;
  allVotesReceived: boolean;
  customAnswers: CustomAnswer[];
  currentQuestionIndex: number;
  totalQuestions: number;
  showTextInputPlayerResults: boolean;
  onShowAnswer: () => void;
  onTriggerVoting: () => void;
  onShowVotingResults: () => void;
  onNextQuestion: () => void;
  onShowTextInputPlayerResults: () => void;
}

export default function HostControlButtons({
  isCustomAnswersMode,
  isTextInputMode,
  isVotingPhase,
  showCorrectAnswer,
  allPlayersAnswered,
  allVotesReceived,
  customAnswers,
  currentQuestionIndex,
  totalQuestions,
  showTextInputPlayerResults,
  onShowAnswer,
  onTriggerVoting,
  onShowVotingResults,
  onNextQuestion,
  onShowTextInputPlayerResults,
}: HostControlButtonsProps) {
  // Custom Answers - Collection Phase
  if (isCustomAnswersMode && !isVotingPhase && !showCorrectAnswer) {
    return (
      <div className="flex justify-center gap-4 flex-wrap">
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
            {allPlayersAnswered ? "Get Answers" : "Waiting for All Players..."}
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
      </div>
    );
  }

  // Custom Answers - Voting Phase
  if (isCustomAnswersMode && isVotingPhase && !showCorrectAnswer) {
    return (
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onShowVotingResults}
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
      </div>
    );
  }

  // Custom Answers - Results Phase
  if (isCustomAnswersMode && showCorrectAnswer) {
    return (
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onNextQuestion}
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
        >
          <span>{currentQuestionIndex + 1 >= totalQuestions ? "🏁" : "➡️"}</span>
          <span>
            {currentQuestionIndex + 1 >= totalQuestions
              ? "Finish Game"
              : "Next Question"}
          </span>
        </button>
      </div>
    );
  }

  // Text Input - Before showing player results
  if (isTextInputMode && !showCorrectAnswer && !showTextInputPlayerResults) {
    return (
      <div className="flex justify-center gap-4 flex-wrap">
        {allPlayersAnswered && (
          <button
            onClick={onShowTextInputPlayerResults}
            className="px-10 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
          >
            <span>📝</span>
            <span>Show Player Results</span>
          </button>
        )}
      </div>
    );
  }

  // Text Input - After showing player results
  if (isTextInputMode && !showCorrectAnswer && showTextInputPlayerResults) {
    return (
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onShowAnswer}
          className="px-10 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900 font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
        >
          <span>💡</span>
          <span>Show Answer</span>
        </button>
      </div>
    );
  }

  // Multiple Choice / Text Input - Before showing answer
  if (!showCorrectAnswer) {
    return (
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={onShowAnswer}
          disabled={!allPlayersAnswered}
          className={`px-10 py-4 rounded-xl font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
            allPlayersAnswered
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900"
              : "bg-gray-600 text-gray-400 cursor-not-allowed"
          }`}
        >
          <span>💡</span>
          <span>
            {allPlayersAnswered ? "Show Answer" : "Waiting for All Players..."}
          </span>
        </button>
      </div>
    );
  }

  // After showing answer - Next Question
  return (
    <div className="flex justify-center gap-4 flex-wrap">
      <button
        onClick={onNextQuestion}
        className="px-10 py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
      >
        <span>{currentQuestionIndex + 1 >= totalQuestions ? "🏁" : "➡️"}</span>
        <span>
          {currentQuestionIndex + 1 >= totalQuestions
            ? "Finish Game"
            : "Next Question"}
        </span>
      </button>
    </div>
  );
}
