import { useState } from 'react';
import type { StoredQuestion, QuestionMedia } from '../../../../../shared/types';
import MediaUploadField from '../MediaUploadField';
import { mediaApi } from '../../../services/api';

interface TextInputFormProps {
  onSave: (question: Omit<StoredQuestion, 'id'>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function TextInputForm({ onSave, onCancel, saving }: TextInputFormProps) {
  const [questionTextDe, setQuestionTextDe] = useState('');
  const [questionTextEn, setQuestionTextEn] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [correctAnswers, setCorrectAnswers] = useState(['']);
  
  // Media fields - support both beforeQuestion and beforeAnswer
  const [hasBeforeQuestionMedia, setHasBeforeQuestionMedia] = useState(false);
  const [beforeQuestionFile, setBeforeQuestionFile] = useState<File | null>(null);
  const [beforeQuestionType, setBeforeQuestionType] = useState<'video' | 'images'>('video');
  
  const [hasBeforeAnswerMedia, setHasBeforeAnswerMedia] = useState(false);
  const [beforeAnswerFile, setBeforeAnswerFile] = useState<File | null>(null);
  const [beforeAnswerType, setBeforeAnswerType] = useState<'video' | 'images'>('video');

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
            alert('Failed to upload beforeQuestion media: ' + (err instanceof Error ? err.message : 'Unknown error'));
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
            alert('Failed to upload beforeAnswer media: ' + (err instanceof Error ? err.message : 'Unknown error'));
            return;
          }
        }
      }

      const question: Omit<StoredQuestion, 'id'> = {
        type: 'text-input',
        text: {
          de: questionTextDe,
          en: questionTextEn,
        },
        correctAnswers: correctAnswers.filter((a) => a.trim() !== ''),
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
        <h4 className="font-semibold text-gray-800">Question Text</h4>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">German Text *</label>
          <input
            type="text"
            value={questionTextDe}
            onChange={(e) => setQuestionTextDe(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Frage auf Deutsch..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">English Text *</label>
          <input
            type="text"
            value={questionTextEn}
            onChange={(e) => setQuestionTextEn(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Question in English..."
          />
        </div>
      </div>

      {/* Correct Answers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-800">Accepted Answers</h4>
          <button
            type="button"
            onClick={addCorrectAnswer}
            className="text-sm px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            + Add Alternative
          </button>
        </div>
        <p className="text-sm text-gray-600">
          List all acceptable answers (case-insensitive matching)
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
              placeholder={`Correct answer ${index + 1}...`}
            />
            {correctAnswers.length > 1 && (
              <button
                type="button"
                onClick={() => removeCorrectAnswer(index)}
                className="px-3 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Media Section */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-800">Media (Optional)</h4>
        
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
              Before Question Media (shown first)
            </label>
          </div>

          {hasBeforeQuestionMedia && (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-blue-50 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type *</label>
                <select
                  value={beforeQuestionType}
                  onChange={(e) => setBeforeQuestionType(e.target.value as 'video' | 'images')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="video">Video</option>
                  <option value="images">Image</option>
                </select>
              </div>

              <MediaUploadField
                label={beforeQuestionType === 'video' ? 'Video File' : 'Image File'}
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
              Before Answer Media (shown after answering)
            </label>
          </div>

          {hasBeforeAnswerMedia && (
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-green-50 ml-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Media Type *</label>
                <select
                  value={beforeAnswerType}
                  onChange={(e) => setBeforeAnswerType(e.target.value as 'video' | 'images')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="video">Video</option>
                  <option value="images">Image</option>
                </select>
              </div>

              <MediaUploadField
                label={beforeAnswerType === 'video' ? 'Video File' : 'Image File'}
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
          className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || isSubmitting}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving || isSubmitting ? 'Saving...' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}
