const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../src/data');
const deFile = path.join(dataDir, 'questions_de.json');
const enFile = path.join(dataDir, 'questions_en.json');

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
  // Read both files
  const questionsDE = JSON.parse(fs.readFileSync(deFile, 'utf8'));
  const questionsEN = JSON.parse(fs.readFileSync(enFile, 'utf8'));

  // Check if they have the same length
  if (questionsDE.length !== questionsEN.length) {
    console.error('⚠️  Warning: questions_de.json and questions_en.json have different lengths!');
    console.error(`   DE: ${questionsDE.length} questions, EN: ${questionsEN.length} questions`);
    process.exit(1);
  }

  // Create array of indices
  const indices = Array.from({ length: questionsDE.length }, (_, i) => i);
  
  // Shuffle the indices
  const shuffledIndices = shuffle(indices);

  // Apply the same shuffling to both arrays
  const shuffledDE = shuffledIndices.map(i => questionsDE[i]);
  const shuffledEN = shuffledIndices.map(i => questionsEN[i]);

  // Write back to files
  fs.writeFileSync(deFile, JSON.stringify(shuffledDE, null, 2), 'utf8');
  fs.writeFileSync(enFile, JSON.stringify(shuffledEN, null, 2), 'utf8');

  console.log('✅ Questions randomized successfully!');
  console.log(`   Shuffled ${questionsDE.length} questions in both language files.`);
} catch (error) {
  console.error('❌ Error randomizing questions:', error.message);
  process.exit(1);
}
