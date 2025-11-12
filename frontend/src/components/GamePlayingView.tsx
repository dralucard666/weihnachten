import QuestionDisplay from './QuestionDisplay';
import type { Lobby, Answer, QuestionType, CustomAnswer, PlayerAnswerInfo } from '../../../shared/types';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  answers?: Answer[];
  correctAnswerId?: string;
  correctAnswer?: string;
}

interface GamePlayingViewProps {
  lobby: Lobby;
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  playersWhoAnswered: Set<string>;
  allPlayersAnswered: boolean;
  showCorrectAnswer: boolean;
  customAnswers: CustomAnswer[];
  isVotingPhase: boolean;
  allVotesReceived: boolean;
  playerAnswers: PlayerAnswerInfo[];
  onShowAnswer: () => void;
  onTriggerVoting: () => void;
  onShowVotingResults: () => void;
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
  customAnswers,
  isVotingPhase,
  allVotesReceived,
  playerAnswers,
  onShowAnswer,
  onTriggerVoting,
  onShowVotingResults,
  onNextQuestion,
  onReloadQuestion,
}: GamePlayingViewProps) {
  const playersWithNames = lobby.players.filter((p) => p.name);
  const isCustomAnswersMode = currentQuestion.type === 'custom-answers';

  const getPlayerAnswer = (playerId: string): string | undefined => {
    return playerAnswers.find(pa => pa.playerId === playerId)?.answerText;
  };

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
                  {isCustomAnswersMode && isVotingPhase && 'Voting Phase - '}
                  {playersWhoAnswered.size} / {playersWithNames.length} {isVotingPhase ? 'voted' : 'answered'}
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
          {isCustomAnswersMode && !isVotingPhase ? (
            <div>
              <h2 className="text-4xl font-bold text-white mb-6 text-center">
                {currentQuestion.text}
              </h2>
              <div className="text-center text-gray-300 text-lg mb-4">
                <p>Players are writing their answers...</p>
                <p className="text-sm mt-2 text-yellow-400">
                  Custom Answer Mode: Players submit their own answers
                </p>
              </div>
              {allPlayersAnswered && customAnswers.length > 0 && (
                <div className="mt-6 bg-gray-800 bg-opacity-50 p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-white mb-4">Submitted Answers:</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {customAnswers.map((answer) => (
                      <div
                        key={answer.id}
                        className="p-4 rounded-lg bg-blue-600"
                      >
                        <div className="text-white font-medium">{answer.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center text-yellow-300 text-sm">
                    ⚠️ One of these answers is correct. The order is randomized.
                  </div>
                </div>
              )}
            </div>
          ) : isCustomAnswersMode && isVotingPhase && !showCorrectAnswer ? (
            <div>
              <h2 className="text-4xl font-bold text-white mb-6 text-center">
                {currentQuestion.text}
              </h2>
              <div className="text-center text-gray-300 text-lg mb-4">
                <p>Players are voting for the correct answer...</p>
                <p className="text-sm mt-2 text-orange-400">
                  Voting Phase: Players pick which answer they think is correct
                </p>
              </div>
              <div className="mt-6 bg-gray-800 bg-opacity-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">All Answers:</h3>
                <div className="grid grid-cols-1 gap-3">
                  {customAnswers.map((answer) => (
                    <div
                      key={answer.id}
                      className="p-4 rounded-lg bg-purple-600"
                    >
                      <div className="text-white font-medium">{answer.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : isCustomAnswersMode && isVotingPhase && showCorrectAnswer ? (
            <div>
              <h2 className="text-4xl font-bold text-white mb-6 text-center">
                {currentQuestion.text}
              </h2>
              <div className="text-center text-green-300 text-lg mb-4">
                <p className="text-2xl font-bold">Results!</p>
              </div>
              <div className="mt-6 bg-gray-800 bg-opacity-50 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">All Answers with Results:</h3>
                <div className="grid grid-cols-1 gap-3">
                  {customAnswers.map((answer) => (
                    <div
                      key={answer.id}
                      className={`p-4 rounded-lg ${
                        !answer.playerId
                          ? 'bg-green-600 ring-4 ring-green-400'
                          : 'bg-blue-600'
                      }`}
                    >
                      <div className="text-white font-medium">{answer.text}</div>
                      {!answer.playerId && (
                        <div className="text-lg text-green-200 mt-2 font-bold">✓ CORRECT ANSWER</div>
                      )}
                      {answer.playerId && (
                        <div className="text-xs text-blue-200 mt-1">
                          Player: {lobby.players.find(p => p.id === answer.playerId)?.name || 'Unknown'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            currentQuestion.answers && currentQuestion.correctAnswerId && (
              <QuestionDisplay
                questionText={currentQuestion.text}
                answers={currentQuestion.answers}
                correctAnswerId={currentQuestion.correctAnswerId}
                showCorrect={showCorrectAnswer}
              />
            )
          )}
        </div>

        {/* Players Status */}
        <div className="bg-black bg-opacity-50 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Player Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {playersWithNames.map((player) => {
              const hasAnswered = playersWhoAnswered.has(player.id);
              const playerAnswer = getPlayerAnswer(player.id);
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
                    {hasAnswered ? (isVotingPhase ? '✓ Voted' : '✓ Answered') : 'Waiting...'}
                  </div>
                  {showCorrectAnswer && playerAnswer && (
                    <div className="text-xs text-yellow-200 mt-1 border-t border-gray-500 pt-1">
                      Picked: {playerAnswer}
                    </div>
                  )}
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
          {isCustomAnswersMode && !isVotingPhase && !showCorrectAnswer ? (
            // Custom answers mode - waiting for submissions or trigger voting
            <>
              <button
                onClick={onShowAnswer}
                disabled={!allPlayersAnswered}
                className={`px-8 py-4 rounded-lg font-bold text-xl shadow-lg transition duration-200 transform hover:scale-105 ${
                  allPlayersAnswered
                    ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {allPlayersAnswered ? 'Get Answers' : 'Waiting for All Players...'}
              </button>
              {allPlayersAnswered && customAnswers.length > 0 && (
                <button
                  onClick={onTriggerVoting}
                  className="px-8 py-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xl shadow-lg transition duration-200 transform hover:scale-105"
                >
                  Start Voting
                </button>
              )}
            </>
          ) : isCustomAnswersMode && isVotingPhase && !showCorrectAnswer ? (
            // Voting phase - waiting for votes or show results
            <button
              onClick={onShowVotingResults}
              disabled={!allVotesReceived}
              className={`px-8 py-4 rounded-lg font-bold text-xl shadow-lg transition duration-200 transform hover:scale-105 ${
                allVotesReceived
                  ? 'bg-orange-500 hover:bg-orange-600 text-black'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {allVotesReceived ? 'Show Results' : 'Waiting for All Votes...'}
            </button>
          ) : isCustomAnswersMode && showCorrectAnswer ? (
            // Custom answers results shown - next question button
            <button
              onClick={onNextQuestion}
              className="px-8 py-4 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-xl shadow-lg transition duration-200 transform hover:scale-105"
            >
              {currentQuestionIndex + 1 >= totalQuestions ? 'Finish Game' : 'Next Question'}
            </button>
          ) : !showCorrectAnswer ? (
            // Multiple choice mode - show answer button
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
            // Answer shown - next question button
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
