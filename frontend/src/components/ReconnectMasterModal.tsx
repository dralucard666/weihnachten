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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Reconnect to Game</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {savedLobbyId ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              We found an active game session. You can try to reconnect to your previous game.
            </p>
            
            <div className="bg-gray-100 p-3 rounded">
              <p className="text-sm text-gray-600 mb-1">Lobby ID:</p>
              <p className="font-mono text-sm break-all">{savedLobbyId}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReconnect}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Reconnect
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-600">
              No previous game session found.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
