import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { BrowserRouter as Router } from "react-router-dom";
import { SocketContext, socket } from "./context/SocketContext";
import { PlayerProvider } from "./context/PlayerContext";
import { RoomProvider } from "./context/RoomContext";
import { ModalProvider } from "./context/ModalContext";

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <PlayerProvider>
        <RoomProvider>
          <SocketContext.Provider value={socket}>
            <ModalProvider>
              <App />
            </ModalProvider>
          </SocketContext.Provider>
        </RoomProvider>
      </PlayerProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById("root")
);
