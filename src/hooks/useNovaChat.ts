"use client";

import { useCallback, useRef, useState } from "react";

import type { NovaChatReply, NovaScholarshipResult } from "@/services/novaChat.service";

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  scholarships?: NovaScholarshipResult[];
  suggestedFollowUps?: string[];
}

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text:
    "Hi, I'm Nova — your AI scholarship advisor. Tell me your field of study, target country, or CGPA, and I'll match you with funded opportunities instantly.",
};

/** Mirrors the server's STANDARD_FOLLOW_UPS — duplicated rather than imported, since this is a client module and the service file is server-only (it transitively touches the Gemini client/env). */
const FOLLOW_UP_ACTIONS = ["Rank by deadline", "Rank by funding amount", "Check eligibility requirements"];

function parseFundingAmount(amount: string): number {
  const match = amount.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return /month/i.test(amount) ? value * 12 : value;
}

/**
 * "Rank by deadline/funding" and "check eligibility" are pure re-sorts/reformats
 * of scholarships we already fetched — handled entirely client-side so they're
 * instant and don't cost a Gemini call or a server round-trip.
 */
function handleFollowUp(message: string, lastResults: NovaScholarshipResult[]): ChatMessage | null {
  if (!lastResults.length) return null;

  if (/rank by deadline/i.test(message)) {
    const sorted = [...lastResults].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Here they are, sorted by the soonest deadlines:",
      scholarships: sorted,
      suggestedFollowUps: FOLLOW_UP_ACTIONS,
    };
  }
  if (/rank by funding/i.test(message)) {
    const sorted = [...lastResults].sort((a, b) => parseFundingAmount(b.funding) - parseFundingAmount(a.funding));
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "Sorted by the highest funding amount:",
      scholarships: sorted,
      suggestedFollowUps: FOLLOW_UP_ACTIONS,
    };
  }
  if (/eligib/i.test(message)) {
    const lines = lastResults
      .map(
        (s) =>
          `${s.name}: CGPA ≥ ${s.cgpaRequirement.toFixed(1)}${s.ieltsRequirement !== null ? `, IELTS ≥ ${s.ieltsRequirement.toFixed(1)}` : ""}`,
      )
      .join("\n");
    return {
      id: crypto.randomUUID(),
      role: "assistant",
      text: `Here are the eligibility requirements for your matches:\n${lines}`,
      suggestedFollowUps: FOLLOW_UP_ACTIONS,
    };
  }
  return null;
}

async function fetchNovaReply(message: string): Promise<NovaChatReply> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json?.error?.message ?? "Something went wrong. Please try again.");
  }
  return json.data as NovaChatReply;
}

export function useNovaChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [isTyping, setIsTyping] = useState(false);
  const lastResultsRef = useRef<NovaScholarshipResult[]>([]);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: trimmed }]);

    const followUp = handleFollowUp(trimmed, lastResultsRef.current);
    if (followUp) {
      if (followUp.scholarships) lastResultsRef.current = followUp.scholarships;
      setMessages((prev) => [...prev, followUp]);
      return;
    }

    setIsTyping(true);
    fetchNovaReply(trimmed)
      .then((reply) => {
        if (reply.scholarships) lastResultsRef.current = reply.scholarships;
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            text: reply.message,
            scholarships: reply.scholarships,
            suggestedFollowUps: reply.suggestedFollowUps,
          },
        ]);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", text: message }]);
      })
      .finally(() => setIsTyping(false));
  }, []);

  return { messages, isTyping, sendMessage };
}
