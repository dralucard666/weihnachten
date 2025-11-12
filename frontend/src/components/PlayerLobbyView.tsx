import type { Lobby } from '../../../shared/types';

interface PlayerLobbyViewProps {
  lobby: Lobby;
  playerId: string;
  playerName: string;
}

export default function PlayerLobbyView({
  lobby,
  playerId,
  playerName,
}: PlayerLobbyViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[20px] shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl font-extrabold text-gray-800">Welcome!</h1>
              <span className="ml-2 text-5xl">👋</span>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4">
              <p className="text-3xl font-bold text-gray-800 mb-1">{playerName}</p>
              <p className="text-sm text-gray-600">You're in the lobby</p>
            </div>
          </div>

          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full">
              <span className="text-2xl animate-pulse">⏳</span>
              <p className="text-gray-700 font-medium">Waiting for game to start...</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-inner">
            <h2 className="font-bold text-gray-800 mb-4 text-center text-lg">
              Players in Lobby ({lobby.players.filter(p => p.name).length})
            </h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {lobby.players
                .filter(p => p.name)
                .map((player) => (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      player.id === playerId 
                        ? 'bg-gradient-to-r from-blue-200 to-purple-200 ring-2 ring-blue-400 shadow-md' 
                        : 'bg-white shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {player.id === playerId && <span className="text-xl">👈</span>}
                      <span className="font-bold text-gray-800">
                        {player.name}
                        {player.id === playerId && ' (You)'}
                      </span>
                    </div>
                    <span className={`text-lg ${player.connected ? '' : 'opacity-50'}`}>
                      {player.connected ? '🟢' : '🔴'}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
