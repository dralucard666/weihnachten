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
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Welcome, {playerName}!
        </h1>
        <div className="text-center text-gray-600 mb-8">
          <p className="text-lg mb-2">You're in the lobby</p>
          <p className="text-sm">Waiting for the game master to start the game...</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-6">
          <h2 className="font-semibold text-gray-800 mb-3">
            Players in Lobby ({lobby.players.filter(p => p.name).length})
          </h2>
          <div className="space-y-2">
            {lobby.players
              .filter(p => p.name)
              .map((player) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    player.id === playerId ? 'bg-purple-100' : 'bg-white'
                  }`}
                >
                  <span className="font-medium text-gray-800">
                    {player.name}
                    {player.id === playerId && ' (You)'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {player.connected ? '🟢' : '🔴'}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
