import { QRCodeSVG } from 'qrcode.react';
import type { Lobby } from '../../../shared/types';

interface GameLobbyViewProps {
  lobby: Lobby;
  onStartGame: () => void;
}

export default function GameLobbyView({ lobby, onStartGame }: GameLobbyViewProps) {
  const playerJoinUrl = `${window.location.origin}/player/${lobby.id}`;
  const playersWithNames = lobby.players.filter((p) => p.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
            Game Lobby
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Lobby Code: <span className="font-mono font-bold text-2xl text-blue-600">{lobby.id}</span>
          </p>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* QR Code */}
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Scan to Join</h2>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <QRCodeSVG value={playerJoinUrl} size={256} level="H" />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Players can scan this QR code to join
              </p>
            </div>

            {/* Players List */}
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Players ({playersWithNames.length})
              </h2>
              {playersWithNames.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  Waiting for players to join...
                </div>
              ) : (
                <div className="space-y-2">
                  {playersWithNames.map((player) => (
                    <div
                      key={player.id}
                      className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                          {player.name!.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{player.name}</div>
                          <div className="text-sm text-gray-500">
                            {player.connected ? '🟢 Connected' : '🔴 Disconnected'}
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-600 font-semibold">{player.score} pts</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Start Game Button */}
          <div className="flex justify-center">
            <button
              onClick={onStartGame}
              disabled={playersWithNames.length === 0}
              className={`px-8 py-4 rounded-lg text-white font-bold text-xl shadow-lg transition duration-200 transform hover:scale-105 ${
                playersWithNames.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {playersWithNames.length === 0
                ? 'Waiting for Players'
                : `Start Game (${playersWithNames.length} player${playersWithNames.length !== 1 ? 's' : ''})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
