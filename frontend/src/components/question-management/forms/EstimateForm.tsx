import { useState } from 'react';
import type { StoredQuestion, QuestionMedia } from '../../../../../shared/types';
import MediaUploadField from '../MediaUploadField';
import { mediaApi } from '../../../services/api';

interface EstimateFormProps {
  onSave: (question: Omit<StoredQuestion, 'id'>) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}

export default function EstimateForm({ onSave, onCancel, saving }: EstimateFormProps) {
  const [questionTextDe, setQuestionTextDe] = useState('');
  const [questionTextEn, setQuestionTextEn] = useState('');
  
  const [correctEstimate, setCorrectEstimate] = useState('');
  const [unit, setUnit] = useState('');
  
  // Media fields
  const [hasMedia, setHasMedia] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'images'>('video');
  const [startTime, setStartTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let mediaConfig: QuestionMedia | undefined;
    if (hasMedia && mediaFile) {
      try {
        const uploadResult = await mediaApi.upload(mediaFile);
        mediaConfig = {
          beforeQuestion: {
            type: mediaType,
            sources: [uploadResult.url],
            autoplay: true,
          },
        };
      } catch (err) {
        alert('Failed to upload media: ' + (err instanceof Error ? err.message : 'Unknown error'));
        return;
      }
    }

    // Note: 'estimate' type is not in the QuestionType union, using text-input as closest match
    const question = {
      type: 'text-input',
      text: {
        de: questionTextDe,
        en: questionTextEn,
      },
      correctAnswers: [correctEstimate],
      media: mediaConfig,
    } as Omit<StoredQuestion, 'id'>;

    await onSave(question);
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

      {/* Estimate Values */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">Correct Value</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Estimate *
            </label>
            <input
              type="number"
              step="any"
              value={correctEstimate}
              onChange={(e) => setCorrectEstimate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., 42"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit (optional)</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., km, kg, years"
            />
          </div>
        </div>
        <p className="text-sm text-gray-600">
          The player who estimates closest to the correct value wins points.
        </p>
      </div>

      {/* Media Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="hasMedia"
            checked={hasMedia}
            onChange={(e) => setHasMedia(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="hasMedia" className="font-semibold text-gray-800">
            Add Media (Video/Image)
          </label>
        </div>

        {hasMedia && (
          <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Media Type *</label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'video' | 'images')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="video">Video</option>
                <option value="images">Image</option>
              </select>
            </div>

            <MediaUploadField
              label={mediaType === 'video' ? 'Video File' : 'Image File'}
              accept={mediaType === 'video' ? 'video/*' : 'image/*'}
              value={mediaFile}
              onChange={setMediaFile}
              required
            />

            {mediaType === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time (seconds, optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="0"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="cursor-pointer px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}
