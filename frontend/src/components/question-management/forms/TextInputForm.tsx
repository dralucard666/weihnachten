import { useState } from 'react';
import type { StoredQuestion, QuestionMedia } from '../../../../../shared/types';
import MediaUploadField from '../MediaUploadField';
import { mediaApi } from '../../../services/api';
import { useI18n } from '../../../i18n/useI18n';

interface TextInputFormProps {
  question?: StoredQuestion;
  onSave: (question: Omit<StoredQuestion, 'id'>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function TextInputForm({ question, onSave, onCancel, saving }: TextInputFormProps) {
  const { t } = useI18n();
  const [questionTextDe, setQuestionTextDe] = useState(question?.text.de || '');
  const [questionTextEn, setQuestionTextEn] = useState(question?.text.en || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [correctAnswers, setCorrectAnswers] = useState(
    question?.correctAnswers && question.correctAnswers.length > 0
      ? question.correctAnswers
      : ['']
  );
  
  // Media fields - support both beforeQuestion and beforeAnswer
  const [hasBeforeQuestionMedia, setHasBeforeQuestionMedia] = useState(!!question?.media?.beforeQuestion);
  const [beforeQuestionFile, setBeforeQuestionFile] = useState<File | null>(null);
  const [beforeQuestionType, setBeforeQuestionType] = useState<'video' | 'images'>(question?.media?.beforeQuestion?.type || 'video');
  
  const [hasBeforeAnswerMedia, setHasBeforeAnswerMedia] = useState(!!question?.media?.beforeAnswer);
  const [beforeAnswerFile, setBeforeAnswerFile] = useState<File | null>(null);
  const [beforeAnswerType, setBeforeAnswerType] = useState<'video' | 'images'>(question?.media?.beforeAnswer?.type || 'video');

  const addCorrectAnswer = () => {
    setCorrectAnswers([...correctAnswers, '']);
  };

  const removeCorrectAnswer = (index: number) => {
    if (correctAnswers.length <= 1) return;
    setCorrectAnswers(correctAnswers.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);

    try {
      // Upload media if provided (only for new questions, editing preserves existing media)
      let mediaConfig: QuestionMedia | undefined = question?.media;
      
      if (!question && (hasBeforeQuestionMedia || hasBeforeAnswerMedia)) {
        mediaConfig = {};
        
        if (hasBeforeQuestionMedia && beforeQuestionFile) {
          try {
            const uploadResult = await mediaApi.upload(beforeQuestionFile);
            mediaConfig.beforeQuestion = {
              type: beforeQuestionType,
              sources: [uploadResult.id],
              autoplay: true,
            };
          } catch (err) {
            alert(t.questionForms.failedToUploadMedia.replace('{type}', t.questionForms.beforeQuestion).replace('{error}', err instanceof Error ? err.message : 'Unknown error'));
            return;
          }
        }
        
        if (hasBeforeAnswerMedia && beforeAnswerFile) {
          try {
            const uploadResult = await mediaApi.upload(beforeAnswerFile);
            mediaConfig.beforeAnswer = {
              type: beforeAnswerType,
              sources: [uploadResult.id],
              autoplay: true,
            };
          } catch (err) {
            alert(t.questionForms.failedToUploadMedia.replace('{type}', t.questionForms.beforeAnswer).replace('{error}', err instanceof Error ? err.message : 'Unknown error'));
            return;
          }
        }
      }

      const questionData: Omit<StoredQuestion, 'id'> = {
        type: 'text-input',
        text: {
          de: questionTextDe,
          en: questionTextEn,
        },
        correctAnswers: correctAnswers.filter(a => a.trim() !== ''),
        media: mediaConfig,
      };

      await onSave(questionData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question Text */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">{t.questionForms.questionText}</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.questionForms.germanText}</label>
          <input
            type="text"
            value={questionTextDe}
            onChange={(e) => setQuestionTextDe(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t.questionForms.germanTextPlaceholder}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t.questionForms.englishText}</label>
          <input
            type="text"
            value={questionTextEn}
            onChange={(e) => setQuestionTextEn(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={t.questionForms.englishTextPlaceholder}
          />
        </div>
      </div>

      {/* Correct Answers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">{t.questionForms.acceptedAnswers}</h4>
          <button
            type="button"
            onClick={addCorrectAnswer}
            className="cursor-pointer text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {t.questionForms.addAlternative}
          </button>
        </div>
        <p className="text-sm text-gray-600">
          {t.questionForms.caseInsensitiveNote}
        </p>

        {correctAnswers.map((answer, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => {
                const newAnswers = [...correctAnswers];
                newAnswers[index] = e.target.value;
                setCorrectAnswers(newAnswers);
              }}
              required
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={t.questionForms.correctAnswerPlaceholder.replace('{number}', String(index + 1))}
            />
            {correctAnswers.length > 1 && (
              <button
                type="button"
                onClick={() => removeCorrectAnswer(index)}
                className="cursor-pointer px-3 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Media Section */}
      {!question && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">{t.questionForms.mediaOptional}</h4>
        
        {/* Before Question Media */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasBeforeQuestionMedia"
              checked={hasBeforeQuestionMedia}
              onChange={(e) => setHasBeforeQuestionMedia(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="hasBeforeQuestionMedia" className="font-medium text-gray-700">
              {t.questionForms.beforeQuestionMedia}
            </label>
          </div>

          {hasBeforeQuestionMedia && (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-blue-50 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.questionForms.mediaType}</label>
                <select
                  value={beforeQuestionType}
                  onChange={(e) => setBeforeQuestionType(e.target.value as 'video' | 'images')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="video">{t.questionForms.video}</option>
                  <option value="images">{t.questionForms.image}</option>
                </select>
              </div>

              <MediaUploadField
                label={beforeQuestionType === 'video' ? t.questionForms.videoFile : t.questionForms.imageFile}
                accept={beforeQuestionType === 'video' ? 'video/*' : 'image/*'}
                value={beforeQuestionFile}
                onChange={setBeforeQuestionFile}
                required={!question}
              />
            </div>
          )}
        </div>
        
        {/* Before Answer Media */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasBeforeAnswerMedia"
              checked={hasBeforeAnswerMedia}
              onChange={(e) => setHasBeforeAnswerMedia(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="hasBeforeAnswerMedia" className="font-medium text-gray-700">
              {t.questionForms.beforeAnswerMedia}
            </label>
          </div>

          {hasBeforeAnswerMedia && (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-green-50 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.questionForms.mediaType}</label>
                <select
                  value={beforeAnswerType}
                  onChange={(e) => setBeforeAnswerType(e.target.value as 'video' | 'images')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="video">{t.questionForms.video}</option>
                  <option value="images">{t.questionForms.image}</option>
                </select>
              </div>

              <MediaUploadField
                label={beforeAnswerType === 'video' ? t.questionForms.videoFile : t.questionForms.imageFile}
                accept={beforeAnswerType === 'video' ? 'video/*' : 'image/*'}
                value={beforeAnswerFile}
                onChange={setBeforeAnswerFile}
                required={!question}
              />
            </div>
          )}
        </div>
      </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving || isSubmitting}
          className="cursor-pointerpx-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {t.questionForms.cancel}
        </button>
        <button
          type="submit"
          disabled={saving || isSubmitting}
          className="cursor-pointer px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving || isSubmitting ? t.questionForms.saving : t.questionForms.saveQuestion}
        </button>
      </div>
    </form>
  );
}
