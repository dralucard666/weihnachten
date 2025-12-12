import { useState, useEffect } from 'react';
import type { Answer } from '../../../../shared/types';
import { useHoverSound } from '../../hooks/useHoverSound';

import { useI18n } from '../../i18n/useI18n';

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
  const { language } = useI18n();
  const answerLabels = ['A', 'B', 'C', 'D'];
  const [revealedCount, setRevealedCount] = useState(0);
  
  const getText = (text: string | { de: string; en: string }) => {
    return typeof text === 'string' ? text : text[language];
  };

  // Reset revealed count when question changes
  useEffect(() => {
    setRevealedCount(0);
  }, [questionText]);

  // Handle space key press
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && revealedCount < answers.length) {
        e.preventDefault();
        setRevealedCount(prev => Math.min(prev + 1, answers.length));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [revealedCount, answers.length]);

  const handleQuestionClick = () => {
    if (revealedCount < answers.length) {
      setRevealedCount(prev => Math.min(prev + 1, answers.length));
    }
  };

  const AnswerCard = ({ answer, index }: { answer: Answer; index: number }) => {
    const soundHandlers = useHoverSound(answer.sound);
    const isCorrect = answer.id === correctAnswerId;
    const shouldHighlight = showCorrect && isCorrect;
    const isRevealed = index < revealedCount;

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
            <p className={`text-3xl md:text-4xl font-semibold leading-relaxed transition-opacity duration-300 ${shouldHighlight ? 'drop-shadow-md' : ''} ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
              {getText(answer.text)}
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
      <div 
        className="bg-gray-900/80 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white/10 cursor-pointer hover:bg-gray-900/90 transition-colors"
        onClick={handleQuestionClick}
      >
        <p className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center drop-shadow-lg">
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
