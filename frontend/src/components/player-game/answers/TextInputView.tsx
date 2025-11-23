import { useState } from 'react';
import type { Player } from '../../../../../shared/types';
import PlayerHeader from './PlayerHeader';
import SubmissionConfirmation from './SubmissionConfirmation';
import { useI18n } from '../../../i18n/useI18n';

interface TextInputViewProps {
  player: Player;
  hasSubmitted: boolean;
  submittedText: string;
  onSubmitTextInput: (answerText: string) => void;
}

export default function TextInputView({
  player,
  hasSubmitted,
  submittedText,
  onSubmitTextInput,
}: TextInputViewProps) {
  const { t } = useI18n();
  const [localTextInput, setLocalTextInput] = useState('');

  return (
    <div className="bg-gradient-to-br from-green-200 to-teal-100 p-4">
      <div className="max-w-2xl mx-auto py-8">
        <PlayerHeader player={player} scoreColor="green" />

        <div className="bg-white rounded-[20px] shadow-xl p-8">
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">✍️</span>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">
              {t.playerAnswers.typeYourAnswer}
            </h3>
            <p className="text-gray-600">
              {t.playerAnswers.lookAtScreenForQuestion}
            </p>
          </div>

          {!hasSubmitted ? (
            <div>
              <input
                type="text"
                value={localTextInput}
                onChange={(e) => setLocalTextInput(e.target.value)}
                placeholder={t.playerAnswers.typeYourAnswerPlaceholder}
                className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none text-lg shadow-inner"
                maxLength={100}
              />
              <p className="text-sm text-gray-500 mt-2 text-right">
                {localTextInput.length}/100 {t.common.characters}
              </p>
              <button
                onClick={() => {
                  if (localTextInput.trim()) {
                    onSubmitTextInput(localTextInput);
                  }
                }}
                disabled={!localTextInput.trim()}
                className="mt-4 w-full py-4 rounded-lg text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
              >
                <span>✓</span>
                <span>{t.playerAnswers.submitAnswer}</span>
              </button>
            </div>
          ) : (
            <SubmissionConfirmation 
              submittedText={submittedText}
              backgroundColor="from-green-50 to-teal-50"
              waitMessage="⏳ Wait for all players to submit..."
            />
          )}
        </div>
      </div>
    </div>
  );
}
