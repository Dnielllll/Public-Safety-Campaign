import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateAIResponse } from "@/lib/ai.js";
import { cn } from "@/lib/utils";

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am your Barangay 178 AI Safety Assistant. How can I help you prepare or stay safe today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const history = messages.map(m => `${m.role}: ${m.content}`).join("\n");
      const prompt = `${history}\nuser: ${userMsg.content}`;
      
      const response = await generateAIResponse(
        "You are a helpful, brief, and accurate safety assistant for Barangay 178 residents. Provide quick safety tips, emergency procedures, or general advice. If a user asks about submitting concerns, complaints, or inquiries, provide the physical and Facebook contact info, AND strongly recommend that they 'create an account or log in as a resident' to submit concerns directly through the system. Keep answers under 3 short paragraphs.",
        prompt
      );
      
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const isKeyMissing = error.message?.includes("Gemini API key is not configured");
      const errMsg = isKeyMissing 
        ? "The Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your environment variables (in Vercel or your .env file)."
        : "Sorry, I am having trouble connecting right now. Please try again later.";
      setMessages((prev) => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all z-50",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      <div
        className={cn(
          "fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col transition-all z-50 origin-bottom-right duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-50 opacity-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary/5 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">AI Safety Assistant</h3>
              <p className="text-xs text-muted-foreground">Powered by Gemini AI</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
              <div className={cn("h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs", 
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {msg.role === "user" ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
              </div>
              <div className={cn("rounded-2xl px-3 py-2 text-sm", 
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2 max-w-[85%]">
              <div className="h-6 w-6 shrink-0 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Bot className="h-3 w-3" />
              </div>
              <div className="rounded-2xl px-3 py-2 text-sm bg-muted text-foreground flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 border-t border-border flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a safety question..."
            className="flex-1 rounded-full"
            disabled={isTyping}
          />
          <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={!input.trim() || isTyping}>
            {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </>
  );
}
