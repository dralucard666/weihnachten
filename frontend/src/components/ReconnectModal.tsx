interface ReconnectModalProps {
  lobbyId: string;
  playerId: string;
  playerName?: string;
  onReconnect: () => void;
  onClose: () => void;
  loading?: boolean;
}

export default function ReconnectModal({
  lobbyId,
  playerId,
  playerName,
  onReconnect,
  onClose,
  loading = false,
}: ReconnectModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Previous Session Found
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            You have a previous game session. Would you like to reconnect?
          </p>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            {playerName && (
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Name:</span>
                <span className="text-gray-800">{playerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Lobby ID:</span>
              <span className="text-gray-800 font-mono text-sm truncate ml-2">
                {lobbyId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium">Player ID:</span>
              <span className="text-gray-800 font-mono text-xs truncate ml-2">
                {playerId}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onReconnect}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Reconnecting...' : 'Reconnect'}
          </button>
        </div>
      </div>
    </div>
  );
}
