"use client";

import { useCallback, useRef } from "react";
import type { VisionCondition } from "@/tool/types";
import { visionTool, ToolCanvas, ToolToolbar, ToolSidebar } from "@/tool";
import { useToolState, useExport, useShare } from "@itsjust/core";

export default function ToolClient() {
  const canvasRef = useRef<HTMLDivElement>(null);

  const toolConfig = visionTool.config;

  const state = useToolState<typeof visionTool.initialState>(
    visionTool.initialState,
    {
      key: "vision-deficiency-simulator",
      maxHistoryEntries: 100,
      debounceMs: 0,
    },
  );

  const { exportTo, isExporting } = useExport(canvasRef, toolConfig, () =>
    visionTool.serialize(state.data),
  );

  const { downloadShareFile, shareViaWeb } = useShare();

  const handleExport = useCallback(
    async (format: "png" | "pdf" | "json" | "jpeg" | "webp") => {
      await exportTo(format);
    },
    [exportTo],
  );

  return (
    <>
      <ToolToolbar
        onExport={() => handleExport("json")}
        imageSrc={state.data.imageSrc}
        activeCondition={state.data.activeCondition}
        intensity={state.data.intensity}
        onConditionChange={(condition: VisionCondition) =>
          state.setData((prev) => ({ ...prev, activeCondition: condition }))
        }
        onIntensityChange={(value) =>
          state.setData((prev) => ({ ...prev, intensity: value }))
        }
      />
      <ToolCanvas
        imageSrc={state.data.imageSrc}
        activeCondition={state.data.activeCondition}
        intensity={state.data.intensity}
        canvasRef={canvasRef}
        onUpload={(imageSrc) =>
          state.setData((prev) => ({ ...prev, imageSrc }))
        }
      />
      <ToolSidebar
        imageSrc={state.data.imageSrc}
        activeCondition={state.data.activeCondition}
        intensity={state.data.intensity}
      />
      {/* Share Actions - visible only when data is ready */}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button
          type="button"
          onClick={async () => {
            await downloadShareFile({
              toolId: toolConfig.id,
              content: visionTool.serialize(state.data),
              metadata: { schemaVersion: "1.0" },
            });
          }}
          disabled={isExporting}
          style={{
            padding: "0.375rem 0.75rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--card)",
            color: "var(--foreground)",
            cursor: isExporting ? "not-allowed" : "pointer",
            fontSize: "0.8125rem",
            fontWeight: 500,
            fontFamily: "inherit",
          }}
          aria-disabled={isExporting}
        >
          Download .itsjust.json
        </button>
        <button
          type="button"
          onClick={async () => {
            await shareViaWeb({
              toolId: toolConfig.id,
              content: visionTool.serialize(state.data),
              metadata: { schemaVersion: "1.0" },
            });
          }}
          disabled={isExporting}
          style={{
            padding: "0.375rem 0.75rem",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            background: "var(--card)",
            color: "var(--foreground)",
            cursor: isExporting ? "not-allowed" : "pointer",
            fontSize: "0.8125rem",
            fontWeight: 500,
            fontFamily: "inherit",
          }}
          aria-disabled={isExporting}
        >
          Share
        </button>
      </div>
    </>
  );
}
