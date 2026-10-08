"use client";

import { useState, useRef, useEffect } from "react";
import { BibiMascot } from "@/components/brand/BibiMascot";
import { Block } from "@/lib/missions/types";

type Message = {
  role: "user" | "bibi";
  content: string;
};

interface TanyaBibiProps {
  missionId: string;
  goal: string;
  program: Block[];
  attempts: number;
  isOpen: boolean;
  onClose: () => void;
  onHintUsed: () => void;
}

export function TanyaBibi({ missionId, goal, program, attempts, isOpen, onClose, onHintUsed }: TanyaBibiProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bibi", content: "Halo! Aku Bibi. Butuh bantuan dengan misi ini? 🤔" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: "user" as const, content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/bibi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          missionId,
          goal,
          program,
          attempts,
          message: text,
          history: messages.filter(m => m.role !== "bibi" || m.content !== "Halo! Aku Bibi. Butuh bantuan dengan misi ini? 🤔")
        }),
      });

      if (!res.ok) throw new Error("Gagal mengambil respon");
      
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "bibi", content: data.reply }]);
      
      if (data.isHint) {
        onHintUsed();
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bibi", content: "Maaf, Bibi sedang sibuk. Coba lagi nanti ya! 😟" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Aku bingung mulai dari mana",
    "Jelaskan pakai contoh dong",
    "Blok mana yang salah?"
  ];

  return (
    <div className="absolute bottom-4 right-4 w-80 sm:w-96 bg-white rounded-2xl shadow-pop flex flex-col overflow-hidden z-50 border-2 border-navy/10 animate-pop-in">
      {/* Header */}
      <div className="bg-peach px-4 py-3 flex justify-between items-center border-b-2 border-navy/10">
        <div className="flex items-center gap-2">
          <BibiMascot mood="happy" className="w-8 h-8" />
          <h3 className="font-display font-bold text-navy">Tanya Bibi AI</h3>
        </div>
        <button onClick={onClose} className="text-navy-700 hover:text-navy font-bold p-1">
          ✕
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto max-h-80 min-h-64 flex flex-col gap-3 bg-peach/5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-2xl max-w-[85%] text-sm ${
              msg.role === "user" 
                ? "bg-navy text-white rounded-tr-sm" 
                : "bg-white text-navy border-2 border-peach-300 rounded-tl-sm shadow-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-white text-navy border-2 border-peach-300 rounded-tl-sm shadow-sm text-sm flex gap-1">
              <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: "0.2s"}}>.</span><span className="animate-bounce" style={{animationDelay: "0.4s"}}>.</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions & Input */}
      <div className="p-3 bg-white border-t-2 border-navy/10 flex flex-col gap-2">
        {messages.length <= 2 && (
          <div className="flex flex-wrap gap-2 mb-1">
            {quickQuestions.map((q) => (
              <button 
                key={q} 
                onClick={() => sendMessage(q)}
                className="text-xs bg-peach-200 hover:bg-peach-300 text-navy-700 px-2 py-1 rounded-full text-left transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem("message") as HTMLInputElement;
            sendMessage(input.value);
            input.value = "";
          }}
          className="flex gap-2"
        >
          <input 
            type="text" 
            name="message"
            placeholder="Tanya ke Bibi..." 
            autoComplete="off"
            className="input flex-1 !py-2 !text-sm"
            disabled={isLoading}
          />
          <button type="submit" disabled={isLoading} className="btn-primary !px-3 !py-2 !text-sm">
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}

