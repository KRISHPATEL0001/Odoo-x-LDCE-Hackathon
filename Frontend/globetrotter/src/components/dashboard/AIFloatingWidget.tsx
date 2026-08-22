import React, { useState, useRef, useEffect } from 'react';
import { api } from '../../services/api.ts';
import {
  Sparkles,
  Bot,
  X,
  Send,
  Plane,
  Compass,
  MapPin,
  Maximize2,
} from 'lucide-react';

interface AIFloatingWidgetProps {
  onOpenFullAssistant: () => void;
}

export const AIFloatingWidget: React.FC<AIFloatingWidgetProps> = ({
  onOpenFullAssistant,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([
    {
      role: 'ai',
      text: 'Hi there! ✈️ Need suggestions for places to discover, transit options, hotels, or restaurants? Ask me anything!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    try {
      const reply = await api.sendAIChat(userText);
      setMessages((prev) => [...prev, { role: 'ai', text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'I am temporarily having trouble connecting. Please try again in a moment.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          id="btn-floating-ai-copilot"
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-[#5d6d5a] hover:bg-[#4a5748] text-[#fdfcf8] p-3.5 rounded-full shadow-2xl border-2 border-white flex items-center gap-2 hover:scale-105 transition-all cursor-pointer group"
          aria-label="Open AI Travel Copilot"
        >
          <div className="relative">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#d4a373] animate-ping" />
          </div>
          <span className="text-xs font-bold hidden sm:inline pr-1">AI Copilot</span>
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-88 sm:w-96 bg-[#fdfcf8] border border-[#e0e0d5] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200 h-[500px]">
          {/* Header */}
          <div className="bg-[#5d6d5a] text-[#fdfcf8] p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#d4a373]" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm">GlobeTrotter Copilot</h4>
                <p className="text-[10px] text-white/80">Powered by Global Travel AI</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullAssistant();
                }}
                className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
                title="Open Full AI Planner View"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-[#f5f5f0] px-3 py-2 border-b border-[#e0e0d5] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
            <span className="text-[#7f8c8d] font-bold shrink-0">Try:</span>
            {[
              '✈️ Best flight route to Tokyo',
              '🍽️ Top vegetarian restaurants',
              '🧳 Packing list for Switzerland',
            ].map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setInput(prompt.replace(/^[^\s]+\s/, ''));
                }}
                className="px-2 py-0.5 rounded-lg bg-white border border-[#e0e0d5] text-[#2d3436] hover:bg-[#eaeae0] shrink-0 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin text-xs">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-6 h-6 rounded-lg bg-[#5d6d5a]/20 text-[#5d6d5a] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] leading-relaxed whitespace-pre-line ${
                    msg.role === 'user'
                      ? 'bg-[#5d6d5a] text-white rounded-tr-none'
                      : 'bg-[#f5f5f0] text-[#2d3436] border border-[#e0e0d5] rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-[11px] text-[#7f8c8d]">
                <Bot className="w-3.5 h-3.5 animate-spin text-[#5d6d5a]" />
                <span>Copilot is writing advice...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSend} className="p-3 bg-[#fdfcf8] border-t border-[#e0e0d5] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about travel, stays, dining..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#f5f5f0] border border-[#e0e0d5] text-xs focus:outline-none focus:border-[#5d6d5a] text-[#2d3436]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl bg-[#5d6d5a] hover:bg-[#4a5748] text-white disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
