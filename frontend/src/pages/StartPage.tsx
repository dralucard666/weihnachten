import { Link } from 'react-router-dom';
import { useState } from 'react';
import ReconnectMasterModal from '../components/ReconnectMasterModal';

export default function StartPage() {
  const [showReconnectModal, setShowReconnectModal] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-4xl font-bold text-gray-800">
            Quiz App
          </h1>
          <button
            onClick={() => setShowReconnectModal(true)}
            className="text-gray-500 hover:text-gray-700 transition duration-200"
            title="Help / Reconnect"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
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

      <ReconnectMasterModal 
        isOpen={showReconnectModal} 
        onClose={() => setShowReconnectModal(false)} 
      />
    </div>
  );
}
