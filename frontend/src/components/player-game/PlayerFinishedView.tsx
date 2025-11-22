import type { Lobby } from '../../../../shared/types';
import { useI18n } from '../../i18n/useI18n';

interface PlayerFinishedViewProps {
  lobby: Lobby;
  playerId: string;
}

export default function PlayerFinishedView({
  lobby,
  playerId,
}: PlayerFinishedViewProps) {
  const { t } = useI18n();
  const sortedPlayers = [...lobby.players].sort((a, b) => b.score - a.score);
  const currentPlayer = lobby.players.find((p) => p.id === playerId);
  const playerRank = sortedPlayers.findIndex((p) => p.id === playerId) + 1;

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🏆';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '🎮';
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-500';
      case 2:
        return 'from-gray-300 to-gray-400';
      case 3:
        return 'from-orange-300 to-orange-400';
      default:
        return 'from-blue-100 to-purple-100';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[20px] shadow-xl p-8">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
            {t.gameFinished.gameOver} 🎉
          </h1>

          {/* Player Result */}
          <div className="text-center mb-8">
            <div className={`bg-gradient-to-r ${getRankColor(playerRank)} rounded-xl p-6 shadow-lg mb-4`}>
              <p className="text-6xl mb-3 animate-bounce">{getRankEmoji(playerRank)}</p>
              <p className="text-3xl font-extrabold text-gray-800 mb-2">
                {playerRank === 1 ? t.gameFinished.winner : 
                 playerRank === 2 ? t.gameFinished.place_2nd : 
                 playerRank === 3 ? t.gameFinished.place_3rd : 
                 `${playerRank}${t.gameFinished.place_nth}`}
              </p>
              <div className="bg-white/50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{t.gameFinished.finalScore}</p>
                <p className="text-4xl font-extrabold text-gray-900">{currentPlayer?.score || 0}</p>
                <p className="text-xs text-gray-600">{t.lobby.points}</p>
              </div>
            </div>
          </div>

          {/* Final Standings */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 shadow-inner">
            <h2 className="font-bold text-gray-800 mb-3 text-center text-lg">
              {t.gameFinished.finalStandings}
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                    player.id === playerId 
                      ? 'bg-gradient-to-r from-blue-200 to-purple-200 ring-2 ring-blue-400 font-bold shadow-md' 
                      : 'bg-white shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getRankEmoji(index + 1)}</span>
                    <span className="text-gray-800">
                      #{index + 1} {player.name}
                      {player.id === playerId && ` ${t.playerLobby.you}`}
                    </span>
                  </div>
                  <span className="text-gray-700 font-bold">{player.score} {t.gameFinished.pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Thank You Message */}
          <div className="mt-6 text-center bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4">
            <p className="text-lg font-bold text-gray-800">
              🎊 {t.gameFinished.thanksForPlaying} 🎊
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
