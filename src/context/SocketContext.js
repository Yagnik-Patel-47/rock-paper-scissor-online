import { createContext } from "react";
import { io } from "socket.io-client";

const SocketUrl = process.env.REACT_APP_SERVER_PATH;

// URL => http://localhost:5000

export const socket = io.connect(SocketUrl);
export const SocketContext = createContext(socket);
