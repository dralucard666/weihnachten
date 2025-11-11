import QuestionDisplay from './QuestionDisplay';
import type { Lobby, Answer } from '../../../shared/types';

interface Question {
  id: string;
  text: string;
  answers: Answer[];
  correctAnswerId: string;
}

interface GamePlayingViewProps {
  lobby: Lobby;
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  playersWhoAnswered: Set<string>;
  allPlayersAnswered: boolean;
  showCorrectAnswer: boolean;
  onShowAnswer: () => void;
  onNextQuestion: () => void;
  onReloadQuestion: () => void;
}

export default function GamePlayingView({
  lobby,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  playersWhoAnswered,
  allPlayersAnswered,
  showCorrectAnswer,
  onShowAnswer,
  onNextQuestion,
  onReloadQuestion,
}: GamePlayingViewProps) {
  const playersWithNames = lobby.players.filter((p) => p.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header with Progress */}
        <div className="bg-black bg-opacity-50 rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-yellow-400">Quiz Master</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={onReloadQuestion}
                className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200"
                title="Reset current question state"
              >
                🔄 Reload
              </button>
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>
                <div className="text-sm text-gray-300">
                  {playersWhoAnswered.size} / {playersWithNames.length} answered
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Display */}
        <div className="bg-black bg-opacity-30 rounded-2xl p-8 shadow-2xl">
          <QuestionDisplay
            questionText={currentQuestion.text}
            answers={currentQuestion.answers}
            correctAnswerId={currentQuestion.correctAnswerId}
            showCorrect={showCorrectAnswer}
          />
        </div>

        {/* Players Status */}
        <div className="bg-black bg-opacity-50 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Player Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {playersWithNames.map((player) => {
              const hasAnswered = playersWhoAnswered.has(player.id);
              return (
                <div
                  key={player.id}
                  className={`p-3 rounded-lg transition-all ${
                    hasAnswered
                      ? 'bg-green-600 ring-2 ring-green-400'
                      : 'bg-gray-700'
                  }`}
                >
                  <div className="font-semibold text-white text-sm">{player.name}</div>
                  <div className="text-xs text-gray-300">
                    {hasAnswered ? '✓ Answered' : 'Waiting...'}
                  </div>
                  <div className="text-sm font-bold text-yellow-400 mt-1">
                    {player.score} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-4">
          {!showCorrectAnswer ? (
            <button
              onClick={onShowAnswer}
              disabled={!allPlayersAnswered}
              className={`px-8 py-4 rounded-lg font-bold text-xl shadow-lg transition duration-200 transform hover:scale-105 ${
                allPlayersAnswered
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {allPlayersAnswered ? 'Show Answer' : 'Waiting for All Players...'}
            </button>
          ) : (
            <button
              onClick={onNextQuestion}
              className="px-8 py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xl shadow-lg transition duration-200 transform hover:scale-105"
            >
              {currentQuestionIndex + 1 >= totalQuestions ? 'Finish Game' : 'Next Question'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
