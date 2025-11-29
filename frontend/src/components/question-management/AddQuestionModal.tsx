import { useState, useEffect } from 'react';
import { questionSetsApi } from '../../services/api';
import type { StoredQuestion } from '../../../../shared/types';
import { useI18n } from '../../i18n/useI18n';

interface AddQuestionModalProps {
  currentSetId: string;
  allSetId: string; // ID of the "all" question set
  questionsInSet: StoredQuestion[];
  onAdd: (questionIds: string[]) => void;
  onClose: () => void;
}

export default function AddQuestionModal({
  allSetId,
  questionsInSet,
  onAdd,
  onClose,
}: AddQuestionModalProps) {
  const { t } = useI18n();
  const [allQuestions, setAllQuestions] = useState<StoredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadAllQuestions = async () => {
      try {
        // Load questions from the "all" set (which has real UUIDs)
        const questions = await questionSetsApi.getQuestions(allSetId);
        setAllQuestions(questions);
      } catch (err) {
        console.error('Failed to load questions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllQuestions();
  }, [allSetId]);

  // Filter out questions already in the current set
  const questionsInSetIds = new Set(questionsInSet.map((q) => q.id));
  const availableQuestions = allQuestions.filter(
    (q) => !questionsInSetIds.has(q.id)
  );

  // Filter by search term
  const filteredQuestions = availableQuestions.filter((q) => {
    const searchLower = searchTerm.toLowerCase();
    const textDe = q.text.de?.toLowerCase() || '';
    const textEn = q.text.en?.toLowerCase() || '';
    return textDe.includes(searchLower) || textEn.includes(searchLower);
  });

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestionIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleAddSelected = () => {
    if (selectedQuestionIds.size > 0) {
      onAdd(Array.from(selectedQuestionIds));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{t.addQuestionModal.title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {t.addQuestionModal.subtitle}
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.addQuestionModal.searchPlaceholder}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">{t.addQuestionModal.loadingQuestions}</div>
          ) : filteredQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {availableQuestions.length === 0
                ? t.addQuestionModal.allInSet
                : t.addQuestionModal.noMatch}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredQuestions.map((question) => {
                const isSelected = selectedQuestionIds.has(question.id);
                return (
                  <div
                    key={question.id}
                    className={`p-4 border rounded-lg transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleQuestionSelection(question.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleQuestionSelection(question.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {question.type}
                          </span>
                          {question.media && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              {t.addQuestionModal.hasMedia}
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-800 ml-6">
                          {question.text.de || question.text.en}
                        </p>
                        {question.text.de && question.text.en && (
                          <p className="text-sm text-gray-600 mt-1 ml-6">
                            EN: {question.text.en}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer flex-1 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {t.addQuestionModal.cancel}
          </button>
          <button
            onClick={handleAddSelected}
            disabled={selectedQuestionIds.size === 0}
            className={`cursor-pointer flex-1 px-4 py-2 rounded-lg transition-colors font-medium ${
              selectedQuestionIds.size === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {t.addQuestionModal.add} {selectedQuestionIds.size > 0 && `(${selectedQuestionIds.size})`}
          </button>
        </div>
      </div>
    </div>
  );
}
