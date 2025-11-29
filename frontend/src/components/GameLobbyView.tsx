import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import type { Lobby } from "../../../shared/types";
import { useI18n } from "../i18n/useI18n";
import LanguageSwitcher from "./LanguageSwitcher";
import { questionSetsApi, type QuestionSet } from "../services/api";

interface GameLobbyViewProps {
  lobby: Lobby;
  onStartGame: (questionSetId: string, questionCount?: number) => void;
}

export default function GameLobbyView({
  lobby,
  onStartGame,
}: GameLobbyViewProps) {
  const { t } = useI18n();
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);
  
  const playerJoinUrl = `${
    import.meta.env.VITE_FRONTEND_URL || window.location.origin
  }/player/${lobby.id}`;
  const playersWithNames = lobby.players.filter((p) => p.name);
  const selectedSet = questionSets.find(s => s.id === selectedSetId);

  useEffect(() => {
    questionSetsApi.getAll()
      .then(sets => {
        setQuestionSets(sets);
        // Pre-select "all" set
        const allSet = sets.find(s => s.name.toLowerCase() === 'all');
        if (allSet) {
          setSelectedSetId(allSet.id);
        }
      })
      .catch(err => console.error('Failed to load question sets:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-6">
      <div className="w-full max-w-5xl">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-5xl font-extrabold text-gray-800">
              {t.lobby.title}
            </h1>
            <span className="ml-3 text-6xl">🎮</span>
          </div>
          <div className="bg-white/60 backdrop-blur-md rounded-[20px] shadow-lg p-4 inline-block">
            <p className="text-gray-700 text-lg">
              {t.lobby.lobbyCode}:{" "}
              <span className="font-mono font-bold text-3xl text-blue-600">
                {lobby.id}
              </span>
            </p>
          </div>
        </div>

        <LanguageSwitcher />

        {/* Main Content Card */}
        <div className="bg-white rounded-[20px] shadow-xl p-8 mb-6">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center flex-1">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-[20px] p-6 shadow-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  📱 {t.lobby.scanToJoin}
                </h2>
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-center">
                  <QRCodeSVG value={playerJoinUrl} size={220} level="H" />
                </div>
                <p className="text-sm text-gray-600 mt-4 text-center min-h-[40px] max-w-[300px] mx-auto">
                  {t.lobby.scanDescription}
                </p>
              </div>
            </div>

            {/* Players List Section */}
            <div className="flex flex-col flex-1">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-[20px] p-6 shadow-md h-full flex flex-col w-full">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
                  👥 {t.lobby.players} ({playersWithNames.length})
                </h2>
                <div className="flex-1 overflow-auto">
                  {playersWithNames.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 py-8">
                      <span className="text-5xl mb-3">⏳</span>
                      <p className="text-center">{t.lobby.waitingForPlayers}</p>
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
                              <div className="font-bold text-gray-800 text-lg">
                                {player.name}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <span
                                  className={
                                    player.connected
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }
                                >
                                  ●
                                </span>
                                {player.connected
                                  ? t.lobby.connected
                                  : t.lobby.disconnected}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="text-2xl font-bold text-blue-600">
                              {player.score}
                            </div>
                            <div className="text-xs text-gray-500">
                              {t.lobby.points}
                            </div>
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

        {/* Question Set and Count Selection */}
        <div className="bg-white rounded-[20px] shadow-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Game Configuration</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Question Set:
              </label>
              <select
                value={selectedSetId}
                onChange={(e) => setSelectedSetId(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 text-base rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-white text-gray-800"
              >
                {questionSets.map((set) => (
                  <option key={set.id} value={set.id}>
                    {set.name} ({set.questionCount} questions)
                  </option>
                ))}
              </select>
              {selectedSet?.description && (
                <p className="mt-2 text-sm text-gray-600">{selectedSet.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Number of Questions (optional):
              </label>
              <input
                type="number"
                min="1"
                max={selectedSet?.questionCount || 100}
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder={`All (${selectedSet?.questionCount || 0})`}
                className="w-full px-4 py-2 text-base rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none bg-white text-gray-800"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to use all questions</p>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        <div className="flex justify-center">
          <button
            onClick={() => onStartGame(selectedSetId, typeof questionCount === 'number' ? questionCount : undefined)}
            disabled={playersWithNames.length === 0 || !selectedSetId || loading}
            className={`px-12 cursor-pointer py-5 rounded-lg text-white font-bold text-2xl shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center gap-3 ${
              playersWithNames.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            }`}
          >
            {playersWithNames.length === 0 ? (
              <>
                <span>⏳</span>
                <span>{t.lobby.waitingForPlayersButton}</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>
                  {t.lobby.startGame} ({playersWithNames.length}{" "}
                  {playersWithNames.length === 1
                    ? t.lobby.player
                    : t.lobby.players_plural}
                  )
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
