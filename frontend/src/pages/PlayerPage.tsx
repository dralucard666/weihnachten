import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import PlayerJoinView from '../components/PlayerJoinView';
import PlayerLobbyView from '../components/PlayerLobbyView';
import PlayerGameView from '../components/PlayerGameView';
import PlayerFinishedView from '../components/PlayerFinishedView';

export default function PlayerPage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const [manualLobbyId, setManualLobbyId] = useState('');
  const {
    lobby,
    playerId,
    playerName,
    currentQuestion,
    selectedAnswer,
    hasSubmitted,
    loading,
    error,
    joined,
    handleJoinLobby,
    handleSubmitAnswer,
  } = usePlayer(lobbyId);

  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualLobbyId.trim()) {
      navigate(`/player/${manualLobbyId.trim()}`);
    }
  };

  // No lobby ID - show instruction to scan QR code
  if (!lobbyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Join a Game
          </h1>
          <div className="text-6xl mb-6">📱</div>
          <p className="text-gray-600 mb-4">
            To join a game, scan the QR code displayed by the game master.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The QR code will automatically take you to the right lobby.
          </p>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <p className="text-gray-700 font-semibold mb-3 text-sm">
              Or enter a lobby code:
            </p>
            <form onSubmit={handleManualJoin} className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={manualLobbyId}
                onChange={(e) => setManualLobbyId(e.target.value)}
                placeholder="Enter code"
                className="px-3 py-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-center font-mono text-sm w-[300px]"
              />
              <button
                type="submit"
                disabled={!manualLobbyId.trim()}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Not joined yet - show join view
  if (!joined) {
    return (
      <PlayerJoinView
        lobbyId={lobbyId}
        onJoin={handleJoinLobby}
        loading={loading}
        error={error}
      />
    );
  }

  // Joined but no lobby data yet - loading
  if (!lobby || !playerId) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const currentPlayer = lobby.players.find((p) => p.id === playerId);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Error: Player not found</div>
      </div>
    );
  }

  // Route to appropriate view based on game state
  switch (lobby.gameState) {
    case 'lobby':
      return (
        <PlayerLobbyView
          lobby={lobby}
          playerId={playerId}
          playerName={playerName}
        />
      );

    case 'playing':
      return (
        <PlayerGameView
          currentPlayer={currentPlayer}
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswer}
          hasSubmitted={hasSubmitted}
          onSubmitAnswer={handleSubmitAnswer}
        />
      );

    case 'finished':
      return <PlayerFinishedView lobby={lobby} playerId={playerId} />;

    default:
      return null;
  }
}
