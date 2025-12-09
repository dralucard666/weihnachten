import pool from './db';
import { StoredQuestion, QuestionType, QuestionMedia } from '../../../shared/types';

/**
 * Database service for managing questions and answers
 */
export class QuestionService {
  /**
   * Get all questions from the database
   */
  async getAllQuestions(): Promise<StoredQuestion[]> {
    const client = await pool.connect();
    try {
      const questionsQuery = `
        SELECT 
          id, type, text_de, text_en, 
          correct_answer_de, correct_answer_en, correct_answers,
          media
        FROM questions
        ORDER BY created_at
      `;
      const questionsResult = await client.query(questionsQuery);
      
      const questions: StoredQuestion[] = [];
      
      for (const row of questionsResult.rows) {
        const question = await this.buildStoredQuestion(client, row);
        questions.push(question);
      }
      
      return questions;
    } finally {
      client.release();
    }
  }

  /**
   * Get a single question by ID
   */
  async getQuestionById(questionId: string): Promise<StoredQuestion | null> {
    const client = await pool.connect();
    try {
      const questionsQuery = `
        SELECT 
          id, type, text_de, text_en, 
          correct_answer_de, correct_answer_en, correct_answers,
          media
        FROM questions
        WHERE id = $1
      `;
      const result = await client.query(questionsQuery, [questionId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return await this.buildStoredQuestion(client, result.rows[0]);
    } finally {
      client.release();
    }
  }

  /**
   * Get multiple questions by IDs
   */
  async getQuestionsByIds(questionIds: string[]): Promise<StoredQuestion[]> {
    const client = await pool.connect();
    try {
      const questionsQuery = `
        SELECT 
          id, type, text_de, text_en, 
          correct_answer_de, correct_answer_en, correct_answers,
          media
        FROM questions
        WHERE id = ANY($1)
        ORDER BY created_at
      `;
      const questionsResult = await client.query(questionsQuery, [questionIds]);
      
      const questions: StoredQuestion[] = [];
      
      for (const row of questionsResult.rows) {
        const question = await this.buildStoredQuestion(client, row);
        questions.push(question);
      }
      
      return questions;
    } finally {
      client.release();
    }
  }

  /**
   * Build a StoredQuestion object from a database row
   */
  private async buildStoredQuestion(client: any, row: any): Promise<StoredQuestion> {
    const question: StoredQuestion = {
      id: row.id,
      type: row.type as QuestionType,
      text: {
        de: row.text_de,
        en: row.text_en,
      },
      media: row.media as QuestionMedia | undefined,
    };

    // Add type-specific fields
    switch (row.type) {
      case 'multiple-choice':
        // Fetch answers for multiple-choice
        const answersQuery = `
          SELECT id, text_de, text_en, is_correct, sounds
          FROM answers
          WHERE question_id = $1
          ORDER BY created_at
        `;
        const answersResult = await client.query(answersQuery, [row.id]);
        
        question.answers = answersResult.rows.map((answerRow: any) => ({
          id: answerRow.id,
          text: {
            de: answerRow.text_de,
            en: answerRow.text_en,
          },
          sound: answerRow.sounds || undefined,
        }));
        
        // Find correct answer
        const correctAnswer = answersResult.rows.find((a: any) => a.is_correct);
        if (correctAnswer) {
          question.correctAnswerId = correctAnswer.id;
        }
        break;

      case 'custom-answers':
        question.correctAnswer = {
          de: row.correct_answer_de,
          en: row.correct_answer_en,
        };
        question.correctAnswerId = 'correct-answer'; // Placeholder ID
        break;

      case 'text-input':
        question.correctAnswer = {
          de: row.correct_answer_de,
          en: row.correct_answer_en,
        };
        question.correctAnswers = row.correct_answers || [];
        break;

      case 'order':
        // Fetch order items
        const orderQuery = `
          SELECT id, text_de, text_en, correct_position, sounds
          FROM order_items
          WHERE question_id = $1
          ORDER BY correct_position
        `;
        const orderResult = await client.query(orderQuery, [row.id]);
        
        question.orderItems = orderResult.rows.map((orderRow: any) => ({
          id: orderRow.id,
          text: {
            de: orderRow.text_de,
            en: orderRow.text_en,
          },
          sound: orderRow.sounds || undefined,
        }));
        
        question.correctOrder = orderResult.rows.map((orderRow: any) => orderRow.id);
        break;
    }

    return question;
  }

  /**
   * Create a new question
   */
  async createQuestion(
    type: QuestionType,
    textDe: string,
    textEn: string,
    options: {
      correctAnswerDe?: string;
      correctAnswerEn?: string;
      correctAnswers?: string[];
      media?: QuestionMedia;
      answers?: Array<{ textDe: string; textEn: string; isCorrect: boolean; sounds?: string[] }>;
      orderItems?: Array<{ textDe: string; textEn: string; sounds?: string[] }>;
    } = {}
  ): Promise<string> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Insert question
      const questionQuery = `
        INSERT INTO questions (type, text_de, text_en, correct_answer_de, correct_answer_en, correct_answers, media)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;
      const questionResult = await client.query(questionQuery, [
        type,
        textDe,
        textEn,
        options.correctAnswerDe || null,
        options.correctAnswerEn || null,
        options.correctAnswers || null,
        options.media ? JSON.stringify(options.media) : null,
      ]);

      const questionId = questionResult.rows[0].id;

      // Insert answers if multiple-choice
      if (type === 'multiple-choice' && options.answers) {
        for (const answer of options.answers) {
          const answerQuery = `
            INSERT INTO answers (question_id, text_de, text_en, is_correct, sounds)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(answerQuery, [
            questionId,
            answer.textDe,
            answer.textEn,
            answer.isCorrect,
            answer.sounds || null,
          ]);
        }
      }

