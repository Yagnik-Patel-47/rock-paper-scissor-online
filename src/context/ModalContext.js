import { useState, createContext } from "react";

export const ModalProvider = ({ children }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");
  return (
    <ModalContext.Provider
      value={{
        Open: [modalOpen, setModalOpen],
        Text: [modalText, setModalText],
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const ModalContext = createContext(ModalProvider);
