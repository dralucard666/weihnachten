import { useState, useEffect } from "react";
import QuestionDisplay from "./QuestionDisplay";
import MediaDisplay from "./MediaDisplay";
import {
  HostHeader,
  HostPlayerStatus,
  HostControlButtons,
  HostCustomAnswersDisplay,
  HostTextInputDisplay,
  HostOrderDisplay,
  type Question,
} from "../host/questions";
import type {
  Lobby,
  CustomAnswer,
  PlayerAnswerInfo,
} from "../../../../shared/types";

interface GamePlayingViewProps {
  lobby: Lobby;
  currentQuestion: Question;
  currentQuestionIndex: number;
  totalQuestions: number;
  playersWhoAnswered: Set<string>;
  allPlayersAnswered: boolean;
  showCorrectAnswer: boolean;
  customAnswers: CustomAnswer[];
  isVotingPhase: boolean;
  allVotesReceived: boolean;
  playerAnswers: PlayerAnswerInfo[];
  correctPlayerIds: string[];
  onShowAnswer: () => void;
  onShowVotingResults: () => void;
  onNextQuestion: () => void;
  onRestartQuestion: () => void;
}

export default function GamePlayingView({
  lobby,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  playersWhoAnswered,
  allPlayersAnswered,
  showCorrectAnswer,
  customAnswers,
  isVotingPhase,
  allVotesReceived,
  playerAnswers,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  correctPlayerIds: _correctPlayerIds,
  onShowAnswer,
  onShowVotingResults,
  onNextQuestion,
  onRestartQuestion,
}: GamePlayingViewProps) {
  const playersWithNames = lobby.players.filter((p) => p.name);
  const isCustomAnswersMode = currentQuestion.type === "custom-answers";
  const isTextInputMode = currentQuestion.type === "text-input";
  const isOrderMode = currentQuestion.type === "order";

  // Media display states
  const [showBeforeQuestionMedia, setShowBeforeQuestionMedia] = useState(
    !!currentQuestion.media?.beforeQuestion
  );
  const [showBeforeAnswerMedia, setShowBeforeAnswerMedia] = useState(false);

  // Text-input player results state
  const [showTextInputPlayerResults, setShowTextInputPlayerResults] =
    useState(false);
  const [textInputPlayerAnswers, setTextInputPlayerAnswers] = useState<
    PlayerAnswerInfo[]
  >([]);

  // Reset media states when question changes
  useEffect(() => {
    setShowBeforeQuestionMedia(!!currentQuestion.media?.beforeQuestion);
    setShowBeforeAnswerMedia(false);
    setShowTextInputPlayerResults(false);
    setTextInputPlayerAnswers([]);
  }, [currentQuestion.id, currentQuestion.media]);

  const handleShowTextInputPlayerResults = () => {
    // Text input answers are already available in playerAnswers prop
    // No need to fetch from backend anymore
    setTextInputPlayerAnswers(playerAnswers);
    setShowTextInputPlayerResults(true);
  };

  // Show before-answer media when correct answer is revealed
  const handleShowAnswerClick = () => {
    if (
      currentQuestion.media?.beforeAnswer &&
      !(currentQuestion.type === "custom-answers" && !isVotingPhase)
    ) {
      setShowBeforeAnswerMedia(true);
    } else {
      onShowAnswer();
    }
  };

  const handleShowVotingResultsClick = () => {
    if (currentQuestion.media?.beforeAnswer) {
      setShowBeforeAnswerMedia(true);
    } else {
      onShowVotingResults();
    }
  };

  const handleBeforeAnswerMediaComplete = () => {
    setShowBeforeAnswerMedia(false);
    // Call the appropriate handler based on the current mode
    if (isVotingPhase) {
      onShowVotingResults();
    } else {
      onShowAnswer();
    }
  };

  const getPlayerAnswer = (playerId: string): string | undefined => {
    return playerAnswers.find((pa) => pa.playerId === playerId)?.answerText;
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900">
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col mt-6">
        {/* Header with Progress */}
        <HostHeader
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
        />

        {/* Before-Question Media Display */}
        {showBeforeQuestionMedia && currentQuestion.media?.beforeQuestion && (
          <div className="mb-6 flex justify-center">
            <MediaDisplay
              media={currentQuestion.media.beforeQuestion}
              onComplete={() => setShowBeforeQuestionMedia(false)}
              className="w-full max-w-5xl"
            />
          </div>
        )}

        {/* Before-Answer Media Display (shown when revealing answer) */}
        {showBeforeAnswerMedia && currentQuestion.media?.beforeAnswer && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6">
            <MediaDisplay
              media={currentQuestion.media.beforeAnswer}
              onComplete={handleBeforeAnswerMediaComplete}
              className="w-full max-w-6xl"
            />
          </div>
        )}

        {/* Question Display - Centered */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="w-full max-w-5xl">
            {isCustomAnswersMode ? (
              <HostCustomAnswersDisplay
                question={currentQuestion}
                customAnswers={customAnswers}
                isVotingPhase={isVotingPhase}
                showCorrectAnswer={showCorrectAnswer}
                allPlayersAnswered={allPlayersAnswered}
                players={lobby.players}
              />
            ) : isTextInputMode ? (
              <HostTextInputDisplay
                question={currentQuestion}
                showCorrectAnswer={showCorrectAnswer}
                showPlayerResults={showTextInputPlayerResults}
                playerAnswers={textInputPlayerAnswers}
                players={lobby.players}
              />
            ) : isOrderMode ? (
              <HostOrderDisplay
                question={currentQuestion}
                showCorrectAnswer={showCorrectAnswer}
                playerOrders={playerAnswers}
                players={lobby.players}
              />
            ) : (
              currentQuestion.answers && (
                <QuestionDisplay
                  questionText={currentQuestion.text}
                  answers={currentQuestion.answers}
                  correctAnswerId={currentQuestion.correctAnswerId || ""}
                  showCorrect={showCorrectAnswer}
                />
              )
            )}
          </div>
        </div>

        {/* Players Status - Bottom */}
        <HostPlayerStatus
          players={playersWithNames}
          playersWhoAnswered={playersWhoAnswered}
          isVotingPhase={isVotingPhase}
          showCorrectAnswer={showCorrectAnswer}
          getPlayerAnswer={getPlayerAnswer}
        />
      </div>
      {/* Control Buttons */}
      <HostControlButtons
        isCustomAnswersMode={isCustomAnswersMode}
        isTextInputMode={isTextInputMode}
        isVotingPhase={isVotingPhase}
        showCorrectAnswer={showCorrectAnswer}
        allPlayersAnswered={allPlayersAnswered}
        allVotesReceived={allVotesReceived}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        showTextInputPlayerResults={showTextInputPlayerResults}
        onShowAnswer={handleShowAnswerClick}
        onShowVotingResults={handleShowVotingResultsClick}
        onNextQuestion={onNextQuestion}
        onShowTextInputPlayerResults={handleShowTextInputPlayerResults}
        onRestartQuestion={onRestartQuestion}
      />
    </div>
  );
}
