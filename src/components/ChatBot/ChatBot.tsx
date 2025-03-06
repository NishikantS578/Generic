import React, { useState } from "react";
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

const ChatBot: React.FC<ChatBotProps> = ({
  apiKey,
  botName = "AI Assistant",
  initialMessage = "Hi! How can I help you today?",
  primaryColor = "#007bff",
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
  const aiService = React.useMemo(() => new AIService(apiKey), [apiKey]);

  React.useEffect(() => {
    const context = ContextCollector.collectWebsiteContext();
    aiService.setContext(context);
  }, [aiService]);

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
      // Convert messages to the format expected by AIService
      const messageHistory = messages.map((msg) => ({
        content: msg.content,
        sender: msg.sender,
        timestamp: msg.timestamp,
      }));

      // Add the new user message to history
      messageHistory.push({
        content: userMessage.content,
        sender: userMessage.sender,
        timestamp: userMessage.timestamp,
      });

      // Get response with full conversation history
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
      <div className={`chatbot-container-${isOpen ? "open" : "closed"}`}>
        <div
          className="chatbot-header"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span>{botName}</span>
          <button className="close-button">{isOpen ? "−" : "+"}</button>
        </div>

        {isOpen && (
          <>
            <div className="messages-container">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.sender}-message`}
                >
                  {message.content}
                </div>
              ))}
            </div>
            <div className="input-container">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button onClick={handleSendMessage}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatBot;
