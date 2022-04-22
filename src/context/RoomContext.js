import { useState, createContext } from "react";

export const RoomProvider = ({ children }) => {
  const [currentRoom, setCurrentRoom] = useState({
    roomId: "",
    roomPlayers: 0,
    roomHost: {},
    firstPlayer: {},
    secondPlayer: {},
  });
  return (
    <RoomContext.Provider
      value={{
        CR: [currentRoom, setCurrentRoom],
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const RoomContext = createContext(RoomProvider);
