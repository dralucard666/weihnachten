import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import PlayerJoinView from '../components/player-game/PlayerJoinView';
import PlayerLobbyView from '../components/player-game/PlayerLobbyView';
import PlayerGameView from '../components/player-game/PlayerGameView';
import PlayerFinishedView from '../components/player-game/PlayerFinishedView';
import PlayerIntermediateScoresView from '../components/player-game/PlayerIntermediateScoresView';
import ReconnectModal from '../components/ReconnectModal';
import { useI18n } from '../i18n/useI18n';

export default function PlayerPage() {
  const { t, language } = useI18n();
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
    handleSubmitTextInput,
    handleSubmitOrder,
    handleVoteForAnswer,
    handleReconnect,
    getStoredSession,
    submittedOrder,
  } = usePlayer(lobbyId);

  // Adapt QuestionData to extract current language text
  const adaptedQuestion = currentQuestion ? {
    questionId: currentQuestion.questionId,
    questionIndex: currentQuestion.questionIndex,
    questionType: currentQuestion.type,
    answers: currentQuestion.answers?.map(a => ({
      id: a.id,
      text: typeof a.text === 'string' ? a.text : a.text[language],
      sound: a.sound,
    })),
    orderItems: currentQuestion.orderItems?.map(item => ({
      id: item.id,
      text: typeof item.text === 'string' ? item.text : item.text[language],
      sound: item.sound,
    })),
  } : null;

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[20px] shadow-xl p-8 text-center relative">
            {/* Help button - only show if there's a stored session */}
            {storedSession && (
              <button
                onClick={() => setShowReconnectModal(true)}
                className="cursor-pointer absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                title={t.common.reconnectToPreviousSession}
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

            <div className="flex items-center justify-center mb-6">
              <h1 className="text-4xl font-extrabold text-gray-800">{t.playerJoin.joinGame}</h1>
              <span className="ml-2 text-5xl">📱</span>
            </div>
            
            <div className="text-6xl mb-6">🎯</div>
            
            <p className="text-gray-700 mb-2 font-semibold">
              {t.playerJoin.scanQR}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {t.playerJoin.qrDescription}
            </p>
            
            <div className="border-t-2 border-gray-200 pt-6 mt-6">
              <p className="text-gray-700 font-bold mb-3">
                {t.playerJoin.orEnterCode}
              </p>
              <form onSubmit={handleManualJoin} className="space-y-3">
                <input
                  type="text"
                  value={manualLobbyId}
                  onChange={(e) => setManualLobbyId(e.target.value)}
                  placeholder={t.playerJoin.enterLobbyCode}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-center font-mono text-lg"
                />
                <button
                  type="submit"
                  disabled={!manualLobbyId.trim()}
                  className="cursor-pointer w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  🚀 {t.playerJoin.joinGameAction}
                </button>
              </form>
            </div>
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
        <div className="text-xl text-gray-600">{t.common.loading}</div>
      </div>
    );
  }

  const currentPlayer = lobby.players.find((p) => p.id === playerId);

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t.common.error}: {t.common.playerNotFound}</div>
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
      // Show intermediate scores if in that phase
      if (lobby.currentPhase === 'intermediate-scores' && currentQuestion) {
        return (
          <PlayerIntermediateScoresView
            lobby={lobby}
            playerId={playerId}
            currentQuestionIndex={currentQuestion.questionIndex}
            totalQuestions={lobby.totalQuestions!}
          />
        );
      }
      
      return (
        <PlayerGameView
          currentPlayer={currentPlayer}
          currentQuestion={adaptedQuestion}
          selectedAnswer={selectedAnswer}
          customAnswerText={customAnswerText}
          hasSubmitted={hasSubmitted}
          votingAnswers={votingAnswers}
          isVotingPhase={isVotingPhase}
          onSubmitAnswer={handleSubmitAnswer}
          onSubmitCustomAnswer={handleSubmitCustomAnswer}
          onSubmitTextInput={handleSubmitTextInput}
          onSubmitOrder={handleSubmitOrder}
          onVoteForAnswer={handleVoteForAnswer}
          submittedOrder={submittedOrder}
        />
      );

    case 'finished':
      return <PlayerFinishedView lobby={lobby} playerId={playerId} />;

    default:
      return null;
  }
}
