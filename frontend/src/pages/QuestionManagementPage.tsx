import { useState, useEffect } from 'react';
import { questionSetsApi, questionsApi, type QuestionSet } from '../services/api';
import type { StoredQuestion } from '../../../shared/types';
import { Link } from 'react-router-dom';
import AddQuestionModal from '../components/question-management/AddQuestionModal';
import CreateQuestionModal from '../components/question-management/CreateQuestionModal';

export default function QuestionManagementPage() {
  console.log('QuestionManagementPage rendered');
  
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [selectedSet, setSelectedSet] = useState<QuestionSet | null>(null);
  const [questionsInSet, setQuestionsInSet] = useState<StoredQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showCreateQuestionModal, setShowCreateQuestionModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showNewSetModal, setShowNewSetModal] = useState(false);
  const [newSetName, setNewSetName] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');

  // Load all question sets
  useEffect(() => {
    loadQuestionSets();
  }, []);

  // Load questions when a set is selected
  useEffect(() => {
    if (selectedSet) {
      loadQuestionsInSet(selectedSet.id);
    }
  }, [selectedSet]);

  const loadQuestionSets = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading question sets...');
      const sets = await questionSetsApi.getAll();
      console.log('Question sets loaded:', sets);
      setQuestionSets(sets);
    } catch (err) {
      console.error('Error loading question sets:', err);
      setError(err instanceof Error ? err.message : 'Failed to load question sets');
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  const loadQuestionsInSet = async (setId: string) => {
    try {
      setError(null);
      const questions = await questionSetsApi.getQuestions(setId);
      setQuestionsInSet(questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    }
  };

  const handleCreateSet = async () => {
    if (!newSetName.trim()) {
      alert('Please enter a set name');
      return;
    }

    try {
      await questionSetsApi.create(newSetName, newSetDescription);
      setNewSetName('');
      setNewSetDescription('');
      setShowNewSetModal(false);
      await loadQuestionSets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create question set');
    }
  };

  const handleDeleteSet = async (setId: string, setName: string) => {
    if (!confirm(`Are you sure you want to delete the "${setName}" question set?`)) {
      return;
    }

    try {
      await questionSetsApi.delete(setId);
      if (selectedSet?.id === setId) {
        setSelectedSet(null);
        setQuestionsInSet([]);
      }
      await loadQuestionSets();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete question set');
    }
  };

  const handleRemoveQuestion = async (questionId: string) => {
    if (!selectedSet) return;

    if (!confirm('Remove this question from the set?')) {
      return;
    }

    try {
      await questionSetsApi.removeQuestion(selectedSet.id, questionId);
      await loadQuestionsInSet(selectedSet.id);
      await loadQuestionSets(); // Refresh counts
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Delete this question permanently from all sets?')) {
      return;
    }

    try {
      await questionsApi.delete(questionId);
      if (selectedSet) {
        await loadQuestionsInSet(selectedSet.id);
      }
      await loadQuestionSets(); // Refresh counts
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  const handleAddExistingQuestion = async (questionIds: string[]) => {
    if (!selectedSet) return;

    try {
      // Add all questions in parallel
      await Promise.all(
        questionIds.map((questionId) =>
          questionSetsApi.addQuestion(selectedSet.id, questionId)
        )
      );
      await loadQuestionsInSet(selectedSet.id);
      await loadQuestionSets(); // Refresh counts
      setShowAddQuestionModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add questions');
    }
  };

  const handleCreateQuestion = async (question: Omit<StoredQuestion, 'id'>) => {
    if (isCreating) return; // Prevent duplicate submissions
    
    try {
      setIsCreating(true);
      await questionsApi.create(question, selectedSet?.id);
      if (selectedSet) {
        await loadQuestionsInSet(selectedSet.id);
      }
      await loadQuestionSets(); // Refresh counts
      setShowCreateQuestionModal(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create question');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-100 flex items-center justify-center">
        <div className="text-xl text-gray-700">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-purple-100 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Question Management</h1>
          <Link
            to="/"
            className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-gray-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Question Sets */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Question Sets</h2>
            <button
              onClick={() => setShowNewSetModal(true)}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              + New Set
            </button>
          </div>

          <div className="space-y-2">
            {questionSets.map((set) => (
              <div
                key={set.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSet?.id === set.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedSet(set)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{set.name}</h3>
                    {set.description && (
                      <p className="text-sm text-gray-600">{set.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {set.questionCount || 0} questions
                    </p>
                  </div>
                  {set.name !== 'all' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSet(set.id, set.name);
                      }}
                      className="ml-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete set"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Questions in Selected Set */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
          {selectedSet ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedSet.name}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {questionsInSet.length} questions
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowAddQuestionModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    + Add Question
                  </button>
                  <button
                    onClick={() => setShowCreateQuestionModal(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    + Create Question
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
                {questionsInSet.map((question) => (
                  <div
                    key={question.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                            {question.type}
                          </span>
                          {question.media && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              📹 Has Media
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-800">
                          {question.text.de || question.text.en}
                        </p>
                        {question.answers && question.answers.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            {question.answers.length} answers
                          </p>
                        )}
                        {question.orderItems && question.orderItems.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            {question.orderItems.length} items to order
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        {selectedSet.name !== 'all' && (
                          <button
                            onClick={() => handleRemoveQuestion(question.id)}
                            className="text-orange-500 hover:text-orange-700 transition-colors"
                            title="Remove from set"
                          >
                            ➖
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete permanently"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {questionsInSet.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No questions in this set yet.
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Select a question set to view its questions
            </div>
          )}
        </div>
      </div>

      {/* New Set Modal */}
      {showNewSetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Question Set</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Set Name *
                </label>
                <input
                  type="text"
                  value={newSetName}
                  onChange={(e) => setNewSetName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Christmas Quiz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSetDescription}
                  onChange={(e) => setNewSetDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowNewSetModal(false);
                    setNewSetName('');
                    setNewSetDescription('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSet}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Question Modal */}
      {showAddQuestionModal && selectedSet && (
        <AddQuestionModal
          currentSetId={selectedSet.id}
          allSetId={questionSets.find(s => s.name === 'all')?.id || ''}
          questionsInSet={questionsInSet}
          onAdd={handleAddExistingQuestion}
          onClose={() => setShowAddQuestionModal(false)}
        />
      )}

      {/* Create Question Modal */}
      {showCreateQuestionModal && (
        <CreateQuestionModal
          onSave={handleCreateQuestion}
          onClose={() => setShowCreateQuestionModal(false)}
        />
      )}
    </div>
  );
}
