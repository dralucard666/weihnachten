import { useState, useEffect } from 'react';
import type { Player, Answer } from '../../../../../shared/types';
import PlayerHeader from './PlayerHeader';

interface VotingViewProps {
  player: Player;
  votingAnswers: Answer[];
  selectedAnswer: string | null;
  hasSubmitted: boolean;
  onVoteForAnswer: (answerId: string) => void;
}

export default function VotingView({
  player,
  votingAnswers,
  selectedAnswer,
  hasSubmitted,
  onVoteForAnswer,
}: VotingViewProps) {
  const [localVoteAnswer, setLocalVoteAnswer] = useState<string | null>(null);

  // Reset local vote when voting answers change (new voting phase)
  useEffect(() => {
    setLocalVoteAnswer(null);
  }, [votingAnswers]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-200 to-red-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <PlayerHeader player={player} scoreColor="orange" />

        <div className="bg-white rounded-[20px] shadow-xl p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🗳️</span>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
              VOTE FOR THE CORRECT ANSWER
            </h3>
            <p className="text-gray-600">
              Which answer do you think is correct?
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {votingAnswers.map((answer, idx) => (
              <button
                key={answer.id}
                onClick={() => setLocalVoteAnswer(answer.id)}
                disabled={hasSubmitted}
                className={`p-5 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                  hasSubmitted && selectedAnswer === answer.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ring-4 ring-blue-300 scale-105'
                    : localVoteAnswer === answer.id
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white ring-4 ring-blue-300'
                    : hasSubmitted
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    hasSubmitted && selectedAnswer === answer.id ? 'bg-blue-300 text-blue-900' : localVoteAnswer === answer.id ? 'bg-blue-300 text-blue-900' : 'bg-yellow-400 text-orange-900'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className="flex-1 text-left">{answer.text}</span>
                </div>
              </button>
            ))}
          </div>

          {!hasSubmitted && localVoteAnswer && (
            <button
              onClick={() => onVoteForAnswer(localVoteAnswer)}
              className="mt-6 w-full py-4 rounded-xl text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            >
              <span>✓</span>
              <span>Confirm Vote</span>
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-6 text-center">
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-bold">Vote submitted! Watch the screen for results.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
