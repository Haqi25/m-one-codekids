"use client";

import { useState, useEffect } from "react";
import { BibiMascot } from "@/components/brand/BibiMascot";

type Message = {
  id: string;
  sender: "child" | "bibi";
  text: string;
};

const INITIAL_CONVERSATION: Message[] = [
  { id: "1", sender: "child", text: "Bibi, kenapa kode looping-ku nggak jalan ya? 😭" },
];

export function BibiDemo() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_CONVERSATION);
  const [isTyping, setIsTyping] = useState(true);
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    // Initial Bibi reply
    const timer = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: "2", sender: "bibi", text: "Hmm, coba kita perhatikan. Bayangkan kamu menyiram 5 pot bunga... 🌸" }
      ]);
      setIsTyping(false);
      setShowOptions(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleOptionClick = (option: string, reply: string) => {
    setShowOptions(false);
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "child", text: option }]);
    setIsTyping(true);
    
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), sender: "bibi", text: reply }]);
      setIsTyping(false);
      setShowOptions(true); // Allow more clicks
    }, 1200);
  };

  return (
    <div className="card max-w-2xl mx-auto overflow-hidden flex flex-col h-[500px] shadow-pop">
      <div className="bg-peach-200 p-4 border-b-2 border-navy/10 flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm overflow-hidden border-2 border-navy/10">
           <BibiMascot mood="happy" className="w-10 h-10 translate-y-1" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-navy m-0">Bibi AI</h3>
          <p className="text-sm font-bold text-orange-600 m-0">Teman Belajar Coding</p>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === "child" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === "child" ? "bg-sky text-white rounded-br-sm" : "bg-peach-200 text-ink rounded-bl-sm"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-peach-200 text-ink p-3 rounded-2xl rounded-bl-sm flex gap-1 items-center h-11">
              <span className="animate-bounce-soft block w-2.5 h-2.5 bg-navy/40 rounded-full" style={{ animationDelay: '0s' }}></span>
              <span className="animate-bounce-soft block w-2.5 h-2.5 bg-navy/40 rounded-full" style={{ animationDelay: '0.15s' }}></span>
              <span className="animate-bounce-soft block w-2.5 h-2.5 bg-navy/40 rounded-full" style={{ animationDelay: '0.3s' }}></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t-2 border-navy/10">
        <p className="text-xs font-bold text-navy-300 mb-2 uppercase tracking-wider">Coba tanya Bibi (Tingkat Bantuan):</p>
        <div className="flex flex-wrap gap-2">
          {showOptions && (
            <>
              <button 
                onClick={() => handleOptionClick("Masih bingung nih...", "Pikirkan lagi, apakah kamu perlu mengulang kata 'siram' 5 kali atau bisa pakai blok 'Ulangi'? 😉")}
                className="chip bg-peach text-orange-700 border border-orange-600 hover:bg-orange-600 hover:text-white transition-colors cursor-pointer"
              >
                1. Pertanyaan Pemandu
              </button>
              <button 
                onClick={() => handleOptionClick("Kasih contoh lain dong", "Sama seperti naik tangga. Langkahmu berulang-ulang sampai di puncak, kan? 🪜")}
                className="chip bg-peach text-sky-700 border border-sky-700 hover:bg-sky-700 hover:text-white transition-colors cursor-pointer"
              >
                2. Analogi
              </button>
              <button 
                onClick={() => handleOptionClick("Blok apa yang harus kupakai?", "Coba cari blok berwarna hijau dengan tulisan 'Ulangi'. Masukkan blok aksi ke dalamnya! 🧩")}
                className="chip bg-peach text-leaf-700 border border-leaf-700 hover:bg-leaf-700 hover:text-white transition-colors cursor-pointer"
              >
                3. Petunjuk Spesifik
              </button>
            </>
          )}
          {!showOptions && !isTyping && <div className="h-8"></div>}
          {!showOptions && isTyping && <div className="h-8"></div>}
        </div>
      </div>
    </div>
  );
}

