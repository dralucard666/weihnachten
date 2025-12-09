import type { Lobby } from '../../../../shared/types';
import { useI18n } from '../../i18n/useI18n';

interface PlayerIntermediateScoresViewProps {
  lobby: Lobby;
  playerId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export default function PlayerIntermediateScoresView({
  lobby,
  playerId,
  currentQuestionIndex,
  totalQuestions,
}: PlayerIntermediateScoresViewProps) {
  const { t } = useI18n();
  const sortedPlayers = [...lobby.players].sort((a, b) => b.score - a.score);
  const currentPlayer = lobby.players.find((p) => p.id === playerId);
  const currentPlayerRank = sortedPlayers.findIndex((p) => p.id === playerId) + 1;

  const getPodiumEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🎯';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <h1 className="text-4xl font-extrabold text-white drop-shadow-lg">{t.intermediateScores.currentStandings}</h1>
            <span className="ml-2 text-5xl">📊</span>
          </div>
          <p className="text-xl text-white/90 font-semibold drop-shadow">
            {t.intermediateScores.afterQuestion} {currentQuestionIndex} {t.intermediateScores.of} {totalQuestions}
          </p>
        </div>

        {/* Your Position Card */}
        {currentPlayer && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[20px] shadow-2xl p-6 mb-6 border-4 border-white">
            <div className="text-center text-white">
              <p className="text-lg font-bold mb-2">{t.playerLobby.you}</p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-5xl">{getPodiumEmoji(currentPlayerRank - 1)}</div>
                <div>
                  <div className="text-3xl font-extrabold">#{currentPlayerRank}</div>
                  <div className="text-2xl font-bold">{currentPlayer.score} {t.gameFinished.pts}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Scores Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[20px] shadow-2xl p-6">
          {/* Top 3 Podium - Compact Version */}
          {sortedPlayers.length >= 3 && (
            <div className="mb-5 flex items-end justify-center gap-2">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-24">
                <span className="text-3xl mb-1">🥈</span>
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg p-2 w-full text-center shadow-lg h-20 flex flex-col justify-center">
                  <div className="font-bold text-gray-800 text-xs truncate">{sortedPlayers[1].name}</div>
                  <div className="text-lg font-extrabold text-gray-700">{sortedPlayers[1].score}</div>
                  <div className="text-xs text-gray-600">{t.lobby.points}</div>
                </div>
              </div>

              {/* 1st Place - Taller */}
              <div className="flex flex-col items-center w-24">
                <span className="text-4xl mb-1 animate-pulse">🥇</span>
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-2 w-full text-center shadow-2xl h-24 flex flex-col justify-center ring-4 ring-yellow-300">
                  <div className="font-bold text-yellow-900 text-sm truncate">{sortedPlayers[0].name}</div>
                  <div className="text-xl font-extrabold text-yellow-900">{sortedPlayers[0].score}</div>
                  <div className="text-xs text-yellow-800">{t.lobby.points}</div>
                </div>
              </div>

              {/* 3rd Place */}
              {sortedPlayers.length > 2 && (
                <div className="flex flex-col items-center w-24">
                  <span className="text-3xl mb-1">🥉</span>
                  <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-lg p-2 w-full text-center shadow-lg h-16 flex flex-col justify-center">
                    <div className="font-bold text-orange-900 text-xs truncate">{sortedPlayers[2].name}</div>
                    <div className="text-lg font-extrabold text-orange-800">{sortedPlayers[2].score}</div>
                    <div className="text-xs text-orange-700">{t.lobby.points}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Players List - Compact */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-center text-gray-800 mb-3">{t.intermediateScores.allScores}</h2>
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`p-2 rounded-lg flex items-center justify-between transition-all duration-300 ${
                  player.id === playerId
                    ? 'bg-gradient-to-r from-purple-200 to-pink-200 shadow-md border-2 border-purple-400'
                    : index === 0
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 shadow-sm'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-100 to-orange-200'
                    : 'bg-gradient-to-r from-blue-50 to-purple-50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className="text-2xl">{getPodiumEmoji(index)}</div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className={`text-lg font-bold ${
                        player.id === playerId ? 'text-purple-700' : index === 0 ? 'text-yellow-700' : 'text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className={`font-bold text-base ${
                        player.id === playerId ? 'text-purple-900' : index === 0 ? 'text-yellow-900' : 'text-gray-800'
                      }`}>
                        {player.name} {player.id === playerId ? `(${t.playerLobby.you})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-xl font-extrabold ${
                  player.id === playerId ? 'text-purple-700' : index === 0 ? 'text-yellow-700' : 'text-gray-700'
                }`}>
                  {player.score}
                  <span className="text-xs ml-1">{t.gameFinished.pts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wait Message */}
        <div className="text-center mt-6 bg-white/80 backdrop-blur-md rounded-[16px] shadow-lg p-4">
          <p className="text-lg text-gray-700 font-semibold animate-pulse">
            ⏳ {t.playerGame.watchScreen}
          </p>
        </div>
      </div>
    </div>
  );
}
