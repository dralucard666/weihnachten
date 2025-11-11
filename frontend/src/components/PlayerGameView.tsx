import type { Player, Answer } from '../../../shared/types';

interface CurrentQuestion {
  questionId: string;
  questionIndex: number;
  answers: Answer[];
}

interface PlayerGameViewProps {
  currentPlayer: Player;
  currentQuestion: CurrentQuestion | null;
  selectedAnswer: string | null;
  hasSubmitted: boolean;
  onSubmitAnswer: (answerId: string) => void;
}

export default function PlayerGameView({
  currentPlayer,
  currentQuestion,
  selectedAnswer,
  hasSubmitted,
  onSubmitAnswer,
}: PlayerGameViewProps) {
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

  // Question active - show answers
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
