import pool from './db';
import { questionService } from './QuestionService';

export interface QuestionSet {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  questionCount?: number; // Optional: number of questions in set
}

export interface QuestionSetWithQuestions extends QuestionSet {
  questionIds: string[];
}

/**
 * Service for managing question sets (collections of questions)
 */
export class QuestionSetService {
  /**
   * Create a new question set
   */
  async createQuestionSet(name: string, description?: string): Promise<string> {
    const query = `
      INSERT INTO question_sets (name, description)
      VALUES ($1, $2)
      RETURNING id
    `;
    
    const result = await pool.query(query, [name, description || null]);
    return result.rows[0].id;
  }

  /**
   * Get all question sets
   */
  async getAllQuestionSets(includeCount: boolean = true): Promise<QuestionSet[]> {
    let query = `
      SELECT qs.id, qs.name, qs.description, qs.created_at, qs.updated_at
    `;
    
    if (includeCount) {
      query += `, COUNT(qsi.question_id) as question_count`;
    }
    
    query += `
      FROM question_sets qs
      LEFT JOIN question_set_items qsi ON qs.id = qsi.question_set_id
      GROUP BY qs.id, qs.name, qs.description, qs.created_at, qs.updated_at
      ORDER BY qs.created_at DESC
    `;
    
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      questionCount: includeCount ? parseInt(row.question_count, 10) : undefined,
    }));
  }

  /**
   * Get a question set by ID
   */
  async getQuestionSetById(setId: string): Promise<QuestionSet | null> {
    const query = `
      SELECT qs.id, qs.name, qs.description, qs.created_at, qs.updated_at,
             COUNT(qsi.question_id) as question_count
      FROM question_sets qs
      LEFT JOIN question_set_items qsi ON qs.id = qsi.question_set_id
      WHERE qs.id = $1
      GROUP BY qs.id, qs.name, qs.description, qs.created_at, qs.updated_at
    `;
    
    const result = await pool.query(query, [setId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      questionCount: parseInt(row.question_count, 10),
    };
  }

  /**
   * Get a question set by name
   */
  async getQuestionSetByName(name: string): Promise<QuestionSet | null> {
    const query = `
      SELECT qs.id, qs.name, qs.description, qs.created_at, qs.updated_at,
             COUNT(qsi.question_id) as question_count
      FROM question_sets qs
      LEFT JOIN question_set_items qsi ON qs.id = qsi.question_set_id
      WHERE qs.name = $1
      GROUP BY qs.id, qs.name, qs.description, qs.created_at, qs.updated_at
    `;
    
    const result = await pool.query(query, [name]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      questionCount: parseInt(row.question_count, 10),
    };
  }

  /**
   * Get all question IDs in a set
   */
  async getQuestionIdsInSet(setId: string): Promise<string[]> {
    const query = `
      SELECT question_id
      FROM question_set_items
      WHERE question_set_id = $1
      ORDER BY added_at
    `;
    
    const result = await pool.query(query, [setId]);
    return result.rows.map(row => row.question_id);
  }

  /**
   * Get all questions in a set (full question objects)
   */
  async getQuestionsInSet(setId: string) {
    const questionIds = await this.getQuestionIdsInSet(setId);
    
    if (questionIds.length === 0) {
      return [];
    }
    
    return await questionService.getQuestionsByIds(questionIds);
  }

  /**
   * Add a question to a set
   */
  async addQuestionToSet(setId: string, questionId: string): Promise<boolean> {
    try {
      const query = `
        INSERT INTO question_set_items (question_set_id, question_id)
        VALUES ($1, $2)
        ON CONFLICT (question_set_id, question_id) DO NOTHING
        RETURNING id
      `;
      
      const result = await pool.query(query, [setId, questionId]);
      return result.rows.length > 0; // true if inserted, false if already existed
    } catch (err) {
      console.error('Error adding question to set:', err);
      throw err;
    }
  }

  /**
   * Add multiple questions to a set
   */
  async addQuestionsToSet(setId: string, questionIds: string[]): Promise<number> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      let addedCount = 0;
      for (const questionId of questionIds) {
        const query = `
          INSERT INTO question_set_items (question_set_id, question_id)
          VALUES ($1, $2)
          ON CONFLICT (question_set_id, question_id) DO NOTHING
          RETURNING id
        `;
        
        const result = await client.query(query, [setId, questionId]);
        if (result.rows.length > 0) {
          addedCount++;
        }
      }
      
      await client.query('COMMIT');
      return addedCount;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Remove a question from a set (question persists in all_questions)
   */
  async removeQuestionFromSet(setId: string, questionId: string): Promise<boolean> {
    const query = `
      DELETE FROM question_set_items
      WHERE question_set_id = $1 AND question_id = $2
    `;
    
    const result = await pool.query(query, [setId, questionId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Remove multiple questions from a set
   */
  async removeQuestionsFromSet(setId: string, questionIds: string[]): Promise<number> {
    const query = `
      DELETE FROM question_set_items
      WHERE question_set_id = $1 AND question_id = ANY($2)
    `;
    
    const result = await pool.query(query, [setId, questionIds]);
    return result.rowCount || 0;
  }

  /**
   * Delete a question set (questions persist in all_questions)
   */
  async deleteQuestionSet(setId: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM question_sets WHERE id = $1', [setId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Update question set metadata
   */
  async updateQuestionSet(
    setId: string,
    updates: { name?: string; description?: string }
  ): Promise<boolean> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }

    if (fields.length === 0) {
      return false;
    }

    values.push(setId);
    const query = `
      UPDATE question_sets
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
    `;

    const result = await pool.query(query, values);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Check if a question exists in a set
   */
  async isQuestionInSet(setId: string, questionId: string): Promise<boolean> {
    const query = `
      SELECT EXISTS(
        SELECT 1 FROM question_set_items
        WHERE question_set_id = $1 AND question_id = $2
      ) as exists
    `;
    
    const result = await pool.query(query, [setId, questionId]);
    return result.rows[0].exists;
  }

  /**
   * Get all sets that contain a specific question
   */
  async getSetsContainingQuestion(questionId: string): Promise<QuestionSet[]> {
    const query = `
      SELECT qs.id, qs.name, qs.description, qs.created_at, qs.updated_at
      FROM question_sets qs
      JOIN question_set_items qsi ON qs.id = qsi.question_set_id
      WHERE qsi.question_id = $1
      ORDER BY qs.name
    `;
    
    const result = await pool.query(query, [questionId]);
    
    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Get question set count
   */
  async getQuestionSetCount(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM question_sets');
    return parseInt(result.rows[0].count, 10);
  }
}

// Export singleton instance
export const questionSetService = new QuestionSetService();
