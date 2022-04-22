import React, { useContext, useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { PlayerContext } from "../context/PlayerContext";
import { RoomContext } from "../context/RoomContext";
import { SocketContext } from "../context/SocketContext";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../context/ModalContext";
import { motion } from "framer-motion";
import {
  TextFadeIn,
  PlayerAnim,
  OpponentAnim,
} from "../animations/WaitingAnimations";

const WaitingScreen = () => {
  const [socket, setSocket] = useState(useContext(SocketContext));

  const { Player, Logged } = useContext(PlayerContext);
  const [playerData, setPlayerData] = Player;
  const { CR } = useContext(RoomContext);
  const [currentRoom, setCurrentRoom] = CR;
  const [isLogged, setIsLogged] = Logged;
  const [playerJoined, setPlayerJoined] = useState(false);
  const navigate = useNavigate();

  const { Open, Text } = useContext(ModalContext);
  const [modalOpen, setModalOpen] = Open;
  const [modalText, setModalText] = Text;

  useEffect(() => {
    if (!isLogged) {
      navigate("/");
      return;
    }

    let gameRedirect;
    socket.on("playerJoined", (room, id) => {
      if (id !== socket.id) {
        setCurrentRoom({
          roomId: room.RoomID,
          roomPlayers: room.RoomPlayers,
          roomHost: room.RoomHost,
          firstPlayer: room.RoomHost,
          secondPlayer: room.secondPlayer,
        });
      }
      setPlayerJoined(true);
    });

    socket.on("entered", () => {
      setPlayerJoined(true);
      gameRedirect = setTimeout(() => {
        navigate("/game");
      }, 5000);
    });

    socket.on("leaveSecondPlayer", () => {
      clearTimeout(gameRedirect);
      setPlayerJoined(false);
      setCurrentRoom({
        roomId: "",
        roomPlayers: 0,
        roomHost: {},
        firstPlayer: {},
        secondPlayer: {},
      });
      navigate("/");
      setModalText("Host left the game!");
      setModalOpen(true);
    });

    socket.on("opponentWentOffline", (id) => {
      if (id === currentRoom.roomHost.id) {
        socket.emit("cancelRoomWaiting", currentRoom.roomId);
      } else {
        socket.emit("secondPlayerOffineWaiting", currentRoom.roomId);
      }
    });

    socket.on("cancelTimeout", () => {
      clearTimeout(gameRedirect);
    });

    socket.on("roomUpdate", () => {
      clearTimeout(gameRedirect);
      setPlayerJoined(false);
      setCurrentRoom((prev) => ({
        ...prev,
        roomPlayers: 1,
        secondPlayer: {},
      }));
      setModalText("Opponent left. Waiting for other...");
      setModalOpen(true);
    });

    return function cleanup() {
      setSocket(null);
    };
  }, []);
  return (
    <Container>
      <RoomId variants={TextFadeIn} animate="show" initial="hidden">
        Room ID: {currentRoom.roomId}
      </RoomId>
      {!playerJoined && (
        <Headline variants={TextFadeIn} animate="show" initial="hidden">
          Waiting For Other Player...
        </Headline>
      )}
      <FlexDiv>
        <FlexData variants={PlayerAnim} animate="show" initial="hidden">
          <PlayerImg src={playerData.picture} alt="Your Picture" />
          <PlayerName>{playerData.fullName}</PlayerName>
        </FlexData>
        <FlexData variants={OpponentAnim} animate="show" initial="hidden">
          {playerJoined ? (
            <>
              <PlayerImg
                src={currentRoom.secondPlayer.picture}
                alt="Opponent Picture"
              />
              <OpponentName>{currentRoom.secondPlayer.fullName}</OpponentName>
            </>
          ) : (
            <WaitingText></WaitingText>
          )}
        </FlexData>
      </FlexDiv>
      {playerJoined && (
        <>
          <Headline>Starting Game Soon...</Headline>
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const Animate = keyframes`
  0% {
    content: "Waiting";
  }
  25% {
    content: "Waiting.";
  }
  50% {
    content: "Waiting..";
  }
  75% {
    content: "Waiting...";
  }
`;

const WaitingText = styled(motion.span)`
  align-self: center;
  justify-self: center;
  &::after {
    font-size: 1.5rem;
    content: "Waiting";
    animation: ${Animate} 3s linear infinite;
    letter-spacing: 1px;
  }
`;

const PlayerImg = styled.img`
  width: 10vw;
  border-radius: 20%;
  align-self: center;
  @media screen and (max-width: 600px) {
    width: 10vh;
  }
`;

const PlayerName = styled.p`
  font-size: 2rem;
  margin: 1.5rem 0;
  @media screen and (max-width: 600px) {
    font-size: 1rem;
    align-self: center;
  }
`;

const OpponentName = styled.p`
  font-size: 2rem;
  margin: 1.5rem 0;
  align-self: flex-end;
  @media screen and (max-width: 600px) {
    font-size: 1rem;
    align-self: center;
  }
`;

const FlexDiv = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  height: 100%;
  @media screen and (max-width: 600px) {
    flex-direction: column;
  }
`;

const FlexData = styled(motion.div)`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  width: 40vw;
  border: 2px solid #f9f9f9;
  margin: 2rem 0;
  border-radius: 1rem;
  @media screen and (max-width: 600px) {
    width: 100%;
    margin: 0.5rem 0;
    padding: 1rem;
  }
`;

const RoomId = styled(motion.p)`
  padding: 0.4rem 0.7rem;
  margin: 1rem auto;
  width: fit-content;
  border-radius: 0.5rem;
  background-color: #f9f9f9;
  color: #383e56;
  @media screen and (max-width: 600px) {
    margin: 0.5rem auto;
  }
`;

const Headline = styled(motion.h3)`
  margin: 1rem 0;
  text-align: center;
`;

export default WaitingScreen;
