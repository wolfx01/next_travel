"use client";

import { useState, useEffect, useRef } from 'react';
import '@/app/styles/chatbot.css';

type Message = {
  text: string;
  className: 'user-msg' | 'bot-msg';
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load history
    const history = localStorage.getItem("chatHistory");
    if (history) {
      setMessages(JSON.parse(history));
    } else {
      const welcomeMsg: Message = { text: "Hello! I am your AI Travel Guide. 🌍✈️\nAsk me anything about destinations, planning, or culture!", className: 'bot-msg' };
      setMessages([welcomeMsg]);
      localStorage.setItem("chatHistory", JSON.stringify([welcomeMsg]));
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom
    if (chatboxRef.current) {
        chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const saveMessage = (msg: Message) => {
    const newMessages = [...messages, msg];
    setMessages(newMessages); // Set state immediately for UI response
    localStorage.setItem("chatHistory", JSON.stringify(newMessages));
    return newMessages;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { text: input.trim(), className: 'user-msg' };
    
    // Optimistic update
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    localStorage.setItem("chatHistory", JSON.stringify(updatedMessages));
    setInput("");

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text })
      });

      const data = await res.json();
      
      let botText = "";
      if (!res.ok) {
        botText = data.reply || "Error connecting to server.";
      } else {
        botText = data.reply;
      }

      const botMsg: Message = { text: botText, className: 'bot-msg' };
      const withBot = [...updatedMessages, botMsg];
      setMessages(withBot);
      localStorage.setItem("chatHistory", JSON.stringify(withBot));

    } catch (error) {
      console.error("Chat Error", error);
      const errorMsg: Message = { text: "Sorry, something went wrong.", className: 'bot-msg' };
      const withError = [...updatedMessages, errorMsg];
      setMessages(withError);
    }
  };

  return (
    <>
      <div id="chat-icon" onClick={() => setIsOpen(true)} style={{ display: isOpen ? 'none' : 'flex' }}>
        <video src="/video/robot.mp4" autoPlay loop muted playsInline></video>
        <span className="chatbot-text">Your Travel AI</span>
      </div>

      <div id="chat-window" style={{ display: isOpen ? 'flex' : 'none' }}>
        <button 
            id="close-chat-btn" 
            className="close-btn-style" 
            onClick={() => setIsOpen(false)}
        >×</button>
        
        <div id="chatbox" ref={chatboxRef}>
            {messages.map((msg, idx) => (
                <p key={idx} className={msg.className} dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, "<br>") }}></p>
            ))}
        </div>
        
        <div className="input-container">
          <input 
            type="text" 
            id="message" 
            placeholder="write your message..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <button id="sendBtn" onClick={handleSend}>
            <img src="/images/send-message.png" alt="Send" />
          </button>
        </div>
      </div>
    </>
  );
}
