import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { SocketContext } from "../context/SocketContext";
import { PlayerContext } from "../context/PlayerContext";
import { provider, auth } from "../firebase";
import { RoomContext } from "../context/RoomContext";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../context/ModalContext";
import { FormAnim } from "../animations/JoinCreateAnimations";
import { motion } from "framer-motion";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";

const Landing = () => {
  const [join, setJoin] = useState(true);
  const [roomInfo, setRoomInfo] = useState({
    RoomId: "",
  });
  const navigate = useNavigate();

  const socket = useContext(SocketContext);

  const { CR } = useContext(RoomContext);
  const [currentRoom, setCurrentRoom] = CR;

  const { Logged, Player } = useContext(PlayerContext);
  const [isLogged, setIsLogged] = Logged;
  const [playerData, setPlayerData] = Player;

  const { Open, Text } = useContext(ModalContext);
  const [modalOpen, setModalOpen] = Open;
  const [modalText, setModalText] = Text;

  const [user] = useAuthState(auth);

  const [checkBox, setCheckBox] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogged) {
      if (join) {
        socket.emit("joinRoomReq", roomInfo, playerData);
      } else {
        socket.emit("generateRoom", playerData);
      }
    } else {
      (() => {
        signInWithPopup(auth, provider);
      })();
    }
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
    socket.on("roomGenerated", (roomObj) => {
      setCurrentRoom((prev) => ({
        ...prev,
        roomId: roomObj.RoomID,
        roomPlayers: roomObj.RoomPlayers,
        roomHost: roomObj.RoomHost,
        firstPlayer: roomObj.RoomHost,
      }));
      navigate("/waiting");
    });
    socket.on("playerJoined", (room, id) => {
      if (id !== socket.id) {
        // Host Player //
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
    socket.on("roomJoinFailed", (msg) => {
      setModalText(msg);
      setModalOpen(true);
    });
    document.cookie = "";
  }, []);

  return (
    <Container>
      <Form
        onSubmit={handleSubmit}
        autocomplete="off"
        variants={FormAnim}
        initial="hidden"
        animate="show"
      >
        <Divider>
          <h3>{join ? "Join Room." : "Create Room."}</h3>
        </Divider>
        <Divider>
          <Button
            type="button"
            onClick={() => {
              setJoin(true);
            }}
          >
            JOIN ROOM
          </Button>
          <Button
            type="button"
            onClick={() => {
              setJoin(false);
            }}
          >
            CREATE ROOM
          </Button>
        </Divider>
        {join && (
          <Divider>
            <label htmlFor="room">Room Id: </label>
            <TextField
              id="room"
              onChange={(e) => {
                setRoomInfo({ ...roomInfo, RoomId: e.target.value });
              }}
              type="text"
              autocomplete="off"
              autofil="off"
              placeholder="ex: qCyJ0"
            ></TextField>
          </Divider>
        )}
        {!join && (
          <>
            <div>
              <p>This will create a room with random ID.</p>
              <p>
                Share that ID with your friend or a random player will join from
                Rooms Page.
              </p>
            </div>
            <Divider>
              <label htmlFor="checkbox">Add this room in Room Lobby: </label>
              <input
                onChange={() => {
                  setCheckBox((prev) => !prev);
                }}
                // onClick={() => {
                //   setCheckBox((prev) => !prev);
                // }}
                id="checkbox"
                checked={checkBox}
                type="checkbox"
              />
            </Divider>
          </>
        )}
        <Divider>
          <Button type="submit">{join ? "Join" : "Create"}</Button>
        </Divider>
      </Form>
    </Container>
  );
};

// STYLED COMPONENTS //

const Container = styled.div`
  display: flex;
  min-height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Form = styled(motion.form)`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  width: 90vw;
  max-width: 400px;
  height: 500px;
  background: linear-gradient(
    to bottom right,
    rgba(56, 62, 86, 1),
    rgba(56, 62, 86, 0.3) 50%
  );
  border-radius: 10px;
  padding: 1rem;
  margin: 2rem;
`;

const Divider = styled.div`
  margin: 1.4rem 0;
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`;

const Button = styled.button`
  background: #1e212d;
  color: #f9f9f9;
`;

const TextField = styled.input`
  padding: 0.5rem;
  border-radius: 0.5rem;
  outline: none;
  border: none;
`;

export default Landing;
