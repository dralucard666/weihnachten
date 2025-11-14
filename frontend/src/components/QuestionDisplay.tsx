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
    // Updated max-width and background for the new style
    <div className="space-y-8 max-w-3xl mx-auto bg-gradient-to-br from-blue-900 to-blue-700 p-8 rounded-xl shadow-2xl">
      
      {/* Question Container - Simple, rounded, white box */}
      <div className="bg-white rounded-xl p-6 shadow-xl">
        <p className="text-2xl md:text-3xl font-bold text-gray-800 text-center">
          {questionText}
        </p>
      </div>

      {/* Answers Grid - Simple, rectangular buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {answers.map((answer, index) => {
          const isCorrect = answer.id === correctAnswerId;
          const shouldHighlight = showCorrect && isCorrect;

          // Define base styles for the button
          const baseStyles = 'bg-gray-700 text-white hover:bg-gray-600';
          
          // Define correct highlight styles
          const correctStyles = 'bg-green-500 hover:bg-green-500 ring-4 ring-yellow-400';

          return (
            <div
              key={answer.id}
              className={`
                relative
                rounded-xl p-4 shadow-lg transition-all duration-300 cursor-pointer
                ${shouldHighlight ? correctStyles : baseStyles}
              `}
            >
              
              {/* Answer content */}
              <div className="relative flex items-center space-x-4">
                
                {/* Letter label - simple orange diamond on a slight shadow/border */}
                <div 
                  className={`
                    flex-shrink-0 w-10 h-10 flex items-center justify-center
                    font-bold text-xl shadow-md transform rotate-45 overflow-hidden
                    ${shouldHighlight ? 'bg-yellow-400' : 'bg-orange-500'}
                  `}
                >
                  <span className="transform -rotate-45 text-gray-900">
                    {answerLabels[index]}
                  </span>
                </div>
                
                {/* Answer text */}
                <div className="flex-1">
                  <p className="text-lg md:text-xl font-semibold leading-relaxed">
                    {answer.text}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}