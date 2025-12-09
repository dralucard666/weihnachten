import { useState, useEffect } from "react";
import type { Player, Answer } from "../../../../../shared/types";
import PlayerHeader from "./PlayerHeader";
import { useI18n } from "../../../i18n/useI18n";

interface VotingViewProps {
  player: Player;
  votingAnswers: Answer[];
  selectedAnswer: string | null;
  hasSubmitted: boolean;
  onVoteForAnswer: (answerId: string) => void;
  customAnswerText?: string; // The player's own submitted answer text
}

export default function VotingView({
  player,
  votingAnswers,
  selectedAnswer,
  hasSubmitted,
  onVoteForAnswer,
  customAnswerText,
}: VotingViewProps) {
  const { t, language } = useI18n();
  const [localVoteAnswer, setLocalVoteAnswer] = useState<string | null>(null);
  
  const getText = (text: string | { de: string; en: string }) => {
    return typeof text === 'string' ? text : text[language];
  };
  
  // Helper to check if an answer is the player's own answer
  const isOwnAnswer = (answer: Answer) => {
    if (!customAnswerText) return false;
    const answerText = getText(answer.text);
    return answerText.trim().toLowerCase() === customAnswerText.trim().toLowerCase();
  };

  // Reset local vote when voting answers change (new voting phase)
  useEffect(() => {
    setLocalVoteAnswer(null);
  }, [votingAnswers]);

  return (
    <div className="bg-gradient-to-br from-orange-200 to-red-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <PlayerHeader player={player} scoreColor="orange" />

        <div className="bg-white rounded-[20px] shadow-xl p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🗳️</span>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
              {t.playerGame.voteForCorrect}
            </h3>
            <p className="text-gray-600">{t.playerGame.whichIsCorrect}</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {votingAnswers.map((answer, idx) => {
              const isOwn = isOwnAnswer(answer);
              return (
                <button
                  key={answer.id}
                  onClick={() => !isOwn && setLocalVoteAnswer(answer.id)}
                  disabled={hasSubmitted || isOwn}
                  className={`cursor-pointer p-4 rounded-lg text-lg font-semibold transition-all duration-300 transform shadow-lg ${
                    isOwn
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                      : hasSubmitted && selectedAnswer === answer.id
                      ? "bg-blue-600 text-white ring-2 ring-blue-400 scale-[1.02]"
                      : localVoteAnswer === answer.id
                      ? "bg-blue-500 text-white ring-2 ring-blue-300"
                      : hasSubmitted
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 text-white hover:bg-orange-600 hover:scale-[1.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                        isOwn
                          ? "bg-gray-400 text-gray-600"
                          : hasSubmitted && selectedAnswer === answer.id
                          ? "bg-blue-200 text-blue-900"
                          : localVoteAnswer === answer.id
                          ? "bg-blue-200 text-blue-900"
                          : "bg-white/30 text-white"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span className="flex-1 text-left">{getText(answer.text)}</span>
                    {isOwn && (
                      <span className="text-sm opacity-75">(Your answer)</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {!hasSubmitted && localVoteAnswer && (
            <button
              onClick={() => onVoteForAnswer(localVoteAnswer)}
              className="cursor-pointer mt-6 w-full py-4 rounded-lg text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            >
              <span>✓</span>
              <span>{t.playerGame.submitAnswer}</span>
            </button>
          )}

          {hasSubmitted && (
            <div className="mt-6 text-center">
              <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2">
                <span className="text-2xl">✓</span>
                <span className="font-bold">{t.playerGame.voteSubmitted}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