      // Insert order items if order question
      if (type === 'order' && options.orderItems) {
        for (let i = 0; i < options.orderItems.length; i++) {
          const item = options.orderItems[i];
          const orderQuery = `
            INSERT INTO order_items (question_id, text_de, text_en, correct_position, sounds)
            VALUES ($1, $2, $3, $4, $5)
          `;
          await client.query(orderQuery, [
            questionId,
            item.textDe,
            item.textEn,
            i,
            item.sounds || null,
          ]);
        }
      }

      await client.query('COMMIT');
      return questionId;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Update a question's text (media is immutable)
   */
  async updateQuestion(
    questionId: string,
    textDe: string,
    textEn: string,
    options: {
      correctAnswerDe?: string;
      correctAnswerEn?: string;
      correctAnswers?: string[];
      answers?: Array<{ id?: string; textDe: string; textEn: string; isCorrect: boolean }>;
      orderItems?: Array<{ id?: string; textDe: string; textEn: string }>;
    } = {}
  ): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update the question text fields (media is immutable)
      const updateQuestionQuery = `
        UPDATE questions 
        SET text_de = $1, text_en = $2, correct_answer_de = $3, correct_answer_en = $4, correct_answers = $5
        WHERE id = $6
      `;
      const result = await client.query(updateQuestionQuery, [
        textDe,
        textEn,
        options.correctAnswerDe || null,
        options.correctAnswerEn || null,
        options.correctAnswers || null,
        questionId,
      ]);

      if (result.rowCount === null || result.rowCount === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      // Get the question type to determine how to handle answers/order items
      const typeResult = await client.query(
        'SELECT type FROM questions WHERE id = $1',
        [questionId]
      );
      const questionType = typeResult.rows[0]?.type;

      // Update answers if multiple-choice
      if (questionType === 'multiple-choice' && options.answers) {
        // Delete existing answers
        await client.query('DELETE FROM answers WHERE question_id = $1', [questionId]);

        // Insert new answers
        for (const answer of options.answers) {
          const answerQuery = `
            INSERT INTO answers (question_id, text_de, text_en, is_correct)
            VALUES ($1, $2, $3, $4)
          `;
          await client.query(answerQuery, [
            questionId,
            answer.textDe,
            answer.textEn,
            answer.isCorrect,
          ]);
        }
      }

      // Update order items if order question
      if (questionType === 'order' && options.orderItems) {
        // Delete existing order items
        await client.query('DELETE FROM order_items WHERE question_id = $1', [questionId]);

        // Insert new order items
        for (let i = 0; i < options.orderItems.length; i++) {
          const item = options.orderItems[i];
          const orderQuery = `
            INSERT INTO order_items (question_id, text_de, text_en, correct_position)
            VALUES ($1, $2, $3, $4)
          `;
          await client.query(orderQuery, [questionId, item.textDe, item.textEn, i]);
        }
      }

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a question by ID and cleanup associated media files
   */
  async deleteQuestion(questionId: string): Promise<boolean> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // First, get the question to extract media filenames
      const questionResult = await client.query(
        'SELECT media FROM questions WHERE id = $1',
        [questionId]
      );

      if (questionResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      const media = questionResult.rows[0].media;
      const mediaFilenames: string[] = [];

      // Extract media filenames from the media JSONB field
      if (media) {
        if (media.beforeQuestion?.path) {
          mediaFilenames.push(media.beforeQuestion.path);
        }
        if (media.beforeAnswer?.path) {
          mediaFilenames.push(media.beforeAnswer.path);
        }
      }

      // Get sound files from answers
      const answersResult = await client.query(
        'SELECT sounds FROM answers WHERE question_id = $1',
        [questionId]
      );
      for (const row of answersResult.rows) {
        if (row.sounds && Array.isArray(row.sounds)) {
          mediaFilenames.push(...row.sounds);
        }
      }

      // Get sound files from order items
      const orderItemsResult = await client.query(
        'SELECT sounds FROM order_items WHERE question_id = $1',
        [questionId]
      );
      for (const row of orderItemsResult.rows) {
        if (row.sounds && Array.isArray(row.sounds)) {
          mediaFilenames.push(...row.sounds);
        }
      }

      // Delete the question (cascades to answers and order_items)
      const deleteResult = await client.query(
        'DELETE FROM questions WHERE id = $1',
        [questionId]
      );

      if (deleteResult.rowCount === null || deleteResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      // Delete associated media files
      if (mediaFilenames.length > 0) {
        await client.query(
          'DELETE FROM media_files WHERE filename = ANY($1)',
          [mediaFilenames]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get count of all questions
   */
  async getQuestionCount(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM questions');
    return parseInt(result.rows[0].count, 10);
  }
}

// Export singleton instance
export const questionService = new QuestionService();
