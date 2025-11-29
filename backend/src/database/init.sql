-- Quiz Database Schema
-- This schema stores quiz questions and their associated answers/order items

-- Questions table - stores all question data
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('multiple-choice', 'custom-answers', 'text-input', 'order')),
    text_de TEXT NOT NULL,
    text_en TEXT NOT NULL,
    
    -- For custom-answers and text-input types
    correct_answer_de TEXT,
    correct_answer_en TEXT,
    correct_answers TEXT[], -- Array of acceptable answers for text-input
    
    -- Media configuration (stored as JSONB for flexibility)
    media JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answers table - for multiple-choice questions
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text_de TEXT NOT NULL,
    text_en TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    sounds TEXT[], -- Array of sound file paths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table - for order questions
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    text_de TEXT NOT NULL,
    text_en TEXT NOT NULL,
    correct_position INTEGER NOT NULL, -- 0-based index for correct order
    sounds TEXT[], -- Array of sound file paths
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(type);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_order_items_question_id ON order_items(question_id);
CREATE INDEX IF NOT EXISTS idx_order_items_position ON order_items(question_id, correct_position);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Media files table - stores all media as binary data
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

-- Indexes for media files
CREATE INDEX IF NOT EXISTS idx_media_files_filename ON media_files(filename);
CREATE INDEX IF NOT EXISTS idx_media_files_original_path ON media_files(original_path);

-- Trigger to update media_files updated_at
CREATE TRIGGER update_media_files_updated_at
    BEFORE UPDATE ON media_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Question Sets - Named collections of questions
CREATE TABLE IF NOT EXISTS question_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question Set Items - Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS question_set_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_set_id UUID NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Ensure a question can only be in a set once
    UNIQUE(question_set_id, question_id)
);

-- Indexes for question sets
CREATE INDEX IF NOT EXISTS idx_question_sets_name ON question_sets(name);
CREATE INDEX IF NOT EXISTS idx_question_set_items_set_id ON question_set_items(question_set_id);
CREATE INDEX IF NOT EXISTS idx_question_set_items_question_id ON question_set_items(question_id);

-- Trigger to update question_sets updated_at
CREATE TRIGGER update_question_sets_updated_at
    BEFORE UPDATE ON question_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
