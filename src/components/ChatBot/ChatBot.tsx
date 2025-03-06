import React, { useState } from "react";
import "./ChatBot.css";
interface ChatBotProps {}

const ChatBot: React.FC<ChatBotProps> = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className=" main-container">
      <div
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        className={`chatbot-container-${isOpen ? "open" : "closed"}`}
      ></div>
    </div>
  );
};

export default ChatBot;
