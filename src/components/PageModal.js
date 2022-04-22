import React, { useContext } from "react";
import Modal from "react-modal";
import { ModalContext } from "../context/ModalContext";
import styled from "styled-components";

Modal.setAppElement("#root");

const PageModal = () => {
  const { Open, Text } = useContext(ModalContext);
  const [modalOpen, setModalOpen] = Open;
  const [modalText, setModalText] = Text;
  return (
    <Modal
      isOpen={modalOpen}
      style={{
        overlay: {
          backgroundColor: "rgba(0,0,0,0.5)",
        },
        content: {
          backgroundColor: "#f3f3f3",
          color: "#333",
          bottom: "initial",
        },
      }}
      closeTimeoutMS={400}
      onRequestClose={() => {
        setModalOpen(false);
      }}
      shouldCloseOnOverlayClick={true}
    >
      <ContentPara>{modalText}</ContentPara>
      <Button
        onClick={() => {
          setModalOpen(false);
        }}
      >
        Close
      </Button>
    </Modal>
  );
};

const ContentPara = styled.p`
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

const Button = styled.button`
  /* text-transform: uppercase;
  font-weight: 500;
  font-family: "Barlow Semi Condensed", sans-serif;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 0.4rem 1rem; */
  margin: 1rem 0;
`;

export default PageModal;
