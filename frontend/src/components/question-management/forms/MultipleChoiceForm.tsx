import { useState } from 'react';
import type { StoredQuestion, QuestionMedia } from '../../../../../shared/types';
import MediaUploadField from '../MediaUploadField';
import { mediaApi } from '../../../services/api';
import { useI18n } from '../../../i18n/useI18n';
import { generateUUID } from '../../../utils/uuid';

interface MultipleChoiceFormProps {
  onSave: (question: Omit<StoredQuestion, 'id'>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function MultipleChoiceForm({ onSave, onCancel, saving }: MultipleChoiceFormProps) {
  const { t } = useI18n();
  const [questionTextDe, setQuestionTextDe] = useState('');
  const [questionTextEn, setQuestionTextEn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [answers, setAnswers] = useState([
    { textDe: '', textEn: '', soundFile: null as File | null },
    { textDe: '', textEn: '', soundFile: null as File | null },
  ]);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  
  // Media fields - support both beforeQuestion and beforeAnswer
  const [hasBeforeQuestionMedia, setHasBeforeQuestionMedia] = useState(false);
  const [beforeQuestionFile, setBeforeQuestionFile] = useState<File | null>(null);
  const [beforeQuestionType, setBeforeQuestionType] = useState<'video' | 'images'>('video');
  
  const [hasBeforeAnswerMedia, setHasBeforeAnswerMedia] = useState(false);
  const [beforeAnswerFile, setBeforeAnswerFile] = useState<File | null>(null);
  const [beforeAnswerType, setBeforeAnswerType] = useState<'video' | 'images'>('video');

  const addAnswer = () => {
    setAnswers([...answers, { textDe: '', textEn: '', soundFile: null }]);
  };

  const removeAnswer = (index: number) => {
    if (answers.length <= 2) return; // Minimum 2 answers
    const newAnswers = answers.filter((_, i) => i !== index);
    setAnswers(newAnswers);
    if (correctAnswerIndex >= newAnswers.length) {
      setCorrectAnswerIndex(newAnswers.length - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent double submission
    setIsSubmitting(true);

    try {
      // Upload media if provided
      let mediaConfig: QuestionMedia | undefined;
      
      if (hasBeforeQuestionMedia || hasBeforeAnswerMedia) {
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

      const question: Omit<StoredQuestion, 'id'> = {
        type: 'multiple-choice',
        text: {
          de: questionTextDe,
          en: questionTextEn,
        },
        answers: await Promise.all(answers.map(async (a) => {
          let soundUrl: string[] | undefined;
          if (a.soundFile) {
            try {
              const uploadResult = await mediaApi.upload(a.soundFile);
              soundUrl = [uploadResult.id];
            } catch (err) {
              console.error('Failed to upload sound:', err);
            }
          }
          return {
            id: generateUUID(),
            text: { de: a.textDe, en: a.textEn },
            sound: soundUrl,
          };
        })),
        correctAnswer: { de: answers[correctAnswerIndex].textDe, en: answers[correctAnswerIndex].textEn },
        media: mediaConfig,
      };

      await onSave(question);
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.questionForms.germanText}
          </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t.questionForms.englishText}
          </label>
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

      {/* Answers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">{t.questionForms.answers}</h4>
          <button
            type="button"
            onClick={addAnswer}
            className="cursor-pointer text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {t.questionForms.addAnswer}
          </button>
        </div>

        {answers.map((answer, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={correctAnswerIndex === index}
                  onChange={() => setCorrectAnswerIndex(index)}
                  className="w-4 h-4"
                />
                <span className="font-medium text-sm">
                  {t.questionForms.answer.replace('{number}', String(index + 1))} {correctAnswerIndex === index && t.questionForms.correct}
                </span>
              </label>
              {answers.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeAnswer(index)}
                  className="cursor-pointer text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={answer.textDe}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[index].textDe = e.target.value;
                  setAnswers(newAnswers);
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder={t.questionForms.answerPlaceholderDe}
              />
              <input
                type="text"
                value={answer.textEn}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[index].textEn = e.target.value;
                  setAnswers(newAnswers);
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder={t.questionForms.answerPlaceholderEn}
              />
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {t.questionForms.soundEffect}
                </label>
                <MediaUploadField
                  label=""
                  accept="audio/*"
                  value={answer.soundFile}
                  onChange={(file) => {
                    const newAnswers = [...answers];
                    newAnswers[index].soundFile = file;
                    setAnswers(newAnswers);
                  }}
                  required={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Media Section */}
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
                required
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
                required
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving || isSubmitting}
          className="cursor-pointer px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
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
