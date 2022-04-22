import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import RockImage from "../img/icon-rock.svg";
import PaperImage from "../img/icon-paper.svg";
import ScissorImage from "../img/icon-scissors.svg";
import TriangleBg from "../img/bg-triangle.svg";
import { RoomContext } from "../context/RoomContext";
import { SocketContext } from "../context/SocketContext";
import { PlayerContext } from "../context/PlayerContext";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../context/ModalContext";
import { motion } from "framer-motion";
import {
  GameAreaAnim,
  ChoiceAnim,
  BgTriangleAnim,
} from "../animations/GameAnimations";
import { PlayerAnim, OpponentAnim } from "../animations/WaitingAnimations";

const GameArena = () => {
  const [playerTurn, setPlayerTurn] = useState(false);
  const { CR } = useContext(RoomContext);
  const [currentRoom, setCurrentRoom] = CR;
  const { Player, Logged } = useContext(PlayerContext);
  const [isLogged, setIsLogged] = Logged;
  const [playerData, setPlayerData] = Player;
  const [choose, setChoose] = useState("");
  const [round, setRound] = useState(0);
  const [firstChoice, setFirstChoice] = useState("");
  const [secondPlayerImagePath, setSecondPlayerImagePath] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [youWin, setYouWin] = useState(false);
  const [tie, setTie] = useState(false);
  const navigate = useNavigate();

  const { Open, Text } = useContext(ModalContext);
  const [modalOpen, setModalOpen] = Open;
  const [modalText, setModalText] = Text;

  const [myPoints, setMyPoints] = useState(0);
  const [opponentPoints, setOpponentPoints] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const [count, setCount] = useState(5);

  const [socket, setSocket] = useState(useContext(SocketContext));

  useEffect(() => {
    if (!isLogged) {
      navigate("/");
      return;
    }

    socket.on("opponentWentOffline", () => {
      socket.emit("destroyRoomOffline", currentRoom.roomId);
    });

    socket.emit("gameStart", currentRoom);
    socket.on("takeTurn", (id) => {
      if (
        currentRoom.roomHost.id === id &&
        currentRoom.roomHost.email === playerData.email
      ) {
        setPlayerTurn(true);
      }
    });
    socket.on("secondPlayerTurn", (FirstChoice) => {
      setPlayerTurn(true);
      setFirstChoice(FirstChoice);
    });

    socket.on("roomClosed", () => {
      socket.emit("leaveMe", currentRoom.roomId);
      setRound(0);
      setCurrentRoom({
        roomId: "",
        roomPlayers: 0,
        roomHost: {},
        firstPlayer: {},
        secondPlayer: {},
      });
      navigate("/");
      setModalText("Opponent left the match!");
      setModalOpen(true);
    });

    socket.on("results", (result) => {
      setRound(result.round);

      let countUpdate = setInterval(() => {
        setCount((prev) => prev - 1);
      }, 1000);

      if (result.firstPlayer.name === playerData.fullName) {
        if (result.firstPlayer.win) {
          setYouWin(true);
        } else if (result.tie) {
          setTie(true);
        }
        setSecondPlayerImagePath(result.secondPlayer.img);
        setMyPoints(result.firstPlayer.points);
        setOpponentPoints(result.secondPlayer.points);
      } else if (result.secondPlayer.name === playerData.fullName) {
        if (result.secondPlayer.win) {
          setYouWin(true);
        } else if (result.tie) {
          setTie(true);
        }
        setSecondPlayerImagePath(result.firstPlayer.img);
        setMyPoints(result.secondPlayer.points);
        setOpponentPoints(result.firstPlayer.points);
      }

      setPlayerTurn(false);
      setShowResults(true);

      setTimeout(() => {
        setShowResults(false);
        setTie(false);
        setYouWin(false);
        setSecondPlayerImagePath("");
        setFirstChoice("");
        setChoose("");
        clearInterval(countUpdate);
        setCount(5);
        socket.emit("restartRound", currentRoom.roomId);
      }, 5000);
    });

    return function cleanup() {
      setSocket(null);
    };
  }, []);

  return (
    <Container>
      <PlayContainer>
        <PlayerStats variants={PlayerAnim} initial="hidden" animate="shows">
          <PlayerImg
            src={currentRoom.firstPlayer.picture}
            alt="profile image"
          />
          <PlayerName>{currentRoom.firstPlayer.fullName}</PlayerName>
          <StatusDiv>
            <p>You Choose</p>
            <StatusImage src={choose} alt="" />
          </StatusDiv>
        </PlayerStats>
        <GameContainer
          variants={GameAreaAnim}
          animate="show"
          initial="hidden"
          exit="exit"
        >
          <Paper>
            <PaperImg
              src={PaperImage}
              alt="Paper"
              variants={ChoiceAnim}
              onClick={() => {
                if (firstChoice.length > 0) {
                  setChoose(PaperImage);
                  socket.emit(
                    "secondTurnTaked",
                    "paper",
                    currentRoom.roomId,
                    PaperImage,
                    playerData.fullName,
                    round,
                    myPoints
                  );
                  setPlayerTurn(false);
                } else {
                  setChoose(PaperImage);
                  socket.emit(
                    "turnTaked",
                    "paper",
                    currentRoom.roomId,
                    PaperImage,
                    playerData.fullName,
                    myPoints
                  );
                  setPlayerTurn(false);
                }
              }}
            />
          </Paper>
          <Scissor>
            <ScissorImg
              src={ScissorImage}
              alt="Scissor"
              variants={ChoiceAnim}
              onClick={() => {
                if (firstChoice.length > 0) {
                  setChoose(ScissorImage);
                  socket.emit(
                    "secondTurnTaked",
                    "scissor",
                    currentRoom.roomId,
                    ScissorImage,
                    playerData.fullName,
                    round,
                    myPoints
                  );
                  setPlayerTurn(false);
                } else {
                  setChoose(ScissorImage);
                  socket.emit(
                    "turnTaked",
                    "scissor",
                    currentRoom.roomId,
                    ScissorImage,
                    playerData.fullName,
                    myPoints
                  );
                  setPlayerTurn(false);
                }
              }}
            />
          </Scissor>
          <Rock>
            <RockImg
              src={RockImage}
              alt="Rock"
              variants={ChoiceAnim}
              onClick={() => {
                if (firstChoice.length > 0) {
                  setChoose(RockImage);
                  socket.emit(
                    "secondTurnTaked",
                    "rock",
                    currentRoom.roomId,
                    RockImage,
                    playerData.fullName,
                    round,
                    myPoints
                  );
                  setPlayerTurn(false);
                } else {
                  setChoose(RockImage);
                  socket.emit(
                    "turnTaked",
                    "rock",
                    currentRoom.roomId,
                    RockImage,
                    playerData.fullName,
                    myPoints
                  );
                  setPlayerTurn(false);
                }
              }}
            />
          </Rock>
          <TriBg
            variants={BgTriangleAnim}
            src={TriangleBg}
            alt="Triangle-Background"
          />
          {!playerTurn && (
            <WaitBackdrop>
              {showResults ? "Results" : "Wait, Opponent is taking turn."}
            </WaitBackdrop>
          )}
        </GameContainer>
        <OpponentStats variants={OpponentAnim} initial="hidden" animate="shows">
          <PlayerImg
            src={currentRoom.secondPlayer.picture}
            alt="profile image"
          />
          <PlayerName>{currentRoom.secondPlayer.fullName}</PlayerName>
          <StatusDiv>
            <p>Opponent Choose</p>
            {showResults && <StatusImage src={secondPlayerImagePath} alt="" />}
          </StatusDiv>
        </OpponentStats>
      </PlayContainer>
      {showResults && (
        <Results>
          <p>{tie ? "Tied" : youWin ? "You Win!" : "You Lose!"}</p>
          <p>Next Round Starting in {count} seconds</p>
        </Results>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  padding: 1rem;
  flex-direction: column;
`;

const PlayContainer = styled.div`
  display: grid;
  grid-template-columns: 0.5fr 1fr 0.5fr;
  grid-template-rows: 1fr;
  grid-template-areas: "playerOne game playerTwo";
  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: "game game" "playerOne playerTwo";
  }
`;

const PlayerStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  border: 2px solid #f9f9f9;
  grid-area: playerOne;
  @media screen and (max-width: 800px) {
    align-items: flex-start;
  }
`;

const OpponentStats = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 1rem;
  border: 2px solid #f9f9f9;
  grid-area: playerTwo;
  @media screen and (max-width: 800px) {
    align-items: flex-start;
  }
`;

const PlayerImg = styled.img`
  width: 10vw;
  height: 10vw;
  border-radius: 50%;
  align-self: center;
`;

const StatusDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  width: 100%;
`;

const StatusImage = styled.img`
  width: 7vw;
  height: auto;
  margin: 0.4rem;
  filter: invert(1);
  @media screen and (max-width: 800px) {
    margin: 1rem;
  }
`;

const PlayerName = styled.p`
  font-size: 1.4rem;
  color: #f9f9f9;
  margin: 1rem 0;
`;

const GameContainer = styled(motion.div)`
  display: grid;
  position: relative;
  padding: 1rem;
  margin: 0.5rem auto;
  width: 100%;
  grid-auto-columns: 1fr 1fr;
  grid-auto-rows: 1fr 1fr;
  grid-template-areas: "paper scissor" "rock rock";
  place-items: center;
  grid-area: game;
`;

const WaitBackdrop = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-size: 2rem;
  backdrop-filter: blur(2px) brightness(0.7);
  -webkit-backdrop-filter: blur(2px) brightness(0.7);
  border-radius: 1rem;
  z-index: 2;
  @media screen and (max-width: 900px) {
    font-size: 1.3rem;
  }
`;

const TriBg = styled(motion.img)`
  pointer-events: none;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 50%;
  z-index: -1;
`;

const Paper = styled.div`
  grid-area: paper;
`;
const Rock = styled.div`
  grid-area: rock;
`;
const Scissor = styled.div`
  grid-area: scissor;
`;

const RockImg = styled(motion.img)`
  border-radius: 50%;
  background: white;
  border: 1rem solid hsl(349, 70%, 56%);
  box-shadow: 0 6px 0 hsl(349, 71%, 52%), inset 0 6px 0 hsl(217, 16%, 85%);
  cursor: pointer;
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  padding: 1.2rem;
  width: 15vw;
  height: auto;
  max-width: 8rem;
  @media screen and (max-width: 800px) {
    width: 25vw;
    max-width: 8rem;
  }
`;

const PaperImg = styled(motion.img)`
  border-radius: 50%;
  background: white;
  border: 1rem solid hsl(230, 89%, 65%);
  padding: 1.2rem;
  width: 15vw;
  height: auto;
  box-shadow: 0 6px 0 hsl(230, 89%, 62%), inset 0 6px 0 hsl(217, 16%, 85%);
  cursor: pointer;
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  max-width: 8rem;
  @media screen and (max-width: 800px) {
    width: 25vw;
    max-width: 8rem;
  }
`;

const ScissorImg = styled(motion.img)`
  border-radius: 50%;
  background: white;
  border: 1rem solid hsl(40, 84%, 53%);
  padding: 1.2rem;
  width: 15vw;
  max-width: 8rem;
  height: auto;
  box-shadow: 0 6px 0 hsl(39, 89%, 49%), inset 0 6px 0 hsl(217, 16%, 85%);
  cursor: pointer;
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  @media screen and (max-width: 800px) {
    width: 25vw;
    max-width: 8rem;
  }
`;

const Results = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 1rem 0;
  text-align: center;
  font-size: 1.5rem;
`;

export default GameArena;
