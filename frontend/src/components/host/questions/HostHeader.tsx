import { useI18n } from '../../../i18n/useI18n';

interface HostHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
}

export default function HostHeader({
  currentQuestionIndex,
  totalQuestions,
}: HostHeaderProps) {
  const { t } = useI18n();
  
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🎯</span>
        <h1 className="text-3xl font-extrabold text-yellow-400 drop-shadow-md">
          {t.game.quizMaster}
        </h1>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-white drop-shadow-md">
          {t.game.question} {currentQuestionIndex + 1} / {totalQuestions}
        </div>
      </div>
    </div>
  );
}
