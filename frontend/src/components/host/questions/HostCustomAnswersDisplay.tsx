import type { CustomAnswer, Player } from "../../../../../shared/types";
import type { Question } from "./types";
import { useI18n } from "../../../i18n/useI18n";

interface HostCustomAnswersDisplayProps {
  question: Question;
  customAnswers: CustomAnswer[];
  isVotingPhase: boolean;
  showCorrectAnswer: boolean;
  allPlayersAnswered: boolean;
  players: Player[];
}

export default function HostCustomAnswersDisplay({
  question,
  customAnswers,
  isVotingPhase,
  showCorrectAnswer,
  allPlayersAnswered,
  players,
}: HostCustomAnswersDisplayProps) {
  const { language } = useI18n();
  const { t } = useI18n();
  
  // Helper to get text in current language
  const getText = (text: string | { de: string; en: string }) => {
    return typeof text === 'string' ? text : text[language];
  };
  // Collection phase
  if (!isVotingPhase) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-purple-400/30">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-center drop-shadow-lg">
          {question.text}
        </h2>
        <div className="text-center text-gray-300 text-lg mb-4">
          <p>{t.host.playersWritingAnswers}</p>
          <p className="text-sm mt-2 text-yellow-300">
            {t.host.customAnswerModeNote}
          </p>
        </div>
        {allPlayersAnswered && customAnswers.length > 0 && (
          <div className="mt-6 bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-blue-400/30">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              {t.host.submittedAnswers}
            </h3>
            <div className="grid grid-cols-1 auto-rows-fr gap-3">
              {customAnswers.map((answer, idx) => (
                <div
                  key={answer.id}
                  className="p-4 rounded-lg bg-blue-600/90 shadow-lg border border-blue-400/40 h-full flex items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-blue-900">
                      {idx + 1}
                    </div>
                    <div className="text-white font-medium text-3xl md:text-4xl">
                      {getText(answer.text)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-yellow-300 text-sm">
              {t.host.oneAnswerCorrect}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Voting phase (without results)
  if (!showCorrectAnswer) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-orange-400/30">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-center drop-shadow-lg">
          {question.text}
        </h2>
        <div className="text-center text-gray-300 text-lg mb-4">
          <p>{t.host.playersVoting}</p>
          <p className="text-sm mt-2 text-orange-300">
            {t.host.votingPhaseNote}
          </p>
        </div>
        <div className="mt-6 bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-purple-400/30">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            {t.host.allAnswers}
          </h3>
          <div className="grid grid-cols-1 auto-rows-fr gap-3">
            {customAnswers.map((answer, idx) => (
              <div
                key={answer.id}
                className="p-4 rounded-lg bg-purple-600/90 shadow-lg border border-purple-400/40 h-full flex items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-purple-900">
                    {idx + 1}
                  </div>
                  <div className="text-white font-medium text-3xl md:text-4xl flex-1">
                    {getText(answer.text)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Results phase
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-green-400/30">
      <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 text-center drop-shadow-lg">
        {question.text}
      </h2>
      <div className="text-center text-green-300 text-lg mb-4">
        <p className="text-3xl font-bold drop-shadow-md">{t.host.results}</p>
      </div>
      <div className="mt-6 bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-green-400/30">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          {t.host.allAnswersWithResults}
        </h3>
        <div className="grid grid-cols-1 auto-rows-fr gap-3">
          {customAnswers.map((answer, idx) => (
            <div
              key={answer.id}
              className={`p-4 rounded-lg shadow-lg h-full flex items-center ${
                !answer.playerId
                  ? "bg-green-600 ring-2 ring-yellow-400"
                  : "bg-blue-600/90 border border-blue-400/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    !answer.playerId
                      ? "bg-yellow-400 text-green-900"
                      : "bg-yellow-400 text-blue-900"
                  }`}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-3xl md:text-4xl">
                    {getText(answer.text)}
                  </div>
                  {!answer.playerId && (
                    <div className="text-base text-green-200 mt-1 font-bold flex items-center gap-2">
                      <span>✓</span>
                      <span>{t.host.correctAnswerLabel}</span>
                    </div>
                  )}
                  {answer.playerId && (
                    <div className="text-xs text-blue-200 mt-1">
                      {t.host.playerLabel}:{" "}
                      {players.find((p) => p.id === answer.playerId)?.name ||
                        t.host.unknown}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
