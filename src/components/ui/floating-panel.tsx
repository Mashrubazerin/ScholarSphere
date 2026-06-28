"use client";

import { FloatingPanel } from "@ark-ui/react/floating-panel";
import { Portal } from "@ark-ui/react/portal";
import { ArrowDownLeft, Maximize2, Minus, X, GripVertical } from "lucide-react";

interface CountryPanelProps {
  triggerLabel: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
}

export default function CountryPanel({
  triggerLabel,
  title,
  children,
}: CountryPanelProps) {
  return (
    <FloatingPanel.Root>
      <FloatingPanel.Trigger className="px-5 py-3 bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white text-sm font-semibold rounded-lg hover:shadow-[0_0_24px_rgba(124,58,237,0.5)] hover:scale-[1.02] transition-all focus:outline-hidden focus:ring-2 focus:ring-[#7C3AED] focus:ring-offset-2 focus:ring-offset-[#020617]">
        {triggerLabel}
      </FloatingPanel.Trigger>

      <Portal>
        <FloatingPanel.Positioner className="z-50">
          <FloatingPanel.Content className="flex flex-col rounded-lg data-maximized:rounded-none border w-full shadow-md min-w-80 max-w-md bg-[#0B1120]/95 backdrop-blur-xl border-[#7C3AED]/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <FloatingPanel.DragTrigger>
              <FloatingPanel.Header className="py-3 px-4 bg-[#0F172A] border-b border-[#7C3AED]/15 flex justify-between items-center cursor-move rounded-t-lg">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-[#94A3B8]" />
                  <FloatingPanel.Title className="font-medium text-white">
                    {title}
                  </FloatingPanel.Title>
                </div>
                <FloatingPanel.Control className="flex items-center gap-1">
                  <FloatingPanel.StageTrigger
                    stage="minimized"
                    className="w-6 h-6 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </FloatingPanel.StageTrigger>
                  <FloatingPanel.StageTrigger
                    stage="maximized"
                    className="w-6 h-6 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </FloatingPanel.StageTrigger>
                  <FloatingPanel.StageTrigger
                    stage="default"
                    className="w-6 h-6 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 rounded transition-colors"
                  >
                    <ArrowDownLeft className="w-3 h-3" />
                  </FloatingPanel.StageTrigger>
                  <FloatingPanel.CloseTrigger className="w-6 h-6 flex items-center justify-center text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded transition-colors">
                    <X className="w-3 h-3" />
                  </FloatingPanel.CloseTrigger>
                </FloatingPanel.Control>
              </FloatingPanel.Header>
            </FloatingPanel.DragTrigger>

            <FloatingPanel.Body className="flex flex-col gap-4 p-4 text-[#94A3B8]">
              {children}
            </FloatingPanel.Body>

            {/* Resize handles */}
            <FloatingPanel.ResizeTrigger axis="n" />
            <FloatingPanel.ResizeTrigger axis="e" />
            <FloatingPanel.ResizeTrigger axis="w" />
            <FloatingPanel.ResizeTrigger axis="s" />
            <FloatingPanel.ResizeTrigger axis="ne" />
            <FloatingPanel.ResizeTrigger axis="se" />
            <FloatingPanel.ResizeTrigger axis="sw" />
            <FloatingPanel.ResizeTrigger axis="nw" />
          </FloatingPanel.Content>
        </FloatingPanel.Positioner>
      </Portal>
    </FloatingPanel.Root>
  );
}
