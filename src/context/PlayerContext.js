import { useState, createContext } from "react";

export const PlayerProvider = ({ children }) => {
  const [playerData, setPlayerData] = useState({
    fullName: "",
    email: "",
    picture: "",
  });
  const [isLogged, setIsLogged] = useState(false);
  return (
    <PlayerContext.Provider
      value={{
        Player: [playerData, setPlayerData],
        Logged: [isLogged, setIsLogged],
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const PlayerContext = createContext(PlayerProvider);
