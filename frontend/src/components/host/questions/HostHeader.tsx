interface HostHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
}

export default function HostHeader({
  currentQuestionIndex,
  totalQuestions,
}: HostHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🎯</span>
        <h1 className="text-3xl font-extrabold text-yellow-400 drop-shadow-md">
          Quiz Master
        </h1>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-white drop-shadow-md">
          Question {currentQuestionIndex + 1} / {totalQuestions}
        </div>
      </div>
    </div>
  );
}
