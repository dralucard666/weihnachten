# Question Sets Feature

Question Sets allow you to organize questions into named collections. This enables creating themed quiz games (e.g., "christmas", "halloween", "general") from a master database of all questions.

## Architecture

### Database Tables

1. **`questions`** - Master table storing all questions
2. **`question_sets`** - Named collections (e.g., "christmas")
3. **`question_set_items`** - Junction table (many-to-many relationship)

### Key Concepts

- **Master Database**: All questions live in the `questions` table
- **Question Sets**: Named subsets that reference questions
- **Flexible Organization**: Same question can be in multiple sets
- **Safe Deletion**: 
  - Remove from set → question persists in master database
  - Delete from master → automatically cleaned from all sets (CASCADE)

## API Endpoints

### Question Sets Management

#### Create a Question Set
```bash
POST /api/question-sets
Content-Type: application/json

{
  "name": "christmas",
  "description": "Christmas-themed quiz questions"
}
```

#### List All Question Sets
```bash
GET /api/question-sets

Response:
{
  "questionSets": [
    {
      "id": "uuid",
      "name": "christmas",
      "description": "Christmas-themed quiz questions",
      "questionCount": 5,
      "createdAt": "2025-11-28T...",
      "updatedAt": "2025-11-28T..."
    }
  ],
  "count": 2
}
```

#### Get Specific Question Set
```bash
GET /api/question-sets/:setId
```

#### Get Questions in a Set
```bash
GET /api/question-sets/:setId/questions

Response:
{
  "questions": [ /* full question objects */ ],
  "count": 5
}
```

#### Update Question Set
```bash
PATCH /api/question-sets/:setId
Content-Type: application/json

{
  "name": "xmas",
  "description": "Updated description"
}
```

#### Delete Question Set
```bash
DELETE /api/question-sets/:setId
```
*Note: Questions remain in master database*

### Question Management

#### Create Question (with optional set assignment)
```bash
POST /api/questions
Content-Type: application/json

{
  "type": "multiple-choice",
  "textDe": "Was ist die Hauptstadt von Deutschland?",
  "textEn": "What is the capital of Germany?",
  "questionSetId": "uuid-of-christmas-set",  // Optional
  "answers": [
    { "textDe": "Berlin", "textEn": "Berlin", "isCorrect": true },
    { "textDe": "München", "textEn": "Munich", "isCorrect": false }
  ]
}
```

#### Get All Questions (Master Database)
```bash
GET /api/questions
```

#### Delete Question (from master database)
```bash
DELETE /api/questions/:questionId
```
*Note: Automatically removed from all sets (CASCADE)*

### Set-Question Relationship

#### Add Question to Set
```bash
POST /api/question-sets/:setId/questions
Content-Type: application/json

{
  "questionId": "uuid-of-question"
}

Response:
{
  "success": true,
  "added": true,  // false if already in set
  "message": "Question added to set"
}
```

#### Remove Question from Set
```bash
DELETE /api/question-sets/:setId/questions/:questionId

Response:
{
  "success": true,
  "message": "Question removed from set"
}
```
*Note: Question remains in master database*

## Workflow Examples

### Example 1: Create a Christmas Quiz

```bash
# 1. Create the question set
curl -X POST http://localhost:3000/api/question-sets \
  -H "Content-Type: application/json" \
  -d '{"name":"christmas","description":"Christmas quiz"}'

# 2. Create a new question directly in the set
curl -X POST http://localhost:3000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "multiple-choice",
    "textDe": "Wer bringt die Geschenke?",
    "textEn": "Who brings the gifts?",
    "questionSetId": "christmas-set-uuid",
    "answers": [
      {"textDe": "Weihnachtsmann", "textEn": "Santa", "isCorrect": true}
    ]
  }'

# 3. Or add an existing question to the set
curl -X POST http://localhost:3000/api/question-sets/christmas-set-uuid/questions \
  -H "Content-Type: application/json" \
  -d '{"questionId":"existing-question-uuid"}'
```

### Example 2: Reorganize Questions

```bash
# Move a question from "general" to "christmas"
curl -X DELETE http://localhost:3000/api/question-sets/general-uuid/questions/q-uuid
curl -X POST http://localhost:3000/api/question-sets/christmas-uuid/questions \
  -H "Content-Type: application/json" \
  -d '{"questionId":"q-uuid"}'
```

### Example 3: Delete a Question Permanently

```bash
# This removes the question from ALL sets and the master database
curl -X DELETE http://localhost:3000/api/questions/question-uuid
```

## Using the QuestionSetService

```typescript
import { questionSetService } from './database/QuestionSetService';

// Create a new set
const setId = await questionSetService.createQuestionSet(
  'halloween',
  'Spooky questions'
);

// Add questions to set
await questionSetService.addQuestionToSet(setId, questionId);
await questionSetService.addQuestionsToSet(setId, [id1, id2, id3]);

// Get questions in a set
const questions = await questionSetService.getQuestionsInSet(setId);

// Remove a question from a set (question persists in database)
await questionSetService.removeQuestionFromSet(setId, questionId);

// Check if question is in a set
const inSet = await questionSetService.isQuestionInSet(setId, questionId);

// Find all sets containing a question
const sets = await questionSetService.getSetsContainingQuestion(questionId);

// Delete a set (questions remain in database)
await questionSetService.deleteQuestionSet(setId);
```

## Database Queries

```sql
-- View all question sets with counts
SELECT qs.name, COUNT(qsi.question_id) as question_count
FROM question_sets qs
LEFT JOIN question_set_items qsi ON qs.id = qsi.question_set_id
GROUP BY qs.id, qs.name
ORDER BY qs.name;

-- Find questions not in any set
SELECT q.id, q.text_de
FROM questions q
LEFT JOIN question_set_items qsi ON q.id = qsi.question_id
WHERE qsi.id IS NULL;

-- Find questions in multiple sets
SELECT q.text_de, COUNT(qsi.question_set_id) as set_count
FROM questions q
JOIN question_set_items qsi ON q.id = qsi.question_id
GROUP BY q.id, q.text_de
HAVING COUNT(qsi.question_set_id) > 1;

-- Get all questions in a specific set
SELECT q.*
FROM questions q
JOIN question_set_items qsi ON q.id = qsi.question_id
JOIN question_sets qs ON qsi.question_set_id = qs.id
WHERE qs.name = 'christmas';
```

## Migration

To set up question sets with existing data:

```bash
cd backend

# 1. Ensure questions are migrated
pnpm run migrate

# 2. Create default question sets
pnpm run migrate:sets
```

This creates:
- `all` set with all questions
- `christmas` empty set (ready for customization)

## Benefits

1. **Flexible Organization**: One question in multiple themed quizzes
2. **Safe Operations**: Removing from set doesn't delete the question
3. **Easy Management**: API for all CRUD operations
4. **Database Integrity**: CASCADE delete ensures no orphaned references
5. **Scalability**: Add unlimited sets without duplicating questions
6. **Reusability**: Build different quizzes from same question pool
