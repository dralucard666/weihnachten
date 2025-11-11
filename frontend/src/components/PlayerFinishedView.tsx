import type { Lobby } from '../../../shared/types';

interface PlayerFinishedViewProps {
  lobby: Lobby;
  playerId: string;
}

export default function PlayerFinishedView({
  lobby,
  playerId,
}: PlayerFinishedViewProps) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Game Over!
        </h1>

        {/* Player Result */}
        <div className="text-center mb-8">
          <p className="text-6xl mb-4">{getRankEmoji(playerRank)}</p>
          <p className="text-2xl font-bold text-gray-800 mb-2">
            You placed #{playerRank}
          </p>
          <p className="text-xl text-gray-600">
            Final Score: {currentPlayer?.score || 0} points
          </p>
        </div>

        {/* Final Standings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h2 className="font-semibold text-gray-800 mb-3 text-center">
            Final Standings
          </h2>
          <div className="space-y-2">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-3 rounded ${
                  player.id === playerId ? 'bg-blue-100 font-bold' : 'bg-white'
                }`}
              >
                <span className="text-gray-800">
                  #{index + 1} {player.name}
                  {player.id === playerId && ' (You)'}
                </span>
                <span className="text-gray-600">{player.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
