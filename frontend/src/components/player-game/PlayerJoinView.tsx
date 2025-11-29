import { useState, type FormEvent } from 'react';
import { useI18n } from '../../i18n/useI18n';

interface PlayerJoinViewProps {
  lobbyId: string;
  onJoin: (name: string) => void;
  loading: boolean;
  error: string | null;
}

export default function PlayerJoinView({
  lobbyId,
  onJoin,
  loading,
  error,
}: PlayerJoinViewProps) {
  const { t } = useI18n();
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-[20px] shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <h1 className="text-4xl font-extrabold text-gray-800">{t.playerJoin.joinGame}</h1>
              <span className="ml-2 text-5xl">🎮</span>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-3">
              <p className="text-gray-700 text-sm font-medium">{t.playerJoin.lobbyCode}</p>
              <p className="font-mono font-bold text-2xl text-blue-600">{lobbyId}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="playerName"
                className="block text-sm font-bold text-gray-700 mb-2"
              >
                👤 {t.playerJoin.yourName}
              </label>
              <input
                type="text"
                id="playerName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.playerJoin.enterName}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-lg"
                required
                disabled={loading}
                maxLength={20}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className={`w-full cursor-pointer py-4 rounded-xl text-white font-bold text-xl shadow-xl transition-all duration-300 transform hover:scale-105 ${
                loading || !name.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              }`}
            >
              {loading ? `⏳ ${t.playerJoin.joining}` : `🚀 ${t.playerJoin.joinGameButton}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
