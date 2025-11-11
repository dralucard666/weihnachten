import type { Lobby } from '../../../shared/types';

interface GameFinishedViewProps {
  lobby: Lobby;
}

export default function GameFinishedView({ lobby }: GameFinishedViewProps) {
  const sortedPlayers = [...lobby.players].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
            🎉 Game Finished! 🎉
          </h1>
          
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
            Final Scores
          </h2>
          
          <div className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`p-6 rounded-lg flex items-center justify-between ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg scale-105'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-3xl font-bold ${
                    index === 0 ? 'text-yellow-900' : 'text-gray-600'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="font-bold text-xl text-gray-800">{player.name}</div>
                </div>
                <div className={`text-2xl font-bold ${
                  index === 0 ? 'text-yellow-900' : 'text-gray-700'
                }`}>
                  {player.score} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
