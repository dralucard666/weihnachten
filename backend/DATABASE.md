# PostgreSQL Database Setup

This project uses PostgreSQL to store quiz questions and answers.

## Database Schema

The database consists of four main tables:

### `questions`
Stores all question data with multilingual support (German and English).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| type | VARCHAR(50) | Question type: `multiple-choice`, `custom-answers`, `text-input`, `order` |
| text_de | TEXT | Question text in German |
| text_en | TEXT | Question text in English |
| correct_answer_de | TEXT | Correct answer in German (for custom-answers, text-input) |
| correct_answer_en | TEXT | Correct answer in English (for custom-answers, text-input) |
| correct_answers | TEXT[] | Array of acceptable answers (for text-input) |
| media | JSONB | Media configuration (videos, images, etc.) |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

### `answers`
Stores answer options for multiple-choice questions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| question_id | UUID | Foreign key to questions table |
| text_de | TEXT | Answer text in German |
| text_en | TEXT | Answer text in English |
| is_correct | BOOLEAN | Whether this is the correct answer |
| sounds | TEXT[] | Array of sound file paths |
| created_at | TIMESTAMP | Creation timestamp |

### `order_items`
Stores items for order-type questions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| question_id | UUID | Foreign key to questions table |
| text_de | TEXT | Item text in German |
| text_en | TEXT | Item text in English |
| correct_position | INTEGER | Correct position in order (0-based) |
| sounds | TEXT[] | Array of sound file paths |
| created_at | TIMESTAMP | Creation timestamp |

### `media_files`
Stores all media files (images, videos, audio) as binary data in the database.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| filename | VARCHAR(255) | Original filename |
| original_path | TEXT | Original path from questions.json (e.g., "gregor/gregor.mp4") |
| mimetype | VARCHAR(100) | MIME type (e.g., video/mp4, image/jpeg) |
| size_bytes | BIGINT | File size in bytes |
| data | BYTEA | Binary file data |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Docker Setup

PostgreSQL runs as a Docker service defined in `docker-compose.yml`:

```yaml
postgres:
  image: postgres:16-alpine
  environment:
    - POSTGRES_USER=quizuser
    - POSTGRES_PASSWORD=quizpass
    - POSTGRES_DB=quizdb
  ports:
    - 5432:5432
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - ./backend/src/database/init.sql:/docker-entrypoint-initdb.d/init.sql
```

## Environment Variables

The backend connects to PostgreSQL using the `DATABASE_URL` environment variable:

```bash
DATABASE_URL=postgresql://quizuser:quizpass@postgres:5432/quizdb
```

For local development (outside Docker):
```bash
DATABASE_URL=postgresql://quizuser:quizpass@localhost:5432/quizdb
```

## Getting Started

### 1. Start PostgreSQL

```bash
docker-compose up -d postgres
```

The database will be automatically initialized with the schema from `backend/src/database/init.sql`.

### 2. Migrate Existing Questions

To import questions from `questions.json`:

```bash
cd backend
pnpm run migrate
```

This will:
- Read all questions from the JSON file
- Insert them into the PostgreSQL database
- Maintain the bilingual structure (German/English)
- Preserve all media configurations

### 3. Migrate Media Files

To import all media files (videos, images) into the database:

```bash
cd backend
pnpm run migrate:media
```

This will:
- Scan `questions.json` for all media references
- Read media files from `backend/src/data/` directory
- Store them as binary data in the `media_files` table
- Preserve original paths for reference
- Report total size and file count

Example output:
```
✅ Media migration complete!
   Successful: 23
   Total: 23
   Imported size: 146.69 MB
```

### 4. Start the Backend

```bash
docker-compose up -d --build
```

Or for development:

```bash
cd backend
pnpm run dev
```

## Using the QuestionService

The `QuestionService` provides methods to interact with the database:

```typescript
import { questionService } from './database/QuestionService';

// Get all questions
const questions = await questionService.getAllQuestions();

// Get a specific question
const question = await questionService.getQuestionById('uuid-here');

// Get multiple questions by IDs
const questions = await questionService.getQuestionsByIds(['id1', 'id2']);

// Create a new multiple-choice question
await questionService.createQuestion(
  'multiple-choice',
  'Was ist die Hauptstadt von Deutschland?',
  'What is the capital of Germany?',
  {
    answers: [
      { textDe: 'Berlin', textEn: 'Berlin', isCorrect: true },
      { textDe: 'München', textEn: 'Munich', isCorrect: false },
      { textDe: 'Hamburg', textEn: 'Hamburg', isCorrect: false },
    ]
  }
);

// Delete a question
await questionService.deleteQuestion('uuid-here');

// Get total question count
const count = await questionService.getQuestionCount();
```

