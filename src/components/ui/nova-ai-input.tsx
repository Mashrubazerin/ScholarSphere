"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowUp,
  BrainCog,
  FolderCode,
  Globe,
  Mic,
  Paperclip,
  Square,
  StopCircle,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

function useAutoResizeTextarea(minHeight: number, maxHeight: number) {
  const ref = React.useRef<HTMLTextAreaElement>(null);

  const adjustHeight = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = `${minHeight}px`;
    el.style.height = `${Math.max(minHeight, Math.min(el.scrollHeight, maxHeight))}px`;
  }, [minHeight, maxHeight]);

  return { ref, adjustHeight };
}

/** Mounted only while recording, so the timer simply runs for its whole lifetime. */
function VoiceRecorder() {
  const [time, setTime] = React.useState(0);
  const [bars, setBars] = React.useState<{ height: number; delay: number; duration: number }[]>(
    () => Array.from({ length: 32 }, () => ({ height: 50, delay: 0, duration: 0.7 })),
  );

  React.useEffect(() => {
    const id = window.setTimeout(() => {
      setBars(
        Array.from({ length: 32 }, (_, i) => ({
          height: 15 + Math.random() * 85,
          delay: i * 0.05,
          duration: 0.5 + Math.random() * 0.5,
        })),
      );
    }, 0);
    const interval = window.setInterval(() => setTime((t) => t + 1), 1000);
    return () => {
      window.clearTimeout(id);
      window.clearInterval(interval);
    };
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="flex w-full flex-col items-center justify-center py-3">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[#EF4444]" />
        <span className="font-mono text-sm text-white/80">{formatTime(time)}</span>
      </div>
      <div className="flex h-10 w-full items-center justify-center gap-0.5 px-4">
        {bars.map((bar, i) => (
          <div
            key={i}
            className="w-0.5 animate-pulse rounded-full bg-[#06B6D4]/60"
            style={{
              height: `${bar.height}%`,
              animationDelay: `${bar.delay}s`,
              animationDuration: `${bar.duration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

type Mode = "search" | "think" | "canvas" | null;

const MODE_CONFIG = {
  search: { label: "Find Scholarships", icon: Globe, color: "#06B6D4" },
  think: { label: "Deep Match", icon: BrainCog, color: "#7C3AED" },
  canvas: { label: "Essay Help", icon: FolderCode, color: "#3B82F6" },
} as const;

function ModePill({
  mode,
  active,
  onToggle,
}: {
  mode: keyof typeof MODE_CONFIG;
  active: boolean;
  onToggle: () => void;
}) {
  const { label, icon: Icon, color } = MODE_CONFIG[mode];
  return (
    <button
      type="button"
      onClick={onToggle}
      title={label}
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-full border px-2.5 py-1 transition-all",
        active ? "border-transparent" : "border-transparent text-[#94A3B8] hover:text-white",
      )}
      style={active ? { backgroundColor: `${color}26`, color } : undefined}
    >
      <motion.div
        animate={{ rotate: active ? 360 : 0, scale: active ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
      >
        <Icon className="h-4 w-4" />
      </motion.div>
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 overflow-hidden whitespace-nowrap text-xs"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

interface NovaAIInputProps {
  onSend?: (message: string, files: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  /** External trigger (e.g. a suggestion chip) that types text into the input without sending it. */
  prefill?: { text: string; nonce: number } | null;
}

export function NovaAIInput({
  onSend = () => {},
  isLoading = false,
  placeholder = "Ask Nova about scholarships, deadlines, or eligibility...",
  className,
  prefill,
}: NovaAIInputProps) {
  const [input, setInput] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [previews, setPreviews] = React.useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>(null);
  const uploadRef = React.useRef<HTMLInputElement>(null);
  const { ref: textareaRef, adjustHeight } = useAutoResizeTextarea(48, 160);

  // Adjust state during render (not in an effect) when the prefill trigger changes —
  // the React-recommended way to sync local editable state from an external trigger.
  const [lastPrefillNonce, setLastPrefillNonce] = React.useState(prefill?.nonce);
  if (prefill && prefill.nonce !== lastPrefillNonce) {
    setLastPrefillNonce(prefill.nonce);
    setInput(prefill.text);
  }

  // Resize whenever the text actually changes, regardless of whether it came
  // from typing or a prefill — runs after React commits the new value to the DOM.
  React.useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  const processFile = React.useCallback((file: File) => {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return;
    setFiles([file]);
    const reader = new FileReader();
    reader.onload = (e) => setPreviews({ [file.name]: e.target?.result as string });
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveFile = () => {
    setFiles([]);
    setPreviews({});
  };

  const hasContent = input.trim() !== "" || files.length > 0;

  const handleSubmit = () => {
    if (!hasContent) return;
    const prefix = mode ? `[${MODE_CONFIG[mode].label}] ` : "";
    onSend(`${prefix}${input}`, files);
    setInput("");
    setFiles([]);
    setPreviews({});
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-[#0B1120]/80 px-3 pt-3 pb-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-colors",
        isRecording && "border-[#EF4444]/50",
        className,
      )}
    >
      {files.length > 0 && !isRecording && (
        <div className="mb-2 flex flex-wrap gap-2">
          {files.map((file) => (
            <div key={file.name} className="group relative h-16 w-16 overflow-hidden rounded-xl">
              {previews[file.name] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previews[file.name]} alt={file.name} className="h-full w-full object-cover" />
              )}
              <button
                onClick={handleRemoveFile}
                className="absolute top-1 right-1 rounded-full bg-black/70 p-0.5"
                aria-label="Remove attachment"
              >
                <X className="h-3 w-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={cn("transition-all duration-300", isRecording ? "h-0 overflow-hidden opacity-0" : "opacity-100")}>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none bg-transparent px-1 py-2 text-base text-white placeholder:text-[#94A3B8] focus-visible:outline-none"
          style={{ minHeight: 48 }}
        />
      </div>

      {isRecording && <VoiceRecorder />}

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className={cn("flex items-center gap-1", isRecording && "invisible")}>
          <button
            type="button"
            title="Attach an image"
            onClick={() => uploadRef.current?.click()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#94A3B8] transition-colors hover:bg-white/10 hover:text-white"
          >
            <Paperclip className="h-4 w-4" />
            <input
              ref={uploadRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) processFile(file);
                e.target.value = "";
              }}
            />
          </button>

          <div className="ml-1 flex items-center gap-1">
            {(Object.keys(MODE_CONFIG) as Array<keyof typeof MODE_CONFIG>).map((m) => (
              <ModePill key={m} mode={m} active={mode === m} onToggle={() => setMode((prev) => (prev === m ? null : m))} />
            ))}
          </div>
        </div>

        <button
          type="button"
          title={isRecording ? "Stop recording" : hasContent ? "Send message" : "Record voice message"}
          disabled={isLoading && !hasContent}
          onClick={() => {
            if (isRecording) {
              setIsRecording(false);
              onSend("[Voice message]", []);
            } else if (hasContent) handleSubmit();
            else setIsRecording(true);
          }}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all duration-200",
            isRecording
              ? "text-[#EF4444] hover:bg-[#EF4444]/10"
              : hasContent
                ? "bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white hover:shadow-[0_0_16px_rgba(124,58,237,0.5)]"
                : "text-[#94A3B8] hover:bg-white/10 hover:text-white",
          )}
        >
          {isLoading ? (
            <Square className="h-4 w-4 animate-pulse fill-current" />
          ) : isRecording ? (
            <StopCircle className="h-5 w-5" />
          ) : hasContent ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}

export default NovaAIInput;
