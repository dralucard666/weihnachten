import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StartPage from './pages/StartPage';
import GameMasterPage from './pages/GameMasterPage';
import PlayerPage from './pages/PlayerPage';
import QuestionManagementPage from './pages/QuestionManagementPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/game-master" element={<GameMasterPage />} />
        <Route path="/game-master/:lobbyId" element={<GameMasterPage />} />
        <Route path="/player" element={<PlayerPage />} />
        <Route path="/player/:lobbyId" element={<PlayerPage />} />
        <Route path="/questions" element={<QuestionManagementPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
