"use client";

import { useCallback, useEffect, useRef } from "react";
import type { VisionCondition } from "@/tool/types";
import { visionTool, ToolCanvas, ToolToolbar, ToolSidebar } from "@/tool";
import { visionFilters } from "@/tool/types";
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

  const handleUpload = useCallback(
    (imageSrc: string) => {
      state.setData((prev) => ({ ...prev, imageSrc, showOriginal: false }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setData is stable
    [state.setData],
  );

  const handleReset = useCallback(() => {
    state.setData((prev) => ({
      ...prev,
      imageSrc: "",
      activeCondition: "normal",
      intensity: 50,
      showOriginal: false,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setData is stable
  }, [state.setData]);

  const handleConditionChange = useCallback(
    (condition: VisionCondition) => {
      state.setData((prev) => ({
        ...prev,
        activeCondition: condition,
        showOriginal: false,
      }));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setData is stable
    [state.setData],
  );

  const handleToggleOriginal = useCallback(() => {
    state.setData((prev) => ({ ...prev, showOriginal: !prev.showOriginal }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setData is stable
  }, [state.setData]);

  const activeCondition = state.data.activeCondition;

  /**
   * Register keyboard shortcuts:
   *   Ctrl+Shift+Left/Right → cycle vision conditions
   *   Ctrl+Shift+Up/Down    → adjust intensity by 10%
   *   Ctrl+Shift+E          → export
   */
  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      if (!(e.ctrlKey || e.metaKey) || !e.shiftKey) return;

      switch (e.key.toLowerCase()) {
        case "arrowleft": {
          e.preventDefault();
          const idx = visionFilters.findIndex(
            (f) => f.name === activeCondition,
          );
          const prevIdx =
            (idx - 1 + visionFilters.length) % visionFilters.length;
          state.setData((prev) => ({
            ...prev,
            activeCondition: visionFilters[prevIdx]!.name,
          }));
          break;
        }
        case "arrowright": {
          e.preventDefault();
          const idx = visionFilters.findIndex(
            (f) => f.name === activeCondition,
          );
          const nextIdx = (idx + 1) % visionFilters.length;
          state.setData((prev) => ({
            ...prev,
            activeCondition: visionFilters[nextIdx]!.name,
          }));
          break;
        }
        case "arrowup": {
          e.preventDefault();
          state.setData((prev) => ({
            ...prev,
            intensity: Math.min(100, prev.intensity + 10),
          }));
          break;
        }
        case "arrowdown": {
          e.preventDefault();
          state.setData((prev) => ({
            ...prev,
            intensity: Math.max(0, prev.intensity - 10),
          }));
          break;
        }
        case "e": {
          e.preventDefault();
          handleExport("json");
          break;
        }
        case "o": {
          // Toggle original/comparison view
          e.preventDefault();
          state.setData((prev) => ({
            ...prev,
            showOriginal: !prev.showOriginal,
          }));
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setData is stable, only activeCondition matters for arrow key lookup
  }, [activeCondition, handleExport, state.setData]);

  return (
    <>
      <ToolToolbar
        onExport={() => handleExport("png")}
        imageSrc={state.data.imageSrc}
        activeCondition={state.data.activeCondition}
        intensity={state.data.intensity}
        showOriginal={state.data.showOriginal}
        onConditionChange={handleConditionChange}
        onIntensityChange={(value) =>
          state.setData((prev) => ({ ...prev, intensity: value }))
        }
        onReset={handleReset}
        onToggleOriginal={handleToggleOriginal}
      />
      <ToolCanvas
        imageSrc={state.data.imageSrc}
        activeCondition={state.data.activeCondition}
        intensity={state.data.intensity}
        showOriginal={state.data.showOriginal}
        canvasRef={canvasRef}
        onUpload={handleUpload}
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
