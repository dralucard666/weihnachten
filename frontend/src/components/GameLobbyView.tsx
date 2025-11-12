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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-6">
      <div className="w-full max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-5xl font-extrabold text-gray-800">Game Lobby</h1>
            <span className="ml-3 text-6xl">🎮</span>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-[20px] shadow-lg p-4 inline-block">
            <p className="text-gray-700 text-lg">
              Lobby Code: <span className="font-mono font-bold text-3xl text-blue-600">{lobby.id}</span>
            </p>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-[20px] shadow-xl p-8 mb-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-[20px] p-6 shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">📱 Scan to Join</h2>
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <QRCodeSVG value={playerJoinUrl} size={220} level="H" />
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center max-w-[250px]">
                  Players can scan this QR code with their phones to join instantly
                </p>
              </div>
            </div>

            {/* Players List Section */}
            <div className="flex flex-col">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-[20px] p-6 shadow-md h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  👥 Players ({playersWithNames.length})
                </h2>
                <div className="flex-1 overflow-auto">
                  {playersWithNames.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                      <span className="text-5xl mb-3">⏳</span>
                      <p className="text-center">Waiting for players to join...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {playersWithNames.map((player) => (
                        <div
                          key={player.id}
                          className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {player.name!.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-lg">{player.name}</div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <span className={player.connected ? 'text-green-500' : 'text-red-500'}>●</span>
                                {player.connected ? 'Connected' : 'Disconnected'}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-2xl font-bold text-blue-600">{player.score}</div>
                            <div className="text-xs text-gray-500">points</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="flex justify-center">
          <button
            onClick={onStartGame}
            disabled={playersWithNames.length === 0}
            className={`px-12 py-5 rounded-xl text-white font-bold text-2xl shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 ${
              playersWithNames.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
            }`}
          >
            {playersWithNames.length === 0 ? (
              <>
                <span>⏳</span>
                <span>Waiting for Players</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Start Game ({playersWithNames.length} player{playersWithNames.length !== 1 ? 's' : ''})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
