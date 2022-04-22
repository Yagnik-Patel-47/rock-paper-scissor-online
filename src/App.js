import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Nav from "./components/Nav";
import GameArena from "./pages/GameArena";
import WaitingScreen from "./pages/WaitingScreen";
import PageModal from "./components/PageModal";
import RoomLobby from "./pages/RoomLobby";

const App = () => {
  return (
    <div className="App">
      <Nav />
      <PageModal />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/game" element={<GameArena />} />
        <Route path="/waiting" element={<WaitingScreen />} />
        <Route path="/rooms" element={<RoomLobby />} />
      </Routes>
    </div>
  );
};

export default App;
