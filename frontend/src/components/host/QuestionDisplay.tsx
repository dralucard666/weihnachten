import type { Answer } from '../../../../shared/types';
import { useHoverSound } from '../../hooks/useHoverSound';

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

  const AnswerCard = ({ answer, index }: { answer: Answer; index: number }) => {
    const soundHandlers = useHoverSound(answer.sound);
    const isCorrect = answer.id === correctAnswerId;
    const shouldHighlight = showCorrect && isCorrect;

    const baseStyles = 'bg-gray-700/90 text-white hover:bg-gray-600/90';
    const correctStyles = 'bg-green-600 hover:bg-green-600 ring-4 ring-yellow-400 shadow-2xl';

    return (
      <div
        key={answer.id}
        onMouseEnter={soundHandlers.onMouseEnter}
        onMouseLeave={soundHandlers.onMouseLeave}
        className={`
          relative 
          flex
          h-full
          rounded-xl p-5 shadow-lg transition-all duration-300 cursor-pointer
          ${shouldHighlight ? correctStyles : baseStyles}
        `}
      >
        <div className="relative flex items-center space-x-4">
          <div 
            className={`
              flex-shrink-0 w-8 h-8 flex items-center justify-center
              font-bold text-base rounded-md
              ${shouldHighlight ? 'bg-yellow-400 text-gray-900' : 'bg-gray-600/70 text-gray-300'}
            `}
          >
            <span>
              {answerLabels[index]}
            </span>
          </div>
          
          <div className="flex-1">
            <p className={`text-lg md:text-xl font-semibold leading-relaxed ${shouldHighlight ? 'drop-shadow-md' : ''}`}>
              {answer.text}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    // Updated max-width and background for the new style
    <div className="space-y-8 mx-auto bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-white/20">
      
      {/* Question Container - Simple, rounded, with better contrast */}
      <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10">
        <p className="text-2xl md:text-3xl font-bold text-white text-center drop-shadow-lg">
          {questionText}
        </p>
      </div>

      {/* Answers Grid - Simple, rectangular buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-2 gap-4">
        {answers.map((answer, index) => (
          <AnswerCard key={answer.id} answer={answer} index={index} />
        ))}
      </div>
    </div>
  );
}