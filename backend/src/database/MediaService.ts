import pool from './db';

export interface MediaFile {
  id: string;
  filename: string;
  originalPath: string | null;
  mimetype: string;
  sizeBytes: number;
  data: Buffer;
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaFileMetadata {
  id: string;
  filename: string;
  originalPath: string | null;
  mimetype: string;
  sizeBytes: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Service for managing media files in the database
 */
export class MediaService {
  /**
   * Upload a media file to the database
   */
  async uploadMedia(
    filename: string,
    data: Buffer,
    mimetype: string,
    originalPath?: string
  ): Promise<string> {
    const query = `
      INSERT INTO media_files (filename, original_path, mimetype, size_bytes, data)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    const result = await pool.query(query, [
      filename,
      originalPath || null,
      mimetype,
      data.length,
      data,
    ]);
    
    return result.rows[0].id;
  }

  /**
   * Get media file by ID (includes binary data)
   */
  async getMediaById(id: string): Promise<MediaFile | null> {
    const query = `
      SELECT id, filename, original_path, mimetype, size_bytes, data, created_at, updated_at
      FROM media_files
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      filename: row.filename,
      originalPath: row.original_path,
      mimetype: row.mimetype,
      sizeBytes: row.size_bytes,
      data: row.data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Get media file by original path (for migration lookups)
   */
  async getMediaByPath(originalPath: string): Promise<MediaFile | null> {
    const query = `
      SELECT id, filename, original_path, mimetype, size_bytes, data, created_at, updated_at
      FROM media_files
      WHERE original_path = $1
    `;
    
    const result = await pool.query(query, [originalPath]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      filename: row.filename,
      originalPath: row.original_path,
      mimetype: row.mimetype,
      sizeBytes: row.size_bytes,
      data: row.data,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Get media metadata without binary data (for listings)
   */
  async getMediaMetadata(id: string): Promise<MediaFileMetadata | null> {
    const query = `
      SELECT id, filename, original_path, mimetype, size_bytes, created_at, updated_at
      FROM media_files
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      filename: row.filename,
      originalPath: row.original_path,
      mimetype: row.mimetype,
      sizeBytes: row.size_bytes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * List all media files (metadata only, no binary data)
   */
  async listAllMedia(): Promise<MediaFileMetadata[]> {
    const query = `
      SELECT id, filename, original_path, mimetype, size_bytes, created_at, updated_at
      FROM media_files
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      filename: row.filename,
      originalPath: row.original_path,
      mimetype: row.mimetype,
      sizeBytes: row.size_bytes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  /**
   * Delete a media file
   */
  async deleteMedia(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM media_files WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get total count of media files
   */
  async getMediaCount(): Promise<number> {
    const result = await pool.query('SELECT COUNT(*) as count FROM media_files');
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Get total size of all media in bytes
   */
  async getTotalMediaSize(): Promise<number> {
    const result = await pool.query('SELECT COALESCE(SUM(size_bytes), 0) as total FROM media_files');
    return parseInt(result.rows[0].total, 10);
  }

  /**
   * Check if a file with the given path already exists
   */
  async mediaExists(originalPath: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT EXISTS(SELECT 1 FROM media_files WHERE original_path = $1) as exists',
      [originalPath]
    );
    return result.rows[0].exists;
  }
}

// Export singleton instance
export const mediaService = new MediaService();