### Using the MediaService

The `MediaService` provides methods to manage media files:

```typescript
import { mediaService } from './database/MediaService';

// Upload a media file
const mediaId = await mediaService.uploadMedia(
  'video.mp4',
  fileBuffer,
  'video/mp4',
  'gregor/gregor.mp4' // optional original path
);

// Get media file by ID (with binary data)
const media = await mediaService.getMediaById('uuid-here');
// Returns: { id, filename, mimetype, data: Buffer, ... }

// Get media by original path
const media = await mediaService.getMediaByPath('gregor/gregor.mp4');

// List all media (metadata only, no binary data)
const mediaList = await mediaService.listAllMedia();

// Get media statistics
const count = await mediaService.getMediaCount();
const totalSize = await mediaService.getTotalMediaSize(); // in bytes
```

### Media API Endpoints

The backend provides REST endpoints for media management:

```bash
# Upload a media file
curl -F "file=@video.mp4" -F "originalPath=folder/video.mp4" \
  http://localhost:3000/api/media/upload

# Get media by ID
curl http://localhost:3000/media/{uuid}

# Get media by original path (backward compatible)
curl http://localhost:3000/media/gregor/gregor.mp4

# List all media with statistics
curl http://localhost:3000/api/media
```

## Database Management

### Connect to PostgreSQL CLI

```bash
docker-compose exec postgres psql -U quizuser -d quizdb
```

### Useful SQL Commands

```sql
-- View all questions
SELECT id, type, text_de FROM questions;

-- Count questions by type
SELECT type, COUNT(*) FROM questions GROUP BY type;

-- View all media files
SELECT filename, original_path, mimetype, 
       pg_size_pretty(size_bytes) as size 
FROM media_files ORDER BY size_bytes DESC;

-- Get media statistics
SELECT 
  COUNT(*) as total_files,
  pg_size_pretty(SUM(size_bytes)) as total_size,
  COUNT(CASE WHEN mimetype LIKE 'video%' THEN 1 END) as videos,
  COUNT(CASE WHEN mimetype LIKE 'image%' THEN 1 END) as images
FROM media_files;

-- View all answers for a question
SELECT a.* FROM answers a 
JOIN questions q ON a.question_id = q.id 
WHERE q.text_de LIKE '%Boris Yeltsin%';

-- Clear all data (for fresh migration)
TRUNCATE TABLE questions CASCADE;
TRUNCATE TABLE media_files CASCADE;

-- Backup database (including media)
pg_dump -U quizuser quizdb > backup.sql

-- Restore database
psql -U quizuser quizdb < backup.sql

-- Get database size
SELECT pg_size_pretty(pg_database_size('quizdb')) as database_size;
```

## Data Persistence

All data (questions, answers, and **media files**) is persisted in a Docker volume named `postgres-data`. This ensures data survives container restarts.

Media files are stored as binary data (BYTEA) directly in the database, eliminating the need for separate file storage.

To completely reset the database:

```bash
docker-compose down -v  # Remove volumes
docker-compose up -d --build  # Recreate everything
cd backend && pnpm run migrate  # Re-import questions
cd backend && pnpm run migrate:media  # Re-import media files
```

## Benefits Over File-Based Storage

### Questions
- **Query flexibility**: Easy filtering, sorting, and searching
- **Data integrity**: Foreign key constraints ensure consistency
- **Scalability**: Can handle thousands of questions efficiently
- **Concurrent access**: Multiple services can safely access data
- **Transactions**: Atomic operations for data consistency
- **Backups**: Standard database backup/restore tools

### Media Files
- **Centralized storage**: All media in one place, no file system dependencies
- **Atomic operations**: Media uploads/deletes are transactional
- **Easy backups**: Media included in standard database backups
- **No file permissions issues**: Database handles all access control
- **Simplified deployment**: No need to sync file systems across servers
- **Version control**: Can track media changes with database tools
- **Efficient caching**: Database can cache frequently accessed media
- **Portable**: Entire application state in one database dump
