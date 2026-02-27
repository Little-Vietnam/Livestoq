"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { TopNav, BottomNav } from "@/components/Navigation";
import { useAuth } from "@/components/AuthContext";
import Link from "next/link";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

type Message = {
  id: string;
  text: string;
  sender: "user" | "stoqy";
  timestamp: Date;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
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
      text: "Hello! I'm Stoqy AI, your Livestoq Personal Assistant. I can help you with livestock health, feeding, nutrition, medicine, marketplace questions, and general livestock management. You can type or tap the mic to talk to me!",
      sender: "stoqy",
      timestamp: new Date(),
    },
  ]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ---- Speech Recognition (voice input) ----
  const startListening = useCallback(() => {
    const w = window as unknown as IWindow;
    const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript.trim()) {
        handleSend(transcript.trim());
      }
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setError(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // ---- Speech Synthesis (voice output) ----
  const speak = useCallback((text: string) => {
    if (!voiceEnabled) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    // Pick a natural-sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(
      (v) =>
        v.name.includes("Google") ||
        v.name.includes("Samantha") ||
        v.name.includes("Daniel")
    );
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ---- Send message (text or voice) ----
  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isTyping) return;

    setError(null);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const newChatHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: messageText },
    ];
    setChatHistory(newChatHistory);

    setIsTyping(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newChatHistory }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const replyText = data.reply;

      const stoqyMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: replyText,
        sender: "stoqy",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, stoqyMessage]);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: replyText },
      ]);

      // Speak the response
      speak(replyText);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setError(errMsg);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${errMsg}. Please try again.`,
        sender: "stoqy",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white">
        <TopNav />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-primary-600"
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access Stoqy AI, your Personal Voice Assistant.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/login"
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50"
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopNav />

      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className={`w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center ${isSpeaking ? "ring-4 ring-primary-300 ring-opacity-50 animate-pulse" : ""}`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.494 4.316a2.25 2.25 0 01-2.13 1.559H8.624a2.25 2.25 0 01-2.13-1.559L5 14.5m14 0H5" />
                  </svg>
                </div>
                {isSpeaking && (
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Stoqy AI</h1>
                <p className="text-sm text-gray-600">
                  {isTyping
                    ? "Thinking..."
                    : isSpeaking
                    ? "Speaking..."
                    : isListening
                    ? "Listening..."
                    : "Livestoq Voice Assistant"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Voice output toggle */}
              <button
                onClick={() => {
                  if (isSpeaking) stopSpeaking();
                  setVoiceEnabled(!voiceEnabled);
                }}
                className={`p-2 rounded-full transition-colors ${
                  voiceEnabled
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-400"
                }`}
                title={voiceEnabled ? "Mute voice responses" : "Enable voice responses"}
              >
                {voiceEnabled ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8H4a1 1 0 00-1 1v6a1 1 0 001 1h2.5l4.5 4V4L6.5 8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707A1 1 0 0112 5v14a1 1 0 01-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>
              {/* Stop speaking */}
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="p-2 rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200"
                  title="Stop speaking"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.sender === "stoqy" && (
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.494 4.316a2.25 2.25 0 01-2.13 1.559H8.624a2.25 2.25 0 01-2.13-1.559L5 14.5m14 0H5" />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  message.sender === "user"
                    ? "bg-primary-600 text-white"
                    : "bg-white text-gray-900 border border-gray-200 shadow-sm"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sender === "user"
                      ? "text-primary-100"
                      : "text-gray-400"
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
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.494 4.316a2.25 2.25 0 01-2.13 1.559H8.624a2.25 2.25 0 01-2.13-1.559L5 14.5m14 0H5" />
                </svg>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(question)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-primary-50 hover:border-primary-300 transition-colors shadow-sm"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Voice + Input area */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-lg">
          {/* Listening indicator */}
          {isListening && (
            <div className="flex items-center justify-center mb-3 py-2">
              <div className="flex items-center space-x-2 text-red-500">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-semibold">Listening... speak now</span>
                <button
                  onClick={stopListening}
                  className="ml-2 text-xs text-gray-500 underline hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            {/* Mic button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isTyping}
              className={`p-3 rounded-full transition-all flex-shrink-0 ${
                isListening
                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30 animate-pulse"
                  : "bg-gray-100 text-gray-600 hover:bg-primary-100 hover:text-primary-700"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Text input */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask Stoqy AI anything about livestock..."
              disabled={isTyping || isListening}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />

            {/* Send button */}
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-3 bg-primary-600 text-white rounded-full font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-primary-500/20 flex-shrink-0"
              title="Send message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Tap the mic to talk or type your question. Stoqy AI can help with health, feeding, nutrition, medicine &amp; more.
          </p>
        </div>
      </div>

      <BottomNav />
      <div className="h-20 md:hidden" />
    </div>
  );
}
