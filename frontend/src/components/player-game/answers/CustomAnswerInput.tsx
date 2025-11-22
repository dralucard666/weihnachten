import { useState } from 'react';
import type { Player } from '../../../../../shared/types';
import PlayerHeader from './PlayerHeader';
import SubmissionConfirmation from './SubmissionConfirmation';

interface CustomAnswerInputProps {
  player: Player;
  hasSubmitted: boolean;
  submittedText: string;
  onSubmitCustomAnswer: (answerText: string) => void;
}

export default function CustomAnswerInput({
  player,
  hasSubmitted,
  submittedText,
  onSubmitCustomAnswer,
}: CustomAnswerInputProps) {
  const [localCustomAnswer, setLocalCustomAnswer] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <PlayerHeader player={player} scoreColor="blue" />

        <div className="bg-white rounded-[20px] shadow-xl p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">✍️</span>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
              WRITE YOUR ANSWER
            </h3>
            <p className="text-gray-600">
              Look at the game master's screen for the question, then write your answer below.
            </p>
          </div>

          {!hasSubmitted ? (
            <div>
              <textarea
                value={localCustomAnswer}
                onChange={(e) => setLocalCustomAnswer(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg min-h-[140px] resize-none shadow-inner"
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-2 text-right">
                {localCustomAnswer.length}/200 characters
              </p>
              <button
                onClick={() => {
                  if (localCustomAnswer.trim()) {
                    onSubmitCustomAnswer(localCustomAnswer);
                  }
                }}
                disabled={!localCustomAnswer.trim()}
                className="mt-4 w-full py-4 rounded-xl text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
              >
                <span>📤</span>
                <span>Submit Answer</span>
              </button>
            </div>
          ) : (
            <SubmissionConfirmation 
              submittedText={submittedText}
              backgroundColor="from-purple-50 to-pink-50"
            />
          )}
        </div>
      </div>
    </div>
  );
}
