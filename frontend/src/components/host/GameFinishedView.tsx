import type { Lobby } from '../../../shared/types';

interface GameFinishedViewProps {
  lobby: Lobby;
}

export default function GameFinishedView({ lobby }: GameFinishedViewProps) {
  const sortedPlayers = [...lobby.players].sort((a, b) => b.score - a.score);

  const getPodiumEmoji = (index: number) => {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🎯';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-5xl font-extrabold text-gray-800">Game Over!</h1>
            <span className="ml-3 text-6xl">🎉</span>
          </div>
          <p className="text-xl text-gray-700">Final Results</p>
        </div>

        {/* Main Results Card */}
        <div className="bg-white rounded-[20px] shadow-xl p-8 mb-6">
          {/* Top 3 Podium */}
          {sortedPlayers.length >= 3 && (
            <div className="mb-8 flex items-end justify-center gap-4">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-32">
                <span className="text-5xl mb-2">🥈</span>
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl p-4 w-full text-center shadow-lg h-28 flex flex-col justify-center">
                  <div className="font-bold text-gray-800 text-lg truncate">{sortedPlayers[1].name}</div>
                  <div className="text-2xl font-extrabold text-gray-700">{sortedPlayers[1].score}</div>
                  <div className="text-xs text-gray-600">points</div>
                </div>
              </div>

              {/* 1st Place - Taller */}
              <div className="flex flex-col items-center w-32">
                <span className="text-6xl mb-2 animate-bounce">�</span>
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-4 w-full text-center shadow-2xl h-36 flex flex-col justify-center ring-4 ring-yellow-300">
                  <div className="font-bold text-yellow-900 text-xl truncate">{sortedPlayers[0].name}</div>
                  <div className="text-3xl font-extrabold text-yellow-900">{sortedPlayers[0].score}</div>
                  <div className="text-xs text-yellow-800">points</div>
                </div>
              </div>

              {/* 3rd Place */}
              {sortedPlayers.length > 2 && (
                <div className="flex flex-col items-center w-32">
                  <span className="text-5xl mb-2">🥉</span>
                  <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl p-4 w-full text-center shadow-lg h-24 flex flex-col justify-center">
                    <div className="font-bold text-orange-900 text-lg truncate">{sortedPlayers[2].name}</div>
                    <div className="text-2xl font-extrabold text-orange-800">{sortedPlayers[2].score}</div>
                    <div className="text-xs text-orange-700">points</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Players List */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Full Scoreboard</h2>
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`p-4 rounded-xl flex items-center justify-between transition-all duration-300 ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 shadow-lg scale-102 border-2 border-yellow-400'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 shadow-md'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-100 to-orange-200 shadow-md'
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="text-4xl">{getPodiumEmoji(index)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${
                        index === 0 ? 'text-yellow-700' : 'text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className={`font-bold text-xl ${
                        index === 0 ? 'text-yellow-900' : 'text-gray-800'
                      }`}>
                        {player.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-3xl font-extrabold ${
                  index === 0 ? 'text-yellow-700' : 'text-gray-700'
                }`}>
                  {player.score}
                  <span className="text-sm ml-1">pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thank You Message */}
        <div className="text-center bg-white/60 backdrop-blur-md rounded-[20px] shadow-lg p-6">
          <p className="text-lg text-gray-700 font-semibold">
            🎊 Thanks for playing! 🎊
          </p>
        </div>
      </div>
    </div>
  );
}
