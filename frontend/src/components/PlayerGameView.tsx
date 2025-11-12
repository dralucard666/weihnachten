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
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Get Ready!
          </h2>
          <p className="text-center text-gray-600">
            Watch the game master's screen for the question...
          </p>
          <div className="mt-6 text-center">
            <div className="text-6xl mb-2">👀</div>
            <p className="text-sm text-gray-500">
              Your score: {currentPlayer.score || 0}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Custom Answers Mode - Submit Answer
  if (currentQuestion.questionType === 'custom-answers' && !isVotingPhase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Player Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {currentPlayer.name}
              </h2>
              <div className="text-lg font-semibold text-gray-600">
                Score: {currentPlayer.score || 0}
              </div>
            </div>
          </div>

          {/* Custom Answer Input */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">
              WRITE YOUR ANSWER
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Look at the game master's screen for the question, then write your answer below.
            </p>

            {!hasSubmitted ? (
              <div>
                <textarea
                  value={localCustomAnswer}
                  onChange={(e) => setLocalCustomAnswer(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg min-h-[120px] resize-none"
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
                  className="mt-4 w-full p-4 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg transition duration-200 transform hover:scale-105"
                >
                  Submit Answer
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                  ✓ Answer submitted!
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">Your answer:</p>
                  <p className="text-lg font-medium text-gray-800">{customAnswerText}</p>
                </div>
                <p className="text-gray-600 mt-4">
                  Wait for all players to submit their answers...
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
      <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Player Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {currentPlayer.name}
              </h2>
              <div className="text-lg font-semibold text-gray-600">
                Score: {currentPlayer.score || 0}
              </div>
            </div>
          </div>

          {/* Voting */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">
              VOTE FOR THE CORRECT ANSWER
            </h3>
            <p className="text-center text-gray-600 mb-6">
              Which answer do you think is correct?
            </p>

            <div className="grid grid-cols-1 gap-4">
              {votingAnswers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => onVoteForAnswer(answer.id)}
                  disabled={hasSubmitted}
                  className={`p-6 rounded-xl text-lg font-semibold transition duration-200 transform hover:scale-105 ${
                    hasSubmitted && selectedAnswer === answer.id
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : hasSubmitted
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 shadow-lg'
                  }`}
                >
                  {answer.text}
                </button>
              ))}
            </div>

            {hasSubmitted && (
              <div className="mt-6 text-center">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  ✓ Vote submitted! Watch the screen for results.
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
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
        <div className="max-w-2xl mx-auto py-8">
          {/* Player Header */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {currentPlayer.name}
              </h2>
              <div className="text-lg font-semibold text-gray-600">
                Score: {currentPlayer.score || 0}
              </div>
            </div>
          </div>

          {/* Answer Selection */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 text-center">
              SELECT YOUR ANSWER
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.answers.map((answer) => (
                <button
                  key={answer.id}
                  onClick={() => onSubmitAnswer(answer.id)}
                  disabled={hasSubmitted}
                  className={`p-6 rounded-xl text-lg font-semibold transition duration-200 transform hover:scale-105 ${
                    hasSubmitted && selectedAnswer === answer.id
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : hasSubmitted
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                  }`}
                >
                  {answer.text}
                </button>
              ))}
            </div>

            {hasSubmitted && (
              <div className="mt-6 text-center">
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  ✓ Answer submitted! Watch the screen for results.
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
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Get Ready!
        </h2>
        <p className="text-center text-gray-600">
          Watch the game master's screen...
        </p>
      </div>
    </div>
  );
}
