import type { Player, PlayerAnswerInfo } from "../../../../../shared/types";
import type { Question } from "./types";
import { useI18n } from "../../../i18n/useI18n";

interface HostTextInputDisplayProps {
  question: Question;
  showCorrectAnswer: boolean;
  showPlayerResults: boolean;
  playerAnswers: PlayerAnswerInfo[];
  players: Player[];
}

export default function HostTextInputDisplay({
  question,
  showCorrectAnswer,
  showPlayerResults,
  playerAnswers,
  players,
}: HostTextInputDisplayProps) {
  const { t } = useI18n();
  
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-blue-400/30">
      <h2 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">
        {question.text}
      </h2>
      <div className="text-center text-gray-300 text-lg mb-4">
        <p>{t.host.playersTyping}</p>
        <p className="text-sm mt-2 text-blue-300">
          {t.host.textInputModeNote}
        </p>
      </div>
      
      {showPlayerResults && playerAnswers.length > 0 && (
        <div className="mt-6 bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-blue-400/30">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            {t.host.playerAnswersLabel}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {playerAnswers.map((pa) => {
              const player = players.find((p) => p.id === pa.playerId);
              return (
                <div
                  key={pa.playerId}
                  className="p-4 rounded-lg bg-blue-600/90 shadow-lg border border-blue-400/40"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold text-blue-900">
                        {player?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {player?.name || t.host.unknown}
                        </div>
                        <div className="text-blue-200 text-sm">
                          {pa.answerText || t.host.noAnswer}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {showCorrectAnswer && question.correctAnswers && (
        <div className="mt-6 bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-green-400/30">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            {t.host.correctAnswerColon}
          </h3>
          <div className="p-4 rounded-lg bg-green-600 shadow-lg border border-green-400/40">
            <div className="text-white font-medium text-lg text-center">
              {question.correctAnswers[0]}
            </div>
          </div>
          <div className="mt-4 text-center text-yellow-300 text-sm">
            {t.host.caseInsensitiveNote}
          </div>
        </div>
      )}
    </div>
  );
}
