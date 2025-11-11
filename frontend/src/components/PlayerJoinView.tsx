import { useState, type FormEvent } from 'react';

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
  const [name, setName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onJoin(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Join Game
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Lobby: <span className="font-mono font-bold text-purple-600">{lobbyId}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="playerName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={loading}
              maxLength={20}
              autoFocus
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className={`w-full py-3 rounded-lg text-white font-semibold transition duration-200 ${
              loading || !name.trim()
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>
        </form>
      </div>
    </div>
  );
}
