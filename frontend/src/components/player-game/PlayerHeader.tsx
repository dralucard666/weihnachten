import type { Player } from '../../../../shared/types';

interface PlayerHeaderProps {
  player: Player;
  scoreColor?: string;
}

export default function PlayerHeader({ player, scoreColor = 'blue' }: PlayerHeaderProps) {
  const colorClasses = {
    blue: 'text-blue-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
  };

  return (
    <div className="bg-white rounded-[20px] shadow-xl p-6 mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">👤</span>
          <h2 className="text-2xl font-bold text-gray-800">
            {player.name}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">Score</div>
          <div className={`text-2xl font-extrabold ${colorClasses[scoreColor as keyof typeof colorClasses] || colorClasses.blue}`}>
            {player.score || 0}
          </div>
        </div>
      </div>
    </div>
  );
}
