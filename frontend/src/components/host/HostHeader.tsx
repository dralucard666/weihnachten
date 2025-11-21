interface HostHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  playersAnsweredCount: number;
  totalPlayersCount: number;
  isVotingPhase: boolean;
  isCustomAnswersMode: boolean;
  onReloadQuestion: () => void;
}

export default function HostHeader({
  currentQuestionIndex,
  totalQuestions,
  playersAnsweredCount,
  totalPlayersCount,
  isVotingPhase,
  isCustomAnswersMode,
  onReloadQuestion,
}: HostHeaderProps) {
  return (
    <div className="bg-black/40 backdrop-blur-md rounded-[20px] p-6 shadow-2xl mb-6 border-2 border-yellow-400/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">🎯</span>
          <h1 className="text-3xl font-extrabold text-yellow-400">
            Quiz Master
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onReloadQuestion}
            className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition duration-200 flex items-center gap-2 border border-white/20"
            title="Reset current question state"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">Reload</span>
          </button>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              Question {currentQuestionIndex + 1} / {totalQuestions}
            </div>
            <div className="text-sm text-yellow-300">
              {isCustomAnswersMode && isVotingPhase && "🗳️ Voting Phase - "}
              {playersAnsweredCount} / {totalPlayersCount}{" "}
              {isVotingPhase ? "voted" : "answered"}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800/50 rounded-full h-4 overflow-hidden border border-white/20">
        <div
          className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-400 h-full transition-all duration-1000 rounded-full shadow-lg"
          style={{
            width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
