import type { Player, PlayerAnswerInfo } from "../../../../../shared/types";
import type { Question } from "./types";

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
  return (
    <div className="bg-black/30 backdrop-blur-md rounded-[20px] p-8 shadow-2xl border-2 border-blue-400/30">
      <h2 className="text-4xl font-bold text-white mb-6 text-center">
        {question.text}
      </h2>
      <div className="text-center text-gray-300 text-lg mb-4">
        <p>Players are typing their answers...</p>
        <p className="text-sm mt-2 text-blue-400">
          ⌨️ Text Input Mode: Players enter text answers
        </p>
      </div>
      
      {showPlayerResults && playerAnswers.length > 0 && (
        <div className="mt-6 bg-gray-800/50 p-6 rounded-xl border border-blue-400/30">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            📝 Player Answers:
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {playerAnswers.map((pa) => {
              const player = players.find((p) => p.id === pa.playerId);
              return (
                <div
                  key={pa.playerId}
                  className="p-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border border-blue-400/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-blue-900">
                        {player?.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {player?.name || "Unknown"}
                        </div>
                        <div className="text-blue-200 text-sm">
                          {pa.answerText || "(no answer)"}
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
        <div className="mt-6 bg-gray-800/50 p-6 rounded-xl border border-green-400/30">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            ✅ Correct Answer:
          </h3>
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-500 to-green-600 shadow-lg border border-green-400/30">
            <div className="text-white font-medium text-lg text-center">
              {question.correctAnswers[0]}
            </div>
          </div>
          <div className="mt-4 text-center text-yellow-300 text-sm">
            ℹ️ Answers are case-insensitive and whitespace is trimmed
          </div>
        </div>
      )}
    </div>
  );
}
