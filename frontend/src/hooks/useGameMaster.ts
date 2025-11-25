import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { socketService } from "../services/socket";
import type {
  Lobby,
  Player,
  CustomAnswer,
  PlayerAnswerInfo,
  QuestionData,
} from "../../../shared/types";

export function useGameMaster(lobbyId: string | undefined, questionIds: string[]) {
  const navigate = useNavigate();
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [allPlayersAnswered, setAllPlayersAnswered] = useState(false);
  const [playersWhoAnswered, setPlayersWhoAnswered] = useState<Set<string>>(new Set());
  const [customAnswers, setCustomAnswers] = useState<CustomAnswer[]>([]);
  const [isVotingPhase, setIsVotingPhase] = useState(false);
  const [allVotesReceived, setAllVotesReceived] = useState(false);
  const [playerAnswers, setPlayerAnswers] = useState<PlayerAnswerInfo[]>([]);
  const [correctPlayerIds, setCorrectPlayerIds] = useState<string[]>([]);
  const [playerScores, setPlayerScores] = useState<{ [playerId: string]: number }>({});
  // Store correct answer data when results are revealed
  const [correctAnswerId, setCorrectAnswerId] = useState<string | undefined>();
  const [correctAnswer, setCorrectAnswer] = useState<string | undefined>();
  const [correctAnswers, setCorrectAnswers] = useState<string[] | undefined>();
  const [correctOrder, setCorrectOrder] = useState<string[] | undefined>();

  useEffect(() => {
    const socket = socketService.connect();

    if (!lobbyId) {
      // Use questionIds from closure - only runs once on mount
      socket.emit("createLobby", { questionIds }, (response) => {
        if (response.lobby) {
          setLobby(response.lobby);
          setLoading(false);
          navigate(`/game-master/${response.lobbyId}`, { replace: true });
        } else {
          setError("Failed to create lobby");
          setLoading(false);
        }
      });
    } else {
      // Try to reconnect to existing lobby
      socket.emit("reconnectMaster", { lobbyId }, (response) => {
        if (response.success && response.lobby) {
          setLobby(response.lobby);
          if (response.currentQuestion) {
            setCurrentQuestion(response.currentQuestion);
          }
          setLoading(false);
          console.log("Reconnected to lobby:", response.lobby);
        } else {
          setError(response.error || "Failed to reconnect to lobby");
          setLoading(false);
        }
      });
    }

    socket.on("lobbyUpdated", (updatedLobby) => {
      setLobby(updatedLobby);
    });

    socket.on("playerJoined", (player: Player) => {
      console.log("Player joined:", player.name);
    });

    socket.on("playerLeft", (playerId: string) => {
      console.log("Player left:", playerId);
      setPlayersWhoAnswered((prev) => {
        const newSet = new Set(prev);
        newSet.delete(playerId);
        return newSet;
      });
    });

    // Question started - backend sends the question data
    socket.on("questionStarted", (questionData: QuestionData) => {
      console.log("Question started:", questionData);
      setCurrentQuestion(questionData);
      setPlayersWhoAnswered(new Set());
      setAllPlayersAnswered(false);
      setCustomAnswers([]);
      setIsVotingPhase(false);
      setAllVotesReceived(false);
      setPlayerAnswers([]);
      setCorrectPlayerIds([]);
      setPlayerScores({});
      // Reset correct answer data for new question
      setCorrectAnswerId(undefined);
      setCorrectAnswer(undefined);
      setCorrectAnswers(undefined);
      setCorrectOrder(undefined);
    });

    socket.on("playerAnswered", (playerId: string) => {
      console.log("Player answered:", playerId);
      setPlayersWhoAnswered((prev) => new Set(prev).add(playerId));
    });

    socket.on("everybodyAnswered", () => {
      console.log("Everybody answered!");
      setAllPlayersAnswered(true);
    });

    socket.on(
      "customAnswersReady",
      (data: { questionId: string; answers: CustomAnswer[] }) => {
        console.log("Custom answers ready:", data.answers.length);
        setCustomAnswers(data.answers);
      }
    );

    socket.on("showAnswersForVoting", () => {
      console.log("Voting phase started");
      setIsVotingPhase(true);
      setPlayersWhoAnswered(new Set());
      setAllPlayersAnswered(false);
    });

    socket.on("allVotesReceived", () => {
      console.log("All votes received!");
      setAllVotesReceived(true);
    });

    socket.on(
      "questionResultReady",
      (data: { correctAnswerId: string; playerAnswers: PlayerAnswerInfo[] }) => {
        console.log("Question result ready:", data);
        setCorrectAnswerId(data.correctAnswerId);
        setPlayerAnswers(data.playerAnswers);
      }
    );

    socket.on(
      "customAnswerResultReady",
      (data: { correctAnswerId: string; playerVotes: PlayerAnswerInfo[] }) => {
        console.log("Custom answer result ready:", data);
        setCorrectAnswerId(data.correctAnswerId);
        setPlayerAnswers(data.playerVotes);
      }
    );

    socket.on("scoresUpdated", (players: Player[]) => {
      console.log("Scores updated:", players);
      setLobby((prev) => (prev ? { ...prev, players } : null));
    });

    socket.on(
      "textInputResultReady",
      (data: {
        correctAnswers: string[];
        playerAnswers: PlayerAnswerInfo[];
        correctPlayerIds: string[];
      }) => {
        console.log("Text input result ready:", data);
        setCorrectAnswers(data.correctAnswers);
        setPlayerAnswers(data.playerAnswers);
        setCorrectPlayerIds(data.correctPlayerIds);
      }
    );

    socket.on(
      "orderResultReady",
      (data: {
        correctOrder: string[];
        playerOrders: PlayerAnswerInfo[];
        playerScores: { [playerId: string]: number };
      }) => {
        console.log("Order result ready:", data);
        setCorrectOrder(data.correctOrder);
        setPlayerAnswers(data.playerOrders);
        setPlayerScores(data.playerScores);
      }
    );

    return () => {
      socket.off("lobbyUpdated");
      socket.off("playerJoined");
      socket.off("playerLeft");
      socket.off("questionStarted");
      socket.off("playerAnswered");
      socket.off("everybodyAnswered");
      socket.off("customAnswersReady");
      socket.off("showAnswersForVoting");
      socket.off("allVotesReceived");
      socket.off("questionResultReady");
      socket.off("customAnswerResultReady");
      socket.off("scoresUpdated");
      socket.off("textInputResultReady");
      socket.off("orderResultReady");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lobbyId, navigate]);

  const handleStartGame = () => {
    if (!lobby) return;

    const socket = socketService.getSocket();
    if (socket) {
      localStorage.setItem("gameMasterLobbyId", lobby.id);

      socket.emit("startGame", { lobbyId: lobby.id }, (response) => {
        if (response.success && response.currentQuestion) {
          setCurrentQuestion(response.currentQuestion);
        }
      });
    }
  };

  const handleShowAnswer = () => {
    if (!lobby || !currentQuestion) return;

    const socket = socketService.getSocket();
    if (socket) {
      // For custom answers mode, prepare voting phase and trigger voting
      if (currentQuestion.type === "custom-answers" && !isVotingPhase) {
        // First prepare the voting (backend mixes answers)
        socket.emit("prepareCustomAnswerVoting", { lobbyId: lobby.id }, (response) => {
          if (response.success) {
            // The backend will emit 'customAnswersReady' back to us
            setAllPlayersAnswered(true); // Show the answers to master
            
            // After answers are prepared, trigger voting phase for all players
            socket.emit("triggerAnswerVoting", { lobbyId: lobby.id });
          }
        });
        return;
      }

      // For text-input, order, multiple-choice, or custom-answers after voting
      const resultMap = {
        "text-input": "textInputResult",
        "order": "orderResult",
        "multiple-choice": "questionResult",
        "custom-answers": "customAnswerResult",
      } as const;

      const eventName = resultMap[currentQuestion.type];
      if (eventName) {
        socket.emit(eventName, { lobbyId: lobby.id });
      }
    }
  };

  const handleTriggerVoting = () => {
    if (!lobby) return;

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("triggerAnswerVoting", { lobbyId: lobby.id });
    }
  };

  const handleShowVotingResults = () => {
    if (!lobby) return;

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("customAnswerResult", { lobbyId: lobby.id });
    }
  };

  const handleNextQuestion = () => {
    if (!lobby) return;

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("nextQuestion", { lobbyId: lobby.id }, (response) => {
        if (response.success) {
          if (response.gameFinished) {
            // Game is over
            localStorage.removeItem("gameMasterLobbyId");
            socket.emit("endGame", lobby.id);
          } else if (response.currentQuestion) {
            setCurrentQuestion(response.currentQuestion);
          }
        }
      });
    }
  };

  const handleRestartQuestion = () => {
    if (!lobby) return;

    const socket = socketService.getSocket();
    if (socket) {
      socket.emit("restartQuestion", { lobbyId: lobby.id }, (response) => {
        if (response.success && response.currentQuestion) {
          setCurrentQuestion(response.currentQuestion);
          // Reset local state
          setAllPlayersAnswered(false);
          setPlayersWhoAnswered(new Set());
          setCustomAnswers([]);
          setIsVotingPhase(false);
          setAllVotesReceived(false);
          setPlayerAnswers([]);
          setCorrectPlayerIds([]);
          setPlayerScores({});
          setCorrectAnswerId("");
          setCorrectAnswer("");
          setCorrectAnswers([]);
          setCorrectOrder([]);
        }
      });
    }
  };


  return {
    lobby,
    loading,
    error,
    currentQuestion,
    allPlayersAnswered,
    playersWhoAnswered,
    customAnswers,
    isVotingPhase,
    allVotesReceived,
    playerAnswers,
    correctPlayerIds,
    playerScores,
    correctAnswerId,
    correctAnswer,
    correctAnswers,
    correctOrder,
    handleStartGame,
    handleShowAnswer,
    handleTriggerVoting,
    handleShowVotingResults,
    handleNextQuestion,
    handleRestartQuestion,
  };
}
