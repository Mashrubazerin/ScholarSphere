"use client";

import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import { NovaAIInput } from "@/components/ui/nova-ai-input";
import { NovaScholarshipCard } from "@/components/ui/nova-scholarship-card";
import { useNovaChat } from "@/hooks/useNovaChat";

const SUGGESTED_PROMPTS = [
  "I have a CGPA of 3.97 and want to study AI in Japan.",
  "Show fully funded scholarships in Germany.",
  "What scholarships are available for Computer Science?",
  "Find scholarships closing this month.",
];

const PREFILL_SEND_DELAY = 350;

function NovaAvatar({ size = 32 }: { size?: number }) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 30%, #ffffff, #c4b5fd 30%, #7c3aed 65%, #3b82f6 100%)",
          boxShadow: "0 0 16px 2px rgba(124,58,237,0.6)",
        }}
      />
      <Sparkles className="relative z-10 h-3.5 w-3.5 text-white" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <NovaAvatar size={28} />
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-[#94A3B8]"
            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

interface SuggestionChipsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  indent?: boolean;
}

function SuggestionChips({ prompts, onSelect, indent }: SuggestionChipsProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", indent && "pl-9")}>
      {prompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="rounded-full border border-[#7C3AED]/30 bg-[#7C3AED]/10 px-3 py-1.5 text-xs text-[#C4B5FD] transition-colors hover:bg-[#7C3AED]/20"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}

interface NovaChatPanelProps {
  className?: string;
}

export function NovaChatPanel({ className }: NovaChatPanelProps) {
  const { messages, isTyping, sendMessage } = useNovaChat();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [prefill, setPrefill] = React.useState<{ text: string; nonce: number } | null>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSuggestionClick = React.useCallback((prompt: string) => {
    setPrefill({ text: prompt, nonce: Date.now() });
    window.setTimeout(() => {
      sendMessage(prompt);
      setPrefill({ text: "", nonce: Date.now() });
    }, PREFILL_SEND_DELAY);
  }, [sendMessage]);

  const handleViewDetails = React.useCallback((id: string) => {
    console.log("View details requested for scholarship:", id);
  }, []);

  const latestMessage = messages[messages.length - 1];
  const showSuggestions = !isTyping && messages.length === 1;
  const showFollowUps = !isTyping && latestMessage?.role === "assistant" && Boolean(latestMessage.suggestedFollowUps?.length);

  return (
    <div
      className={cn(
        "relative flex h-[560px] max-h-[75vh] w-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0B1120]/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.45)]",
        className,
      )}
    >
      <BorderBeam lightColor="#06B6D4" lightWidth={160} duration={14} />

      {/* header */}
      <div className="relative z-10 flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <NovaAvatar size={36} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Nova</p>
          <p className="text-xs text-[#94A3B8]">AI Scholarship Advisor</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          <span className="text-[11px] text-[#6EE7B7]">Online</span>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="relative z-10 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn("flex items-end gap-2", m.role === "user" && "flex-row-reverse")}
            >
              {m.role === "assistant" && <NovaAvatar size={28} />}
              <div className={cn("flex max-w-[80%] flex-col gap-2.5", m.role === "user" && "items-end")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    m.role === "assistant"
                      ? "rounded-tl-sm border border-white/10 bg-white/5 text-white/90"
                      : "rounded-tr-sm bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white",
                  )}
                >
                  {m.text}
                </div>

                {m.scholarships?.length ? (
                  <div className="flex w-full flex-col gap-2.5">
                    {m.scholarships.map((s) => (
                      <NovaScholarshipCard key={s.id} scholarship={s} onViewDetails={handleViewDetails} />
                    ))}
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}

        {showSuggestions && <SuggestionChips prompts={SUGGESTED_PROMPTS} onSelect={handleSuggestionClick} indent />}
        {showFollowUps && <SuggestionChips prompts={latestMessage?.suggestedFollowUps ?? []} onSelect={handleSuggestionClick} indent />}
      </div>

      {/* input */}
      <div className="relative z-10 border-t border-white/10 p-3">
        <NovaAIInput onSend={(text) => sendMessage(text)} prefill={prefill} className="border-none bg-transparent shadow-none" />
      </div>
    </div>
  );
}

export default NovaChatPanel;
