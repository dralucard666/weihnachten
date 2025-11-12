import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import PlayerJoinView from '../components/PlayerJoinView';
import PlayerLobbyView from '../components/PlayerLobbyView';
import PlayerGameView from '../components/PlayerGameView';
import PlayerFinishedView from '../components/PlayerFinishedView';
import ReconnectModal from '../components/ReconnectModal';

export default function PlayerPage() {
  const { lobbyId } = useParams<{ lobbyId: string }>();
  const navigate = useNavigate();
  const [manualLobbyId, setManualLobbyId] = useState('');
  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const {
    lobby,
    playerId,
    playerName,
    currentQuestion,
    selectedAnswer,
    customAnswerText,
    hasSubmitted,
    votingAnswers,
    isVotingPhase,
    loading,
    error,
    joined,
    handleJoinLobby,
    handleSubmitAnswer,
    handleSubmitCustomAnswer,
    handleVoteForAnswer,
    handleReconnect,
    getStoredSession,
  } = usePlayer(lobbyId);

  const handleManualJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualLobbyId.trim()) {
      navigate(`/player/${manualLobbyId.trim()}`);
    }
  };

  const handleReconnectClick = () => {
    const session = getStoredSession();
    if (session) {
      // Use the handleReconnect function from the hook
      handleReconnect(session.lobbyId, session.playerId);
      setShowReconnectModal(false);
    }
  };

  const storedSession = getStoredSession();

  // No lobby ID - show instruction to scan QR code
  if (!lobbyId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center relative">
          {/* Help button - only show if there's a stored session */}
          {storedSession && (
            <button
              onClick={() => setShowReconnectModal(true)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
              title="Reconnect to previous session"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
            </button>
          )}

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

        {/* Reconnect Modal */}
        {showReconnectModal && storedSession && (
          <ReconnectModal
            lobbyId={storedSession.lobbyId}
            playerId={storedSession.playerId}
            playerName={storedSession.playerName}
            onReconnect={handleReconnectClick}
            onClose={() => setShowReconnectModal(false)}
            loading={false}
          />
        )}
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
          customAnswerText={customAnswerText}
          hasSubmitted={hasSubmitted}
          votingAnswers={votingAnswers}
          isVotingPhase={isVotingPhase}
          onSubmitAnswer={handleSubmitAnswer}
          onSubmitCustomAnswer={handleSubmitCustomAnswer}
          onVoteForAnswer={handleVoteForAnswer}
        />
      );

    case 'finished':
      return <PlayerFinishedView lobby={lobby} playerId={playerId} />;

    default:
      return null;
  }
}
