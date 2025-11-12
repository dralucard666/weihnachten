import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ReconnectMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReconnectMasterModal({ isOpen, onClose }: ReconnectMasterModalProps) {
  const navigate = useNavigate();
  const [savedLobbyId, setSavedLobbyId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const lobbyId = localStorage.getItem('gameMasterLobbyId');
      setSavedLobbyId(lobbyId);
    }
  }, [isOpen]);

  const handleReconnect = () => {
    if (savedLobbyId) {
      navigate(`/game-master/${savedLobbyId}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-[20px] shadow-2xl max-w-md w-full p-6 transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <span>🔄</span>
            <span>Reconnect to Game</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {savedLobbyId ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              We found an active game session. You can try to reconnect to your previous game.
            </p>
            
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl">
              <p className="text-sm text-gray-700 mb-1 font-medium">Lobby ID:</p>
              <p className="font-mono text-lg font-bold text-blue-600 break-all">{savedLobbyId}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReconnect}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🔗 Reconnect
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              No previous game session found.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all duration-200"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
