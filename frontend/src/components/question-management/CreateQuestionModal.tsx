import { useState } from 'react';
import type { StoredQuestion } from '../../../../shared/types';
import MultipleChoiceForm from './forms/MultipleChoiceForm';
import OrderForm from './forms/OrderForm';
import TextInputForm from './forms/TextInputForm';
import CustomAnswersForm from './forms/CustomAnswersForm';

interface CreateQuestionModalProps {
  onSave: (question: Omit<StoredQuestion, 'id'>) => Promise<void>;
  onClose: () => void;
}

type QuestionType = 'multiple-choice' | 'order' | 'text-input' | 'custom-answers';

export default function CreateQuestionModal({ onSave, onClose }: CreateQuestionModalProps) {
  const [selectedType, setSelectedType] = useState<QuestionType | null>(null);
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
        label: 'Multiple Choice',
        icon: '✓',
        description: 'Question with multiple answer options',
      },
      {
        type: 'order',
        label: 'Order',
        icon: '↕',
        description: 'Items that need to be ordered correctly',
      },
      {
        type: 'text-input',
        label: 'Text Input',
        icon: '✎',
        description: 'Free text answer',
      },
      {
        type: 'custom-answers',
        label: 'Custom Answers',
        icon: '✏',
        description: 'Players submit their own answers',
      },
    ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Create New Question</h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedType
                  ? `Creating a ${questionTypes.find((t) => t.type === selectedType)?.label} question`
                  : 'Choose a question type to get started'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
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
                  className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
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
              <button
                onClick={() => setSelectedType(null)}
                className="mb-4 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                disabled={saving}
              >
                ← Change question type
              </button>

              {selectedType === 'multiple-choice' && (
                <MultipleChoiceForm onSave={handleSave} onCancel={onClose} saving={saving} />
              )}
              {selectedType === 'order' && (
                <OrderForm onSave={handleSave} onCancel={onClose} saving={saving} />
              )}
              {selectedType === 'text-input' && (
                <TextInputForm onSave={handleSave} onCancel={onClose} saving={saving} />
              )}
              {selectedType === 'custom-answers' && (
                <CustomAnswersForm onSave={handleSave} onCancel={onClose} saving={saving} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
