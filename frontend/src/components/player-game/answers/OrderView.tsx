import { useState, useEffect } from 'react';
import type { Player, OrderItem } from '../../../../../shared/types';
import PlayerHeader from './PlayerHeader';
import SubmissionConfirmation from './SubmissionConfirmation';
import { useHoverSound } from '../../../hooks/useHoverSound';
import { useI18n } from '../../../i18n/useI18n';

interface OrderViewProps {
  player: Player;
  orderItems: OrderItem[];
  hasSubmitted: boolean;
  submittedOrder: string[];
  onSubmitOrder: (orderedItemIds: string[]) => void;
}

export default function OrderView({
  player,
  orderItems,
  hasSubmitted,
  submittedOrder,
  onSubmitOrder,
}: OrderViewProps) {
  const { t } = useI18n();
  const [orderedItems, setOrderedItems] = useState<OrderItem[]>([...orderItems]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Update local state when orderItems prop changes (new question)
  useEffect(() => {
    setOrderedItems([...orderItems]);
  }, [orderItems]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...orderedItems];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setOrderedItems(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...orderedItems];
    [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
    setOrderedItems(newItems);
  };

  const moveDown = (index: number) => {
    if (index === orderedItems.length - 1) return;
    const newItems = [...orderedItems];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    setOrderedItems(newItems);
  };

  const handleSubmit = () => {
    const orderedIds = orderedItems.map(item => item.id);
    onSubmitOrder(orderedIds);
  };

  const getSubmittedItemsText = () => {
    return submittedOrder
      .map(id => orderItems.find(item => item.id === id)?.text)
      .filter(Boolean)
      .join(' → ');
  };

  const OrderItemComponent = ({ item, index }: { item: OrderItem; index: number }) => {
    const soundHandlers = useHoverSound(item.sound);
    
    return (
      <div
        key={item.id}
        draggable
        onDragStart={() => handleDragStart(index)}
        onDragOver={(e) => handleDragOver(e, index)}
        onDragEnd={handleDragEnd}
        onMouseEnter={soundHandlers.onMouseEnter}
        onMouseLeave={soundHandlers.onMouseLeave}
        className={`flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-200 cursor-move transition-all duration-200 hover:shadow-lg ${
          draggedIndex === index ? 'opacity-50 scale-95' : ''
        }`}
      >
        <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
          {index + 1}
        </div>
        <div className="flex-1 text-gray-800 font-medium">
          {item.text}
        </div>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => moveUp(index)}
            disabled={index === 0}
            className="px-2 py-1 cursor-pointer rounded bg-orange-200 hover:bg-orange-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ▲
          </button>
          <button
            onClick={() => moveDown(index)}
            disabled={index === orderedItems.length - 1}
            className="px-2 py-1 cursor-pointer rounded bg-orange-200 hover:bg-orange-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ▼
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-orange-200 to-red-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <PlayerHeader player={player} scoreColor="orange" />

        <div className="bg-white rounded-[20px] shadow-xl p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🔢</span>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
              {t.playerAnswers.putInOrder}
            </h3>
            <p className="text-gray-600">
              {t.playerAnswers.dragToArrange}
            </p>
          </div>

          {!hasSubmitted ? (
            <div>
              <div className="space-y-3 mb-6">
                {orderedItems.map((item, index) => (
                  <OrderItemComponent key={item.id} item={item} index={index} />
                ))}
              </div>
              <button
                onClick={handleSubmit}
                className="cursor-pointer w-full py-4 rounded-lg text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                <span>✓</span>
                <span>{t.playerAnswers.submitOrder}</span>
              </button>
            </div>
          ) : (
            <SubmissionConfirmation 
              submittedText={getSubmittedItemsText()}
              backgroundColor="from-orange-50 to-red-50"
              waitMessage="⏳ Wait for all players to submit..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
