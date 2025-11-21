import type { Player, Answer, QuestionType } from '../../../shared/types';
import {
  WaitingView,
  CustomAnswerInput,
  VotingView,
  MultipleChoiceView,
  TextInputView,
} from './player-game';

interface CurrentQuestion {
  questionId: string;
  questionIndex: number;
  questionType: QuestionType;
  answers?: Answer[];
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
}: PlayerGameViewProps) {
  // Waiting for question
  if (!currentQuestion) {
    return <WaitingView player={currentPlayer} />;
  }

  // Custom Answers Mode - Submit Answer
  if (currentQuestion.questionType === 'custom-answers' && !isVotingPhase) {
    return (
      <CustomAnswerInput
        player={currentPlayer}
        hasSubmitted={hasSubmitted}
        submittedText={customAnswerText}
        onSubmitCustomAnswer={onSubmitCustomAnswer}
      />
    );
  }

  // Voting Phase - Vote for Answers
  if (isVotingPhase && votingAnswers.length > 0) {
    return (
      <VotingView
        player={currentPlayer}
        votingAnswers={votingAnswers}
        selectedAnswer={selectedAnswer}
        hasSubmitted={hasSubmitted}
        onVoteForAnswer={onVoteForAnswer}
      />
    );
  }

  // Multiple Choice Mode - Select Answer
  if (currentQuestion.questionType === 'multiple-choice' && currentQuestion.answers) {
    return (
      <MultipleChoiceView
        player={currentPlayer}
        answers={currentQuestion.answers}
        selectedAnswer={selectedAnswer}
        hasSubmitted={hasSubmitted}
        onSubmitAnswer={onSubmitAnswer}
      />
    );
  }

  // Text Input Mode - Submit Text Answer
  if (currentQuestion.questionType === 'text-input') {
    return (
      <TextInputView
        player={currentPlayer}
        hasSubmitted={hasSubmitted}
        submittedText={customAnswerText}
        onSubmitTextInput={onSubmitTextInput}
      />
    );
  }

  // Fallback - waiting state
  return (
    <WaitingView
      player={currentPlayer}
      emoji="⏳"
      title="Get Ready!"
      message="Watch the game master's screen..."
    />
  );
}
