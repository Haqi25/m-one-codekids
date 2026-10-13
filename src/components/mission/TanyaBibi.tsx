"use client";

import { useState, useRef, useEffect } from "react";
import { BibiMascot } from "@/components/brand/BibiMascot";
import { Block } from "@/lib/missions/types";
import { speakBibiText, stopSpeaking, useSpeechSupported } from "@/lib/speech";

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
  const isSpeechSupported = useSpeechSupported();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bibi", content: "Halo! Aku Bibi. Butuh bantuan dengan misi ini? 🤔" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      stopSpeaking();
      setSpeakingIdx(null);
    }
  }, [messages, isOpen]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  if (!isOpen) return null;

  const handleToggleSpeak = (idx: number, text: string) => {
    if (speakingIdx === idx) {
      stopSpeaking();
      setSpeakingIdx(null);
    } else {
      speakBibiText(text, {
        onStart: () => setSpeakingIdx(idx),
        onEnd: () => setSpeakingIdx(null),
        onError: () => setSpeakingIdx(null),
      });
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    stopSpeaking();
    setSpeakingIdx(null);

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
      const replyText = data.reply;
      
      setMessages((prev) => {
        const next = [...prev, { role: "bibi" as const, content: replyText }];
        const newIdx = next.length - 1;
        
        if (autoSpeak) {
          setTimeout(() => {
            speakBibiText(replyText, {
              onStart: () => setSpeakingIdx(newIdx),
              onEnd: () => setSpeakingIdx(null),
              onError: () => setSpeakingIdx(null),
            });
          }, 300);
        }
        
        return next;
      });
      
      if (data.isHint) {
        onHintUsed();
      }
    } catch {
      const fallbackText = "Maaf, Bibi sedang sibuk. Coba lagi nanti ya! 😟";
      setMessages((prev) => [...prev, { role: "bibi", content: fallbackText }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "Aku bingung mulai dari mana",
    "Jelaskan pakai contoh dong",
    "Blok mana yang salah?"
  ];

  const handleClose = () => {
    stopSpeaking();
    setSpeakingIdx(null);
    onClose();
  };

  return (
    <div className="absolute bottom-4 right-4 w-80 sm:w-96 bg-white rounded-2xl shadow-pop flex flex-col overflow-hidden z-50 border-2 border-navy/10 animate-pop-in">
      {/* Header */}
      <div className="bg-peach px-4 py-3 flex justify-between items-center border-b-2 border-navy/10">
        <div className="flex items-center gap-2">
          <BibiMascot mood="happy" className="w-8 h-8" />
          <h3 className="font-display font-bold text-navy">Tanya Bibi AI</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {isSpeechSupported && (
            <button
              type="button"
              onClick={() => {
                const next = !autoSpeak;
                setAutoSpeak(next);
                if (!next) {
                  stopSpeaking();
                  setSpeakingIdx(null);
                }
              }}
              className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-all ${
                autoSpeak
                  ? "bg-leaf-700 text-white shadow-sm"
                  : "bg-peach-200 text-navy-700 hover:bg-peach-300"
              }`}
              title="Otomatis bacakan jawaban Bibi"
            >
              <span>{autoSpeak ? "🔊 Suara ON" : "🔈 Suara OFF"}</span>
            </button>
          )}
          <button 
            onClick={handleClose} 
            className="text-navy-700 hover:text-navy font-bold p-1 rounded hover:bg-navy/5"
            aria-label="Tutup panel chat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto max-h-80 min-h-64 flex flex-col gap-3 bg-peach/5">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`p-3 rounded-2xl max-w-[88%] text-sm ${
              msg.role === "user" 
                ? "bg-navy text-white rounded-tr-sm" 
                : "bg-white text-navy border-2 border-peach-300 rounded-tl-sm shadow-sm"
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {msg.role === "bibi" && isSpeechSupported && (
                <div className="mt-2 pt-1 border-t border-peach-200/60 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleToggleSpeak(idx, msg.content)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all select-none ${
                      speakingIdx === idx
                        ? "bg-orange text-white shadow-pop-sm animate-pulse"
                        : "bg-peach-200 text-navy-700 hover:bg-orange hover:text-white"
                    }`}
                    title={speakingIdx === idx ? "Hentikan suara" : "Dengarkan suara Bibi"}
                  >
                    <span>{speakingIdx === idx ? "⏹️" : "🔊"}</span>
                    <span>{speakingIdx === idx ? "Hentikan" : "Dengarkan"}</span>
                  </button>
                </div>
              )}
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
                className="text-xs bg-peach-200 hover:bg-peach-300 text-navy-700 px-2 py-1 rounded-full text-left transition-colors font-medium"
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
