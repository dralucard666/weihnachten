import type { Question } from './types';
import type { Player, PlayerAnswerInfo, OrderItem } from '../../../../../shared/types';
import { useHoverSound } from '../../../hooks/useHoverSound';
import { useI18n } from '../../../i18n/useI18n';

interface HostOrderDisplayProps {
  question: Question;
  showCorrectAnswer: boolean;
  playerOrders?: PlayerAnswerInfo[];
  players: Player[];
}

export default function HostOrderDisplay({
  question,
  showCorrectAnswer,
  playerOrders = [],
  players,
}: HostOrderDisplayProps) {
  const { t } = useI18n();
  const orderItems = question.orderItems || [];
  const correctOrder = question.correctOrder || [];

  const getItemById = (id: string) => {
    return orderItems.find(item => item.id === id);
  };

  const getPlayerById = (playerId: string) => {
    return players.find(p => p.id === playerId);
  };

  const OrderItemCard = ({ item }: { item: OrderItem }) => {
    const soundHandlers = useHoverSound(item.sound);
    
    return (
      <div
        key={item.id}
        onMouseEnter={soundHandlers.onMouseEnter}
        onMouseLeave={soundHandlers.onMouseLeave}
        className="p-6 bg-white/90 rounded-2xl shadow-lg cursor-pointer hover:bg-white/95 transition-all"
      >
        <p className="text-2xl font-bold text-gray-800 text-center">
          {item.text}
        </p>
      </div>
    );
  };

  const CorrectOrderItem = ({ item, index }: { item: OrderItem; index: number }) => {
    const soundHandlers = useHoverSound(item.sound);
    
    return (
      <div
        key={item.id}
        onMouseEnter={soundHandlers.onMouseEnter}
        onMouseLeave={soundHandlers.onMouseLeave}
        className="flex items-center gap-4 p-6 bg-green-100 rounded-2xl shadow-lg border-2 border-green-400 cursor-pointer hover:bg-green-200 transition-all"
      >
        <div className="flex-shrink-0 w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-xl">
          {index + 1}
        </div>
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-800">
            {item.text}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30">
      <div className="text-center mb-8">
        <span className="text-6xl mb-4 block">🔢</span>
        <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 drop-shadow-lg">
          {question.text}
        </h2>
        <p className="text-xl text-blue-200">{t.host.putItemsInOrder}</p>
      </div>

      {/* Question Items Display */}
      {!showCorrectAnswer && (
        <div className="space-y-3 max-w-3xl mx-auto">
          {orderItems.map((item) => (
            <OrderItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Correct Answer Display */}
      {showCorrectAnswer && correctOrder.length > 0 && (
        <div className="space-y-6">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">
              {t.host.correctOrder}
            </h3>
            <div className="space-y-3">
              {correctOrder.map((itemId, index) => {
                const item = getItemById(itemId);
                return item ? <CorrectOrderItem key={itemId} item={item} index={index} /> : null;
              })}
            </div>
          </div>

          {/* Player Results */}
          {playerOrders.length > 0 && (
            <div className="mt-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                {t.host.playerResults}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {playerOrders.map((playerOrder) => {
                  const player = getPlayerById(playerOrder.playerId);
                  const playerOrderIds = playerOrder.answerId.split(',');
                  
                  // Count how many items are in the correct position
                  const correctPositions = playerOrderIds.filter((id, index) => 
                    correctOrder[index] === id
                  ).length;
                  
                  const maxScore = correctOrder.length;
                  const percentage = Math.round((correctPositions / maxScore) * 100);
                  
                  return (
                    <div
                      key={playerOrder.playerId}
                      className="p-4 bg-white/90 rounded-xl shadow-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-800">
                          {player?.name || t.host.unknown}
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                          {correctPositions}/{maxScore} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
