export const translations = {
  en: {
    // Start Page
    startPage: {
      title: 'Quiz App',
      subtitle: 'Join the Fun!',
      chooseRole: 'Choose Your Role:',
      gameMaster: 'Game Master',
      player: 'Player',
      hostNewGame: 'Host a New Game',
      joinGame: 'Join a Game',
    },

    // Game Lobby
    lobby: {
      title: 'Game Lobby',
      lobbyCode: 'Lobby Code',
      scanToJoin: 'Scan to Join',
      scanDescription: 'Players can scan this QR code with their phones to join instantly',
      players: 'Players',
      waitingForPlayers: 'Waiting for players to join...',
      connected: 'Connected',
      disconnected: 'Disconnected',
      points: 'points',
      startGame: 'Start Game',
      waitingForPlayersButton: 'Waiting for Players',
      player: 'player',
      players_plural: 'players',
    },

    // Player Join
    playerJoin: {
      joinGame: 'Join Game',
      lobbyCode: 'Lobby Code',
      yourName: 'Your Name',
      enterName: 'Enter your name',
      joinGameButton: 'Join Game',
      joining: 'Joining...',
      scanQR: 'To join a game, scan the QR code displayed by the game master.',
      qrDescription: 'The QR code will automatically take you to the right lobby.',
      orEnterCode: 'Or enter a lobby code:',
      enterLobbyCode: 'Enter lobby code',
      joinGameAction: 'Join Game',
    },

    // Player Lobby
    playerLobby: {
      welcome: 'Welcome!',
      inLobby: "You're in the lobby",
      waitingToStart: 'Waiting for game to start...',
      playersInLobby: 'Players in Lobby',
      you: '(You)',
    },

    // Game Playing
    game: {
      quizMaster: 'Quiz Master',
      question: 'Question',
      score: 'Score',
      answered: 'Answered',
      voting: 'Voting',
    },

    // Host Control Buttons
    hostControls: {
      getAnswersStartVoting: 'Get Answers & Start Voting',
      waitingForAllPlayers: 'Waiting for All Players...',
      showResults: 'Show Results',
      waitingForAllVotes: 'Waiting for All Votes...',
      showPlayerResults: 'Show Player Results',
      showAnswer: 'Show Answer',
      nextQuestion: 'Next Question',
      finishGame: 'Finish Game',
      switchToGerman: 'Switch to German',
      switchToEnglish: 'Switch to English',
    },

    // Player Game View
    playerGame: {
      writeYourAnswer: 'WRITE YOUR ANSWER',
      lookAtScreen: 'Look at the game master\'s screen for the question, then write your answer below.',
      yourAnswer: 'Your answer...',
      submitAnswer: 'Submit Answer',
      answerSubmitted: 'Answer submitted!',
      yourAnswerLabel: 'Your answer:',
      waitForPlayers: 'Wait for all players to submit their answers...',
      voteForCorrect: 'VOTE FOR THE CORRECT ANSWER',
      whichIsCorrect: 'Which answer do you think is correct?',
      voteSubmitted: 'Vote submitted! Watch the screen for results.',
      answerSubmittedWatch: 'Answer submitted! Watch the screen for results.',
      getReady: 'Get Ready!',
      watchScreen: "Watch the game master's screen...",
    },

    // Game Finished
    gameFinished: {
      gameOver: 'Game Over!',
      finalResults: 'Final Results',
      fullScoreboard: 'Full Scoreboard',
      thanksForPlaying: 'Thanks for playing!',
      winner: 'Winner!',
      place_2nd: '2nd Place',
      place_3rd: '3rd Place',
      place_nth: 'th Place',
      finalScore: 'Final Score',
      finalStandings: 'Final Standings',
      pts: 'pts',
    },

    // Reconnect Modal
    reconnect: {
      previousSessionFound: 'Previous Session Found',
      reconnectToGame: 'Reconnect to Game',
      youHavePrevious: 'You have a previous game session. Would you like to reconnect?',
      foundActive: 'We found an active game session. You can try to reconnect to your previous game.',
      name: 'Name',
      lobby: 'Lobby',
      player: 'Player',
      lobbyId: 'Lobby ID',
      reconnect: 'Reconnect',
      cancel: 'Cancel',
      reconnecting: 'Reconnecting...',
      close: 'Close',
      noSession: 'No previous game session found.',
    },

    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      creatingLobby: 'Creating lobby...',
      loadingQuestions: 'Loading questions...',
      failedToLoadQuestions: 'Failed to load questions from server',
      gameInProgress: 'Game In Progress',
      connectedButNoData: 'Connected to lobby but question data is not available.',
      lobbyIdLabel: 'Lobby ID',
      questionIndex: 'Question Index',
      totalQuestions: 'Total Questions',
      playerNotFound: 'Player not found',
      reconnectToPreviousSession: 'Reconnect to previous session',
      switchToLanguage: 'Switch to',
      characters: 'characters',
    },

    // Media Display
    media: {
      replay: 'Replay',
      continue: 'Continue',
      minimize: 'Minimize',
      restore: 'Restore',
      fullscreen: 'Fullscreen',
      exitFullscreen: 'Exit fullscreen',
    },

    // Player Answer Views
    playerAnswers: {
      selectYourAnswer: 'SELECT YOUR ANSWER',
      lookAtScreenAndPick: 'Look at the screen and pick the correct answer',
      typeYourAnswer: 'TYPE YOUR ANSWER',
      lookAtScreenForQuestion: "Look at the game master's screen for the question",
      typeYourAnswerPlaceholder: 'Type your answer...',
      submitAnswer: 'Submit Answer',
      putInOrder: 'PUT IN ORDER',
      dragToArrange: 'Drag items or use arrows to arrange them in the correct order',
      submitOrder: 'Submit Order',
      waitForAllPlayers: '⏳ Wait for all players to submit...',
    },

    // Host Views
    host: {
      playerStatus: 'Player Status',
      voted: 'Voted',
      done: 'Done',
      wait: 'Wait',
      playersWritingAnswers: 'Players are writing their answers...',
      customAnswerModeNote: '📝 Custom Answer Mode: Players submit their own answers',
      submittedAnswers: '✨ Submitted Answers:',
      oneAnswerCorrect: '⚠️ One of these answers is correct. The order is randomized.',
      playersVoting: 'Players are voting for the correct answer...',
      votingPhaseNote: '🗳️ Voting Phase: Players pick which answer they think is correct',
      allAnswers: 'All Answers:',
      results: '🎉 Results!',
      allAnswersWithResults: 'All Answers with Results:',
      correctAnswerLabel: 'CORRECT ANSWER',
      playerLabel: 'Player',
      unknown: 'Unknown',
      playersTyping: 'Players are typing their answers...',
      textInputModeNote: '⌨️ Text Input Mode: Players enter text answers',
      playerAnswersLabel: '📝 Player Answers:',
      noAnswer: '(no answer)',
      correctAnswerColon: '✅ Correct Answer:',
      caseInsensitiveNote: 'ℹ️ Answers are case-insensitive and whitespace is trimmed',
      putItemsInOrder: 'Put the items in the correct order',
      correctOrder: '✅ Correct Order:',
      playerResults: '📊 Player Results:',
    },
  },

  de: {
    // Start Page
    startPage: {
      title: 'Quiz App',
      subtitle: 'Mach mit!',
      chooseRole: 'Wähle deine Rolle:',
      gameMaster: 'Spielleiter',
      player: 'Spieler',
      hostNewGame: 'Neues Spiel starten',
      joinGame: 'Spiel beitreten',
    },

    // Game Lobby
    lobby: {
      title: 'Spiel-Lobby',
      lobbyCode: 'Lobby-Code',
      scanToJoin: 'Zum Beitreten scannen',
      scanDescription: 'Spieler können diesen QR-Code mit ihren Handys scannen, um sofort beizutreten',
      players: 'Spieler',
      waitingForPlayers: 'Warte auf Spieler...',
      connected: 'Verbunden',
      disconnected: 'Getrennt',
      points: 'Punkte',
      startGame: 'Spiel starten',
      waitingForPlayersButton: 'Warte auf Spieler',
      player: 'Spieler',
      players_plural: 'Spieler',
    },

    // Player Join
    playerJoin: {
      joinGame: 'Spiel beitreten',
      lobbyCode: 'Lobby-Code',
      yourName: 'Dein Name',
      enterName: 'Gib deinen Namen ein',
      joinGameButton: 'Spiel beitreten',
      joining: 'Trete bei...',
      scanQR: 'Um einem Spiel beizutreten, scanne den vom Spielleiter angezeigten QR-Code.',
      qrDescription: 'Der QR-Code führt dich automatisch zur richtigen Lobby.',
      orEnterCode: 'Oder gib einen Lobby-Code ein:',
      enterLobbyCode: 'Lobby-Code eingeben',
      joinGameAction: 'Spiel beitreten',
    },

    // Player Lobby
    playerLobby: {
      welcome: 'Willkommen!',
      inLobby: 'Du bist in der Lobby',
      waitingToStart: 'Warte auf Spielstart...',
      playersInLobby: 'Spieler in der Lobby',
      you: '(Du)',
    },

    // Game Playing
    game: {
      quizMaster: 'Quiz-Meister',
      question: 'Frage',
      score: 'Punktzahl',
      answered: 'Geantwortet',
      voting: 'Abstimmung',
    },

    // Host Control Buttons
    hostControls: {
      getAnswersStartVoting: 'Antworten holen & Abstimmung starten',
      waitingForAllPlayers: 'Warte auf alle Spieler...',
      showResults: 'Ergebnisse anzeigen',
      waitingForAllVotes: 'Warte auf alle Stimmen...',
      showPlayerResults: 'Spieler-Ergebnisse anzeigen',
      showAnswer: 'Antwort anzeigen',
      nextQuestion: 'Nächste Frage',
      finishGame: 'Spiel beenden',
      switchToGerman: 'Auf Deutsch wechseln',
      switchToEnglish: 'Auf Englisch wechseln',
    },

    // Player Game View
    playerGame: {
      writeYourAnswer: 'SCHREIBE DEINE ANTWORT',
      lookAtScreen: 'Schau auf den Bildschirm des Spielleiters für die Frage und schreibe dann deine Antwort unten.',
      yourAnswer: 'Deine Antwort...',
      submitAnswer: 'Antwort absenden',
      answerSubmitted: 'Antwort abgeschickt!',
      yourAnswerLabel: 'Deine Antwort:',
      waitForPlayers: 'Warte, bis alle Spieler ihre Antworten abgegeben haben...',
      voteForCorrect: 'STIMME FÜR DIE RICHTIGE ANTWORT',
      whichIsCorrect: 'Welche Antwort hältst du für richtig?',
      voteSubmitted: 'Stimme abgegeben! Schau auf den Bildschirm für die Ergebnisse.',
      answerSubmittedWatch: 'Antwort abgeschickt! Schau auf den Bildschirm für die Ergebnisse.',
      getReady: 'Mach dich bereit!',
      watchScreen: 'Schau auf den Bildschirm des Spielleiters...',
    },

    // Game Finished
    gameFinished: {
      gameOver: 'Spiel vorbei!',
      finalResults: 'Endergebnisse',
      fullScoreboard: 'Vollständige Rangliste',
      thanksForPlaying: 'Danke fürs Mitspielen!',
      winner: 'Gewinner!',
      place_2nd: '2. Platz',
      place_3rd: '3. Platz',
      place_nth: '. Platz',
      finalScore: 'Endpunktzahl',
      finalStandings: 'Endstand',
      pts: 'Pkte',
    },

    // Reconnect Modal
    reconnect: {
      previousSessionFound: 'Vorherige Sitzung gefunden',
      reconnectToGame: 'Wieder zum Spiel verbinden',
      youHavePrevious: 'Du hast eine vorherige Spielsitzung. Möchtest du dich wieder verbinden?',
      foundActive: 'Wir haben eine aktive Spielsitzung gefunden. Du kannst versuchen, dich wieder mit deinem vorherigen Spiel zu verbinden.',
      name: 'Name',
      lobby: 'Lobby',
      player: 'Spieler',
      lobbyId: 'Lobby-ID',
      reconnect: 'Wieder verbinden',
      cancel: 'Abbrechen',
      reconnecting: 'Verbinde wieder...',
      close: 'Schließen',
      noSession: 'Keine vorherige Spielsitzung gefunden.',
    },

    // Common
    common: {
      loading: 'Lädt...',
      error: 'Fehler',
      creatingLobby: 'Lobby wird erstellt...',
      loadingQuestions: 'Fragen werden geladen...',
      failedToLoadQuestions: 'Fehler beim Laden der Fragen vom Server',
      gameInProgress: 'Spiel läuft',
      connectedButNoData: 'Mit Lobby verbunden, aber Fragendaten sind nicht verfügbar.',
      lobbyIdLabel: 'Lobby-ID',
      questionIndex: 'Fragenindex',
      totalQuestions: 'Fragen insgesamt',
      playerNotFound: 'Spieler nicht gefunden',
      reconnectToPreviousSession: 'Mit vorheriger Sitzung verbinden',
      switchToLanguage: 'Wechseln zu',
      characters: 'Zeichen',
    },

    // Media Display
    media: {
      replay: 'Wiederholen',
      continue: 'Weiter',
      minimize: 'Minimieren',
      restore: 'Wiederherstellen',
      fullscreen: 'Vollbild',
      exitFullscreen: 'Vollbild beenden',
    },

    // Player Answer Views
    playerAnswers: {
      selectYourAnswer: 'WÄHLE DEINE ANTWORT',
      lookAtScreenAndPick: 'Schau auf den Bildschirm und wähle die richtige Antwort',
      typeYourAnswer: 'TIPPE DEINE ANTWORT',
      lookAtScreenForQuestion: 'Schau auf den Bildschirm des Spielleiters für die Frage',
      typeYourAnswerPlaceholder: 'Tippe deine Antwort...',
      submitAnswer: 'Antwort absenden',
      putInOrder: 'BRINGE IN REIHENFOLGE',
      dragToArrange: 'Ziehe Elemente oder nutze Pfeile, um sie in die richtige Reihenfolge zu bringen',
      submitOrder: 'Reihenfolge absenden',
      waitForAllPlayers: '⏳ Warte, bis alle Spieler abgegeben haben...',
    },

    // Host Views
    host: {
      playerStatus: 'Spieler-Status',
      voted: 'Abgestimmt',
      done: 'Fertig',
      wait: 'Warte',
      playersWritingAnswers: 'Spieler schreiben ihre Antworten...',
      customAnswerModeNote: '📝 Benutzerdefinierter Antwortmodus: Spieler geben eigene Antworten ein',
      submittedAnswers: '✨ Eingereichte Antworten:',
      oneAnswerCorrect: '⚠️ Eine dieser Antworten ist richtig. Die Reihenfolge ist zufällig.',
      playersVoting: 'Spieler stimmen für die richtige Antwort...',
      votingPhaseNote: '🗳️ Abstimmungsphase: Spieler wählen die richtige Antwort',
      allAnswers: 'Alle Antworten:',
      results: '🎉 Ergebnisse!',
      allAnswersWithResults: 'Alle Antworten mit Ergebnissen:',
      correctAnswerLabel: 'RICHTIGE ANTWORT',
      playerLabel: 'Spieler',
      unknown: 'Unbekannt',
      playersTyping: 'Spieler tippen ihre Antworten...',
      textInputModeNote: '⌨️ Texteingabemodus: Spieler geben Textantworten ein',
      playerAnswersLabel: '📝 Spieler-Antworten:',
      noAnswer: '(keine Antwort)',
      correctAnswerColon: '✅ Richtige Antwort:',
      caseInsensitiveNote: 'ℹ️ Antworten sind nicht groß-/kleinschreibungsabhängig und Leerzeichen werden entfernt',
      putItemsInOrder: 'Bringe die Elemente in die richtige Reihenfolge',
      correctOrder: '✅ Richtige Reihenfolge:',
      playerResults: '📊 Spieler-Ergebnisse:',
    },
  },
} as const;

export type Language = keyof typeof translations;

// Create a union type that includes all possible translation values
type DeepPartial<T> = {
  [P in keyof T]: T[P] extends object ? DeepPartial<T[P]> : string;
};

export type TranslationKeys = DeepPartial<typeof translations.en>;
