import React, { useRef, useState, useEffect } from "react";
import "./ChatBot.css";
import { AIService } from "../../services/AIService";
import { ContextCollector } from "../../utils/ContextCollector";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatBotProps {
  apiKey: string;
  botName?: string;
  initialMessage?: string;
  primaryColor?: string;
}

const LoadingDots = () => (
  <div className="loading-dots">
    <div className="dot"></div>
    <div className="dot"></div>
    <div className="dot"></div>
  </div>
);

const ChatIcon = () => (
  <svg
    className="chat-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const ChatBot: React.FC<ChatBotProps> = ({
  apiKey,
  botName = "AI Assistant",
  initialMessage = "Hi! How can I help you today?",
  primaryColor = "#4299E1",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: initialMessage,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Add a ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll when chat is opened
  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  const aiService = React.useMemo(() => new AIService(apiKey), [apiKey]);

  React.useEffect(() => {
    const context = ContextCollector.collectWebsiteContext();
    aiService.setContext(context);
  }, [aiService]);

  React.useEffect(() => {
    document.documentElement.style.setProperty(
      "--chatbot-accent",
      primaryColor
    );
  }, [primaryColor]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const messageHistory = messages.map((msg) => ({
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp,
      }));

      messageHistory.push({
        content: userMessage.content,
        sender: userMessage.sender,
        timestamp: userMessage.timestamp,
      });

      const response = await aiService.getResponse(messageHistory);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error getting bot response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div
        className={`chatbot-container-${isOpen ? "open" : "closed"}`}
        onClick={() => !isOpen && setIsOpen(true)}
      >
        {isOpen ? (
          <>
            <div className="chatbot-header">
              <span>{botName}</span>
              <button
                className="close-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                ×
              </button>
            </div>
            <div className="messages-container" ref={messagesContainerRef}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender}-message`}
                >
                  {message.content}
                </div>
              ))}
              {isLoading && <LoadingDots />}
              {/* Add this div at the end of messages */}
              <div ref={messagesEndRef} />
            </div>
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <button onClick={handleSendMessage} disabled={isLoading}>
                Send
                {!isLoading && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </div>
          </>
        ) : (
          <ChatIcon />
        )}
      </div>
    </div>
  );
};

export default ChatBot;
