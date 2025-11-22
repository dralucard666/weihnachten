import type { CustomAnswer, Player } from "../../../../../shared/types";
import type { Question } from "./types";

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
  // Collection phase
  if (!isVotingPhase) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-purple-400/30">
        <h2 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">
          {question.text}
        </h2>
        <div className="text-center text-gray-300 text-lg mb-4">
          <p>Players are writing their answers...</p>
          <p className="text-sm mt-2 text-yellow-300">
            📝 Custom Answer Mode: Players submit their own answers
          </p>
        </div>
        {allPlayersAnswered && customAnswers.length > 0 && (
          <div className="mt-6 bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-blue-400/30">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              ✨ Submitted Answers:
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
                    <div className="text-white font-medium text-lg">
                      {answer.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center text-yellow-300 text-sm">
              ⚠️ One of these answers is correct. The order is randomized.
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
        <h2 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">
          {question.text}
        </h2>
        <div className="text-center text-gray-300 text-lg mb-4">
          <p>Players are voting for the correct answer...</p>
          <p className="text-sm mt-2 text-orange-300">
            🗳️ Voting Phase: Players pick which answer they think is correct
          </p>
        </div>
        <div className="mt-6 bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-purple-400/30">
          <h3 className="text-xl font-bold text-white mb-4 text-center">
            All Answers:
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
                  <div className="text-white font-medium text-lg">
                    {answer.text}
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
      <h2 className="text-4xl font-bold text-white mb-6 text-center drop-shadow-lg">
        {question.text}
      </h2>
      <div className="text-center text-green-300 text-lg mb-4">
        <p className="text-3xl font-bold drop-shadow-md">🎉 Results!</p>
      </div>
      <div className="mt-6 bg-gray-900/60 backdrop-blur-sm p-6 rounded-xl border border-green-400/30">
        <h3 className="text-xl font-bold text-white mb-4 text-center">
          All Answers with Results:
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
                  <div className="text-white font-medium text-lg">
                    {answer.text}
                  </div>
                  {!answer.playerId && (
                    <div className="text-base text-green-200 mt-1 font-bold flex items-center gap-2">
                      <span>✓</span>
                      <span>CORRECT ANSWER</span>
                    </div>
                  )}
                  {answer.playerId && (
                    <div className="text-xs text-blue-200 mt-1">
                      Player:{" "}
                      {players.find((p) => p.id === answer.playerId)?.name ||
                        "Unknown"}
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
