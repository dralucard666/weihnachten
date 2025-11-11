import type { Answer } from '../../../shared/types';

interface QuestionDisplayProps {
  questionText: string;
  answers: Answer[];
  correctAnswerId: string;
  showCorrect: boolean;
}

export default function QuestionDisplay({
  questionText,
  answers,
  correctAnswerId,
  showCorrect,
}: QuestionDisplayProps) {
  const answerLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-8">
      {/* Question */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400">
        <p className="text-3xl font-bold text-white text-center leading-relaxed">
          {questionText}
        </p>
      </div>

      {/* Answers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {answers.map((answer, index) => {
          const isCorrect = answer.id === correctAnswerId;
          const shouldHighlight = showCorrect && isCorrect;

          return (
            <div
              key={answer.id}
              className={`
                relative overflow-hidden rounded-xl p-6 shadow-lg
                transform transition-all duration-300
                ${
                  shouldHighlight
                    ? 'bg-gradient-to-r from-green-500 to-green-600 scale-105 ring-4 ring-yellow-400'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:scale-102'
                }
              `}
            >
              {/* Diamond shape decoration */}
              <div className="absolute top-2 right-2">
                {shouldHighlight && (
                  <span className="text-3xl">✓</span>
                )}
              </div>

              {/* Answer content */}
              <div className="flex items-center space-x-4">
                <div
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    font-bold text-xl shadow-lg
                    ${
                      shouldHighlight
                        ? 'bg-yellow-400 text-green-900'
                        : 'bg-yellow-400 text-blue-900'
                    }
                  `}
                >
                  {answerLabels[index]}
                </div>
                <p className="text-xl font-semibold text-white flex-1">
                  {answer.text}
                </p>
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-500" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
