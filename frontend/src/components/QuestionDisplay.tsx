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
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Question - Who Wants to Be a Millionaire Style */}
      <div className="relative">
        {/* Decorative corners */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-yellow-400"></div>
        <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-yellow-400"></div>
        <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-yellow-400"></div>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-yellow-400"></div>
        
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 rounded-2xl p-8 shadow-2xl border-4 border-yellow-400">
          <p className="text-3xl md:text-4xl font-bold text-white text-center leading-relaxed">
            {questionText}
          </p>
        </div>
      </div>

      {/* Answers Grid - Diamond/Millionaire Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {answers.map((answer, index) => {
          const isCorrect = answer.id === correctAnswerId;
          const shouldHighlight = showCorrect && isCorrect;

          return (
            <div
              key={answer.id}
              className={`
                relative group
                transform transition-all duration-500
                ${shouldHighlight ? 'scale-105 z-10' : 'hover:scale-102'}
              `}
            >
              {/* Diamond answer container */}
              <div
                className={`
                  relative overflow-hidden rounded-lg p-4
                  shadow-lg transition-all duration-500
                  ${
                    shouldHighlight
                      ? 'bg-gradient-to-r from-green-500 via-green-600 to-green-500 ring-4 ring-yellow-400 animate-pulse'
                      : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600'
                  }
                `}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10"></div>
                
                {/* Check mark for correct answer */}
                {shouldHighlight && (
                  <div className="absolute top-2 right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <span className="text-green-900 text-2xl font-bold">✓</span>
                  </div>
                )}

                {/* Answer content */}
                <div className="relative flex items-center space-x-3">
                  {/* Letter label - diamond shape */}
                  <div
                    className={`
                      flex-shrink-0 w-14 h-14 flex items-center justify-center
                      font-bold text-2xl shadow-lg transform rotate-45 overflow-hidden
                      ${
                        shouldHighlight
                          ? 'bg-yellow-400'
                          : 'bg-orange-400'
                      }
                    `}
                  >
                    <span className="transform -rotate-45 text-gray-900">
                      {answerLabels[index]}
                    </span>
                  </div>
                  
                  {/* Answer text */}
                  <div className="flex-1 pr-4">
                    <p className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
                      {answer.text}
                    </p>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div className={`
                  absolute bottom-0 left-0 right-0 h-1
                  ${shouldHighlight ? 'bg-yellow-400' : 'bg-blue-400 opacity-50'}
                `}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
