import { useI18n } from "../../../i18n/useI18n";
import LanguageSwitcher from "../../LanguageSwitcher";

interface HostControlButtonsProps {
  isCustomAnswersMode: boolean;
  isTextInputMode: boolean;
  isVotingPhase: boolean;
  showCorrectAnswer: boolean;
  allPlayersAnswered: boolean;
  allVotesReceived: boolean;
  currentQuestionIndex: number;
  totalQuestions: number;
  showTextInputPlayerResults: boolean;
  onShowAnswer: () => void;
  onShowVotingResults: () => void;
  onNextQuestion: () => void;
  onShowTextInputPlayerResults: () => void;
  onReloadQuestion: () => void;
}

export default function HostControlButtons({
  isCustomAnswersMode,
  isTextInputMode,
  isVotingPhase,
  showCorrectAnswer,
  allPlayersAnswered,
  allVotesReceived,
  currentQuestionIndex,
  totalQuestions,
  showTextInputPlayerResults,
  onShowAnswer,
  onShowVotingResults,
  onNextQuestion,
  onShowTextInputPlayerResults,
  onReloadQuestion,
}: HostControlButtonsProps) {
  const { t } = useI18n();
  const isLastQuestion = currentQuestionIndex + 1 >= totalQuestions;

  // Render primary action button
  const renderPrimaryButton = () => {
    // Custom Answers - Collection Phase
    if (isCustomAnswersMode && !isVotingPhase && !showCorrectAnswer) {
      return (
        <button
          onClick={onShowAnswer}
          disabled={!allPlayersAnswered}
          className={`px-10 py-4 rounded-lg font-bold text-xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
            allPlayersAnswered
              ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
              : "bg-gray-600/80 text-gray-400 cursor-not-allowed"
          }`}
        >
          <span>💡</span>
          <span>
            {allPlayersAnswered
              ? t.hostControls.showAnswer
              : t.hostControls.waitingForAllPlayers}
          </span>
        </button>
      );
    }

    // Custom Answers - Voting Phase
    if (isCustomAnswersMode && isVotingPhase && !showCorrectAnswer) {
      return (
        <button
          onClick={onShowVotingResults}
          disabled={!allVotesReceived}
          className={`px-10 py-4 rounded-lg font-bold text-xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
            allVotesReceived
              ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              : "bg-gray-600/80 text-gray-400 cursor-not-allowed"
          }`}
        >
          <span>📊</span>
          <span>
            {allVotesReceived
              ? t.hostControls.showResults
              : t.hostControls.waitingForAllVotes}
          </span>
        </button>
      );
    }

    // Text Input - Before showing player results
    if (isTextInputMode && !showCorrectAnswer && !showTextInputPlayerResults) {
      return allPlayersAnswered ? (
        <button
          onClick={onShowTextInputPlayerResults}
          className="px-10 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
        >
          <span>📝</span>
          <span>{t.hostControls.showPlayerResults}</span>
        </button>
      ) : null;
    }

    // Text Input - After showing player results but before answer
    if (isTextInputMode && !showCorrectAnswer && showTextInputPlayerResults) {
      return (
        <button
          onClick={onShowAnswer}
          className="px-10 py-4 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
        >
          <span>💡</span>
          <span>{t.hostControls.showAnswer}</span>
        </button>
      );
    }

    // Results shown - Next Question
    if (showCorrectAnswer) {
      return (
        <button
          onClick={onNextQuestion}
          className="px-10 py-4 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
        >
          <span>{isLastQuestion ? "🏁" : "➡️"}</span>
          <span>
            {isLastQuestion
              ? t.hostControls.finishGame
              : t.hostControls.nextQuestion}
          </span>
        </button>
      );
    }

    // Default - Show Answer
    return (
      <button
        onClick={onShowAnswer}
        disabled={!allPlayersAnswered}
        className={`px-10 py-4 rounded-lg font-bold text-xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
          allPlayersAnswered
            ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            : "bg-gray-600/80 text-gray-400 cursor-not-allowed"
        }`}
      >
        <span>💡</span>
        <span>
          {allPlayersAnswered
            ? t.hostControls.showAnswer
            : t.hostControls.waitingForAllPlayers}
        </span>
      </button>
    );
  };

  return (
    <div>
      <div className="flex justify-center items-center gap-4 flex-wrap">
        {renderPrimaryButton()}
      </div>
      <div className="absolute bottom-3 left-4 flex gap-2">
        <button
          onClick={onReloadQuestion}
          className="cursor-pointer px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-md"
          title={t.game.reload}
        >
          <span>🔄</span>
        </button>
      </div>
      <LanguageSwitcher />
    </div>
  );
}
