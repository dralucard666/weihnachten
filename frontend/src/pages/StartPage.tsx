import { Link } from 'react-router-dom';

export default function StartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
          Quiz App
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Choose your role to get started
        </p>

        <div className="space-y-4">
          <Link
            to="/game-master"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <div className="text-2xl mb-1">🎮</div>
            <div>Game Master</div>
            <div className="text-sm opacity-90 mt-1">Host a new game</div>
          </Link>

          <Link
            to="/player"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-lg transition duration-200 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <div className="text-2xl mb-1">👤</div>
            <div>Player</div>
            <div className="text-sm opacity-90 mt-1">Join a game</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
