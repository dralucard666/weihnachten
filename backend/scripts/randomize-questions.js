const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data');
const questionsFile = path.join(dataDir, 'questions.json');

// Fisher-Yates shuffle algorithm
function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

try {
  // Read the merged questions file
  const questions = JSON.parse(fs.readFileSync(questionsFile, 'utf8'));

  // Shuffle the questions
  const shuffledQuestions = shuffle(questions);

  // Write back to file
  fs.writeFileSync(questionsFile, JSON.stringify(shuffledQuestions, null, 2), 'utf8');

  console.log('✅ Questions randomized successfully!');
  console.log(`   Shuffled ${questions.length} questions in the merged file.`);
} catch (error) {
  console.error('❌ Error randomizing questions:', error.message);
  process.exit(1);
}
