import type { StoredQuestion } from '../../../shared/types';

const getBackendUrl = () => {
  return import.meta.env.VITE_BACKEND_URL || 'http://192.168.178.22:3001';
};

// Question Set Types
export interface QuestionSet {
  id: string;
  name: string;
  description?: string;
  questionCount?: number; // Changed from question_count to match backend
  createdAt?: string; // Changed from created_at to match backend
}

export interface QuestionSetWithQuestions extends QuestionSet {
  questions: StoredQuestion[];
}

// Question Sets API
export const questionSetsApi = {
  // Get all question sets
  async getAll(): Promise<QuestionSet[]> {
    const response = await fetch(`${getBackendUrl()}/api/question-sets`);
    if (!response.ok) {
      throw new Error('Failed to fetch question sets');
    }
    const data = await response.json();
    // Backend returns { questionSets: [...], count: n }
    return data.questionSets || data;
  },

  // Get a specific question set with its questions
  async getById(id: string): Promise<QuestionSetWithQuestions> {
    const response = await fetch(`${getBackendUrl()}/api/question-sets/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch question set');
    }
    return response.json();
  },

  // Get questions in a question set
  async getQuestions(id: string): Promise<StoredQuestion[]> {
    const response = await fetch(`${getBackendUrl()}/api/question-sets/${id}/questions`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    const data = await response.json();
    // Backend returns { questions: [...], count: n }
    return data.questions || data;
  },

  // Create a new question set
  async create(name: string, description?: string): Promise<QuestionSet> {
    const response = await fetch(`${getBackendUrl()}/api/question-sets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create question set');
    }
    return response.json();
  },

  // Add a question to a set
  async addQuestion(setId: string, questionId: string): Promise<{ added: boolean }> {
    const response = await fetch(`${getBackendUrl()}/api/question-sets/${setId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add question to set');
    }
    return response.json();
  },

  // Remove a question from a set
  async removeQuestion(setId: string, questionId: string): Promise<{ removed: boolean }> {
    const response = await fetch(
      `${getBackendUrl()}/api/question-sets/${setId}/questions/${questionId}`,
      { method: 'DELETE' }
    );
    if (!response.ok) {
      throw new Error('Failed to remove question from set');
    }
    return response.json();
  },

  // Delete a question set
  async delete(id: string): Promise<void> {
    const response = await fetch(`${getBackendUrl()}/api/question-sets/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete question set');
    }
  },
};

// Questions API
export const questionsApi = {
  // Get all questions
  async getAll(): Promise<StoredQuestion[]> {
    const response = await fetch(`${getBackendUrl()}/api/questions`);
    if (!response.ok) {
      throw new Error('Failed to fetch questions');
    }
    return response.json();
  },

  // Get a specific question
  async getById(id: string): Promise<StoredQuestion> {
    const response = await fetch(`${getBackendUrl()}/api/questions/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch question');
    }
    return response.json();
  },

  // Create a new question
  async create(
    question: Omit<StoredQuestion, 'id'>,
    questionSetId?: string
  ): Promise<StoredQuestion> {
    // Transform the question object to match backend API expectations
    const payload: Record<string, unknown> = {
      type: question.type,
      textDe: question.text.de,
      textEn: question.text.en,
      questionSetId,
    };

    // Add media if present
    if (question.media) {
      payload.media = question.media;
    }

    // Handle multiple-choice questions
    if (question.type === 'multiple-choice' && question.answers) {
      payload.answers = question.answers.map(a => ({
        textDe: a.text.de,
        textEn: a.text.en,
        isCorrect: question.correctAnswer 
          ? (a.text.de === question.correctAnswer.de || a.text.en === question.correctAnswer.en)
          : false,
        sounds: a.sound,
      }));
    }

    // Handle order questions
    if (question.type === 'order' && question.orderItems) {
      payload.orderItems = question.orderItems.map(item => ({
        textDe: item.text.de,
        textEn: item.text.en,
        sounds: item.sound,
      }));
    }

    // Handle text-input questions
    if (question.type === 'text-input' && question.correctAnswers) {
      payload.correctAnswers = question.correctAnswers;
    }

    // Handle custom-answers questions
    if (question.type === 'custom-answers' && question.correctAnswer) {
      payload.correctAnswerDe = question.correctAnswer.de;
      payload.correctAnswerEn = question.correctAnswer.en;
    }

    const response = await fetch(`${getBackendUrl()}/api/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create question');
    }
    const result = await response.json();
    return result.question || result;
  },

  // Update a question
  async update(
    id: string,
    question: Omit<StoredQuestion, 'id'>
  ): Promise<StoredQuestion> {
    // Transform the question object to match backend API expectations
    const payload: Record<string, unknown> = {
      textDe: question.text.de,
      textEn: question.text.en,
    };

    // Note: media is immutable and should not be included in updates

    // Handle multiple-choice questions
    if (question.type === 'multiple-choice' && question.answers) {
      payload.answers = question.answers.map(a => ({
        textDe: a.text.de,
        textEn: a.text.en,
        isCorrect: question.correctAnswer 
          ? (a.text.de === question.correctAnswer.de || a.text.en === question.correctAnswer.en)
          : false,
      }));
    }

    // Handle order questions
    if (question.type === 'order' && question.orderItems) {
      payload.orderItems = question.orderItems.map(item => ({
        textDe: item.text.de,
        textEn: item.text.en,
      }));
    }

    // Handle text-input questions
    if (question.type === 'text-input' && question.correctAnswers) {
      payload.correctAnswers = question.correctAnswers;
    }

    // Handle custom-answers questions
    if (question.type === 'custom-answers' && question.correctAnswer) {
      payload.correctAnswerDe = question.correctAnswer.de;
      payload.correctAnswerEn = question.correctAnswer.en;
    }

    const response = await fetch(`${getBackendUrl()}/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update question');
    }
    const result = await response.json();
    return result.question || result;
  },

  // Delete a question
  async delete(id: string): Promise<void> {
    const response = await fetch(`${getBackendUrl()}/api/questions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete question');
    }
  },
};

// Media API
export const mediaApi = {
  // Upload media file
  async upload(file: File): Promise<{ id: string; filename: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${getBackendUrl()}/api/media/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload media');
    }
    const data = await response.json();
    return {
      id: data.mediaId,
      filename: data.filename,
      url: `${getBackendUrl()}/media/${data.mediaId}`
    };
  },

  // Get media URL by ID
  getUrl(id: string): string {
    return `${getBackendUrl()}/media/${id}`;
  },

  // Get media URL by path (backward compatibility)
  getUrlByPath(path: string): string {
    return `${getBackendUrl()}/media/${path}`;
  },
};
