import { useState } from 'react';
import type { StoredQuestion } from '../../../../shared/types';
import MultipleChoiceForm from './forms/MultipleChoiceForm';
import OrderForm from './forms/OrderForm';
import TextInputForm from './forms/TextInputForm';
import CustomAnswersForm from './forms/CustomAnswersForm';
import { useI18n } from '../../i18n/useI18n';

interface CreateQuestionModalProps {
  question?: StoredQuestion; // If provided, we're editing instead of creating
  onSave: (question: Omit<StoredQuestion, 'id'>) => Promise<void>;
  onClose: () => void;
}

type QuestionType = 'multiple-choice' | 'order' | 'text-input' | 'custom-answers';

export default function CreateQuestionModal({ question, onSave, onClose }: CreateQuestionModalProps) {
  const { t } = useI18n();
  const [selectedType, setSelectedType] = useState<QuestionType | null>(question?.type || null);
  const [saving, setSaving] = useState(false);

  const handleSave = async (question: Omit<StoredQuestion, 'id'>) => {
    try {
      setSaving(true);
      await onSave(question);
    } catch (err) {
      console.error('Failed to save question:', err);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const questionTypes: { type: QuestionType; label: string; icon: string; description: string }[] =
    [
      {
        type: 'multiple-choice',
        label: t.createQuestionModal.multipleChoice,
        icon: '✓',
        description: t.createQuestionModal.multipleChoiceDesc,
      },
      {
        type: 'order',
        label: t.createQuestionModal.order,
        icon: '↕',
        description: t.createQuestionModal.orderDesc,
      },
      {
        type: 'text-input',
        label: t.createQuestionModal.textInput,
        icon: '✎',
        description: t.createQuestionModal.textInputDesc,
      },
      {
        type: 'custom-answers',
        label: t.createQuestionModal.customAnswers,
        icon: '✏',
        description: t.createQuestionModal.customAnswersDesc,
      },
    ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {question ? 'Edit Question' : t.createQuestionModal.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedType
                  ? t.createQuestionModal.subtitleCreating.replace('{type}', questionTypes.find((qt) => qt.type === selectedType)?.label || '')
                  : t.createQuestionModal.subtitleChoose}
              </p>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
              disabled={saving}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedType ? (
            // Type Selection
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questionTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className="cursor-pointer p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h4 className="font-bold text-gray-800 mb-1">{type.label}</h4>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>
          ) : (
            // Form for Selected Type
            <div>
              {!question && (
                <button
                  onClick={() => setSelectedType(null)}
                  className="cursor-pointermb-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  disabled={saving}
                >
                  {t.createQuestionModal.changeType}
                </button>
              )}
              
              {question && question.media && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  ℹ️ Note: Media files cannot be changed when editing. Only text can be updated.
                </div>
              )}

              {selectedType === 'multiple-choice' && (
                <MultipleChoiceForm question={question} onSave={handleSave} onCancel={onClose} saving={saving} />
              )}
              {selectedType === 'order' && (
                <OrderForm question={question} onSave={handleSave} onCancel={onClose} saving={saving} />
              )}
              {selectedType === 'text-input' && (
                <TextInputForm question={question} onSave={handleSave} onCancel={onClose} saving={saving} />
              )}
              {selectedType === 'custom-answers' && (
                <CustomAnswersForm question={question} onSave={handleSave} onCancel={onClose} saving={saving} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
