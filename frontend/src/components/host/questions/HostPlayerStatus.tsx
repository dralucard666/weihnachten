import type { Player } from "../../../../../shared/types";
import { useI18n } from '../../../i18n/useI18n';

interface HostPlayerStatusProps {
  players: Player[];
  playersWhoAnswered: Set<string>;
  isVotingPhase: boolean;
  showCorrectAnswer: boolean;
  correctPlayerIds: string[];
  getPlayerAnswer: (playerId: string) => string | undefined;
}

export default function HostPlayerStatus({
  players,
  playersWhoAnswered,
  isVotingPhase,
  showCorrectAnswer,
  correctPlayerIds,
  getPlayerAnswer,
}: HostPlayerStatusProps) {
  const { t } = useI18n();
  
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 shadow-xl mb-6 border border-blue-400/30">
      <h2 className="text-base font-bold text-white mb-3 text-center drop-shadow-md">
        👥 {t.host.playerStatus}
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2">
        {players.map((player) => {
          const hasAnswered = playersWhoAnswered.has(player.id);
          const playerAnswer = getPlayerAnswer(player.id);
          const isCorrect = correctPlayerIds.includes(player.id);
          
          // Determine card color:
          // - If answer is revealed, only correct players are green
          // - Otherwise, any player who answered is green
          const isGreen = showCorrectAnswer ? isCorrect : hasAnswered;
          
          return (
            <div
              key={player.id}
              className={`p-2 rounded-lg transition-all shadow-md ${
                isGreen
                  ? "bg-green-600/90 border border-green-400"
                  : "bg-gray-700/80 border border-gray-600"
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isGreen ? 'bg-green-300 text-green-900' : 'bg-gray-600 text-gray-300'
                }`}>
                  {player.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="text-xs font-semibold text-white truncate flex-1">
                  {player.name}
                </div>
              </div>
              <div className="text-[10px] text-gray-200">
                {hasAnswered
                  ? isVotingPhase
                    ? `✓ ${t.host.voted}`
                    : `✓ ${t.host.done}`
                  : `⏳ ${t.host.wait}`}
              </div>
              {showCorrectAnswer && playerAnswer && (
                <div className="text-[10px] text-yellow-200 mt-1 border-t border-gray-500/50 pt-1 truncate">
                  {playerAnswer}
                </div>
              )}
              <div className="text-xs font-bold text-yellow-400 mt-1">
                {player.score}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
