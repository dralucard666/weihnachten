import { useI18n } from '../i18n/useI18n';

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
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[20px] shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <span>🔄</span>
            <span>{t.reconnect.previousSessionFound}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            {t.reconnect.youHavePrevious}
          </p>

          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 space-y-2">
            {playerName && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">👤 {t.reconnect.name}:</span>
                <span className="text-gray-900 font-bold">{playerName}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">🎮 {t.reconnect.lobby}:</span>
              <span className="text-gray-900 font-mono font-bold text-sm truncate ml-2">
                {lobbyId}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">🆔 {t.reconnect.player}:</span>
              <span className="text-gray-900 font-mono text-xs truncate ml-2">
                {playerId}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all duration-200"
          >
            {t.reconnect.cancel}
          </button>
          <button
            onClick={onReconnect}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-bold transition-all duration-200 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {loading ? `⏳ ${t.reconnect.reconnecting}` : `🔗 ${t.reconnect.reconnect}`}
          </button>
        </div>
      </div>
    </div>
  );
}
