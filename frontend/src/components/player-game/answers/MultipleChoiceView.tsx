import { useState, useEffect } from "react";
import type { Player, Answer } from "../../../../../shared/types";
import PlayerHeader from "./PlayerHeader";
import { useHoverSound } from "../../../hooks/useHoverSound";
import { useI18n } from "../../../i18n/useI18n";

interface MultipleChoiceViewProps {
  player: Player;
  answers: Answer[];
  selectedAnswer: string | null;
  hasSubmitted: boolean;
  onSubmitAnswer: (answerId: string) => void;
}

export default function MultipleChoiceView({
  player,
  answers,
  selectedAnswer,
  hasSubmitted,
  onSubmitAnswer,
}: MultipleChoiceViewProps) {
  const { t } = useI18n();
  const [localSelectedAnswer, setLocalSelectedAnswer] = useState<string | null>(
    null
  );

  // Reset local selection when answers change (new question)
  useEffect(() => {
    setLocalSelectedAnswer(null);
  }, [answers]);

  const AnswerButton = ({ answer, idx }: { answer: Answer; idx: number }) => {
    const soundHandlers = useHoverSound(answer.sound);

    return (
      <button
        key={answer.id}
        onClick={() => setLocalSelectedAnswer(answer.id)}
        onMouseEnter={soundHandlers.onMouseEnter}
        onMouseLeave={soundHandlers.onMouseLeave}
        disabled={hasSubmitted}
        className={`cursor-pointer p-4 rounded-lg text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg ${
          hasSubmitted && selectedAnswer === answer.id
            ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-[1.02]"
            : localSelectedAnswer === answer.id
            ? "bg-blue-500 text-white ring-2 ring-blue-300"
            : hasSubmitted
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-purple-500 text-white hover:bg-purple-600"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
              hasSubmitted && selectedAnswer === answer.id
                ? "bg-blue-200 text-blue-900"
                : localSelectedAnswer === answer.id
                ? "bg-blue-200 text-blue-900"
                : "bg-white/30 text-white"
            }`}
          >
            {String.fromCharCode(65 + idx)}
          </div>
          <span className="flex-1 text-left">{answer.text}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <PlayerHeader player={player} scoreColor="blue" />

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
            {answers.map((answer, idx) => (
              <AnswerButton key={answer.id} answer={answer} idx={idx} />
            ))}
          </div>

          {!hasSubmitted && localSelectedAnswer && (
            <button
              onClick={() => onSubmitAnswer(localSelectedAnswer)}
              className="cursor-pointer  mt-6 w-full py-4 rounded-lg text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            >
              <span>✓</span>
              <span>{t.playerGame.submitAnswer}</span>
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-6 text-center">
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-bold">
                  {t.playerGame.answerSubmittedWatch}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
