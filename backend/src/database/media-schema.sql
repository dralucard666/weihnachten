-- Media Files Table
-- Stores all media files (images, videos, audio) as binary data

CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_path TEXT, -- Original path from questions.json for reference
    mimetype VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    data BYTEA NOT NULL, -- Binary data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by filename
CREATE INDEX IF NOT EXISTS idx_media_files_filename ON media_files(filename);
CREATE INDEX IF NOT EXISTS idx_media_files_original_path ON media_files(original_path);

-- Trigger to update updated_at
CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update questions table to reference media files by ID instead of paths
-- This requires updating the media JSONB structure to store media_file IDs
-- The migration script will handle converting paths to IDs
