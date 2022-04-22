import React, { useContext } from "react";
import styled from "styled-components";
import { provider, auth } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { PlayerContext } from "../context/PlayerContext";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { RoomContext } from "../context/RoomContext";
import { SocketContext } from "../context/SocketContext";
import { motion } from "framer-motion";
import { NavMainAnimation } from "../animations/NavAnimations";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";

const Nav = () => {
  const location = useLocation();
  const { Player, Logged } = useContext(PlayerContext);
  const [playerData, setPlayerData] = Player;
  const [isLogged, setIsLogged] = Logged;
  const socket = useContext(SocketContext);
  const { CR } = useContext(RoomContext);
  const [currentRoom, setCurrentRoom] = CR;
  const path = location.pathname;

  const [user] = useAuthState(auth);

  const loginHandle = async () => {
    signInWithPopup(auth, provider);
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

  const LogoutHandle = () => {
    setIsLogged(false);
    setPlayerData({
      fullName: "",
      email: "",
      picture: "",
    });
    signOut(auth);
  };

  return (
    <motion.header variants={NavMainAnimation} animate="show" initial="hidden">
      <NavBar>
        <Headline>Rock Paper Scissor Online</Headline>
        {isLogged ? (
          <UserDiv>
            <UserSpan>{playerData.fullName}</UserSpan>
            <UserImage src={playerData.picture} alt="account image" />
            <button onClick={LogoutHandle}>Log Out</button>
          </UserDiv>
        ) : (
          <LoginBtn onClick={loginHandle}>Login</LoginBtn>
        )}
        {["/waiting", "/game"].includes(path) && (
          <Link
            onClick={() => {
              if (path === "/waiting") {
                if (currentRoom.roomHost.email === playerData.email) {
                  socket.emit("cancelRoom", currentRoom.roomId);
                } else {
                  socket.emit("secondPlayerLeft", currentRoom.roomId);
                }
              } else if (path === "/game") {
                socket.emit("destroyRoom", currentRoom.roomId);
              }
              setCurrentRoom({
                roomId: "",
                roomPlayers: 0,
                roomHost: {},
                firstPlayer: {},
                secondPlayer: {},
              });
            }}
            to="/"
          >
            Exit
          </Link>
        )}
        {["/", "/rooms"].includes(path) && (
          <Link
            to={path === "/" ? "/rooms" : "/"}
            onClick={() => {
              socket.emit("showRooms");
            }}
          >
            {path === "/" ? "Rooms" : "Home"}
          </Link>
        )}
      </NavBar>
    </motion.header>
  );
};

const NavBar = styled.nav`
  width: 100%;
  height: 10vh;
  background: #262b40;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  @media only screen and (max-width: 600px) {
    flex-direction: column;
    height: 20vh;
  }
`;

const UserDiv = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const UserSpan = styled.span`
  position: relative;
`;

const UserImage = styled.img`
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 0.6rem;
`;

const Headline = styled.h3`
  text-align: center;
  font-size: 1.5rem;
  @media screen and (max-width: 425px) {
    font-size: 1.3rem;
  }
`;

const LoginBtn = styled.button`
  background: #eee;
  color: #1e212d;
`;

export default Nav;
