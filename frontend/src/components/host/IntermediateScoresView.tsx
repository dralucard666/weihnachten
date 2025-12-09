import type { Lobby } from '../../../../shared/types';
import { useI18n } from '../../i18n/useI18n';

interface IntermediateScoresViewProps {
  lobby: Lobby;
  currentQuestionIndex: number;
  totalQuestions: number;
  onContinue: () => void;
}

export default function IntermediateScoresView({
  lobby,
  currentQuestionIndex,
  totalQuestions,
  onContinue,
}: IntermediateScoresViewProps) {
  const { t } = useI18n();
  const sortedPlayers = [...lobby.players].sort((a, b) => b.score - a.score);

  const getPodiumEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '🎯';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">{t.intermediateScores.currentStandings}</h1>
            <span className="ml-3 text-6xl">📊</span>
          </div>
          <p className="text-2xl text-white/90 font-semibold drop-shadow">
            {t.intermediateScores.afterQuestion} {currentQuestionIndex} {t.intermediateScores.of} {totalQuestions}
          </p>
        </div>

        {/* Scores Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-[24px] shadow-2xl p-8 mb-6">
          {/* Top 3 Podium - Compact Version */}
          {sortedPlayers.length >= 3 && (
            <div className="mb-6 flex items-end justify-center gap-3">
              {/* 2nd Place */}
              <div className="flex flex-col items-center w-28">
                <span className="text-4xl mb-1">🥈</span>
                <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-xl p-3 w-full text-center shadow-lg h-24 flex flex-col justify-center">
                  <div className="font-bold text-gray-800 text-sm truncate">{sortedPlayers[1].name}</div>
                  <div className="text-xl font-extrabold text-gray-700">{sortedPlayers[1].score}</div>
                  <div className="text-xs text-gray-600">{t.lobby.points}</div>
                </div>
              </div>

              {/* 1st Place - Taller */}
              <div className="flex flex-col items-center w-28">
                <span className="text-5xl mb-1 animate-pulse">🥇</span>
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl p-3 w-full text-center shadow-2xl h-28 flex flex-col justify-center ring-4 ring-yellow-300">
                  <div className="font-bold text-yellow-900 text-base truncate">{sortedPlayers[0].name}</div>
                  <div className="text-2xl font-extrabold text-yellow-900">{sortedPlayers[0].score}</div>
                  <div className="text-xs text-yellow-800">{t.lobby.points}</div>
                </div>
              </div>

              {/* 3rd Place */}
              {sortedPlayers.length > 2 && (
                <div className="flex flex-col items-center w-28">
                  <span className="text-4xl mb-1">🥉</span>
                  <div className="bg-gradient-to-br from-orange-300 to-orange-400 rounded-xl p-3 w-full text-center shadow-lg h-20 flex flex-col justify-center">
                    <div className="font-bold text-orange-900 text-sm truncate">{sortedPlayers[2].name}</div>
                    <div className="text-xl font-extrabold text-orange-800">{sortedPlayers[2].score}</div>
                    <div className="text-xs text-orange-700">{t.lobby.points}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* All Players List - Compact */}
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-center text-gray-800 mb-3">{t.intermediateScores.allScores}</h2>
            {sortedPlayers.map((player, index) => (
              <div
                key={player.id}
                className={`p-3 rounded-xl flex items-center justify-between transition-all duration-300 ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 shadow-md border-2 border-yellow-400'
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-100 to-gray-200 shadow-sm'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-100 to-orange-200 shadow-sm'
                    : 'bg-gradient-to-r from-blue-50 to-purple-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{getPodiumEmoji(index)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${
                        index === 0 ? 'text-yellow-700' : 'text-gray-700'
                      }`}>
                        #{index + 1}
                      </span>
                      <span className={`font-bold text-lg ${
                        index === 0 ? 'text-yellow-900' : 'text-gray-800'
                      }`}>
                        {player.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`text-2xl font-extrabold ${
                  index === 0 ? 'text-yellow-700' : 'text-gray-700'
                }`}>
                  {player.score}
                  <span className="text-sm ml-1">{t.gameFinished.pts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-2xl px-12 py-4 rounded-full shadow-2xl transform hover:scale-105 transition-all duration-200 animate-pulse"
          >
            {t.intermediateScores.continueGame} →
          </button>
        </div>
      </div>
    </div>
  );
}
