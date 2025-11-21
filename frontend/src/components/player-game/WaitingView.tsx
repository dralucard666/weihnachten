import type { Player } from '../../../../shared/types';

interface WaitingViewProps {
  player: Player;
  emoji?: string;
  title?: string;
  message?: string;
}

export default function WaitingView({ 
  player, 
  emoji = '👀', 
  title = 'Get Ready!',
  message = 'Watch the game master\'s screen for the question...'
}: WaitingViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[20px] shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">{emoji}</div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 mb-4">
            {message}
          </p>
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4">
            <p className="text-sm text-gray-600">Your Score</p>
            <p className="text-4xl font-bold text-blue-600">{player.score || 0}</p>
            <p className="text-xs text-gray-500">points</p>
          </div>
        </div>
      </div>
    </div>
  );
}
