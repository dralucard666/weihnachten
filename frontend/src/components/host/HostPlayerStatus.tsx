import type { Player } from "../../../../shared/types";

interface HostPlayerStatusProps {
  players: Player[];
  playersWhoAnswered: Set<string>;
  isVotingPhase: boolean;
  showCorrectAnswer: boolean;
  getPlayerAnswer: (playerId: string) => string | undefined;
}

export default function HostPlayerStatus({
  players,
  playersWhoAnswered,
  isVotingPhase,
  showCorrectAnswer,
  getPlayerAnswer,
}: HostPlayerStatusProps) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-[20px] p-6 shadow-2xl mb-6 border-2 border-blue-400/30">
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        👥 Player Status
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {players.map((player) => {
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
  );
}
