import React, { useState } from "react";
import { AiChatService } from '@/services/AiChatService';

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = { sender: "user", text: input };
      setMessages([...messages, userMessage]);
      const currentInput = input;
      setInput("");
      try {
        const result = await AiChatService.sendMessage(currentInput);
        if (result.success && result.data) {
          const aiMessage: Message = { sender: "ai", text: result.data.message };
          setMessages((prevMessages) => [...prevMessages, aiMessage]);
        } else {
            if (typeof result.error === 'string') {
                throw new Error(result.error);
            }
            throw new Error("Failed to get response from AI.");
        }
      } catch (error) {
        console.error("Error sending message to AI:", error);
        const errorMessage: Message = {
          sender: "ai",
          text: "Sorry, I'm having trouble connecting. Please try again later.",
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 mb-2 ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 flex">
        <input
          type="text"
          className="flex-1 border rounded-l-lg p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          className="bg-blue-500 text-white rounded-r-lg px-4"
          onClick={handleSend}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AiChat;