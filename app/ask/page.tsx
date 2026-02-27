"use client";

import { useState, useRef, useEffect } from "react";
import { TopNav, BottomNav } from "@/components/Navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

type Message = {
  id: string;
  text: string;
  sender: "user" | "stoqy";
  timestamp: Date;
};

const SUGGESTED_QUESTIONS = [
  "How do I care for a sick cow?",
  "What vitamins should I give my livestock?",
  "What's the best feeding schedule for goats?",
  "How can I verify a livestock listing?",
  "What are signs of healthy livestock?",
];

export default function AskPage() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm Stoqy, your Livestoq Personal AI Assistant. I can help you with livestock health, feeding, nutrition, medicine, marketplace questions, and general livestock management. How can I assist you today?",
      sender: "stoqy",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // In a real implementation, this would call an AI API
      // For now, we just show a placeholder response
      const stoqyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to help! This is a demo interface. In production, I would provide real-time AI-powered guidance on livestock health, care, feeding, nutrition, medicine suggestions, marketplace assistance, and general livestock management questions. Feel free to ask me anything about livestock!",
        sender: "stoqy",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, stoqyMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <TopNav />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="glass-panel p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-400/90 rounded-3xl mb-4 shadow-[0_0_40px_rgba(52,211,153,0.9)]">
              <svg
                className="w-8 h-8 text-slate-950"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-50 mb-4">
              Authentication Required
            </h2>
            <p className="text-slate-300 mb-6">
              Please sign in to access Stoqy, your Personal AI Assistant.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="btn-primary px-6 py-3"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 rounded-2xl font-semibold text-slate-50 bg-slate-900/40 border border-white/15 hover:bg-slate-900/80"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
        <BottomNav />
        <div className="h-20 md:hidden" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-6 glass-panel p-4 sm:p-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-emerald-400/90 rounded-3xl flex items-center justify-center shadow-[0_0_35px_rgba(52,211,153,0.9)]">
              <span className="text-2xl">🤖</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-50">Stoqy</h1>
              <p className="text-sm text-slate-300">Livestoq Personal AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 border ${
                  message.sender === "user"
                    ? "bg-emerald-400/90 text-slate-950 border-emerald-300/60 shadow-[0_10px_35px_rgba(52,211,153,0.75)]"
                    : "bg-slate-900/60 text-slate-50 border-white/10 shadow-[0_10px_35px_rgba(15,23,42,0.9)]"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-emerald-100/90"
                      : "text-slate-400"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-slate-300 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(question)}
                  className="px-4 py-2 bg-slate-900/60 border border-white/10 rounded-xl text-sm text-slate-100 hover:bg-slate-900/90 hover:border-emerald-300/50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="glass-panel p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Stoqy anything about livestock..."
              className="flex-1 px-4 py-2 glass-input"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-2 text-center">
            Stoqy can help with health, feeding, nutrition, medicine, marketplace, and management questions
          </p>
        </div>
      </div>

      <BottomNav />
      <div className="h-20 md:hidden" />
    </div>
  );
}
