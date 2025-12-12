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
  correctPlayerIds,
  onShowAnswer,
  onShowVotingResults,
  onNextQuestion,
  onRestartQuestion,
}: GamePlayingViewProps) {
  const isCustomAnswersMode = currentQuestion.type === "custom-answers";
  const isTextInputMode = currentQuestion.type === "text-input";
  const isOrderMode = currentQuestion.type === "order";

  // Media display states
  const [showBeforeAnswerMedia, setShowBeforeAnswerMedia] = useState(false);
  const [beforeQuestionMediaHidden, setBeforeQuestionMediaHidden] = useState(false);
  const [beforeAnswerMediaHidden, setBeforeAnswerMediaHidden] = useState(false);

  // Text-input player results state
  const [showTextInputPlayerResults, setShowTextInputPlayerResults] =
    useState(false);
  const [textInputPlayerAnswers, setTextInputPlayerAnswers] = useState<
    PlayerAnswerInfo[]
  >([]);

  // Reset media states when question changes
  useEffect(() => {
    setShowBeforeAnswerMedia(false);
    setShowTextInputPlayerResults(false);
    setTextInputPlayerAnswers([]);
    setBeforeQuestionMediaHidden(true);
    setBeforeAnswerMediaHidden(false);
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
    // Don't set showBeforeAnswerMedia to false, just mark as hidden
    // This way the media can be reopened
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
      <div className="w-full md:px-10 lg:px-20 mx-auto flex-1 flex flex-col mt-6">
        {/* Header with Progress */}
        <HostHeader
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
        />

        {/* Before-Question Media Display */}
        {!showCorrectAnswer && currentQuestion.media?.beforeQuestion && !beforeQuestionMediaHidden && (
          <MediaDisplay
            key={`before-question-${currentQuestion.id}`}
            media={currentQuestion.media.beforeQuestion}
            onComplete={() => setBeforeQuestionMediaHidden(true)}
          />
        )}

        {/* Reopen Before-Question Media Button */}
        {!showCorrectAnswer && currentQuestion.media?.beforeQuestion && beforeQuestionMediaHidden && (
          <button
            onClick={() => setBeforeQuestionMediaHidden(false)}
            className="fixed left-4 cursor-pointer top-1/2 -translate-y-1/2 bg-black hover:bg-purple-700 text-white p-3 rounded-r-xl shadow-lg transition-all duration-200 z-40 border-l-4 border-black"
            title="Show media"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}

        {/* Before-Answer Media Display (shown when revealing answer) */}
        {showBeforeAnswerMedia && currentQuestion.media?.beforeAnswer && !beforeAnswerMediaHidden && (
          <>
            <div className="fixed inset-0 z-40 bg-black/90" />
            <MediaDisplay
              key={`before-answer-${currentQuestion.id}`}
              media={currentQuestion.media.beforeAnswer}
              onComplete={() => {
                setBeforeAnswerMediaHidden(true);
                handleBeforeAnswerMediaComplete();
              }}
            />
          </>
        )}

        {/* Reopen Before-Answer Media Button */}
        {showCorrectAnswer && currentQuestion.media?.beforeAnswer && beforeAnswerMediaHidden && (
          <button
            onClick={() => setBeforeAnswerMediaHidden(false)}
            className="fixed left-4 cursor-pointer top-1/2 -translate-y-1/2 bg-black hover:bg-purple-700 text-white p-3 rounded-r-xl shadow-lg transition-all duration-200 z-40 border-l-4 border-black"
            title="Show media"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        )}

        {/* Question Display - Centered */}
        <div className="flex-1 flex items-center justify-center mb-6">
          <div className="w-full">
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
          players={lobby.players}
          playersWhoAnswered={playersWhoAnswered}
          isVotingPhase={isVotingPhase}
          showCorrectAnswer={showCorrectAnswer}
          correctPlayerIds={correctPlayerIds}
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
