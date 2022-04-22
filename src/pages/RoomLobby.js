import React, { useContext, useState, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";
import styled from "styled-components";
import { PlayerContext } from "../context/PlayerContext";
import { provider, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { RoomContext } from "../context/RoomContext";
import { motion } from "framer-motion";
import {
  RoomAnim,
  SingleRoom,
  RoomHeadAnim,
} from "../animations/RoomAnimations";
import { useAuthState } from "react-firebase-hooks/auth";

const RoomLobby = () => {
  const [socket, setSocket] = useState(useContext(SocketContext));
  const [rooms, setRooms] = useState([]);
  const { Player, Logged } = useContext(PlayerContext);
  const [isLogged, setIsLogged] = Logged;
  const [playerData, setPlayerData] = Player;
  const navigate = useNavigate();
  const { CR } = useContext(RoomContext);
  const [currentRoom, setCurrentRoom] = CR;

  const [user] = useAuthState(auth);

  const sortAlgo = (roomOne, roomTwo) => {
    return roomOne.RoomPlayers - roomTwo.RoomPlayers;
  };

  useEffect(() => {
    if (user) {
      setPlayerData({
        fullName: user.displayName,
        email: user.email,
        picture: user.photoURL,
      });
      setIsLogged(true);
    }
  }, [user]);

  useEffect(() => {
    socket.emit("requestRooms");

    socket.on("sendRooms", (serverRooms) => {
      if (serverRooms.length > 1) {
        setRooms(serverRooms.sort(sortAlgo));
      } else {
        setRooms(serverRooms);
      }
    });

    socket.on("serverRoomsUpdate", () => {
      socket.emit("requestRooms");
    });

    socket.on("playerJoined", (room, id) => {
      if (id !== socket.id) {
        // Host Here //
        return;
      }
      // Second Player //
      setCurrentRoom({
        roomId: room.RoomID,
        roomPlayers: room.RoomPlayers,
        roomHost: room.RoomHost,
        firstPlayer: room.secondPlayer,
        secondPlayer: room.RoomHost,
      });
      navigate("/waiting");
    });

    return function cleanup() {
      setSocket(null);
    };
  }, []);

  return (
    <Container>
      <Headline variants={RoomHeadAnim} animate="show" initial="hidden">
        Rooms
      </Headline>
      <RoomsContainer variants={RoomAnim} animate="show" initial="hidden">
        {rooms.length === 0 && (
          <NoRooms
            animate={{ opacity: 1, transition: { duration: 0.6 } }}
            initial={{ opacity: 0 }}
          >
            Currently No Rooms!
          </NoRooms>
        )}
        {rooms.map((room) => (
          <Room key={room.RoomID} variants={SingleRoom}>
            <span>
              Rooms ID: <span>{room.RoomID}</span>
            </span>
            <span>
              Status: <RoomStatus>{room.RoomStatus}</RoomStatus>
            </span>
            {room.RoomStatus === "waiting" && (
              <button
                onClick={() => {
                  if (!isLogged) {
                    (() => {
                      auth.signInWithPopup(provider);
                    })();
                  } else {
                    socket.emit(
                      "joinRoomReq",
                      { RoomId: room.RoomID },
                      playerData
                    );
                  }
                }}
              >
                Join
              </button>
            )}
          </Room>
        ))}
      </RoomsContainer>
    </Container>
  );
};

const Container = styled.div`
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const NoRooms = styled(motion.span)`
  align-self: center;
  justify-self: center;
  margin: 2rem 0;
  font-size: 1.5rem;
`;

const Room = styled(motion.div)`
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 100%;
  background: linear-gradient(
    to bottom right,
    rgba(56, 62, 86, 1),
    rgba(56, 62, 86, 0.5) 50%
  );
  margin: 0.6rem 0;
  padding: 0.5rem 0;
  /* border: 1px solid #f9f9f9; */
  @media screen and (max-width: 800px) {
    padding: 1rem 0.5rem;
  }
`;

const RoomStatus = styled.span`
  text-transform: uppercase;
`;

const RoomsContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Headline = styled(motion.h3)`
  color: #f9f9f9;
  font-size: 1.4rem;
  text-transform: uppercase;
  margin: 0.8rem 0;
`;

export default RoomLobby;
