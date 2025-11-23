import type { Player, Answer, QuestionType } from '../../../../shared/types';
import {
  WaitingView,
  CustomAnswerInput,
  VotingView,
  MultipleChoiceView,
  TextInputView,
  OrderView,
} from './answers';
import LanguageSwitcher from '../LanguageSwitcher';

interface CurrentQuestion {
  questionId: string;
  questionIndex: number;
  questionType: QuestionType;
  answers?: Array<{ id: string; text: string; sound?: string[] }>;
  orderItems?: Array<{ id: string; text: string; sound?: string[] }>;
}

interface PlayerGameViewProps {
  currentPlayer: Player;
  currentQuestion: CurrentQuestion | null;
  selectedAnswer: string | null;
  customAnswerText: string;
  hasSubmitted: boolean;
  votingAnswers: Answer[];
  isVotingPhase: boolean;
  onSubmitAnswer: (answerId: string) => void;
  onSubmitCustomAnswer: (answerText: string) => void;
  onSubmitTextInput: (answerText: string) => void;
  onVoteForAnswer: (answerId: string) => void;
  onSubmitOrder: (orderedItemIds: string[]) => void;
  submittedOrder: string[];
}

export default function PlayerGameView({
  currentPlayer,
  currentQuestion,
  selectedAnswer,
  customAnswerText,
  hasSubmitted,
  votingAnswers,
  isVotingPhase,
  onSubmitAnswer,
  onSubmitCustomAnswer,
  onSubmitTextInput,
  onVoteForAnswer,
  onSubmitOrder,
  submittedOrder,
}: PlayerGameViewProps) {
  // Waiting for question
  if (!currentQuestion) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <WaitingView player={currentPlayer} />
        </div>
        <div className="p-4 flex justify-center">
          <LanguageSwitcher absolute={false} />
        </div>
      </div>
    );
  }

  // Custom Answers Mode - Submit Answer
  if (currentQuestion.questionType === 'custom-answers' && !isVotingPhase) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <CustomAnswerInput
            player={currentPlayer}
            hasSubmitted={hasSubmitted}
            submittedText={customAnswerText}
            onSubmitCustomAnswer={onSubmitCustomAnswer}
          />
        </div>
        <div className="p-4 flex justify-center">
          <LanguageSwitcher absolute={false} />
        </div>
      </div>
    );
  }

  // Voting Phase - Vote for Answers
  if (isVotingPhase && votingAnswers.length > 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <VotingView
            player={currentPlayer}
            votingAnswers={votingAnswers}
            selectedAnswer={selectedAnswer}
            hasSubmitted={hasSubmitted}
            onVoteForAnswer={onVoteForAnswer}
          />
        </div>
        <div className="p-4 flex justify-center">
          <LanguageSwitcher absolute={false} />
        </div>
      </div>
    );
  }

  // Multiple Choice Mode - Select Answer
  if (currentQuestion.questionType === 'multiple-choice' && currentQuestion.answers) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <MultipleChoiceView
            player={currentPlayer}
            answers={currentQuestion.answers}
            selectedAnswer={selectedAnswer}
            hasSubmitted={hasSubmitted}
            onSubmitAnswer={onSubmitAnswer}
          />
        </div>
        <div className="p-4 flex justify-center">
          <LanguageSwitcher absolute={false} />
        </div>
      </div>
    );
  }

  // Text Input Mode - Submit Text Answer
  if (currentQuestion.questionType === 'text-input') {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <TextInputView
            player={currentPlayer}
            hasSubmitted={hasSubmitted}
            submittedText={customAnswerText}
            onSubmitTextInput={onSubmitTextInput}
          />
        </div>
        <div className="p-4 flex justify-center">
          <LanguageSwitcher absolute={false} />
        </div>
      </div>
    );
  }

  // Order Mode - Arrange Items in Order
  if (currentQuestion.questionType === 'order' && currentQuestion.orderItems) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <OrderView
            player={currentPlayer}
            orderItems={currentQuestion.orderItems}
            hasSubmitted={hasSubmitted}
            submittedOrder={submittedOrder}
            onSubmitOrder={onSubmitOrder}
          />
        </div>
        <div className="p-4 flex justify-center">
          <LanguageSwitcher absolute={false} />
        </div>
      </div>
    );
  }

  // Fallback - waiting state
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
        <WaitingView
          player={currentPlayer}
          emoji="⏳"
          title="Get Ready!"
          message="Watch the game master's screen..."
        />
      </div>
      <div className="p-4 flex justify-center">
        <LanguageSwitcher absolute={false} />
      </div>
    </div>
  );
}
