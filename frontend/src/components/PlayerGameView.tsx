import { useState } from 'react';
import type { Player, Answer, QuestionType } from '../../../shared/types';

interface CurrentQuestion {
  questionId: string;
  questionIndex: number;
  questionType: QuestionType;
  answers?: Answer[];
}

interface PlayerGameViewProps {
  currentPlayer: Player;
  currentQuestion: CurrentQuestion | null;
  selectedAnswer: string | null;
  customAnswerText: string;
  hasSubmitted: boolean;
  votingAnswers: Answer[];
  isVotingPhase: boolean;
  onSubmitAnswer: (answerId: string) => void;
  onSubmitCustomAnswer: (answerText: string) => void;
  onVoteForAnswer: (answerId: string) => void;
}

export default function PlayerGameView({
  currentPlayer,
  currentQuestion,
  selectedAnswer,
  customAnswerText,
  hasSubmitted,
  votingAnswers,
  isVotingPhase,
  onSubmitAnswer,
  onSubmitCustomAnswer,
  onVoteForAnswer,
}: PlayerGameViewProps) {
  const [localCustomAnswer, setLocalCustomAnswer] = useState('');

  // Waiting for question
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-[20px] shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">👀</div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
              Get Ready!
            </h2>
            <p className="text-gray-600 mb-4">
              Watch the game master's screen for the question...
            </p>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4">
              <p className="text-sm text-gray-600">Your Score</p>
              <p className="text-4xl font-bold text-blue-600">{currentPlayer.score || 0}</p>
              <p className="text-xs text-gray-500">points</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Custom Answers Mode - Submit Answer
  if (currentQuestion.questionType === 'custom-answers' && !isVotingPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 to-pink-100 p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Player Header */}
          <div className="bg-white rounded-[20px] shadow-xl p-6 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentPlayer.name}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-2xl font-extrabold text-blue-600">{currentPlayer.score || 0}</div>
              </div>
            </div>
          </div>

          {/* Custom Answer Input */}
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
              <div className="text-center">
                <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-center gap-2">
                  <span className="text-2xl">✓</span>
                  <span className="font-bold">Answer submitted!</span>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl shadow-inner">
                  <p className="text-sm text-gray-500 mb-2">Your answer:</p>
                  <p className="text-lg font-medium text-gray-800">{customAnswerText}</p>
                </div>
                <p className="text-gray-600 mt-4">
                  ⏳ Wait for all players to submit their answers...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Voting Phase - Vote for Answers
  if (isVotingPhase && votingAnswers.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-200 to-red-100 p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Player Header */}
          <div className="bg-white rounded-[20px] shadow-xl p-6 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentPlayer.name}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-2xl font-extrabold text-orange-600">{currentPlayer.score || 0}</div>
              </div>
            </div>
          </div>

          {/* Voting */}
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
                  onClick={() => onVoteForAnswer(answer.id)}
                  disabled={hasSubmitted}
                  className={`p-5 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    hasSubmitted && selectedAnswer === answer.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ring-4 ring-blue-300 scale-105'
                      : hasSubmitted
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      hasSubmitted && selectedAnswer === answer.id ? 'bg-blue-300 text-blue-900' : 'bg-yellow-400 text-orange-900'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className="flex-1 text-left">{answer.text}</span>
                  </div>
                </button>
              ))}
            </div>

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

  // Multiple Choice Mode - Select Answer
  if (currentQuestion.questionType === 'multiple-choice' && currentQuestion.answers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-100 p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Player Header */}
          <div className="bg-white rounded-[20px] shadow-xl p-6 mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👤</span>
                <h2 className="text-2xl font-bold text-gray-800">
                  {currentPlayer.name}
                </h2>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Score</div>
                <div className="text-2xl font-extrabold text-blue-600">{currentPlayer.score || 0}</div>
              </div>
            </div>
          </div>

          {/* Answer Selection */}
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
              {currentQuestion.answers.map((answer, idx) => (
                <button
                  key={answer.id}
                  onClick={() => onSubmitAnswer(answer.id)}
                  disabled={hasSubmitted}
                  className={`p-5 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    hasSubmitted && selectedAnswer === answer.id
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ring-4 ring-blue-300 scale-105'
                      : hasSubmitted
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      hasSubmitted && selectedAnswer === answer.id ? 'bg-blue-300 text-blue-900' : 'bg-yellow-400 text-purple-900'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="flex-1 text-left">{answer.text}</span>
                  </div>
                </button>
              ))}
            </div>

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

  // Fallback - waiting state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[20px] shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
            Get Ready!
          </h2>
          <p className="text-gray-600">
            Watch the game master's screen...
          </p>
        </div>
      </div>
    </div>
  );
}
