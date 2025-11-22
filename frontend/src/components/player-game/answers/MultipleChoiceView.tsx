import { useState, useEffect } from 'react';
import type { Player, Answer } from '../../../../../shared/types';
import PlayerHeader from './PlayerHeader';
import { useHoverSound } from '../../../hooks/useHoverSound';

interface MultipleChoiceViewProps {
  player: Player;
  answers: Answer[];
  selectedAnswer: string | null;
  hasSubmitted: boolean;
  onSubmitAnswer: (answerId: string) => void;
}

export default function MultipleChoiceView({
  player,
  answers,
  selectedAnswer,
  hasSubmitted,
  onSubmitAnswer,
}: MultipleChoiceViewProps) {
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<string | null>(null);

  // Reset local selection when answers change (new question)
  useEffect(() => {
    setLocalSelectedAnswer(null);
  }, [answers]);

  const AnswerButton = ({ answer, idx }: { answer: Answer; idx: number }) => {
    const soundHandlers = useHoverSound(answer.sound);
    
    return (
      <button
        key={answer.id}
        onClick={() => setLocalSelectedAnswer(answer.id)}
        onMouseEnter={soundHandlers.onMouseEnter}
        onMouseLeave={soundHandlers.onMouseLeave}
        disabled={hasSubmitted}
        className={`p-5 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
          hasSubmitted && selectedAnswer === answer.id
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ring-4 ring-blue-300 scale-105'
            : localSelectedAnswer === answer.id
            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-4 ring-blue-300'
            : hasSubmitted
            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
            hasSubmitted && selectedAnswer === answer.id ? 'bg-blue-300 text-blue-900' : localSelectedAnswer === answer.id ? 'bg-blue-300 text-blue-900' : 'bg-yellow-400 text-purple-900'
          }`}>
            {String.fromCharCode(65 + idx)}
          </div>
          <span className="flex-1 text-left">{answer.text}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <PlayerHeader player={player} scoreColor="blue" />

        <div className="bg-white rounded-[20px] shadow-xl p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🤔</span>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
              SELECT YOUR ANSWER
            </h3>
            <p className="text-gray-600">
              Look at the screen and pick the correct answer
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {answers.map((answer, idx) => (
              <AnswerButton key={answer.id} answer={answer} idx={idx} />
            ))}
          </div>

          {!hasSubmitted && localSelectedAnswer && (
            <button
              onClick={() => onSubmitAnswer(localSelectedAnswer)}
              className="mt-6 w-full py-4 rounded-xl text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            >
              <span>✓</span>
              <span>Confirm Answer</span>
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-6 text-center">
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-bold">Answer submitted! Watch the screen for results.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
