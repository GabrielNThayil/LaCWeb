"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, X, Crown } from "lucide-react";

const SUGGESTIONS = [
  "Pistachio lover — what should I try first?",
  "I need a cosy, warming drink",
  "Best pastry to share with a friend",
  "Dairy-free options?",
  "Quick caffeine pick-me-up, no sugar please",
];

function parsePickedIds(text: string): string[] {
  const m = text.match(/PICKED_IDS:\s*([^\n]+)/i);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AISommelier() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/sommelier" }),
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  if (!mounted) {
    // Avoid hydration mismatch; only render UI after mount.
    return null;
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label="Open AI Sommelier"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-crown-espresso text-crown-paper shadow-glow transition-transform duration-300 hover:scale-105 hover:bg-crown-caramel active:scale-95"
      >
        <Sparkles className="h-6 w-6" />
        <span className="absolute inset-0 rounded-full bg-crown-gold/30 opacity-0 transition-opacity duration-300 hover:opacity-100" />
     </button>
    );
  }

  const isBusy = status === "streaming" || status === "submitted";

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed || isBusy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <div
      role="dialog"
      aria-label="AI Sommelier"
      className="fixed bottom-6 right-6 z-50 flex h-[min(70vh,640px)] w-[min(420px,92vw)] flex-col overflow-hidden rounded-2xl border border-crown-espresso/15 bg-white/95 shadow-2xl backdrop-blur-xl"
    >
      <header className="flex items-center justify-between gap-3 border-b border-crown-espresso/10 bg-crown-paper px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-crown-espresso text-crown-paper">
            <Crown className="h-4 w-4" />
         </div>
          <div>
            <h2 className="font-display text-sm font-semibold text-crown-espresso">
              AI Sommelier
           </h2>
            <p className="text-[10px] uppercase tracking-widest text-crown-espresso/60">
              {isBusy ? "Composing a pour…" : "Online · La Couronne"}
           </p>
         </div>
       </div>
        <button
          type="button"
          aria-label="Close sommelier"
          onClick={() => setOpen(false)}
          className="grid h-8 w-8 place-items-center rounded-full text-crown-espresso/60 transition hover:bg-crown-espresso/5 hover:text-crown-espresso"
        >
          <X className="h-4 w-4" />
       </button>
     </header>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
        {messages.length === 0 && (
          <div className="rounded-xl bg-crown-cream/60 p-4 text-sm leading-relaxed text-crown-espresso/85">
            Welcome to La Couronne. Tell me a little about your mood, the
            weather, or who you&apos;re with — I&apos;ll suggest something
            fitting.
            <div className="mt-3 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => sendMessage({ text: q })}
                  className="rounded-full border border-crown-espresso/10 bg-white px-3 py-1 text-[11px] font-medium text-crown-espresso/75 transition hover:border-crown-gold hover:text-crown-espresso"
                >
                  {q}
               </button>
              ))}
           </div>
         </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === "user";
          const fullText = m.parts
            .map((p) => (p.type === "text" ? p.text : ""))
            .join("");
          const picked = !isUser ? parsePickedIds(fullText) : [];
          const cleanedText = isUser
            ? fullText
            : fullText.replace(/\s*PICKED_IDS:[^\n]*\n?/i, "").trim();

          // Map picked IDs to short clickable badges.
          return (
            <div
              key={m.id}
              className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  isUser
                    ? "bg-crown-espresso text-crown-paper"
                    : "bg-crown-cream/70 text-crown-espresso"
                }`}
              >
                <div className="whitespace-pre-wrap">{cleanedText}</div>
                {picked.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {picked.map((id) => (
                      <a
                        key={id}
                        href={`/#menu-${id}`}
                        className="rounded-full border border-crown-espresso/15 bg-white/90 px-2.5 py-1 font-mono text-[10px] font-semibold text-crown-espresso transition hover:border-crown-gold hover:bg-crown-paper"
                      >
                        #{id}
                     </a>
                    ))}
                 </div>
                )}
             </div>
           </div>
          );
        })}

        {isBusy && messages.at(-1)?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-crown-cream/70 px-4 py-2.5 text-sm text-crown-espresso/70">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-crown-espresso/50 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-crown-espresso/50 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-crown-espresso/50 [animation-delay:300ms]" />
             </span>
           </div>
         </div>
        )}

        <div ref={scrollRef} />
     </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="flex items-center gap-2 border-t border-crown-espresso/10 bg-crown-paper px-3 py-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isBusy}
          placeholder="Ask the sommelier…"
          aria-label="Message the AI sommelier"
          className="flex-1 rounded-full border border-crown-espresso/10 bg-white px-4 py-2 text-sm text-crown-espresso placeholder:text-crown-espresso/40 focus:border-crown-gold focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isBusy || !input.trim()}
          aria-label="Send message"
          className="grid h-9 w-9 place-items-center rounded-full bg-crown-espresso text-crown-paper transition hover:bg-crown-caramel disabled:opacity-30"
        >
          <Send className="h-4 w-4" />
       </button>
     </form>
   </div>
  );
}
